import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { requirePublishableKey, requireJWT } from "@compat/http/publishable";
import { reject } from "@compat/services/approval";
import { getRequestId, logRequest } from "@compat/logging/logger";

// POST /store/approvals/:id/reject
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  const token = requireJWT(req, res);
  if (!token) return;
  const { id } = req.params as { id: string };
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: `/store/approvals/${id}/reject`, method: "POST", request_id });
  const approval = await reject(id, token);
  res.json({ approval });
};
