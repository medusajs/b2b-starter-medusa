import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";

// POST /admin/quotes/:id  (update status/items; add messages)
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params as { id: string };
  const body = req.body || {};
  const quote = { id, ...body };
  res.json({ quote });
};

