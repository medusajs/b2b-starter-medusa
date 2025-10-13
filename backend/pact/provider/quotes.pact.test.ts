/**
 * 🔗 Pact Provider Verification - Quotes API
 * Verifies backend honors contracts defined by storefront consumer
 */

import { Verifier } from "@pact-foundation/pact";

describe("Quotes API Provider", () => {
  const PORT = process.env.PACT_PROVIDER_PORT || 9000;
  const PACT_BROKER_URL = process.env.PACT_BROKER_URL || "http://localhost:9292";

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
