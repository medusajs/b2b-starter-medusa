import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import PVLibIntegrationService from "../../../modules/pvlib-integration/service"

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

        res.json({
            panels,
            count: panels.length
        })
    } catch (error) {
        console.error("Error fetching PVLib panels:", error)
        res.status(500).json({
            error: "Failed to fetch panels",
            message: error.message
        })
    }
}
