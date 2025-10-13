import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { requirePublishableKey } from "@compat/http/publishable";
import { getCompany } from "@compat/services/company";
import { getRequestId, logRequest } from "@compat/logging/logger";
import { ok, err } from "@compat/http/response";

// GET /store/companies/:id
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  const { id } = req.params as { id: string };
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: `/store/companies/${id}`, method: "GET", request_id });
  const company = await getCompany(id);
  if (!company) return err(req, res, 404, "NOT_FOUND", "Company not found");
  return ok(req, res, { company });
};
