import { Module } from "@medusajs/framework/utils"
import PVLibIntegrationService from "./service"

export const PVLIB_INTEGRATION = "pvlib-integration"

export default Module(PVLIB_INTEGRATION, {
    service: PVLibIntegrationService,
})
