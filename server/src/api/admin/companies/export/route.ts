import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

// GET /admin/companies/export (CSV)
export const GET = async (_req: MedusaRequest, res: MedusaResponse) => {
  const csv = ["id,name,cnpj"].join("\n");
  res.setHeader("content-type", "text/csv");
  res.send(csv);
};

