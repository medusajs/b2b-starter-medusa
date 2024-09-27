import Medusa from "@medusajs/js-sdk";

export const MedusaClient = new Medusa({
  baseUrl: import.meta.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  publishableKey: import.meta.env.MEDUSA_PUBLISHABLE_KEY,
  auth: {
    type: "session",
  },
});
