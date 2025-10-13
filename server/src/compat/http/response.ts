import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const API_VERSION = "v2.0"

export type Meta = {
  limit?: number
  offset?: number
  page?: number
  count?: number
  total?: number
  stale?: boolean
}

function setHeaders(req: MedusaRequest, res: MedusaResponse) {
  const requestId = (req as any).requestId || (req.headers?.["x-request-id"] as string) || `req_${Date.now()}`
  res.setHeader("X-API-Version", API_VERSION)
  res.setHeader("X-Request-ID", requestId)
  return requestId
}

export function ok(req: MedusaRequest, res: MedusaResponse, data: any, meta?: Meta) {
  setHeaders(req, res)
  return res.json({ success: true, data, ...(meta ? { meta } : {}) })
}

export function err(
  req: MedusaRequest,
  res: MedusaResponse,
  status: number,
  code: string,
  message: string,
  details?: any,
  meta?: Meta
) {
  setHeaders(req, res)
  return res
    .status(status)
    .json({ success: false, error: { code, message, ...(details ? { details } : {}) }, ...(meta ? { meta } : {}) })
}
