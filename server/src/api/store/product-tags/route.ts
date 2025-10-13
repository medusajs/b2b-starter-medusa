import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { z } from "zod"
import { requirePublishableKey } from "@compat/http/publishable"
import { ok, err } from "@compat/http/response"

const Query = z.object({ limit: z.coerce.number().min(1).max(100).default(50), offset: z.coerce.number().min(0).default(0) })

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return
  try {
    const { limit, offset } = Query.parse(req.query)
    // TODO: resolve product module and list tags (v2 shape)
    const tags: any[] = []
    const count = 0
    return ok(req, res, { tags, count, limit, offset }, { tags: ["product_tag:*"] })
  } catch (e: any) {
    return err(req, res, 400, "BAD_REQUEST", e.message)
  }
}

