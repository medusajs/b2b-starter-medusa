/**
 * Pact Provider Test Setup
 * Minimal configuration for contract verification
 */

import { Verifier } from "@pact-foundation/pact";
import path from "path";

export interface PactVerifierOptions {
  provider: string;
  providerBaseUrl: string;
  pactBrokerUrl?: string;
  pactBrokerUsername?: string;
  pactBrokerPassword?: string;
  publishVerificationResult?: boolean;
  providerVersion?: string;
  consumerVersionSelectors?: Array<{ tag?: string; latest?: boolean }>;
}

export async function verifyPacts(options: PactVerifierOptions) {
  const {
    provider,
    providerBaseUrl,
    pactBrokerUrl = process.env.PACT_BROKER_URL || "http://localhost:9292",
    pactBrokerUsername = process.env.PACT_BROKER_USERNAME || "pact",
    pactBrokerPassword = process.env.PACT_BROKER_PASSWORD || "pact",
    publishVerificationResult = false,
    providerVersion = process.env.GIT_COMMIT || "dev",
    consumerVersionSelectors = [{ tag: "main", latest: true }],
  } = options;

  const verifier = new Verifier({
    provider,
    providerBaseUrl,
    pactBrokerUrl,
    pactBrokerUsername,
    pactBrokerPassword,
    publishVerificationResult,
    providerVersion,
    consumerVersionSelectors,
    logLevel: "info",
    timeout: 30000,
  });

  try {
    const output = await verifier.verifyProvider();
    console.log("Pact verification complete:", output);
    return output;
  } catch (error) {
    console.error("Pact verification failed:", error);
    throw error;
  }
}

export function createProviderState(name: string, handler: () => Promise<void>) {
  return {
    state: name,
    handler,
  };
}
