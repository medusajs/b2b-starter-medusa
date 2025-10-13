import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { requirePublishableKey } from "@compat/http/publishable"
import { ok, err } from "@compat/http/response"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return
  try {
    const { id } = req.params as { id: string }
    // TODO: resolve product module and get tag by id
    const tag = null
    if (!tag) return err(req, res, 404, "NOT_FOUND", "Product tag not found")
    return ok(req, res, { tag })
  } catch (e: any) {
    return err(req, res, 400, "BAD_REQUEST", e.message)
  }
}

