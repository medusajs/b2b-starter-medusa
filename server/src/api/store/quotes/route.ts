import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { parsePagination, requiredString } from "@api/validators/b2b";
import { requirePublishableKey } from "@api/utils/auth";

// POST /store/quotes
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  const body = req.body || {};
  try {
    const companyId = requiredString(body.company_id, "company_id");
    const items = Array.isArray(body.items) ? body.items : [];
    // Scaffold: call workflow to create quote
    const quote = { id: "q_" + Date.now(), company_id: companyId, items, status: "pending" };
    // Emit domain event (scaffold)
    return res.status(201).json({ quote });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
};

// GET /store/quotes
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  const { limit, offset } = parsePagination(req.query || {});
  // Scaffold list
  res.json({ quotes: [], count: 0, limit, offset });
};

