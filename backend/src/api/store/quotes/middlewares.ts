import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";

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
  StoreCreateQuoteComment,
} from "./validators";

export const storeQuotesMiddlewares: MiddlewareRoute[] = [
  {
    method: "ALL",
    matcher: "/store/quotes*",
    middlewares: [authenticate("customer", ["session", "bearer"])],
  },
  {
    method: ["GET"],
    matcher: "/store/quotes",
    middlewares: [
      validateAndTransformQuery(
        GetQuoteParams,
        retrieveQuoteTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/quotes",
    middlewares: [
      validateAndTransformBody(CreateQuote),
      validateAndTransformQuery(GetQuoteParams, listQuotesTransformQueryConfig),
    ],
  },
  {
    method: ["GET"],
    matcher: "/store/quotes/:id",
    middlewares: [
      validateAndTransformQuery(
        GetQuoteParams,
        retrieveQuoteTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/quotes/:id/accept",
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
    matcher: "/store/quotes/:id/reject",
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
    matcher: "/store/quotes/:id/preview",
    middlewares: [],
  },
  {
    method: ["POST"],
    matcher: "/store/quotes/:id/comments",
    middlewares: [
      validateAndTransformBody(StoreCreateQuoteComment),
      validateAndTransformQuery(
        GetQuoteParams,
        retrieveQuoteTransformQueryConfig
      ),
    ],
  },
];
