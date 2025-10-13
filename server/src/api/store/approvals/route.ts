import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { parsePagination } from "@api/validators/b2b";
import { requirePublishableKey, requireJWT } from "@api/utils/auth";

// GET /store/approvals (requires publishable key + JWT)
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  if (!requireJWT(req, res)) return;
  const { limit, offset } = parsePagination(req.query || {});
  res.json({ approvals: [], count: 0, limit, offset });
};

