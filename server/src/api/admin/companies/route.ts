import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { z } from "zod";
import { isValidCNPJ } from "@compat/validators/b2b";
import { createCompany, listCompanies } from "@compat/services/company";
import { getRequestId, logRequest } from "@compat/logging/logger";
import { ok, err } from "@compat/http/response";

const Query = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  fields: z.string().optional(),
});

const Body = z.object({ name: z.string().min(2), cnpj: z.string().min(14) });

// GET /admin/companies
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const parsed = Query.parse(req.query);
    const fields = parsed.fields?.split(",").filter(Boolean);
    const request_id = getRequestId(req.headers as any);
    logRequest({ route: "/admin/companies", method: "GET", request_id, extra: parsed });
    const { companies, count } = await listCompanies({ limit: parsed.limit, offset: parsed.offset, fields });
    return ok(req, res, { companies, count, limit: parsed.limit, offset: parsed.offset });
  } catch (e: any) {
    return err(req, res, 400, "BAD_REQUEST", e.message);
  }
};

// POST /admin/companies
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = Body.parse(req.body || {});
    if (!isValidCNPJ(body.cnpj)) {
      return err(req, res, 400, "INVALID_CNPJ", "CNPJ must have 14 digits");
    }
    const request_id = getRequestId(req.headers as any);
    logRequest({ route: "/admin/companies", method: "POST", request_id });
    const company = await createCompany({ name: body.name, cnpj: body.cnpj });
    return ok(req, res, { company });
  } catch (e: any) {
    return err(req, res, 400, "BAD_REQUEST", e.message);
  }
};
