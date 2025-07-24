import Medusa from "@medusajs/js-sdk";

export const sdk = new Medusa({
  baseUrl: "/",
  debug: process.env.NODE_ENV === "development",
  auth: {
    type: "session",
  },
});
