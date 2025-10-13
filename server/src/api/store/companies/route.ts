import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { parsePagination } from "@compat/validators/b2b";
import { requirePublishableKey } from "@compat/http/publishable";
import { listCompanies } from "@compat/services/company";
import { getRequestId, logRequest } from "@compat/logging/logger";

// GET /store/companies
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  const { limit, offset, fields } = parsePagination(req.query || {});
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: "/store/companies", method: "GET", request_id, extra: { limit, offset } });
  const { companies, count } = await listCompanies({ limit, offset, fields });
  res.json({ companies, count, limit, offset, fields });
};
