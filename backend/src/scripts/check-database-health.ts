import { Pool } from "pg";
import { resolveDatabaseSslConfig } from "../utils/database-ssl";

type NodeProcess = {
  env: Record<string, string | undefined>;
  exit: (code: number) => never;
};

const ensureProcess = (): NodeProcess => {
  const instance = (globalThis as { process?: NodeProcess }).process;
  if (!instance) {
    throw new Error("process not available");
  }
  return instance;
};

const nodeProcess = ensureProcess();

const log = (message: string): void => {
  console.log(`[db-health] ${message}`);
};

async function run(): Promise<void> {
  const env = nodeProcess.env;
  const databaseUrl = env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL not set");
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: resolveDatabaseSslConfig(env),
  });

  try {
    log("Checking database connectivity...");
    const result = await pool.query("SELECT 1 as ok");
    if (result.rows?.[0]?.ok !== 1) {
      throw new Error("Unexpected response from database");
    }
    log("Database connection successful.");
  } finally {
    await pool.end();
  }
}

run()
  .then(() => {
    log("Health check finished without errors.");
    nodeProcess.exit(0);
  })
  .catch((error) => {
    console.error(`[db-health] Error: ${(error as Error).message}`);
    nodeProcess.exit(1);
  });
