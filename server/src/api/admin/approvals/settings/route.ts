import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";

// GET /admin/approvals/settings
export const GET = async (_req: MedusaRequest, res: MedusaResponse) => {
  res.json({ settings: [] });
};

// POST /admin/approvals/settings
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const body = req.body || {};
  // body: { company_id, thresholds, escalation }
  res.status(201).json({ setting: { id: "aps_" + Date.now(), ...body } });
};

