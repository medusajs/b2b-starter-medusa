import {
  authenticate,
  MiddlewareRoute,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { applyCategoryFilters } from "@medusajs/medusa/api/store/product-categories/helpers";
import { listProductCategoryConfig } from "@medusajs/medusa/api/store/product-categories/query-config";
import { StoreProductCategoriesParams } from "@medusajs/medusa/api/store/product-categories/validators";

export const storeProductCategoriesMiddlewares: MiddlewareRoute[] = [
  {
    method: "ALL",
    matcher: "/store/product-categories*",
    middlewares: [authenticate("customer", ["session", "bearer"])],
  },
  {
    method: ["GET"],
    matcher: "/store/product-categories",
    middlewares: [
      validateAndTransformQuery(
        StoreProductCategoriesParams,
        listProductCategoryConfig
      ),
      applyCategoryFilters,
    ],
  },
];
