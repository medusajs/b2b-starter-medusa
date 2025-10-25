import type { MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import ANEELTariffService from "../../../modules/aneel-tariff/service"
import { APIResponse } from "../../../utils/api-response"
import { APIVersionManager } from "../../../utils/api-versioning"
import { RateLimiter } from "../../../utils/rate-limiter"

/**
 * GET /api/aneel/concessionarias
 * Lista concessionárias por UF
 * Query params: uf (optional)
 */
export async function GET(
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
        APIResponse.rateLimit(res, 'Too many requests to ANEEL concessionarias API')
        return
    }

    try {
        const { uf } = req.query
        const aneelService = new ANEELTariffService()

        let concessionarias
        if (uf) {
            concessionarias = aneelService.getConcessionariasByUF(uf as string)
        } else {
            concessionarias = aneelService.listConcessionarias()
        }

        res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION))
        APIResponse.success(res, {
            concessionarias,
            count: concessionarias.length
        })
    } catch (error: any) {
        console.error("Error fetching concessionarias:", error)
        APIResponse.internalError(res, error?.message ?? "Failed to fetch concessionarias")
    }
}
