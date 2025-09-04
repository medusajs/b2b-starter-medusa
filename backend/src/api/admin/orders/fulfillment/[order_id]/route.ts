import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type { RemoteQueryFunction } from "@medusajs/framework/types";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const {
    params: { order_id },
    scope: { resolve },
  } = req;

  if (!order_id) {
    return res.status(400).json({ message: "order_id is required" });
  }

  try {
    const query = resolve<RemoteQueryFunction>(ContainerRegistrationKeys.QUERY);
    const fsService: any = resolve("fulfillmentShipping");

    // Retrieve order with fulfillments and shipping methods via Remote Query
    const {
      data: [order],
    } = await query.graph(
      {
        entity: "order",
        fields: [
          "id",
          "currency_code",
          "shipping_total",
          "shipping_tax_total",
          "tax_total",
          "fulfillments.id",
          "fulfillments.items.*",
          "shipping_methods.id",
          "shipping_methods.price",
          "shipping_methods.tax_total",
        ],
        filters: { id: order_id },
      },
      { throwIfKeyNotFound: true }
    );

    if (!order) {
      return res.status(404).json({ message: `Order ${order_id} not found` });
    }

    const fulfillmentIds: string[] = (order.fulfillments || []).map((f: any) => f.id);

    // Load saved prices for these fulfillments using module service
    let savedPrices: Record<string, number> = {};
    if (fulfillmentIds.length) {
      try {
        const [rows] = await fsService.listAndCountFulfillmentShippingPrices({
          // Support $in operator for Medusa Mikro filters
          fulfillment_id: { $in: fulfillmentIds },
        });
        savedPrices = (rows as any[]).reduce((acc: Record<string, number>, r: any) => {
          acc[r.fulfillment_id] = Number(r.price) || 0;
          return acc;
        }, {});
      } catch {
        savedPrices = {};
      }
    }

    const fulfillments = (order.fulfillments || []).map((f: any) => ({
      id: f.id,
      items:
        (f.items || []).map((fi: any) => ({
          id: fi.id,
          item_id: fi.item_id || fi.line_item_id, // Try both possible field names
          quantity: fi.quantity,
        })) || [],
      shipping_price: savedPrices[f.id] ?? 0, // Keep in cents - frontend will handle conversion
    }));

    const orderShippingTotalFromMethods = ((order as any)?.shipping_methods || [])
      .reduce((sum: number, sm: any) => sum + Number(sm?.price || 0), 0);
    const orderShippingTaxTotalFromMethods = ((order as any)?.shipping_methods || [])
      .reduce((sum: number, sm: any) => sum + Number(sm?.tax_total || 0), 0);

    return res.status(200).json({
      fulfillments,
      order_shipping_total: orderShippingTotalFromMethods,
      order_shipping_tax_total: orderShippingTaxTotalFromMethods,
      order_tax_total: (order as any)?.tax_total || 0,
    });
  } catch (e) {
    console.error("[GET /admin/orders/fulfillment/:order_id] error", e);
    return res.status(500).json({ message: "Failed to load fulfillment shipping data" });
  }
} 