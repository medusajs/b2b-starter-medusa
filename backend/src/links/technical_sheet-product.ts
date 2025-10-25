import { defineLink } from "@medusajs/framework/utils"
import TechnicalSheetModule from "../modules/technical_sheet"
import ProductModule from "@medusajs/product"

export default defineLink(
  TechnicalSheetModule.linkable.technical_sheet,
  ProductModule.linkable.product
)
