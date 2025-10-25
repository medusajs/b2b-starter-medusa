import { validateAndTransformQuery } from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import { StoreGetFreeShippingPricesParams } from "./validators";

export const storeFreeShippingMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/free-shipping/prices",
    middlewares: [
      validateAndTransformQuery(StoreGetFreeShippingPricesParams as any, {
        defaultLimit: 20,
        isList: true,
      }),
    ],
  },
];
