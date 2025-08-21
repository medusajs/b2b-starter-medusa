import { QUOTE_MODULE } from "./src/modules/quote";
import { APPROVAL_MODULE } from "./src/modules/approval";
import { COMPANY_MODULE } from "./src/modules/company";
import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils";
import { FULFILLMENT_SHIPPING_MODULE } from "./src/modules/fulfillment-shipping";
import { INVOICE_MODULE } from "./src/modules/invoice";

loadEnv(process.env.NODE_ENV!, process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },

  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000", // URL of your Medusa backend
    disable: process.env.ADMIN_DISABLED === "true" || false, // Disable admin (useful for worker mode)
    storefrontUrl: process.env.MEDUSA_STOREFRONT_URL || "http://localhost:8000", // Storefront URL for admin links
    vite: () => {
      return {
        optimizeDeps: {
          include: ["qs"], // Example: include non-ESM compatible libraries
        },
      };
    },
  },
  modules: {
    [COMPANY_MODULE]: {
      resolve: "./modules/company",
    },
    [QUOTE_MODULE]: {
      resolve: "./modules/quote",
    },
    [APPROVAL_MODULE]: {
      resolve: "./modules/approval",
    },
    [FULFILLMENT_SHIPPING_MODULE]: {
      resolve: "./modules/fulfillment-shipping",
    },
    [INVOICE_MODULE]: {
      resolve: "./modules/invoice",
    },
    [Modules.CACHE]: {
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    [Modules.WORKFLOW_ENGINE]: {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    [Modules.EVENT_BUS]: {
      resolve: "@medusajs/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
  },
});
