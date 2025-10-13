// Módulos B2B customizados - constantes definidas inline para evitar imports circulares
const YSH_PRICING_MODULE = "ysh-pricing";
const UNIFIED_CATALOG_MODULE = "unifiedCatalog";
const COMPANY_MODULE = "company";
const QUOTE_MODULE = "quote";
const APPROVAL_MODULE = "approval";

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
    // Módulos B2B - registrados usando constantes exportadas
    [COMPANY_MODULE]: {
      resolve: "./modules/company",
    },
    // TODO: Fix ESM resolution issue with quote module
    // [QUOTE_MODULE]: {
    //   resolve: "./modules/quote",
    // },
    [APPROVAL_MODULE]: {
      resolve: "./modules/approval",
    },
    // ==========================================
    // INFRASTRUCTURE MODULES CONFIGURATION
    // ==========================================
    // Event Bus: Redis for production, in-memory for development
    [Modules.EVENT_BUS]: process.env.NODE_ENV === "production"
      ? {
        resolve: "@medusajs/medusa/event-bus-redis",
        options: {
          redisUrl: process.env.REDIS_URL || process.env.MEDUSA_REDIS_URL,
        },
      }
      : {
        resolve: "@medusajs/medusa/event-bus-local",
      },
    // File Service: Local for development, cloud storage for production
    [Modules.FILE]: process.env.NODE_ENV === "production"
      ? {
        resolve: "@medusajs/medusa/file-s3",
        options: {
          s3: {
            access_key_id: process.env.S3_ACCESS_KEY_ID,
            secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
            region: process.env.S3_REGION || "us-east-1",
            bucket: process.env.S3_BUCKET,
            endpoint: process.env.S3_ENDPOINT,
          },
        },
      }
      : {
        resolve: "@medusajs/medusa/file-local",
        options: {
          upload_dir: "uploads",
        },
      },
    // Notification: Configurable providers
    [Modules.NOTIFICATION]: {
      resolve: "@medusajs/medusa/notification-local",
      options: {
        // Can be extended with email/SMS providers
      },
    },
    // Locking: Redis for production distributed locking
    [Modules.LOCKING]: process.env.NODE_ENV === "production"
      ? {
        resolve: "@medusajs/medusa/locking-redis",
        options: {
          redis: {
            url: process.env.REDIS_URL || process.env.MEDUSA_REDIS_URL,
          },
        },
      }
      : {
        resolve: "@medusajs/medusa/locking-local",
      },
    // Cache: Use Redis for production (multi-instance support)
    // Dev: Use in-memory for local development
    [Modules.CACHE]: process.env.NODE_ENV === "production"
      ? {
        resolve: "@medusajs/medusa/cache-redis",
        options: {
          redisUrl: process.env.REDIS_URL || process.env.MEDUSA_REDIS_URL,
          ttl: 3600, // 1 hour default TTL for better performance
          namespace: "medusa-cache",
        },
      }
      : {
        resolve: "@medusajs/medusa/cache-inmemory",
        options: {
          ttl: 3600,
          max: 1000, // Increased max items for development
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
          // Workflow engine specific options
          jobQueueOptions: {
            removeOnComplete: 100, // Keep last 100 completed jobs
            removeOnFail: 50, // Keep last 50 failed jobs
          },
        },
      }
      : {
        resolve: "@medusajs/medusa/workflow-engine-inmemory",
        options: {
          jobQueueOptions: {
            removeOnComplete: 50,
            removeOnFail: 20,
          },
        },
      },
  },
});
