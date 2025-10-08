import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import PVLibIntegrationService from "../../../modules/pvlib-integration/service"

/**
 * GET /api/pvlib/stats
 * Retorna estatísticas dos bancos de dados PVLib
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const pvlibService = new PVLibIntegrationService()
        const stats = await pvlibService.getStats()

        res.json(stats)
    } catch (error) {
        console.error("Error fetching PVLib stats:", error)
        res.status(500).json({
            error: "Failed to fetch stats",
            message: error.message
        })
    }
}
