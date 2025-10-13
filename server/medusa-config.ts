import { defineConfig, loadEnv } from "@medusajs/framework/utils";

// Carrega .env conforme NODE_ENV (ex.: .env, .env.development)
loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default defineConfig({
    projectConfig: {
        // Banco de dados (PostgreSQL via URL completa)
        databaseUrl: process.env.DATABASE_URL!, // ex.: postgres://user:pass@host:5432/db

        // HTTP + CORS
        http: {
            host: process.env.HOST || "0.0.0.0",
            port: Number(process.env.PORT || 9000),

            // CORS — no dev, aceite o frontend local
            storeCors: [process.env.MEDUSA_DEV_URL!],
            adminCors: [process.env.MEDUSA_DEV_URL!],
            authCors: [process.env.MEDUSA_DEV_URL!],

            // Segredos (defina via env locais; nunca comitar valores reais)
            jwtSecret: process.env.JWT_SECRET || "REPLACE_ME",
            cookieSecret: process.env.COOKIE_SECRET || "REPLACE_ME"
        },

        // (Opcional) Redis
        // redisUrl: process.env.REDIS_URL,

        // (Opcional) Modo de execução
        // workerMode: "shared" | "worker" | "server"
    },

    // Admin app embutido (padrão em /app)
    admin: {
        path: "/app",
        // backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
        // disable: process.env.ADMIN_DISABLED === "true" || false
    },

    // Módulos custom (adicione conforme evoluir)
    modules: [
        // { resolve: "./src/modules/unified-catalog", options: {} }
    ],

    // Plugins (exemplos com placeholders)
    plugins: [
        // "medusa-some-plugin",
        // { resolve: "medusa-some-plugin-2", options: { apiKey: process.env.SOME_API_KEY } }
    ],

    // (Opcional) flags/logger
    // featureFlags: { index_engine: true },
    // logger: myLoggerInstance,
});
