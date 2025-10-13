import { defineConfig, loadEnv } from "@medusajs/framework/utils";

// Carrega .env conforme NODE_ENV (ex.: .env, .env.development)
loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default defineConfig({
  projectConfig: {
    // Banco de dados (PostgreSQL via URL completa)
    databaseUrl: process.env.DATABASE_URL!,

    // Redis (opcional)
    redisUrl: process.env.REDIS_URL,

    // HTTP + CORS
    http: {
      port: Number(process.env.PORT || 9000),

      // CORS — no dev, aceite o frontend local
      storeCors: process.env.MEDUSA_DEV_URL || "http://localhost:8000",
      adminCors: process.env.MEDUSA_DEV_URL || "http://localhost:8000",
      authCors: process.env.MEDUSA_DEV_URL || "http://localhost:8000",

      // Segredos
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret"
    },
  },

  // Admin app embutido
  admin: {
    path: "/app",
  },

  // Módulos - Core Medusa + Custom B2B
  modules: {
    // Core Medusa modules
    "@medusajs/product": true,
    "@medusajs/pricing": true,
    "@medusajs/sales-channel": true,
    "@medusajs/cart": true,
    "@medusajs/order": true,
    "@medusajs/inventory": true,
    "@medusajs/stock-location": true,
    "@medusajs/fulfillment": true,
    "@medusajs/payment": true,
    "@medusajs/tax": true,
    "@medusajs/region": true,

    // Infraestrutura - desenvolvimento
    "@medusajs/cache": {
      resolve: "@medusajs/medusa/cache-inmemory",
    },
    "@medusajs/workflow-engine": {
      resolve: "@medusajs/medusa/workflow-engine-inmemory",
    },

    // File Module - S3 Storage (opcional)
    "@medusajs/file": process.env.FILE_S3_BUCKET
      ? {
        resolve: "@medusajs/medusa/file-s3",
        options: {
          file_url: process.env.FILE_S3_URL,
          access_key_id: process.env.FILE_S3_ACCESS_KEY_ID,
          secret_access_key: process.env.FILE_S3_SECRET_ACCESS_KEY,
          region: process.env.FILE_S3_REGION,
          bucket: process.env.FILE_S3_BUCKET,
        },
      }
      : {
        resolve: "@medusajs/medusa/file-local",
        options: {
          upload_dir: "uploads",
          backend_url: process.env.MEDUSA_DEV_URL || "http://localhost:9000",
        },
      },

    // Módulos B2B customizados
    unifiedCatalog: {
      resolve: "./src/modules/unified-catalog",
      definition: {
        isQueryable: true,
      },
    },
    company: {
      resolve: "./src/modules/company",
      definition: {
        isQueryable: true,
      },
    },
  },
});
