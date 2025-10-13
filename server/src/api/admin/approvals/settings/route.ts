import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";
import { upsertSettings } from "@compat/services/approval";
import { getRequestId, logRequest } from "@compat/logging/logger";
import { ok, err } from "@compat/http/response";

const Body = z.object({ company_id: z.string().min(1), thresholds: z.any().optional(), escalation: z.any().optional() })

// GET /admin/approvals/settings
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  return ok(req, res, { settings: [] })
};

// POST /admin/approvals/settings
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = Body.parse(req.body || {});
    const request_id = getRequestId(req.headers as any);
    logRequest({ route: "/admin/approvals/settings", method: "POST", request_id });
    const setting = await upsertSettings(body);
    return ok(req, res, { setting });
  } catch (e: any) {
    return err(req, res, 400, "BAD_REQUEST", e.message);
  }
};
