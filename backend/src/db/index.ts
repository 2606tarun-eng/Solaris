import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as schema from "./schema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/solaris.db";
const dbPath = databaseUrl.startsWith("file:")
  ? databaseUrl
  : `file:${path.resolve(__dirname, "../..", databaseUrl)}`;

// Ensure the data directory exists for file-based databases.
if (dbPath.startsWith("file:")) {
  const filePath = dbPath.slice(5);
  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
}

const client = createClient({ url: dbPath });

export const db = drizzle(client, { schema });
export { schema };
