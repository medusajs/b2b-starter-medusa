import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { requirePublishableKey } from "@compat/http/publishable";
import { acceptQuote } from "@compat/services/quote";
import { getRequestId, logRequest } from "@compat/logging/logger";
import { ok } from "@compat/http/response";

// POST /store/quotes/:id/accept
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  const { id } = req.params as { id: string };
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: `/store/quotes/${id}/accept`, method: "POST", request_id });
  const quote = await acceptQuote(id);
  return ok(req, res, { quote });
};
