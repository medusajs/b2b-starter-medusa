import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import BACENFinancingService from "../../../modules/financing/bacen-service"

/**
 * GET /api/financing/rates
 * Busca taxas do BACEN (SELIC, CDI, IPCA)
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const bacenService = new BACENFinancingService()
        const rates = await bacenService.getAllRates()

        res.json(rates)
    } catch (error) {
        console.error("Error fetching BACEN rates:", error)
        res.status(500).json({
            error: "Failed to fetch financing rates",
            message: error.message
        })
    }
}
