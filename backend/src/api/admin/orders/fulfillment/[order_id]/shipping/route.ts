import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type { RemoteQueryFunction } from "@medusajs/framework/types";
import { Client } from "pg";

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const {
    params: { order_id },
    scope: { resolve },
    body,
  } = req as AuthenticatedMedusaRequest<{
    fulfillment_id?: string;
    shipping_method_id?: string;
    price?: number;
  }>;

  if (!order_id) {
    return res.status(400).json({ message: "order_id is required" });
  }

  const { fulfillment_id, shipping_method_id, price } = body || {};

  if (!fulfillment_id || !shipping_method_id || typeof price !== "number") {
    return res.status(400).json({
      message: "fulfillment_id, shipping_method_id and numeric price are required",
    });
  }

  const query = resolve<RemoteQueryFunction>(ContainerRegistrationKeys.QUERY);

  // Validate order, fulfillment, and shipping method belong together
  const [order] = (
    await query.graph(
      {
        entity: "order",
        fields: ["id", "fulfillments.id", "shipping_methods.id"],
        filters: { id: order_id },
      },
      { throwIfKeyNotFound: true }
    )
  ).data as any[];

  const fulfillment = (order.fulfillments || []).find((f: any) => f.id === fulfillment_id);
  if (!fulfillment) {
    return res.status(404).json({ message: `Fulfillment ${fulfillment_id} not found in order ${order_id}` });
  }

  const shippingMethod = (order.shipping_methods || []).find((sm: any) => sm.id === shipping_method_id);
  if (!shippingMethod) {
    return res.status(404).json({ message: `Shipping method ${shipping_method_id} not found in order ${order_id}` });
  }

  // Resolve module service by registration name
  const fsService: any = resolve("fulfillmentShipping");

  // Check if there is an existing entry
  const [existing, _count] = await fsService.listAndCountFulfillmentShippingPrices({
    fulfillment_id,
  });

  if (existing?.length) {
    await fsService.updateFulfillmentShippingPrices(
      existing.map((row: any) => ({ id: row.id, price }))
    );
  } else {
    await fsService.createFulfillmentShippingPrices([
      {
        fulfillment_id,
        price,
      },
    ]);
  }

  // After upsert, compute the sum of all fulfillment shipping prices for this order and
  // set the order shipping method amount to that sum (in major units).
  try {
    const connectionString = process.env.DATABASE_URL as string | undefined;
    if (connectionString) {
      // Load all fulfillment prices for this order
      const fulfillmentIds: string[] = (order.fulfillments || []).map((f: any) => f.id);
      const [rows] = await fsService.listAndCountFulfillmentShippingPrices({
        fulfillment_id: { $in: fulfillmentIds },
      });
      const totalCents = (rows as any[]).reduce((sum: number, r: any) => sum + (Number(r.price) || 0), 0);

      const client = new Client({ connectionString });
      await client.connect();
      // Persist in major currency units in amount/raw_amount since this table stores BigNumber values
      const amountMajor = totalCents / 100; // convert cents to major units
      const raw = { value: String(amountMajor), precision: 20 };
      await client.query(
        `update order_shipping_method
         set amount = $1,
             raw_amount = $2::jsonb,
             updated_at = now()
         where id = $3`,
        [amountMajor, JSON.stringify(raw), shipping_method_id]
      );
      await client.end();
    }
  } catch {
    // ignore; widget will still reflect per-fulfillment values via GET endpoint
  }

  // Note: Skipping shipping_method price adjustment here to avoid DB manager requirement.
  // Re-fetch order totals to return values (may be unchanged until totals workflow is added)
  const [updatedOrder] = (
    await query.graph(
      {
        entity: "order",
        fields: ["id", "shipping_total", "shipping_tax_total", "tax_total"],
        filters: { id: order_id },
      },
      { throwIfKeyNotFound: true }
    )
  ).data as any[];

  return res.status(200).json({
    fulfillment_id,
    shipping_method_id,
    price,
    order_shipping_total: updatedOrder?.shipping_total || 0,
    order_shipping_tax_total: updatedOrder?.shipping_tax_total || 0,
    order_tax_total: updatedOrder?.tax_total || 0,
  });
} 