import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { parsePagination, requiredString } from "@compat/validators/b2b";
import { requirePublishableKey } from "@compat/http/publishable";
import { createQuote, listQuotes } from "@compat/services/quote";
import { getRequestId, logRequest } from "@compat/logging/logger";

// POST /store/quotes
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  const body = req.body || {};
  try {
    const company_id = requiredString(body.company_id, "company_id");
    const items = Array.isArray(body.items) ? body.items : [];
    const request_id = getRequestId(req.headers as any);
    logRequest({ route: "/store/quotes", method: "POST", request_id });
    const quote = await createQuote({ company_id, items, message: body.message });
    return res.status(201).json({ quote });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
};

// GET /store/quotes
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  const { limit, offset } = parsePagination(req.query || {});
  const request_id = getRequestId(req.headers as any);
  logRequest({ route: "/store/quotes", method: "GET", request_id, extra: { limit, offset } });
  const { quotes, count } = await listQuotes({ limit, offset });
  res.json({ quotes, count, limit, offset });
};
