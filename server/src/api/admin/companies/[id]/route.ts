import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { isValidCNPJ } from "@api/validators/b2b";

// GET /admin/companies/:id
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params as { id: string };
  const company = null; // scaffold
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
  const company = { id, ...body };
  res.json({ company });
};

// DELETE /admin/companies/:id
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params as { id: string };
  res.json({ id, deleted: true });
};

