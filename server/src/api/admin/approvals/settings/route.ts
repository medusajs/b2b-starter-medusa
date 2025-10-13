import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { upsertSettings } from "@compat/services/approval";
import { getRequestId, logRequest } from "@compat/logging/logger";

// GET /admin/approvals/settings
export const GET = async (_req: MedusaRequest, res: MedusaResponse) => {
  res.json({ settings: [] });
};

// POST /admin/approvals/settings
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const body = req.body || {};
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: "/admin/approvals/settings", method: "POST", request_id });
  const setting = await upsertSettings(body);
  res.status(201).json({ setting });
};
