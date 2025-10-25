/**
 * 🔗 Pact Provider Verification - Quotes API
 * Verifies backend honors contracts defined by storefront consumer
 */

import { Verifier } from "@pact-foundation/pact";
import { DataSource } from "typeorm";
import { getTestDBSeeder } from "./test-db-setup";

describe("Quotes API Provider", () => {
  const PORT = process.env.PACT_PROVIDER_PORT || 9000;
  const PACT_BROKER_URL = process.env.PACT_BROKER_URL || "http://localhost:9292";
  let dataSource: DataSource;
  let seeder: ReturnType<typeof getTestDBSeeder>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: "postgres",
      host: process.env.DATABASE_HOST || "localhost",
      port: parseInt(process.env.DATABASE_PORT || "5432"),
      username: process.env.DATABASE_USERNAME || "postgres",
      password: process.env.DATABASE_PASSWORD || "postgres",
      database: process.env.DATABASE_NAME || "medusa-b2b-test",
      synchronize: false,
    });
    await dataSource.initialize();
    seeder = getTestDBSeeder(dataSource);
  });

  afterAll(async () => {
    await seeder.cleanup();
    await dataSource.destroy();
  });

  it("validates quotes contract from storefront", async () => {
    const opts = {
      provider: "ysh-backend",
      providerBaseUrl: `http://localhost:${PORT}`,
      pactBrokerUrl: PACT_BROKER_URL,
      pactBrokerUsername: "pact",
      pactBrokerPassword: "pact",
      publishVerificationResult: process.env.CI === "true",
      providerVersion: process.env.GIT_COMMIT || "dev",
      stateHandlers: {
        "quote 123 exists": async () => {
          console.log("[Pact] Setting up state: quote 123 exists");
          await seeder.seedQuotes();
          return Promise.resolve();
        },
        "no quotes exist": async () => {
          console.log("[Pact] Setting up state: no quotes exist");
          await seeder.cleanup();
          return Promise.resolve();
        },
        "customer has pending quote": async () => {
          console.log("[Pact] Setting up state: customer has pending quote");
          await seeder.seedQuotes();
          return Promise.resolve();
        },
      },
      logLevel: "info",
      timeout: 30000,
    };

    const verifier = new Verifier(opts);
    await verifier.verifyProvider();
  }, 60000);
});
