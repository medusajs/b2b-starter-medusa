import {
  authenticate,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import { approvalTransformQueryConfig } from "./query-config";
import { AdminGetApprovals, AdminUpdateApproval } from "./validators";

export const adminApprovalsMiddlewares: MiddlewareRoute[] = [
  {
    method: "ALL",
    matcher: "/admin/approvals*",
    middlewares: [authenticate("user", ["session", "bearer"])],
  },
  {
    method: ["GET"],
    matcher: "/admin/approvals",
    middlewares: [
      validateAndTransformQuery(
        AdminGetApprovals,
        approvalTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/approvals/:id",
    middlewares: [validateAndTransformBody(AdminUpdateApproval)],
  },
];
