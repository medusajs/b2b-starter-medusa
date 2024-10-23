import { defineConfig, loadEnv } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV!, process.cwd());

export default defineConfig({
  admin: {
    backendUrl: process.env.BACKEND_URL || "https://b2b-starter.medusajs.app",
  },
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
  modules: [
    { resolve: "./src/modules/company" },
    { resolve: "./src/modules/quote" },
    { resolve: "@medusajs/medusa/cache-inmemory" },
    { resolve: "@medusajs/medusa/workflow-engine-inmemory" },
  ],
});
