import type { InputConfig } from "@medusajs/framework/types";
import { defineConfig, loadEnv } from "@medusajs/framework/utils";

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
    ...((!isDevelopment && {
      workerMode: process.env.MEDUSA_WORKER_MODE as
        | "shared"
        | "worker"
        | "server",
      redisUrl: process.env.REDIS_URL,
    }) ||
      {}),
  },
  ...((!isDevelopment && {
    admin: {
      backendUrl: process.env.MEDUSA_BACKEND_URL,
      disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    },
  }) ||
    {}),
  modules: [
    {
      resolve: "./modules/company",
    },
    {
      resolve: "./modules/quote",
    },
    {
      resolve: "./modules/approval",
    },
    {
      resolve: "./modules/algolia",
      options: {
        appId: process.env.ALGOLIA_APP_ID!,
        apiKey: process.env.ALGOLIA_API_KEY!,
        productIndexName: process.env.ALGOLIA_PRODUCT_INDEX_NAME!,
      },
    },
    // {
    //   resolve: "@medusajs/medusa/fulfillment",
    //   providers: [
    //     {
    //       resolve: "./modules/despatch-lab",
    //       id: "despatch-lab",
    //       options: {
    //         apiUrl: process.env.DESPATCH_LAB_API_URL,
    //         key: process.env.DESPATCH_LAB_KEY,
    //         secret: process.env.DESPATCH_LAB_SECRET,
    //       },
    //     },
    //   ],
    // },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/resend",
            id: "resend",
            options: {
              channels: ["email"],
              api_key: process.env.RESEND_API_KEY,
              from: process.env.RESEND_FROM_EMAIL,
            },
          },
        ],
      },
    },
    {
      resolve: isDevelopment
        ? "@medusajs/medusa/cache-inmemory"
        : "@medusajs/medusa/cache-redis",
      options: isDevelopment
        ? {}
        : {
            redisUrl: process.env.REDIS_URL,
          },
    },
    {
      resolve: isDevelopment
        ? "@medusajs/medusa/workflow-engine-inmemory"
        : "@medusajs/medusa/workflow-engine-redis",
      options: isDevelopment
        ? {}
        : {
            redis: {
              url: process.env.REDIS_URL,
            },
          },
    },
    ...((!isDevelopment && [
      {
        resolve: "@medusajs/medusa/event-bus-redis",
        options: {
          redisUrl: process.env.REDIS_URL,
        },
      },
    ]) ||
      []),
  ],
} as InputConfig;

export default defineConfig(config);
