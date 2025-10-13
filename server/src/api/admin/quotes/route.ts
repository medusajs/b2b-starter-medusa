import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { z } from "zod";
import { listQuotes } from "@compat/services/quote";
import { getRequestId, logRequest } from "@compat/logging/logger";
import { ok, err } from "@compat/http/response";

const Query = z.object({ limit: z.coerce.number().min(1).max(100).default(20), offset: z.coerce.number().min(0).default(0) })

// GET /admin/quotes
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { limit, offset } = Query.parse(req.query);
    const request_id = getRequestId(req.headers as any);
    logRequest({ route: "/admin/quotes", method: "GET", request_id, extra: { limit, offset } });
    const { quotes, count } = await listQuotes({ limit, offset });
    return ok(req, res, { quotes }, { limit, offset, count });
  } catch (e: any) {
    return err(req, res, 400, "BAD_REQUEST", e.message);
  }
};
