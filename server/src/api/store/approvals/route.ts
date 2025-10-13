import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { z } from "zod";
import { requirePublishableKey, requireJWT } from "@compat/http/publishable";
import { listApprovals } from "@compat/services/approval";
import { getRequestId, logRequest } from "@compat/logging/logger";
import { ok, err } from "@compat/http/response";

const Query = z.object({ limit: z.coerce.number().min(1).max(100).default(20), offset: z.coerce.number().min(0).default(0) })

// GET /store/approvals (requires publishable key + JWT)
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  const token = requireJWT(req, res);
  if (!token) return;
  try {
    const { limit, offset } = Query.parse(req.query);
    const request_id = getRequestId(req.headers as any);
    logRequest({ route: "/store/approvals", method: "GET", request_id, extra: { limit, offset } });
    const { approvals, count } = await listApprovals({ limit, offset, userToken: token });
    return ok(req, res, { approvals }, { limit, offset, count });
  } catch (e: any) {
    return err(req, res, 400, "BAD_REQUEST", e.message);
  }
};
