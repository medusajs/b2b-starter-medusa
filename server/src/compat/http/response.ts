import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"

type CacheMeta = { hit?: boolean; tags?: string[] }

export function ok(
  req: MedusaRequest,
  res: MedusaResponse,
  data: any,
  cache?: CacheMeta
) {
  const request_id = (req as any).requestId || (req.headers?.["x-request-id"] as string) || `req_${Date.now()}`
  return res.json({ ok: true, data, request_id, ...(cache ? { cache } : {}) })
}

export function err(
  req: MedusaRequest,
  res: MedusaResponse,
  status: number,
  code: string,
  message: string,
  details?: any
) {
  const request_id = (req as any).requestId || (req.headers?.["x-request-id"] as string) || `req_${Date.now()}`
  return res.status(status).json({ ok: false, error: { code, message, ...(details ? { details } : {}) }, request_id })
}

