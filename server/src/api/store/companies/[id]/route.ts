import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { requirePublishableKey } from "@compat/http/publishable";
import { getCompany } from "@compat/services/company";
import { getRequestId, logRequest } from "@compat/logging/logger";

// GET /store/companies/:id
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  const { id } = req.params as { id: string };
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: `/store/companies/${id}`, method: "GET", request_id });
  const company = await getCompany(id);
  if (!company) return res.status(404).json({ message: "Company not found" });
  res.json({ company });
};
