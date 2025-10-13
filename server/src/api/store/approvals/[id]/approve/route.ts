import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { requirePublishableKey, requireJWT } from "@compat/http/publishable";
import { approve } from "@compat/services/approval";
import { getRequestId, logRequest } from "@compat/logging/logger";
import { ok } from "@compat/http/response";

// POST /store/approvals/:id/approve
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  const token = requireJWT(req, res);
  if (!token) return;
  const { id } = req.params as { id: string };
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: `/store/approvals/${id}/approve`, method: "POST", request_id });
  const approval = await approve(id, token);
  return ok(req, res, { approval });
};
