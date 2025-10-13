import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { isValidCNPJ, parsePagination, requiredString } from "@compat/validators/b2b";
import { createCompany, listCompanies } from "@compat/services/company";
import { getRequestId, logRequest } from "@compat/logging/logger";

// GET /admin/companies
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { limit, offset, fields } = parsePagination(req.query || {});
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: "/admin/companies", method: "GET", request_id, extra: { limit, offset } });
  const { companies, count } = await listCompanies({ limit, offset, fields });
  res.json({ companies, count, limit, offset });
};

// POST /admin/companies
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const body = req.body || {};
  try {
    const name = requiredString(body.name, "name");
    const cnpj = requiredString(body.cnpj, "cnpj");
    if (!isValidCNPJ(cnpj)) {
      return res.status(400).json({ message: "CNPJ must have 14 digits" });
    }
    const request_id = getRequestId(req.headers as any);
    logRequest({ route: "/admin/companies", method: "POST", request_id });
    const company = await createCompany({ name, cnpj });
    res.status(201).json({ company });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};
