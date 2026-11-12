import "dotenv/config";
import { db, schema } from "../src/db/index.js";
import { searchNasaImages, getAssetManifest } from "../src/lib/nasa/images.js";

/**
 * sync-nasa.ts — enrich the SQLite cache with NASA media.
 *
 * For each planet, search the NASA Image and Video Library and store the best
 * handful of images as `media` rows. The API only ever reads from SQLite, so a
 * NASA outage never breaks the app.
 *
 * Run: pnpm sync
 */

const PLANETS: Array<{ id: string; query: string }> = [
  { id: "mercury", query: "Mercury planet" },
  { id: "venus", query: "Venus planet" },
  { id: "earth", query: "Earth from space" },
  { id: "mars", query: "Mars planet surface" },
  { id: "jupiter", query: "Jupiter planet" },
  { id: "saturn", query: "Saturn rings" },
  { id: "uranus", query: "Uranus planet" },
  { id: "neptune", query: "Neptune planet" },
];

const PER_PLANET = 6;

async function syncPlanet(planetId: string, query: string) {
  const results = await searchNasaImages(query, { mediaType: "image", limit: PER_PLANET * 2 });

  let stored = 0;
  for (const result of results.slice(0, PER_PLANET)) {
    // Prefer the large render; fall back to the search thumbnail.
    let src = result.thumbnailUrl;
    try {
      const manifest = await getAssetManifest(result.nasaId);
      src = manifest.large ?? manifest.medium ?? manifest.original ?? src;
    } catch {
      // Keep the thumbnail if the asset manifest fails.
    }
    if (!src) continue;

    await db
      .insert(schema.media)
      .values({
        id: `${planetId}-${result.nasaId}`,
        planetId,
        missionId: null,
        kind: "photo",
        src,
        caption: result.title,
        href: result.assetUrl,
      })
      .onConflictDoNothing();

    stored++;
  }

  return stored;
}

async function main() {
  let total = 0;
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

  await db.insert(schema.syncLog).values({
    source: "nasa:media",
    status: "ok",
    recordsCount: total,
  });

  console.log(`\nSynced ${total} NASA media records.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
