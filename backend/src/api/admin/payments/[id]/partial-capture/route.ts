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
  } = req;
  const paymentService = resolve(Modules.PAYMENT);

  const allCaptures = await paymentService.listCaptures(
    {
      payment_id: id,
    },
    {
      relations: ["payment"],
    }
  );

  return res.json({
    captures: allCaptures,
  });
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const {
    scope: { resolve },
    params: { id: payment_id },
  } = req;
  const paymentService = resolve(Modules.PAYMENT);

  try {
    const { amount } = req.body as any;

    const capturePayment = await paymentService.capturePayment({
      amount,
      payment_id,
      captured_by: req.user?.userId,
    });

    return res.status(200).json({
      payment: capturePayment,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const {
    scope: { resolve },
    params: { id: payment_id },
  } = req;
  const paymentService = resolve(Modules.PAYMENT) as any;

  try {
    const { capture_id } = req.query as any;
    if (!capture_id) {
      return res.status(400).json({ message: "capture_id is required" });
    }

    // Try to delete/void the capture. If service lacks delete, attempt refund to zero out.
    if (typeof paymentService.deleteCaptures === "function") {
      await paymentService.deleteCaptures([capture_id]);
    } else if (typeof paymentService.voidCapture === "function") {
      await paymentService.voidCapture(capture_id);
    } else if (typeof paymentService.refundPayment === "function") {
      // Fallback: refund captured amount
      const [cap] = await paymentService.listCaptures({ id: capture_id });
      if (!cap) {
        return res.status(404).json({ message: "Capture not found" });
      }
      await paymentService.refundPayment({ payment_id, amount: cap.amount });
    } else {
      return res.status(501).json({ message: "Deleting captures is not supported by the configured payment service" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Failed to delete capture" });
  }
}
