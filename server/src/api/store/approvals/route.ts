import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { parsePagination } from "@compat/validators/b2b";
import { requirePublishableKey, requireJWT } from "@compat/http/publishable";
import { listApprovals } from "@compat/services/approval";
import { getRequestId, logRequest } from "@compat/logging/logger";

// GET /store/approvals (requires publishable key + JWT)
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  const token = requireJWT(req, res);
  if (!token) return;
  const { limit, offset } = parsePagination(req.query || {});
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: "/store/approvals", method: "GET", request_id, extra: { limit, offset } });
  const { approvals, count } = await listApprovals({ limit, offset, userToken: token });
  res.json({ approvals, count, limit, offset });
};
