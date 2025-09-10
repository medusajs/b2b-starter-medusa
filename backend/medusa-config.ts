import { QUOTE_MODULE } from "./src/modules/quote";
import { APPROVAL_MODULE } from "./src/modules/approval";
import { COMPANY_MODULE } from "./src/modules/company";
import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils";
import { FULFILLMENT_SHIPPING_MODULE } from "./src/modules/fulfillment-shipping";
import { INVOICE_MODULE } from "./src/modules/invoice";
import { EMAIL_MODULE } from "./src/modules/email";
import { EMAIL_SERVICE } from "./src/services/email-service-registration";

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
    [EMAIL_MODULE]: {
      resolve: "./modules/email",
    },
    [EMAIL_SERVICE]: {
      resolve: "./services/email-service-registration",
    },
    [Modules.FILE]: {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              // public base URL for your bucket
              file_url: `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`,
              bucket: process.env.S3_BUCKET,
              region: process.env.S3_REGION,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,

              // optional if you're using AWS proper; set for MinIO/Spaces/etc.
              // endpoint: `https://s3.${process.env.S3_REGION}.amazonaws.com`,

              // ✅ put everything under products/
              prefix: "products/",

              // extra AWS SDK client options (v2 name is `additional_client_config`)
              additional_client_config: {
                signatureVersion: "v4",
              },
            },
          },
        ],
      },
    },
    [Modules.CACHE]: {
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    [Modules.WORKFLOW_ENGINE]: {
      resolve: "@medusajs/medusa/workflow-engine-inmemory",
    },
    [Modules.EVENT_BUS]: {
      resolve: "@medusajs/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
  },
});
