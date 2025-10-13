import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { z } from "zod";
import { adminUpdateQuote } from "@compat/services/quote";
import { getRequestId, logRequest } from "@compat/logging/logger";
import { ok, err } from "@compat/http/response";

const Body = z.object({ status: z.enum(["pending", "accepted", "rejected"]).optional(), items: z.array(z.any()).optional(), message: z.string().optional() })

// POST /admin/quotes/:id  (update status/items; add messages)
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params as { id: string };
  try {
    const body = Body.parse(req.body || {});
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: `/admin/quotes/${id}`, method: "POST", request_id });
  const quote = await adminUpdateQuote(id, body);
  return ok(req, res, { quote });
  } catch (e: any) {
    return err(req, res, 400, "BAD_REQUEST", e.message)
  }
};
