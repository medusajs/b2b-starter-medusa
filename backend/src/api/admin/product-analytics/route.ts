import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const { start_date, end_date, product_id } = req.query;
    if (!start_date || !end_date || !product_id) {
      return res.status(400).json({ message: "Start date, end date, and product ID are required" });
    }

    console.log("Fetching analytics for:", { start_date, end_date, product_id });

    // Get the query service from the request scope
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    // Get all orders with the specified product
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "created_at",
        "items.*",
        "items.quantity",
        "items.product_id",
        "status"
      ]
    });

    console.log("Total orders found:", orders.length);
    if (orders.length > 0) {
      console.log("Sample order:", JSON.stringify(orders[0], null, 2));
    }

    // Filter orders to only include those with the specified product
    const productOrders = orders.filter((order: any) => {
      const hasProduct = order.items.some((item: any) => item.product_id === product_id);
      if (hasProduct) {
        console.log("Found order with product:", {
          orderId: order.id,
          createdAt: order.created_at,
          status: order.status,
          items: order.items.map((item: any) => ({
            productId: item.product_id,
            quantity: item.quantity
          }))
        });
      }
      return hasProduct;
    });

    console.log("Orders with product:", productOrders.length);

    // Filter orders by date range
    const startDate = new Date(String(start_date));
    const endDate = new Date(String(end_date));
    console.log("Date range:", {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });

    const filteredOrders = productOrders.filter((order: any) => {
      const orderDate = new Date(order.created_at);
      const isInRange = orderDate >= startDate && orderDate <= endDate;
      if (isInRange) {
        console.log("Order in date range:", {
          orderId: order.id,
          createdAt: order.created_at,
          status: order.status
        });
      }
      return isInRange;
    });

    console.log("Orders in date range:", filteredOrders.length);

    // Generate all dates in the range
    const allDates = new Map();
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      allDates.set(dateStr, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Group orders by date and sum quantities
    filteredOrders.forEach((order: any) => {
      const date = new Date(order.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      const productItems = order.items.filter((item: any) => item.product_id === product_id);
      const totalQuantity = productItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
      
      if (allDates.has(date)) {
        allDates.set(date, allDates.get(date) + totalQuantity);
      }
    });

    // Convert to arrays for the response
    const labels = Array.from(allDates.keys());
    const sales = Array.from(allDates.values());

    console.log("Final data:", { labels, sales });

    return res.json({
      labels,
      sales
    });
  } catch (error) {
    console.error("Error in product analytics API:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}; 