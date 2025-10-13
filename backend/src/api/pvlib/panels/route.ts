import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { MedusaError } from "@medusajs/framework/utils"
import PVLibIntegrationService from "../../../modules/pvlib-integration/service"
import { APIResponse } from "../../../utils/api-response"
import { APIVersionManager } from "../../../utils/api-versioning"

/**
 * GET /api/pvlib/panels
 * Lista painéis disponíveis no banco PVLib
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const pvlibService = new PVLibIntegrationService()

        const {
            complete_only = "false",
            power_w,
            tolerance = "0.15"
        } = req.query

        let panels

        // Filtrar por potência se fornecido
        if (power_w) {
            const powerNum = parseFloat(power_w as string)
            const toleranceNum = parseFloat(tolerance as string)
            panels = await pvlibService.findPanelsByPower(powerNum, toleranceNum)
        } else if (complete_only === "true") {
            panels = await pvlibService.listCompletePanels()
        } else {
            panels = await pvlibService.loadPanels()
        }

        res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION))
        APIResponse.success(res, panels, { count: panels.length })
    } catch (error: any) {
        console.error("Error fetching PVLib panels:", error)
        APIResponse.internalError(res, error?.message ?? "Failed to fetch PVLib panels")
    }
}
