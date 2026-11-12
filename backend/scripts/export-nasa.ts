import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { db, schema } from "../src/db/index.js";

const outDir = path.join(process.cwd(), "generated", "nasa-filled");
fs.mkdirSync(outDir, { recursive: true });

const dump = async (name: string, table: any) => {
  const rows = await db.select().from(table).all();
  fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(rows, null, 2));
  return rows.length;
};

const counts: Record<string, number> = {};
counts.planets = await dump("planets", schema.planets);
counts.missions = await dump("missions", schema.missions);
counts.projects = await dump("projects", schema.projects);
counts.timelineEvents = await dump("timeline_events", schema.timelineEvents);
counts.stories = await dump("stories", schema.stories);
counts.media = await dump("media", schema.media);

console.log(JSON.stringify(counts, null, 2));
console.log(outDir);
