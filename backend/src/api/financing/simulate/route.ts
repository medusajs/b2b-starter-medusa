import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import BACENFinancingService from "../../../modules/financing/bacen-service"
import { APIResponse } from "../../../utils/api-response"
import { APIVersionManager } from "../../../utils/api-versioning"

/**
 * POST /api/financing/simulate
 * Simula financiamento SAC ou Price
 * Body: { principal: number, annual_rate?: number, periods: number, system: "SAC" | "PRICE" }
 */
export async function POST(
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const { principal, annual_rate, periods, system = "SAC", spread = 3.5 } = req.body as {
            principal: number
            annual_rate?: number
            periods: number
            system?: "SAC" | "PRICE"
            spread?: number
        }

        if (!principal || !periods) {
            APIResponse.validationError(res, "Missing required parameters", {
                required: ["principal", "periods"]
            })
            return
        }

        const bacenService = new BACENFinancingService()

        // Se não fornecido, busca taxa solar (SELIC + spread)
        const rate = annual_rate ?? await bacenService.getSolarFinancingRate(spread)

        let simulation
        if (system === "PRICE") {
            simulation = bacenService.simulatePrice(principal, rate, periods)
        } else {
            simulation = bacenService.simulateSAC(principal, rate, periods)
        }

        res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION))
        APIResponse.success(res, {
            simulation,
            rate_info: {
                annual_rate: rate,
                source: annual_rate ? "custom" : "selic_plus_spread",
                spread_used: annual_rate ? null : spread
            }
        })
    } catch (error: any) {
        console.error("Error simulating financing:", error)
        APIResponse.internalError(res, error?.message ?? "Failed to simulate financing")
    }
}
