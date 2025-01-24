import {
  authenticate,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import { approvalTransformQueryConfig } from "./query-config";
import { StoreGetApprovals, StoreUpdateApproval } from "./validators";
import { ensureRole } from "src/api/middlewares/ensure-role";

export const storeApprovalsMiddlewares: MiddlewareRoute[] = [
  {
    method: "ALL",
    matcher: "/store/approvals*",
    middlewares: [
      authenticate("customer", ["session", "bearer"]),
      ensureRole("company_admin"),
    ],
  },
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
  {
    method: ["POST"],
    matcher: "/store/approvals/:id",
    middlewares: [validateAndTransformBody(StoreUpdateApproval)],
  },
];
