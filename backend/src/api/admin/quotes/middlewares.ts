import { MiddlewareRoute } from "@medusajs/medusa";
import { validateAndTransformBody } from "@medusajs/medusa/api/utils/validate-body";
import { validateAndTransformQuery } from "@medusajs/medusa/api/utils/validate-query";
import { retrieveQuoteTransformQueryConfig } from "./query-config";
import { AdminGetQuoteParams, AdminSendQuote } from "./validators";

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
  {
    method: ["POST"],
    matcher: "/admin/quotes/:id/send",
    middlewares: [
      validateAndTransformBody(AdminSendQuote),
      validateAndTransformQuery(
        AdminGetQuoteParams,
        retrieveQuoteTransformQueryConfig
      ),
    ],
  },
];
