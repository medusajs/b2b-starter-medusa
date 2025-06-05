import { QUOTE_MODULE } from "./src/modules/quote";
import { APPROVAL_MODULE } from "./src/modules/approval";
import { COMPANY_MODULE } from "./src/modules/company";
import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils";

import type { InputConfig } from "@medusajs/framework/types";

loadEnv(process.env.NODE_ENV!, process.cwd());

const isDevelopment = process.env.NODE_ENV === "development";

const config = {
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
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
    [Modules.CACHE]: {
      resolve: "@medusajs/medusa/cache-inmemory",
    },
    [Modules.WORKFLOW_ENGINE]: {
      resolve: "@medusajs/medusa/workflow-engine-inmemory",
    },
  },
} as InputConfig;

if (!isDevelopment && config.projectConfig) {
  config.projectConfig.workerMode = process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server",
  config.projectConfig.redisUrl = process.env.REDIS_URL;
  config.admin = {
    backendUrl: process.env.MEDUSA_BACKEND_URL,
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
  };
  config.modules ? config.modules[Modules.CACHE] = {
    resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
  } : undefined;
  config.modules ? config.modules[Modules.WORKFLOW_ENGINE] = {
    resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          url: process.env.REDIS_URL,
        }
      },
  } : undefined;
  config.modules ? config.modules[Modules.EVENT_BUS] = {
  resolve: "@medusajs/medusa/event-bus-redis",
    options: {
      redisUrl: process.env.REDIS_URL,
    },
  } : undefined;
}

export default defineConfig(config);