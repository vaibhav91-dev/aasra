import { getMigrations } from "better-auth/db/migration";
import { getAuth } from "../lib/auth.ts";
import { getDatabase } from "../lib/database.ts";
// Run only after the intended Vercel project/database/environment are verified.
if (process.env.DATABASE_URL_UNPOOLED)
  process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
try {
  const migration = await getMigrations(getAuth().options);
  await migration.runMigrations();
  await getDatabase().query(`CREATE TABLE IF NOT EXISTS aasra_worker_data (
 user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
 data JSONB NOT NULL,
 revision INTEGER NOT NULL DEFAULT 1 CHECK (revision>0),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
 )`);
  console.log("Aasra account and worker-data schema is ready.");
} catch {
  console.error(
    "Migration failed. Verify private database/auth configuration and inspect the schema without logging secrets.",
  );
  process.exitCode = 1;
} finally {
  if (process.env.DATABASE_URL) await getDatabase().end();
}
