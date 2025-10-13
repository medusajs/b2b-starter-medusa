import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import fs from "fs"
import path from "path"

export const POST = async (
  req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const { name, email, phone, message, items } = req.body as any
    if (!email || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Dados inválidos", message: "E-mail e itens são obrigatórios" })
    }
    const id = `lead_${Date.now()}`
    const lead = {
      id,
      name,
      email,
      phone,
      message,
      items,
      created_at: new Date().toISOString(),
    }
    const dir = path.join(process.cwd(), "../../../data/leads")
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const file = path.join(dir, `${id}.json`)
    fs.writeFileSync(file, JSON.stringify(lead, null, 2), "utf-8")
    res.json({ id, created_at: lead.created_at })
  } catch (e: any) {
    throw new MedusaError(MedusaError.Types.INTERNAL_ERROR, error.message)
  }
}

