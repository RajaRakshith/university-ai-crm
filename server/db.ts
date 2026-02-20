import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env before anything else. Works in both ESM (tsx) and CJS (production bundle).
const serverDir =
  typeof __dirname !== "undefined"
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));
// Try worktree root first, then main repo root
config({ path: resolve(serverDir, "../.env") });
if (!process.env.DATABASE_URL) {
  config({ path: resolve(serverDir, "../../../../.env") });
}

import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database or copy .env?"
  );
}

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
