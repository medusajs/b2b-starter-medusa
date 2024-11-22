import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import {
  listQuotesTransformQueryConfig,
  retrieveQuoteTransformQueryConfig,
} from "./query-config";
import {
  AdminCreateQuoteMessage,
  AdminGetQuoteParams,
  AdminRejectQuote,
  AdminSendQuote,
} from "./validators";

export const adminQuotesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/quotes",
    middlewares: [
      validateAndTransformQuery(
        AdminGetQuoteParams,
        listQuotesTransformQueryConfig
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
  {
    method: ["POST"],
    matcher: "/admin/quotes/:id/reject",
    middlewares: [
      validateAndTransformBody(AdminRejectQuote),
      validateAndTransformQuery(
        AdminGetQuoteParams,
        retrieveQuoteTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/quotes/:id/messages",
    middlewares: [
      validateAndTransformBody(AdminCreateQuoteMessage),
      validateAndTransformQuery(
        AdminGetQuoteParams,
        retrieveQuoteTransformQueryConfig
      ),
    ],
  },
];
