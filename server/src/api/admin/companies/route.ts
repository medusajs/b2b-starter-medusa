import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { isValidCNPJ, parsePagination, requiredString } from "@api/validators/b2b";

// GET /admin/companies
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { limit, offset } = parsePagination(req.query || {});
  res.json({ companies: [], count: 0, limit, offset });
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
    const company = { id: "comp_" + Date.now(), name, cnpj };
    // Emit event: company.created
    res.status(201).json({ company });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

