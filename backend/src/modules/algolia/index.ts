import AlgoliaModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const ALGOLIA_MODULE = "algoliaModuleService"

export default Module(ALGOLIA_MODULE, {
  service: AlgoliaModuleService,
})