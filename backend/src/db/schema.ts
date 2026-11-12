import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Solaris backend schema.
 *
 * The data model mirrors the frontend's TypeScript types so the API can serve
 * the UI directly without a mapping layer. SQLite is the cache + fallback:
 * the sync script upserts into these tables, and the API reads from them.
 */

export const planets = sqliteTable("planets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nickname: text("nickname"),
  tagline: text("tagline"),
  color: text("color"),
  heroImageUrl: text("hero_image_url"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const missions = sqliteTable("missions", {
  id: text("id").primaryKey(),
  planetId: text("planet_id")
    .notNull()
    .references(() => planets.id),
  name: text("name").notNull(),
  agency: text("agency"),
  status: text("status").$type<"active" | "retired">(),
  launched: integer("launched"),
  ended: integer("ended"),
  headline: text("headline"),
  summary: text("summary"),
  funFact: text("fun_fact"),
  nasaUrl: text("nasa_url"),
  heroImageUrl: text("hero_image_url"),
  stats: text("stats"), // JSON string: [{ label, value }]
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  planetId: text("planet_id")
    .notNull()
    .references(() => planets.id),
  name: text("name").notNull(),
  agency: text("agency"),
  status: text("status").$type<"active" | "retired">(),
  launched: integer("launched"),
  ended: integer("ended"),
  featured: integer("featured").default(0),
});

export const timelineEvents = sqliteTable("timeline_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  year: integer("year").notNull(),
  title: text("title").notNull(),
  kind: text("kind").$type<"launch" | "arrival" | "milestone" | "end">(),
  planetId: text("planet_id").references(() => planets.id),
  detail: text("detail"),
});

export const stories = sqliteTable("stories", {
  planetId: text("planet_id")
    .primaryKey()
    .references(() => planets.id),
  headline: text("headline"),
  intro: text("intro"),
  funFact: text("fun_fact"),
  voiceCacheUrl: text("voice_cache_url"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  planetId: text("planet_id").references(() => planets.id),
  missionId: text("mission_id").references(() => missions.id),
  kind: text("kind").$type<"photo" | "video">(),
  src: text("src").notNull(),
  caption: text("caption"),
  href: text("href"),
});

export const voiceCache = sqliteTable("voice_cache", {
  id: text("id").primaryKey(), // SHA-256 hash of transcript
  transcript: text("transcript").notNull(),
  audioUrl: text("audio_url").notNull(),
  durationMs: integer("duration_ms"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const syncLog = sqliteTable("sync_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  source: text("source").notNull(),
  status: text("status").$type<"ok" | "error">(),
  recordsCount: integer("records_count"),
  error: text("error"),
  syncedAt: text("synced_at").$defaultFn(() => new Date().toISOString()),
});
