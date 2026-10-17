import "server-only";
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";
let pool: Pool | undefined;
export function getDatabase(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("CLOUD_CONFIG");
  if (pool) return pool;
  const url = new URL(process.env.DATABASE_URL);
  if (
    ["require", "prefer", "verify-ca"].includes(
      url.searchParams.get("sslmode") ?? "",
    )
  )
    url.searchParams.set("sslmode", "verify-full");
  pool = new Pool({
    connectionString: url.toString(),
    max: 3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 8000,
    statement_timeout: 10000,
    query_timeout: 10000,
    allowExitOnIdle: true,
  });
  if (process.env.VERCEL) attachDatabasePool(pool);
  return pool;
}
