/**
 * 🔗 Pact Provider Verification - Catalog API
 * Verifies backend catalog endpoints honor storefront contracts
 */

import { Verifier } from "@pact-foundation/pact";

describe("Catalog API Provider", () => {
  const PORT = process.env.PACT_PROVIDER_PORT || 9000;
  const PACT_BROKER_URL = process.env.PACT_BROKER_URL || "http://localhost:9292";

  it("validates catalog contract from storefront", async () => {
    const opts = {
      provider: "ysh-backend",
      providerBaseUrl: `http://localhost:${PORT}`,
      pactBrokerUrl: PACT_BROKER_URL,
      pactBrokerUsername: "pact",
      pactBrokerPassword: "pact",
      publishVerificationResult: process.env.CI === "true",
      providerVersion: process.env.GIT_COMMIT || "dev",
      stateHandlers: {
        "products exist": async () => {
          console.log("[Pact] Setting up state: products exist");
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
