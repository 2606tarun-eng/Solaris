import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, schema } from "../src/db/index.js";
import { searchNasaImages, getAssetManifest } from "../src/lib/nasa/images.js";

/**
 * sync-nasa.ts — enrich the SQLite cache with real NASA media.
 *
 * Uses the NASA Image and Video Library (images-api.nasa.gov, no API key
 * required) to fetch photos for each planet and for each mission/project in the
 * database, storing them as `media` rows. The API reads from SQLite, so outages
 * never break the app.
 *
 * Run: pnpm sync
 */

const PLANETS: Array<{ id: string; query: string }> = [
  { id: "mercury", query: "Mercury planet MESSENGER" },
  { id: "venus", query: "Venus planet Magellan" },
  { id: "earth", query: "Earth from space Blue Marble" },
  { id: "mars", query: "Mars planet Perseverance rover" },
  { id: "jupiter", query: "Jupiter planet Juno" },
  { id: "saturn", query: "Saturn planet Cassini rings" },
  { id: "uranus", query: "Uranus planet Voyager 2" },
  { id: "neptune", query: "Neptune planet Voyager 2" },
];

const PER_PLANET = 6;
const PER_MISSION = 3;

async function storeImage(opts: {
  id: string;
  planetId: string;
  missionId: string | null;
  nasaId: string;
  title: string;
  thumbnailUrl: string | null;
  assetUrl: string;
}) {
  let src = opts.thumbnailUrl;
  try {
    const manifest = await getAssetManifest(opts.nasaId);
    src = manifest.large ?? manifest.medium ?? manifest.original ?? src;
  } catch {
    // Keep the thumbnail if the asset manifest fails.
  }
  if (!src) return false;

  await db
    .insert(schema.media)
    .values({
      id: opts.id,
      planetId: opts.planetId,
      missionId: opts.missionId,
      kind: "photo",
      src,
      caption: opts.title,
      href: opts.assetUrl,
    })
    .onConflictDoUpdate({
      target: schema.media.id,
      set: { src, caption: opts.title, href: opts.assetUrl },
    });

  return true;
}

async function syncPlanet(planetId: string, query: string) {
  const results = await searchNasaImages(query, { mediaType: "image", limit: PER_PLANET * 2 });
  let stored = 0;
  for (const result of results.slice(0, PER_PLANET)) {
    const ok = await storeImage({
      id: `${planetId}-${result.nasaId}`,
      planetId,
      missionId: null,
      nasaId: result.nasaId,
      title: result.title,
      thumbnailUrl: result.thumbnailUrl,
      assetUrl: result.assetUrl,
    });
    if (ok) stored++;
  }
  return stored;
}

async function syncMission(mission: { id: string; name: string; planetId: string }) {
  const queries = [
    `${mission.name} ${mission.planetId} mission`,
    mission.name,
  ];

  let stored = 0;
  const seen = new Set<string>();

  for (const query of queries) {
    if (stored >= PER_MISSION) break;
    let results;
    try {
      results = await searchNasaImages(query, { mediaType: "image", limit: PER_MISSION * 2 });
    } catch {
      continue;
    }

    for (const result of results) {
      if (stored >= PER_MISSION) break;
      if (seen.has(result.nasaId)) continue;
      seen.add(result.nasaId);

      const ok = await storeImage({
        id: `mission-${mission.id}-${result.nasaId}`,
        planetId: mission.planetId,
        missionId: mission.id,
        nasaId: result.nasaId,
        title: result.title,
        thumbnailUrl: result.thumbnailUrl,
        assetUrl: result.assetUrl,
      });
      if (ok) stored++;
    }
  }

  return stored;
}

async function main() {
  let total = 0;

  console.log("Syncing planet media from NASA Image Library...");
  for (const planet of PLANETS) {
    try {
      const stored = await syncPlanet(planet.id, planet.query);
      total += stored;
      console.log(`  ${planet.id}: ${stored} media`);
    } catch (err) {
      console.error(`  ${planet.id}: failed —`, (err as Error).message);
      await db.insert(schema.syncLog).values({
        source: `nasa:${planet.id}`,
        status: "error",
        error: (err as Error).message,
      });
    }
  }

  console.log("\nSyncing mission media from NASA Image Library...");
  const missions = await db
    .select({ id: schema.missions.id, name: schema.missions.name, planetId: schema.missions.planetId })
    .from(schema.missions)
    .all();

  for (const mission of missions) {
    try {
      const stored = await syncMission(mission);
      total += stored;
      if (stored > 0) console.log(`  ${mission.name} (${mission.planetId}): ${stored} media`);
    } catch (err) {
      console.error(`  ${mission.name}: failed —`, (err as Error).message);
      await db.insert(schema.syncLog).values({
        source: `nasa:mission:${mission.id}`,
        status: "error",
        error: (err as Error).message,
      });
    }
  }

  await db.insert(schema.syncLog).values({
    source: "nasa:media",
    status: "ok",
    recordsCount: total,
  });

  console.log(`\nSynced ${total} NASA media records into SQLite.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
