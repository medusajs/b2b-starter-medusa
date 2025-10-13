import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import BACENFinancingService from "../../../modules/financing/bacen-service"
import { APIResponse } from "../../../utils/api-response"
import { APIVersionManager } from "../../../utils/api-versioning"

/**
 * GET /api/financing/rates
 * Busca taxas do BACEN (SELIC, CDI, IPCA)
 */
export async function GET(
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const bacenService = new BACENFinancingService()
        const rates = await bacenService.getAllRates()

        res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION))
        APIResponse.success(res, rates)
    } catch (error) {
        console.error("Error fetching BACEN rates:", error)
        APIResponse.internalError(res, error?.message ?? "Failed to fetch BACEN rates")
    }
}
