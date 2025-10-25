import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { createBundleWorkflow } from "../../../../workflows/create-bundle"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { title, items } = req.body

  if (!title || !items || !Array.isArray(items)) {
    return res.status(400).json({ message: "Missing title or items" })
  }

  const workflow = createBundleWorkflow()
  const { result } = await workflow.run({
    input: {
      title,
      items,
    },
  })

  res.status(201).json({ bundle: result })
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const bundleModule = req.scope.resolve("bundleModuleService")
  const bundles = await bundleModule.list(
    {},
    { relations: ["items", "items.product"] }
  )
  res.status(200).json({ bundles })
}
