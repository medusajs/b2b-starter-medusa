import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";
import { requirePublishableKey } from "@compat/http/publishable";
import { listCompanies } from "@compat/services/company";
import { getRequestId, logRequest } from "@compat/logging/logger";
import { ok, err } from "@compat/http/response";
import { rateLimit } from "@compat/http/rate-limit";

const Query = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  fields: z.string().optional(),
});

// GET /store/companies
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  if (!rateLimit(req, res, `store:companies:list:${req.ip || "ip"}`)) return;
  const request_id = getRequestId(req.headers as any);
  try {
    const parsed = Query.parse(req.query);
    const fields = parsed.fields?.split(",").filter(Boolean);
    logRequest({ route: "/store/companies", method: "GET", request_id, extra: parsed });
    const { companies, count } = await listCompanies({ limit: parsed.limit, offset: parsed.offset, fields });
    return ok(req, res, { companies }, { limit: parsed.limit, offset: parsed.offset, count });
  } catch (e: any) {
    return err(req, res, 400, "BAD_REQUEST", e.message);
  }
};
