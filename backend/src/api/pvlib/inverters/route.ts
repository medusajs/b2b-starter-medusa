import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { MedusaError } from "@medusajs/framework/utils"
import PVLibIntegrationService from "../../../modules/pvlib-integration/service"
import { APIResponse } from "../../../utils/api-response"
import { APIVersionManager } from "../../../utils/api-versioning"
import { RateLimiter } from "../../../utils/rate-limiter"

/**
 * GET /api/pvlib/inverters
 * Lista inversores disponíveis no banco PVLib
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    // Rate limiting: 100 req/15min
    const limiter = RateLimiter.getInstance()
    const limitResult = await limiter.checkLimit(
        RateLimiter.byIPAndEndpoint(req),
        RateLimiter.MODERATE
    )

    res.setHeader('X-RateLimit-Limit', limitResult.limit)
    res.setHeader('X-RateLimit-Remaining', limitResult.remaining)
    res.setHeader('X-RateLimit-Reset', new Date(limitResult.resetTime).toISOString())

    if (!limitResult.success) {
        APIResponse.rateLimit(res, 'Too many requests to PVLib inverters API')
        return
    }

    try {
        const pvlibService = new PVLibIntegrationService()

        const {
            complete_only = "false",
            power_w,
            tolerance = "0.2"
        } = req.query

        let inverters

        // Filtrar por potência se fornecido
        if (power_w) {
            const powerNum = parseFloat(power_w as string)
            const toleranceNum = parseFloat(tolerance as string)
            inverters = await pvlibService.findInvertersByPower(powerNum, toleranceNum)
        } else if (complete_only === "true") {
            inverters = await pvlibService.listCompleteInverters()
        } else {
            inverters = await pvlibService.loadInverters()
        }

        res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION))
        APIResponse.success(res, inverters, { count: inverters.length })
    } catch (error: any) {
        console.error("Error fetching PVLib inverters:", error)
        APIResponse.internalError(res, error?.message ?? "Failed to fetch PVLib inverters")
    }
}
