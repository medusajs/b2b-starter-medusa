import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { isValidCNPJ } from "@compat/validators/b2b";
import { getCompany, updateCompany, deleteCompany } from "@compat/services/company";
import { getRequestId, logRequest } from "@compat/logging/logger";

// GET /admin/companies/:id
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params as { id: string };
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: `/admin/companies/${id}`, method: "GET", request_id });
  const company = await getCompany(id);
  if (!company) return res.status(404).json({ message: "Company not found" });
  res.json({ company });
};

// PUT /admin/companies/:id
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params as { id: string };
  const body = req.body || {};
  if (body.cnpj && !isValidCNPJ(String(body.cnpj))) {
    return res.status(400).json({ message: "CNPJ must have 14 digits" });
  }
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: `/admin/companies/${id}`, method: "PUT", request_id });
  const company = await updateCompany(id, body);
  res.json({ company });
};

// DELETE /admin/companies/:id
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params as { id: string };
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: `/admin/companies/${id}`, method: "DELETE", request_id });
  const result = await deleteCompany(id);
  res.json(result);
};
