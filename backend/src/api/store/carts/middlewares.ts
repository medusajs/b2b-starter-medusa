import {
  authenticate,
  AuthenticatedMedusaRequest,
  MedusaResponse,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import { retrieveCartTransformQueryConfig } from "./query-config";
import {
  GetCartLineItemsBulkParams,
  StoreAddLineItemsBulk,
} from "./validators";

const checkCartOwnership = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
  next: Function
) => {
  const { id } = req.params;
  const { customer_id } = req.auth_context.app_metadata as {
    customer_id: string;
  };

  const query = req.scope.resolve("query");

  const {
    data: [cart],
  } = await query.graph({
    entity: "cart",
    fields: ["*"],
    filters: { id },
  });

  if (cart?.customer_id === customer_id) {
    console.log("cart is owned by customer");
    return next();
  }

  console.log("cart is not owned by customer");

  const {
    data: [customer],
  } = await query.graph({
    entity: "customer",
    fields: ["*"],
    filters: { id: customer_id },
  });

  if (cart?.company?.id === customer?.employee?.company?.id) {
    console.log("cart is owned by company");
    return next();
  }

  console.log("cart is not owned by company");

  return res.status(403).json({ message: "Forbidden" });
};

export const storeCartsMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/carts/:id",
    middlewares: [
      authenticate("customer", ["bearer", "session"], {
        allowUnauthenticated: true,
      }),
      checkCartOwnership,
    ],
  },
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
  {
    method: ["POST"],
    matcher: "/store/carts/:id/approvals",
    middlewares: [authenticate("customer", ["bearer", "session"])],
  },
];
