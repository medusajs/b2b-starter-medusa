import {
  authenticate,
  MiddlewareRoute,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { listTransformQueryConfig } from "@medusajs/medusa/api/admin/collections/query-config";
import { AdminGetCollectionsParams } from "@medusajs/medusa/api/admin/collections/validators";

export const storeCollectionsMiddlewares: MiddlewareRoute[] = [
  {
    method: "ALL",
    matcher: "/store/collections*",
    middlewares: [authenticate("customer", ["session", "bearer"])],
  },
  {
    method: ["GET"],
    matcher: "/store/collections",
    middlewares: [
      validateAndTransformQuery(
        AdminGetCollectionsParams,
        listTransformQueryConfig
      ),
    ],
  },
];
