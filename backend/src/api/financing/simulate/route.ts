import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import BACENFinancingService from "../../../modules/financing/bacen-service"

/**
 * POST /api/financing/simulate
 * Simula financiamento SAC ou Price
 * Body: { principal: number, annual_rate?: number, periods: number, system: "SAC" | "PRICE" }
 */
export async function POST(
    req: MedusaRequest,
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
            res.status(400).json({
                error: "Missing required parameters",
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

        res.json({
            simulation,
            rate_info: {
                annual_rate: rate,
                source: annual_rate ? "custom" : "selic_plus_spread",
                spread_used: annual_rate ? null : spread
            }
        })
    } catch (error) {
        console.error("Error simulating financing:", error)
        res.status(500).json({
            error: "Failed to simulate financing",
            message: error.message
        })
    }
}
