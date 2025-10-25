import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { MedusaError } from "@medusajs/framework/utils"
import PVLibIntegrationService from "../../../modules/pvlib-integration/service"
import { APIResponse } from "../../../utils/api-response"
import { APIVersionManager } from "../../../utils/api-versioning"

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

        res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION))
        APIResponse.success(res, stats)
    } catch (error: any) {
        console.error("Error fetching PVLib stats:", error)
        APIResponse.internalError(res, error?.message ?? "Failed to fetch PVLib stats")
    }
}
