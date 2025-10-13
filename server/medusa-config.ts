import { defineConfig, loadEnv } from "@medusajs/framework/utils";

// Carrega .env conforme NODE_ENV (ex.: .env, .env.development)
loadEnv(process.env.NODE_ENV || "development", process.cwd());

const isProd = (process.env.NODE_ENV || "development").startsWith("prod");

// Infra por ambiente (scaffold): alterna entre implementações locais (dev)
// e serviços gerenciados (prod). Ajuste conforme pacotes utilizados.
const infrastructureModules = [
  // Cache
  isProd
    ? {
      resolve: "@medusajs/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    }
    : {
      resolve: "@medusajs/cache-inmemory",
      options: {},
    },

  // Event Bus
  isProd
    ? {
      resolve: "@medusajs/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    }
    : {
      resolve: "@medusajs/event-bus-local",
      options: {},
    },

  // File storage
  isProd
    ? {
      resolve: "@medusajs/file-s3",
      options: {
        s3: {
          access_key_id: process.env.AWS_ACCESS_KEY_ID,
          secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION,
          bucket: process.env.AWS_BUCKET_NAME,
        },
      },
    }
    : {
      resolve: "@medusajs/file-local",
      options: {
        upload_dir: "./uploads",
      },
    },

  // Workflow engine
  isProd
    ? {
      resolve: "@medusajs/workflow-engine-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    }
    : {
      resolve: "@medusajs/workflow-engine-inmemory",
      options: {},
    },
];

export default defineConfig({
  projectConfig: {
    // Banco de dados (PostgreSQL via URL completa)
    databaseUrl: process.env.DATABASE_URL!, // ex.: postgres://user:pass@host:5432/db

    // HTTP + CORS
    http: {
      host: process.env.HOST || "0.0.0.0",
      port: Number(process.env.PORT || 9000),

      // CORS — ajuste de acordo com o client
      storeCors: [process.env.STORE_CORS || process.env.MEDUSA_DEV_URL!].filter(Boolean) as string[],
      adminCors: [process.env.ADMIN_CORS || process.env.MEDUSA_DEV_URL!].filter(Boolean) as string[],
      authCors: [process.env.MEDUSA_DEV_URL!].filter(Boolean) as string[],

      // Segredos (defina via env locais; nunca comitar valores reais)
      jwtSecret: process.env.JWT_SECRET || "REPLACE_ME",
      cookieSecret: process.env.COOKIE_SECRET || "REPLACE_ME",
    },

    // (Opcional) Redis direto no core (sessions/locks)
    // redisUrl: process.env.REDIS_URL,
  },

  // Admin app embutido (padrão em /app)
  admin: {
    path: "/app",
  },

  // Módulos Commerce principais (scaffold para extensibilidade futura)
  // Inclua os módulos do ecossistema conforme necessidade
  modules: [
    ...infrastructureModules,

    // Módulos B2B customizados
    {
      resolve: "./src/modules/b2b-company",
      options: {},
    },
    {
      resolve: "./src/modules/b2b-quote",
      options: {},
    },
    {
      resolve: "./src/modules/b2b-approval",
      options: {},
    },

    // Ex.: Pricing, Product, Inventory já são parte do core do framework v2.
    // Módulos custom B2B serão adicionados em ./src/modules
  ],

  // Plugins adicionais (deixe vazio por hora)
  plugins: [],
});
