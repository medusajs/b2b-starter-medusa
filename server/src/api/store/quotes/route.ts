import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { z } from "zod";
import { requirePublishableKey } from "@compat/http/publishable";
import { createQuote, listQuotes } from "@compat/services/quote";
import { getRequestId, logRequest } from "@compat/logging/logger";
import { ok, err } from "@compat/http/response";

const CreateBody = z.object({
  company_id: z.string().min(1),
  items: z
    .array(
      z.object({
        variant_id: z.string().optional(),
        sku: z.string().optional(),
        quantity: z.coerce.number().min(1),
        price: z.coerce.number().optional(),
      })
    )
    .default([]),
  message: z.string().optional(),
});

const Query = z.object({ limit: z.coerce.number().min(1).max(100).default(20), offset: z.coerce.number().min(0).default(0) });

// POST /store/quotes
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  try {
    const body = CreateBody.parse(req.body || {});
    const request_id = getRequestId(req.headers as any);
    logRequest({ route: "/store/quotes", method: "POST", request_id });
    const quote = await createQuote(body);
    return ok(req, res, { quote });
  } catch (e: any) {
    return err(req, res, 400, "BAD_REQUEST", e.message);
  }
};

// GET /store/quotes
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  try {
    const { limit, offset } = Query.parse(req.query);
    const request_id = getRequestId(req.headers as any);
    logRequest({ route: "/store/quotes", method: "GET", request_id, extra: { limit, offset } });
    const { quotes, count } = await listQuotes({ limit, offset });
    return ok(req, res, { quotes }, { limit, offset, count });
  } catch (e: any) {
    return err(req, res, 400, "BAD_REQUEST", e.message);
  }
};
