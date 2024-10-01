import { MiddlewareRoute } from "@medusajs/medusa";
import { validateAndTransformBody } from "@medusajs/medusa/api/utils/validate-body";
import { validateAndTransformQuery } from "@medusajs/medusa/api/utils/validate-query";

import {
  listQuotesTransformQueryConfig,
  retrieveQuoteTransformQueryConfig,
} from "./query-config";

import { authenticate } from "@medusajs/framework";
import {
  AcceptQuote,
  CreateQuote,
  GetQuoteParams,
  RejectQuote,
} from "./validators";

export const quotesMiddlewares: MiddlewareRoute[] = [
  {
    method: "ALL",
    matcher: "/customers/quotes*",
    middlewares: [authenticate("customer", ["session", "bearer"])],
  },
  {
    method: ["GET"],
    matcher: "/customers/quotes",
    middlewares: [
      validateAndTransformQuery(
        GetQuoteParams,
        retrieveQuoteTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/customers/quotes",
    middlewares: [
      validateAndTransformBody(CreateQuote),
      validateAndTransformQuery(GetQuoteParams, listQuotesTransformQueryConfig),
    ],
  },
  {
    method: ["GET"],
    matcher: "/customers/quotes/:id",
    middlewares: [
      validateAndTransformQuery(
        GetQuoteParams,
        retrieveQuoteTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/customers/quotes/:id/accept",
    middlewares: [
      validateAndTransformBody(AcceptQuote),
      validateAndTransformQuery(
        GetQuoteParams,
        retrieveQuoteTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/customers/quotes/:id/reject",
    middlewares: [
      validateAndTransformBody(RejectQuote),
      validateAndTransformQuery(
        GetQuoteParams,
        retrieveQuoteTransformQueryConfig
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/customers/quotes/:id/preview",
    middlewares: [],
  },
];
