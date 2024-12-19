import Medusa from "@medusajs/js-sdk";

const backendUrl =
  import.meta.env.MEDUSA_BACKEND_URL ||
  // process.env.MEDUSA_BACKEND_URL ||
  "http://localhost:9000";

export const sdk = new Medusa({
  baseUrl: backendUrl,
  auth: {
    type: "session",
  },
  logger: {
    info: (...messages: any[]) =>
      console.log("backendUrl", backendUrl, ...messages),
    error: (...messages: any[]) =>
      console.error("backendUrl", backendUrl, ...messages),
    warn: (...messages: any[]) =>
      console.warn("backendUrl", backendUrl, ...messages),
    debug: (...messages: any[]) =>
      console.log("backendUrl", backendUrl, ...messages),
  },
});
