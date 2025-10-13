import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";

// POST /admin/companies/import (CSV)
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Scaffold: parse CSV from multipart/form-data or text
  res.json({ imported: 0 });
};

