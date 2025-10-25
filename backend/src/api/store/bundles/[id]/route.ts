import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { BundledProductModuleService } from "../../../../modules/bundle"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  if (!id) {
    return res.status(400).json({ message: "Missing bundle ID" })
  }

  const bundleService: BundledProductModuleService = req.scope.resolve(
    "bundleModuleService"
  )

  const bundle = await bundleService.retrieve(id, {
    relations: ["items", "items.product"],
  })

  if (!bundle) {
    return res.status(404).json({ message: "Bundle not found" })
  }

  res.status(200).json({ bundle })
}
