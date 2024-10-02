import { MiddlewareRoute } from "@medusajs/medusa";
import { validateAndTransformBody } from "@medusajs/medusa/api/utils/validate-body";
import { validateAndTransformQuery } from "@medusajs/medusa/api/utils/validate-query";
import { retrieveCartTransformQueryConfig } from "./query-config";
import {
  GetCartLineItemsBulkParams,
  StoreAddLineItemsBulk,
} from "./validators";

export const storeCartsMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/store/carts/:id/line-items/bulk",
    middlewares: [
      validateAndTransformBody(StoreAddLineItemsBulk),
      validateAndTransformQuery(
        GetCartLineItemsBulkParams,
        retrieveCartTransformQueryConfig
      ),
    ],
  },
];
