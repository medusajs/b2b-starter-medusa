import { module } from "@medusajs/framework/utils"
import BundledProductModuleService from "./service"

export default module("bundle", {
  service: BundledProductModuleService,
})
