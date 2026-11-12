import "dotenv/config";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./index.js";

/**
 * Run Drizzle migrations. For a competition project, `db:push` is simpler;
 * this script is the explicit, production-safe path.
 */
export function runMigrations() {
  return migrate(db, { migrationsFolder: "./drizzle" });
}

// Allow running directly: `tsx src/db/migrate.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => console.log("Migrations complete."))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
