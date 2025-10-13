import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { parsePagination } from "@api/validators/b2b";
import { requirePublishableKey } from "@api/utils/auth";

// GET /store/companies
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  const { limit, offset, fields } = parsePagination(req.query || {});

  // Scaffold: replace with query.graph or custom module service once implemented
  const items: any[] = [];
  const count = 0;

  res.json({ companies: items, count, limit, offset, fields });
};

