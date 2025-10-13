import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { z } from "zod"
import { ok, err } from "@compat/http/response"

const Query = z.object({ limit: z.coerce.number().min(1).max(100).default(50), offset: z.coerce.number().min(0).default(0) })
const Body = z.object({ value: z.string().min(1), metadata: z.record(z.any()).optional() })

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { limit, offset } = Query.parse(req.query)
    const tags: any[] = []
    const count = 0
    return ok(req, res, { tags }, { limit, offset, count })
  } catch (e: any) {
    return err(req, res, 400, "BAD_REQUEST", e.message)
  }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = Body.parse(req.body || {})
    const tag = { id: "pt_" + Date.now(), ...body }
    return ok(req, res, { tag })
  } catch (e: any) {
    return err(req, res, 400, "BAD_REQUEST", e.message)
  }
}
