import { validateAndTransformQuery } from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import { approvalTransformQueryConfig } from "./query-config";
import { StoreGetApprovals } from "./validators";
export const storeApprovalsMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/approvals",
    middlewares: [
      validateAndTransformQuery(
        StoreGetApprovals,
        approvalTransformQueryConfig
      ),
    ],
  },
];
