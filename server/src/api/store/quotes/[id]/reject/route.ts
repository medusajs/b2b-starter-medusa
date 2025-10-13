import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { requirePublishableKey } from "@compat/http/publishable";
import { rejectQuote } from "@compat/services/quote";
import { getRequestId, logRequest } from "@compat/logging/logger";

// POST /store/quotes/:id/reject
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  const { id } = req.params as { id: string };
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: `/store/quotes/${id}/reject`, method: "POST", request_id });
  const quote = await rejectQuote(id);
  res.json({ quote });
};
