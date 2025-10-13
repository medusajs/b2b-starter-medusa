// Módulos B2B customizados - usando strings diretas para evitar problemas de build
// import { QUOTE_MODULE } from "./src/modules/quote";
// import { APPROVAL_MODULE } from "./src/modules/approval";
// import { COMPANY_MODULE } from "./src/modules/company";
import { YSH_PRICING_MODULE } from "./src/modules/ysh-pricing";
import { UNIFIED_CATALOG_MODULE } from "./src/modules/unified-catalog";
import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils";
import { resolveDatabaseSslConfig } from "./src/utils/database-ssl";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: process.env.DATABASE_URL?.startsWith("sqlite") ? undefined : {
      ssl: resolveDatabaseSslConfig(process.env),
    },
    redisUrl: process.env.REDIS_URL || process.env.MEDUSA_REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || "*",
      adminCors: process.env.ADMIN_CORS || "*",
      authCors: process.env.AUTH_CORS || "*",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: {
    [Modules.PRODUCT]: true,
    [Modules.PRICING]: true,
    [Modules.SALES_CHANNEL]: true,
    [Modules.CART]: true,
    [Modules.ORDER]: true,
    [Modules.INVENTORY]: true, // Enabled for basic functionality
    [Modules.STOCK_LOCATION]: true, // Enabled for seed script
    [Modules.FULFILLMENT]: true, // Enabled for shipping profiles
    [Modules.PAYMENT]: true,
    [Modules.TAX]: true,
    [Modules.REGION]: true,
    // Custom modules
    [YSH_PRICING_MODULE]: {
      resolve: "./modules/ysh-pricing",
      options: {
        catalogPath: process.env.YSH_CATALOG_PATH || "./data/catalog",
      },
    },
    [UNIFIED_CATALOG_MODULE]: {
      resolve: "./modules/unified-catalog",
      definition: {
        isQueryable: true,
      },
    },
    // Módulos B2B - registrados por string direta
    "company": {
      resolve: "./modules/company",
    },
    "quote": {
      resolve: "./modules/quote",
    },
    "approval": {
      resolve: "./modules/approval",
    },
    // ==========================================
    // MEDUSA 2.10.3 PRODUCTION BEST PRACTICES
    // ==========================================
    // Cache: Use Redis for production (multi-instance support)
    // Dev: Use in-memory for local development
    [Modules.CACHE]: process.env.NODE_ENV === "production"
      ? {
        resolve: "@medusajs/medusa/cache-redis",
        options: {
          redisUrl: process.env.REDIS_URL || process.env.MEDUSA_REDIS_URL,
          ttl: 30, // 30 seconds default TTL
          namespace: "medusa",
        },
      }
      : {
        resolve: "@medusajs/medusa/cache-inmemory",
        options: {
          ttl: 30,
          max: 500, // Max 500 items in memory
        },
      },
    // Workflow Engine: Use Redis for production (distributed task execution)
    [Modules.WORKFLOW_ENGINE]: process.env.NODE_ENV === "production"
      ? {
        resolve: "@medusajs/medusa/workflow-engine-redis",
        options: {
          redis: {
            url: process.env.REDIS_URL || process.env.MEDUSA_REDIS_URL,
            // Job queue configuration
            connection: {
              maxRetriesPerRequest: null,
              enableReadyCheck: false,
            },
          },
        },
      }
      : {
        resolve: "@medusajs/medusa/workflow-engine-inmemory",
      },
  },
});
