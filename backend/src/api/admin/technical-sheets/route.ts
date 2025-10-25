import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { TechnicalSheetModuleService } from "../../../../modules/technical_sheet"
import { createRemoteLinkStep } from "@medusajs/remote-links"
import TechnicalSheetModule from "../../../../modules/technical_sheet"
import ProductModule from "@medusajs/product"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { url, file_type, version, product_id } = req.body

  if (!url || !product_id) {
    return res
      .status(400)
      .json({ message: "Missing url or product_id" })
  }

  const technicalSheetService: TechnicalSheetModuleService = req.scope.resolve(
    "technicalSheetModuleService"
  )

  const [technicalSheet] = await technicalSheetService.create([
    {
      url,
      file_type,
      version,
    },
  ])

  await createRemoteLinkStep({
    [TechnicalSheetModule.linkable.technical_sheet.id]: {
      technical_sheet_id: technicalSheet.id,
    },
    [ProductModule.linkable.product.id]: {
      product_id: product_id,
    },
  })

  res.status(201).json({ technicalSheet })
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { product_id } = req.query

  if (!product_id) {
    return res.status(400).json({ message: "Missing product_id" })
  }

  const technicalSheetService: TechnicalSheetModuleService = req.scope.resolve(
    "technicalSheetModuleService"
  )

  const technicalSheets = await technicalSheetService.list({
    product_id: product_id as string,
  })

  res.status(200).json({ technicalSheets })
}
