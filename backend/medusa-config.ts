import { QUOTE_MODULE } from "./src/modules/quote";
// import { APPROVAL_MODULE } from "./src/modules/approval";
import { COMPANY_MODULE } from "./src/modules/company";
import { YSH_CATALOG_MODULE } from "./src/modules/ysh-catalog";
import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils";
import { resolveDatabaseSslConfig } from "./src/utils/database-ssl";

loadEnv(process.env.NODE_ENV!, process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: process.env.DATABASE_URL?.startsWith("sqlite") ? undefined : {
      ssl: resolveDatabaseSslConfig(process.env),
    },
    redisUrl: process.env.REDIS_URL || process.env.MEDUSA_REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
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
    [Modules.INVENTORY]: false, // Explicitly disabled
    [Modules.STOCK_LOCATION]: false, // Explicitly disabled
    [Modules.FULFILLMENT]: false, // Explicitly disabled
    [Modules.PAYMENT]: true,
    [Modules.TAX]: true,
    [Modules.REGION]: true,
    // Custom modules
    [COMPANY_MODULE]: {
      resolve: "./modules/company",
    },
    [QUOTE_MODULE]: {
      resolve: "./modules/quote",
    },
    // [APPROVAL_MODULE]: {
    //   resolve: "./modules/approval",
    // },
    [YSH_CATALOG_MODULE]: {
      resolve: "./modules/ysh-catalog",
    },
    [Modules.CACHE]: {
      resolve: "@medusajs/medusa/cache-inmemory",
    },
    [Modules.WORKFLOW_ENGINE]: {
      resolve: "@medusajs/medusa/workflow-engine-inmemory",
    },
  },
});
