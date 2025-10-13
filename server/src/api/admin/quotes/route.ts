import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { parsePagination } from "@api/validators/b2b";

// GET /admin/quotes
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { limit, offset } = parsePagination(req.query || {});
  res.json({ quotes: [], count: 0, limit, offset });
};

