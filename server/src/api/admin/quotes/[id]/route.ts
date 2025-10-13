import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { adminUpdateQuote } from "@compat/services/quote";
import { getRequestId, logRequest } from "@compat/logging/logger";

// POST /admin/quotes/:id  (update status/items; add messages)
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params as { id: string };
  const body = req.body || {};
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: `/admin/quotes/${id}`, method: "POST", request_id });
  const quote = await adminUpdateQuote(id, body);
  res.json({ quote });
};
