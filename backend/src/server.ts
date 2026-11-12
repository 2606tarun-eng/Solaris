import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { and, eq, like, or } from "drizzle-orm";
import { db, schema } from "./db/index.js";
import voiceRoutes from "./routes/voice.js";

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: true, // tighten to the frontend origin in production
  methods: ["GET", "POST"],
});

await app.register(multipart, {
  limits: { fileSize: 12 * 1024 * 1024 }, // 12 MB voice clips
});

/* ------------------------------------------------------------- health */

app.get("/api/health", async () => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});

/* ------------------------------------------------------------ planets */

app.get("/api/planets", async () => {
  return db.select().from(schema.planets).all();
});

app.get("/api/planets/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const planet = await db.select().from(schema.planets).where(eq(schema.planets.id, id)).get();
  if (!planet) return reply.code(404).send({ error: "Planet not found" });

  const planetMissions = await db
    .select()
    .from(schema.missions)
    .where(eq(schema.missions.planetId, id))
    .all();

  const story = await db.select().from(schema.stories).where(eq(schema.stories.planetId, id)).get();

  const planetMedia = await db
    .select()
    .from(schema.media)
    .where(eq(schema.media.planetId, id))
    .all();

  return { ...planet, missions: planetMissions, story, media: planetMedia };
});

/* ------------------------------------------------------------ missions */

app.get("/api/missions", async (request) => {
  const { planet, status } = request.query as { planet?: string; status?: string };
  const conditions = [];
  if (planet) conditions.push(eq(schema.missions.planetId, planet));
  if (status) conditions.push(eq(schema.missions.status, status as "active" | "retired"));

  return db
    .select()
    .from(schema.missions)
    .where(conditions.length ? and(...conditions) : undefined)
    .all();
});

/* ------------------------------------------------------------ projects */

app.get("/api/projects", async (request) => {
  const { planet, status } = request.query as { planet?: string; status?: string };
  const conditions = [];
  if (planet) conditions.push(eq(schema.projects.planetId, planet));
  if (status) conditions.push(eq(schema.projects.status, status as "active" | "retired"));

  return db
    .select()
    .from(schema.projects)
    .where(conditions.length ? and(...conditions) : undefined)
    .all();
});

/* ------------------------------------------------------------ timeline */

app.get("/api/timeline", async (request) => {
  const { year } = request.query as { year?: string };
  const conditions = [];
  if (year) conditions.push(eq(schema.timelineEvents.year, parseInt(year)));

  return db
    .select()
    .from(schema.timelineEvents)
    .where(conditions.length ? and(...conditions) : undefined)
    .all();
});

/* ------------------------------------------------------------ stories */

app.get("/api/stories/:planetId", async (request, reply) => {
  const { planetId } = request.params as { planetId: string };
  const story = await db
    .select()
    .from(schema.stories)
    .where(eq(schema.stories.planetId, planetId))
    .get();

  if (!story) return reply.code(404).send({ error: "Story not found" });
  return story;
});

/* -------------------------------------------------------------- media */

app.get("/api/media", async (request) => {
  const { planet, kind } = request.query as { planet?: string; kind?: string };
  const conditions = [];
  if (planet) conditions.push(eq(schema.media.planetId, planet));
  if (kind) conditions.push(eq(schema.media.kind, kind as "photo" | "video"));

  return db
    .select()
    .from(schema.media)
    .where(conditions.length ? and(...conditions) : undefined)
    .all();
});

/* ------------------------------------------------------------- search */

app.get("/api/search", async (request) => {
  const { q } = request.query as { q?: string };
  const term = (q ?? "").trim();
  if (!term) return { planets: [], missions: [], projects: [] };

  const pattern = `%${term}%`;

  const planets = await db
    .select()
    .from(schema.planets)
    .where(or(like(schema.planets.name, pattern), like(schema.planets.nickname, pattern)))
    .all();

  const missions = await db
    .select()
    .from(schema.missions)
    .where(or(like(schema.missions.name, pattern), like(schema.missions.headline, pattern)))
    .all();

  const projects = await db
    .select()
    .from(schema.projects)
    .where(and(like(schema.projects.name, pattern)))
    .all();

  return { planets, missions, projects };
});

/* ------------------------------------------------------------ listen */

await app.register(voiceRoutes);

const port = parseInt(process.env.PORT ?? "3001");

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
