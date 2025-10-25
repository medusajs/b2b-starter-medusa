import { defineLink } from "@medusajs/framework/utils"
import BundleModule from "../modules/bundle"
import ProductModule from "@medusajs/product"

export default defineLink(
  BundleModule.linkable.bundle,
  ProductModule.linkable.product
)
