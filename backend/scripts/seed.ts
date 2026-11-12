import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import { db, schema } from "../src/db/index.js";

/**
 * seed.ts — port the frontend's curated data into SQLite.
 *
 * The frontend is the single source of truth for hand-checked mission data.
 * Rather than duplicating ~1000 lines, this script:
 *   1. Reads the frontend's data/*.ts files
 *   2. Rewrites their `../assets` import to a generated stub with real paths
 *   3. Writes them into ./generated
 *   4. Dynamically imports them (tsx transpiles the TS)
 *   5. Upserts everything into the SQLite tables
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(here, "../..");
const frontendData = path.join(workspace, "frontend/src/data");
const frontendAssets = path.join(workspace, "frontend/src/assets.ts");
const generated = path.join(here, "..", "generated");

const DATA_FILES = [
  "missions.ts",
  "projects.ts",
  "timelineEvents.ts",
  "planets.ts",
  "solarSystem.ts",
];

function buildAssetStub(): string {
  const source = fs.readFileSync(frontendAssets, "utf8");
  const entries: string[] = [];
  const re = /(\w+):\s*asset\("([^"]+)"\)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    entries.push(`  ${match[1]}: "/assets/${match[2]}",`);
  }
  return `export const img = {\n${entries.join("\n")}\n};\nexport default img;\n`;
}

function prepare() {
  fs.mkdirSync(generated, { recursive: true });
  fs.writeFileSync(path.join(generated, "assets.ts"), buildAssetStub(), "utf8");

  for (const file of DATA_FILES) {
    const src = fs.readFileSync(path.join(frontendData, file), "utf8");
    // The only non-relative module the data files import is the asset registry.
    const rewritten = src.replace(/from\s+["']\.\.\/assets["']/g, 'from "./assets"');
    fs.writeFileSync(path.join(generated, file), rewritten, "utf8");
  }
}

async function loadModules() {
  const load = (file: string) => import(pathToFileURL(path.join(generated, file)).href);
  const [missions, projects, timeline, planets] = await Promise.all([
    load("missions.ts"),
    load("projects.ts"),
    load("timelineEvents.ts"),
    load("planets.ts"),
  ]);
  return { missions, projects, timeline, planets };
}

async function seed() {
  prepare();
  const {
    missions: missionsMod,
    projects: projectsMod,
    timeline: timelineMod,
    planets: planetsMod,
  } = await loadModules();

  const planetList = planetsMod.planets as Array<{
    id: string;
    name: string;
    tagline: string;
    color: string;
    hero?: string;
    src: string;
  }>;
  const storyMap = missionsMod.planetStories as Record<
    string,
    { nickname: string; headline: string; intro: string; funFact: string }
  >;
  const missionList = missionsMod.missions as Array<{
    id: string;
    planetId: string;
    name: string;
    agency: string;
    status: "active" | "retired";
    launched: number;
    ended?: number;
    headline: string;
    summary: string;
    funFact: string;
    stats: Array<{ label: string; value: string }>;
    image: string;
    nasaUrl: string;
  }>;
  const projectList = projectsMod.projects as Array<{
    id: string;
    planetId: string;
    name: string;
    agency: string;
    status: "active" | "retired";
    launched: number;
    ended?: number;
    featured?: boolean;
  }>;
  const timelineList = timelineMod.timelineEvents as Array<{
    year: number;
    title: string;
    kind: "launch" | "arrival" | "milestone" | "end";
    planetId?: string;
    detail: string;
  }>;

  // Wipe tables so the seed is idempotent.
  await db.delete(schema.syncLog);
  await db.delete(schema.voiceCache);
  await db.delete(schema.media);
  await db.delete(schema.timelineEvents);
  await db.delete(schema.projects);
  await db.delete(schema.stories);
  await db.delete(schema.missions);
  await db.delete(schema.planets);

  // Planets
  for (const planet of planetList) {
    const story = storyMap[planet.id];
    await db.insert(schema.planets).values({
      id: planet.id,
      name: planet.name,
      nickname: story?.nickname ?? planet.tagline,
      tagline: planet.tagline,
      color: planet.color,
      heroImageUrl: planet.hero ?? planet.src,
    });
  }

  // Stories
  for (const planet of planetList) {
    const story = storyMap[planet.id];
    if (!story) continue;
    await db.insert(schema.stories).values({
      planetId: planet.id,
      headline: story.headline,
      intro: story.intro,
      funFact: story.funFact,
    });
  }

  // Missions
  for (const mission of missionList) {
    await db.insert(schema.missions).values({
      id: mission.id,
      planetId: mission.planetId,
      name: mission.name,
      agency: mission.agency,
      status: mission.status,
      launched: mission.launched,
      ended: mission.ended ?? null,
      headline: mission.headline,
      summary: mission.summary,
      funFact: mission.funFact,
      nasaUrl: mission.nasaUrl,
      heroImageUrl: mission.image,
      stats: JSON.stringify(mission.stats),
    });
  }

  // Projects
  for (const project of projectList) {
    await db.insert(schema.projects).values({
      id: project.id,
      planetId: project.planetId,
      name: project.name,
      agency: project.agency,
      status: project.status,
      launched: project.launched,
      ended: project.ended ?? null,
      featured: project.featured ? 1 : 0,
    });
  }

  // Timeline
  for (const event of timelineList) {
    await db.insert(schema.timelineEvents).values({
      year: event.year,
      title: event.title,
      kind: event.kind,
      planetId: event.planetId ?? null,
      detail: event.detail,
    });
  }

  await db.insert(schema.syncLog).values({
    source: "frontend-seed",
    status: "ok",
    recordsCount: missionList.length + projectList.length + timelineList.length,
  });

  console.log(
    `Seeded ${planetList.length} planets, ${storyMap ? Object.keys(storyMap).length : 0} stories, ` +
      `${missionList.length} missions, ${projectList.length} projects, ` +
      `${timelineList.length} timeline events.`,
  );
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
