import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const {
    scope: { resolve },
    params: { id },
    auth_context,
  } = req;
  const paymentService = resolve(Modules.PAYMENT);
  const query = resolve(ContainerRegistrationKeys.QUERY);

  try {
    const { customer_id } = auth_context.app_metadata as {
      customer_id: string;
    };

    if (!customer_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // First, verify that the payment belongs to the authenticated customer
    const { data: payments } = await query.graph({
      entity: "payment",
      fields: [
        "id",
        "payment_collection_id",
        "payment_collection.order_id",
        "payment_collection.order.customer_id"
      ],
      filters: {
        id: id,
      }
    });

    if (!payments || payments.length === 0) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    const payment = payments[0];
    const orderCustomerId = payment.payment_collection?.order?.customer_id;

    // Check if the payment belongs to the authenticated customer
    if (orderCustomerId !== customer_id) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const allCaptures = await paymentService.listCaptures({
      payment_id: id,
    });

    return res.json({
      captures: allCaptures,
    });
  } catch (error) {
    console.error("Error fetching captures:", error);
    return res.status(500).json({
      message: "Failed to fetch payment captures",
    });
  }
}
