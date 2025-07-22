import {
  authenticate,
  featureFlagRouter,
  maybeApplyLinkFilter,
  MiddlewareRoute,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { listProductQueryConfig } from "@medusajs/medusa/api/admin/products/query-config";
import { maybeApplyPriceListsFilter } from "@medusajs/medusa/api/admin/products/utils/index";
import { AdminGetProductsParams } from "@medusajs/medusa/api/admin/products/validators";
import IndexEngineFeatureFlag from "@medusajs/medusa/loaders/feature-flags/index-engine";

export const storeProductsMiddlewares: MiddlewareRoute[] = [
  {
    method: "ALL",
    matcher: "/store/products*",
    middlewares: [authenticate("customer", ["session", "bearer"])],
  },
  {
    method: ["GET"],
    matcher: "/store/products",
    middlewares: [
      validateAndTransformQuery(AdminGetProductsParams, listProductQueryConfig),
      (req, res, next) => {
        if (featureFlagRouter.isFeatureEnabled(IndexEngineFeatureFlag.key)) {
          return next();
        }

        return maybeApplyLinkFilter({
          entryPoint: "product_sales_channel",
          resourceId: "product_id",
          filterableField: "sales_channel_id",
        })(req, res, next);
      },
      maybeApplyPriceListsFilter(),
    ],
  },
];
