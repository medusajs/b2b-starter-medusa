import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { ok, err } from "@compat/http/response"

const Body = z.object({ value: z.string().min(1).optional(), metadata: z.record(z.any()).optional() })

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params as { id: string }
    const tag = null
    if (!tag) return err(req, res, 404, "NOT_FOUND", "Product tag not found")
    return ok(req, res, { tag })
  } catch (e: any) {
    return err(req, res, 400, "BAD_REQUEST", e.message)
  }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params as { id: string }
    const body = Body.parse(req.body || {})
    const tag = { id, ...body }
    return ok(req, res, { tag })
  } catch (e: any) {
    return err(req, res, 400, "BAD_REQUEST", e.message)
  }
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params as { id: string }
    return ok(req, res, { id, deleted: true })
  } catch (e: any) {
    return err(req, res, 400, "BAD_REQUEST", e.message)
  }
}

