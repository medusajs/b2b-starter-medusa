import { Client } from "pg";

export default async function clearDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const query = `
      DO $$
      DECLARE
          r RECORD;
      BEGIN
          FOR r IN (
              SELECT tablename
              FROM pg_tables
              WHERE schemaname = current_schema() AND
              tablename NOT IN ('user', 'provider_identity', 'api_key', 'sales_channel', 'provider_identity', 'auth_identity')
          )
          LOOP
              EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE;';
          END LOOP;
      END $$;
    `;

    await client.query(query);
    console.log("✨ Database cleared successfully");
  } catch (error) {
    console.error("Failed to clear database:", error);
    throw error;
  } finally {
    await client.end();
  }
}
