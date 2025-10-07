import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { name, payload } = req.body as any
    if (!name) {
      return res.status(400).json({ error: "Evento inválido", message: "'name' é obrigatório" })
    }
    const id = `evt_${Date.now()}`
    const event = { id, name, payload, created_at: new Date().toISOString() }
    const dir = path.join(process.cwd(), "../../../data/events")
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const file = path.join(dir, `${id}.json`)
    fs.writeFileSync(file, JSON.stringify(event, null, 2), "utf-8")
    res.json({ id, created_at: event.created_at })
  } catch (e: any) {
    res.status(500).json({ error: "Erro ao registrar evento", message: e.message })
  }
}

