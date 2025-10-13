import type { MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import ANEELTariffService from "../../../modules/aneel-tariff/service"
import { RateLimiter } from "../../../utils/rate-limiter"
import { APIResponse } from "../../../utils/api-response"
import { APIVersionManager } from "../../../utils/api-versioning"

/**
 * POST /api/aneel/calculate-savings
 * Calcula economia com sistema solar
 * Body: { 
 *   monthly_consumption_kwh: number, 
 *   system_generation_kwh: number, 
 *   uf: string, 
 *   grupo?: "B1" | "B2" | "B3" | "A4" 
 * }
 */
export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const limiter = RateLimiter.getInstance()
    const limitResult = await limiter.checkLimit(
        RateLimiter.byIPAndEndpoint(req),
        RateLimiter.MODERATE
    )

    res.setHeader('X-RateLimit-Limit', limitResult.limit)
    res.setHeader('X-RateLimit-Remaining', limitResult.remaining)
    res.setHeader('X-RateLimit-Reset', new Date(limitResult.resetTime).toISOString())

    if (!limitResult.success) {
        APIResponse.rateLimit(res, 'Too many requests to ANEEL calculate savings API')
        return
    }

    try {
        const {
            monthly_consumption_kwh,
            system_generation_kwh,
            uf,
            grupo = "B1"
        } = req.body as {
            monthly_consumption_kwh: number
            system_generation_kwh: number
            uf: string
            grupo?: "B1" | "B2" | "B3" | "A4"
        }

        if (!monthly_consumption_kwh || !system_generation_kwh || !uf) {
            APIResponse.error(res, 400, "Missing required parameters", {
                required: ["monthly_consumption_kwh", "system_generation_kwh", "uf"]
            })
            return
        }

        const aneelService = new ANEELTariffService()
        const savings = aneelService.calculateSolarSavings(
            monthly_consumption_kwh,
            system_generation_kwh,
            uf,
            grupo as "B1" | "B2" | "B3" | "A4"
        )

        res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION))
        APIResponse.success(res, savings)
    } catch (error: any) {
        console.error("Error calculating savings:", error)
        APIResponse.internalError(res, error?.message ?? "Failed to calculate savings")
    }
}
