"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// DISABLED: Custom modules temporarily disabled for initial setup
// import { QUOTE_MODULE } from "./src/modules/quote";
// import { APPROVAL_MODULE } from "./src/modules/approval";
// import { COMPANY_MODULE } from "./src/modules/company";
// import { YSH_CATALOG_MODULE } from "./src/modules/ysh-catalog";
const utils_1 = require("@medusajs/framework/utils");
const database_ssl_1 = require("./src/utils/database-ssl");
(0, utils_1.loadEnv)(process.env.NODE_ENV, process.cwd());
module.exports = (0, utils_1.defineConfig)({
    projectConfig: {
        databaseUrl: process.env.DATABASE_URL,
        databaseDriverOptions: process.env.DATABASE_URL?.startsWith("sqlite") ? undefined : {
            ssl: (0, database_ssl_1.resolveDatabaseSslConfig)(process.env),
        },
        redisUrl: process.env.REDIS_URL || process.env.MEDUSA_REDIS_URL,
        http: {
            storeCors: process.env.STORE_CORS,
            adminCors: process.env.ADMIN_CORS,
            authCors: process.env.AUTH_CORS,
            jwtSecret: process.env.JWT_SECRET || "supersecret",
            cookieSecret: process.env.COOKIE_SECRET || "supersecret",
        },
    },
    modules: {
        [utils_1.Modules.PRODUCT]: true,
        [utils_1.Modules.PRICING]: true,
        [utils_1.Modules.SALES_CHANNEL]: true,
        [utils_1.Modules.CART]: true,
        [utils_1.Modules.ORDER]: true,
        [utils_1.Modules.INVENTORY]: false, // Explicitly disabled
        [utils_1.Modules.STOCK_LOCATION]: false, // Explicitly disabled
        [utils_1.Modules.FULFILLMENT]: false, // Explicitly disabled
        [utils_1.Modules.PAYMENT]: true,
        [utils_1.Modules.TAX]: true,
        [utils_1.Modules.REGION]: true,
        // Custom modules - DISABLED for initial setup
        // [COMPANY_MODULE]: {
        //   resolve: "./modules/company",
        // },
        // [QUOTE_MODULE]: {
        //   resolve: "./modules/quote",
        // },
        // [APPROVAL_MODULE]: {
        //   resolve: "./modules/approval",
        // },
        // [YSH_CATALOG_MODULE]: {
        //   resolve: "./modules/ysh-catalog",
        // },
        [utils_1.Modules.CACHE]: {
            resolve: "@medusajs/medusa/cache-inmemory",
        },
        [utils_1.Modules.WORKFLOW_ENGINE]: {
            resolve: "@medusajs/medusa/workflow-engine-inmemory",
        },
    },
});
