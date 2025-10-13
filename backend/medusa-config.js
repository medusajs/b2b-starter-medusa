"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { QUOTE_MODULE } from "./src/modules/quote/index.ts";
import { APPROVAL_MODULE } from "./src/modules/approval/index.ts";
import { COMPANY_MODULE } from "./src/modules/company/index.ts";
import { YSH_CATALOG_MODULE } from "./src/modules/ysh-catalog/index.ts";
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
        // Custom modules - ENABLED for testing
        [COMPANY_MODULE]: {
            resolve: "./src/modules/company",
            definition: {
                isQueryable: true,
            },
        },
        // [QUOTE_MODULE]: {
        //     resolve: "./src/modules/quote",
        //     definition: {
        //         isQueryable: true,
        //     },
        // },
        [APPROVAL_MODULE]: {
            resolve: "./src/modules/approval",
            definition: {
                isQueryable: true,
            },
        },
        [YSH_CATALOG_MODULE]: {
            resolve: "./src/modules/ysh-catalog",
            definition: {
                isQueryable: true,
            },
        },
        [utils_1.Modules.CACHE]: {
            resolve: "@medusajs/medusa/cache-inmemory",
        },
        [utils_1.Modules.WORKFLOW_ENGINE]: {
            resolve: "@medusajs/medusa/workflow-engine-inmemory",
        },
    },
});
