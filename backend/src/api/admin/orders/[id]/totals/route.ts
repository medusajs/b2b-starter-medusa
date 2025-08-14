import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type { RemoteQueryFunction } from "@medusajs/framework/types";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const {
    params: { id },
    scope: { resolve },
  } = req;

  if (!id) {
    return res.status(400).json({ message: "id is required" });
  }

  const query = resolve<RemoteQueryFunction>(ContainerRegistrationKeys.QUERY);

  const {
    data: [order],
  } = await query.graph(
    {
      entity: "order",
      fields: [
        "id",
        "currency_code",
        "subtotal",
        "shipping_total",
        "tax_total",
        "total",
      ],
      filters: { id },
    },
    { throwIfKeyNotFound: true }
  );

  if (!order) {
    return res.status(404).json({ message: `Order ${id} not found` });
  }

  return res.status(200).json({
    id: order.id,
    currency_code: (order as any).currency_code,
    subtotal: (order as any).subtotal || 0,
    shipping_total: (order as any).shipping_total || 0,
    tax_total: (order as any).tax_total || 0,
    total: (order as any).total || 0,
  });
}


