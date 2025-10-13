import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";
import { isValidCNPJ } from "@compat/validators/b2b";
import { getCompany, updateCompany, deleteCompany } from "@compat/services/company";
import { getRequestId, logRequest } from "@compat/logging/logger";
import { ok, err } from "@compat/http/response";

const Body = z.object({ name: z.string().min(2).optional(), cnpj: z.string().min(14).optional() })

// GET /admin/companies/:id
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params as { id: string };
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: `/admin/companies/${id}`, method: "GET", request_id });
  const company = await getCompany(id);
  if (!company) return err(req, res, 404, "NOT_FOUND", "Company not found");
  return ok(req, res, { company });
};

// PUT /admin/companies/:id
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params as { id: string };
  const body = Body.parse(req.body || {});
  if (body.cnpj && !isValidCNPJ(String(body.cnpj))) {
    return err(req, res, 400, "INVALID_CNPJ", "CNPJ must have 14 digits");
  }
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: `/admin/companies/${id}`, method: "PUT", request_id });
  const company = await updateCompany(id, body);
  return ok(req, res, { company });
};

// DELETE /admin/companies/:id
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params as { id: string };
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: `/admin/companies/${id}`, method: "DELETE", request_id });
  const result = await deleteCompany(id);
  return ok(req, res, result);
};
