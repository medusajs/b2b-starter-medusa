import { MiddlewareRoute } from "@medusajs/medusa";
import { validateAndTransformQuery } from "@medusajs/medusa/api/utils/validate-query";

import { retrieveQuoteTransformQueryConfig } from "./query-config";

import { AdminGetQuoteParams } from "./validators";

export const adminQuotesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/quotes",
    middlewares: [
      validateAndTransformQuery(
        AdminGetQuoteParams,
        retrieveQuoteTransformQueryConfig
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/admin/quotes/:id",
    middlewares: [
      validateAndTransformQuery(
        AdminGetQuoteParams,
        retrieveQuoteTransformQueryConfig
      ),
    ],
  },
];
