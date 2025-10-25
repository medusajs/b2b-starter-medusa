import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { TechnicalSheetModuleService } from "../../../../modules/technical_sheet"
import { RemoteLink } from "@medusajs/modules-sdk"
import TechnicalSheetModule from "../../../../modules/technical_sheet"
import ProductModule from "@medusajs/product"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { url, file_type, version, product_id } = req.body

  if (!url || !product_id) {
    return res.status(400).json({ message: "Missing url or product_id" })
  }

  const technicalSheetService: TechnicalSheetModuleService = req.scope.resolve(
    "technicalSheetModuleService"
  )
  const remoteLink: RemoteLink = req.scope.resolve("remoteLink")

  const [technicalSheet] = await technicalSheetService.create([
    {
      url,
      file_type,
      version,
    },
  ])

  await remoteLink.create({
    [TechnicalSheetModule.linkable.technical_sheet.id]: {
      technical_sheet_id: technicalSheet.id,
    },
    [ProductModule.linkable.product.id]: {
      product_id: product_id,
    },
  })

  res.status(201).json({ technicalSheet })
}

import { RemoteLink } from "@medusajs/modules-sdk"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { product_id } = req.query

  if (!product_id) {
    return res.status(400).json({ message: "Missing product_id" })
  }

  const remoteLink: RemoteLink = req.scope.resolve("remoteLink")
  const technicalSheetService: TechnicalSheetModuleService = req.scope.resolve(
    "technicalSheetModuleService"
  )

  const links = await remoteLink.list({
    product: {
      id: product_id as string,
    },
  })

  const technicalSheetIds = links.map(
    (link) => link.technical_sheet.technical_sheet_id
  )

  if (technicalSheetIds.length === 0) {
    return res.status(200).json({ technicalSheets: [] })
  }

  const technicalSheets = await technicalSheetService.list({
    id: technicalSheetIds,
  })

  res.status(200).json({ technicalSheets })
}
