import { MiddlewareRoute } from "@medusajs/medusa";
import { validateAndTransformBody } from "@medusajs/medusa/dist/api/utils/validate-body";
import { validateAndTransformQuery } from "@medusajs/medusa/dist/api/utils/validate-query";

import { retrieveQuoteTransformQueryConfig } from "./query-config";
import { CreateQuote, GetQuoteParams } from "./validators";

export const quotesMiddlewares: MiddlewareRoute[] = [
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
      validateAndTransformQuery(
        GetQuoteParams,
        retrieveQuoteTransformQueryConfig
      ),
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
];
