// Módulos B2B customizados - constantes definidas inline para evitar imports circulares
const UNIFIED_CATALOG_MODULE = "unifiedCatalog";
const COMPANY_MODULE = "company";

import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      host: "0.0.0.0",
      port: 9000,
      storeCors: process.env.MEDUSA_DEV_URL || "http://localhost:8000",
      adminCors: process.env.MEDUSA_DEV_URL || "http://localhost:8000",
      authCors: process.env.MEDUSA_DEV_URL || "http://localhost:8000",
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: {
    [Modules.PRODUCT]: true,
    [Modules.PRICING]: true,
    [Modules.SALES_CHANNEL]: true,
    [Modules.CART]: true,
    [Modules.ORDER]: true,
    [Modules.INVENTORY]: true,
    [Modules.STOCK_LOCATION]: true,
    [Modules.FULFILLMENT]: true,
    [Modules.PAYMENT]: true,
    [Modules.TAX]: true,
    [Modules.REGION]: true,

    // Infraestrutura - desenvolvimento
    [Modules.CACHE]: {
      resolve: "@medusajs/medusa/cache-inmemory",
    },
    [Modules.WORKFLOW_ENGINE]: {
      resolve: "@medusajs/medusa/workflow-engine-inmemory",
    },
  },
});
