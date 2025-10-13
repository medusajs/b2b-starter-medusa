import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { MedusaError } from "@medusajs/framework/utils"
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
    } catch (error: any) {
        console.error("Error fetching PVLib stats:", error)
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to fetch PVLib stats")
    }
}
