import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { defineMiddlewares } from "@medusajs/medusa";
import { adminMiddlewares } from "./admin/middlewares";
import { storeMiddlewares } from "./store/middlewares";
import { requestIdMiddleware } from "../utils/api-response";
import { apiVersionMiddleware } from "../utils/api-versioning";
import { rateLimiter } from "../utils/rate-limiter";
import { loggerMiddleware } from "../utils/logger";

// Rate limiter for public routes
const publicRateLimiter = rateLimiter.middleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  skip: (req) => req.url?.startsWith('/admin') || false,
});

export default defineMiddlewares({
  routes: [
    {
      matcher: "*",
      middlewares: [requestIdMiddleware, loggerMiddleware, apiVersionMiddleware(), publicRateLimiter],
    },
    ...adminMiddlewares,
    ...storeMiddlewares,
    {
      matcher: "/store/customers/me",
      middlewares: [
        (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          req.allowed = ["employee"];
          next();
        },
      ],
    },
  ],
});
