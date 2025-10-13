import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { requirePublishableKey } from "@api/utils/auth";

// POST /store/quotes/:id/reject
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  const { id } = req.params as { id: string };
  // Scaffold: update quote status
  const quote = { id, status: "rejected" };
  // Emit event: quote.rejected
  res.json({ quote });
};

