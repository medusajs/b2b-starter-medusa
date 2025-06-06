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
