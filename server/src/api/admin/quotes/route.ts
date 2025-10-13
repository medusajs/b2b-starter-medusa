import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { parsePagination } from "@compat/validators/b2b";
import { listQuotes } from "@compat/services/quote";
import { getRequestId, logRequest } from "@compat/logging/logger";

// GET /admin/quotes
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { limit, offset } = parsePagination(req.query || {});
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: "/admin/quotes", method: "GET", request_id, extra: { limit, offset } });
  const { quotes, count } = await listQuotes({ limit, offset });
  res.json({ quotes, count, limit, offset });
};
