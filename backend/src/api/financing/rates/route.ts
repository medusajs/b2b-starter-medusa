import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import BACENFinancingService from "../../../modules/financing/bacen-service"

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

        res.json(rates)
    } catch (error) {
        console.error("Error fetching BACEN rates:", error)
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to fetch BACEN rates")
    }
}
