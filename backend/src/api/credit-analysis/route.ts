/**
 * 💳 Credit Analysis API Routes
 * Endpoints para análise de crédito de clientes solares
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import CreditAnalysisService from "../../modules/credit-analysis/service"
import type { CreditAnalysisInput } from "../../modules/credit-analysis/service"
import { APIResponse } from "../../utils/api-response"
import { APIVersionManager } from "../../utils/api-versioning"

/**
 * POST /api/credit-analysis
 * Criar nova análise de crédito
 */
export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const creditAnalysisService = req.scope.resolve("creditAnalysisService") as CreditAnalysisService

        // Extrair dados do body
        const input = req.body as CreditAnalysisInput

        // Adicionar metadados da requisição
        input.submission_source = "api"
        input.ip_address = req.ip || req.headers["x-forwarded-for"] as string || "unknown"
        input.user_agent = req.headers["user-agent"] || "unknown"

        // Criar análise
        const analysisData = await creditAnalysisService.createCreditAnalysis(input)

        // Persistir no banco (usar query direto)
        const query = req.scope.resolve("query") as any
        const { data: [analysis] } = await query.graph({
            entity: "credit_analysis",
            fields: ["*"],
            data: [analysisData]
        } as any)

        res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION))
        APIResponse.success(res, analysis, undefined, 201)
    } catch (error: any) {
        console.error("Error creating credit analysis:", error)
        APIResponse.validationError(res, error.message || "Failed to create credit analysis")
    }
}

/**
 * GET /api/credit-analysis/:id
 * Buscar análise por ID
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const { id } = req.params
        const query = req.scope.resolve("query") as any

        const { data: [analysis] } = await query.graph({
            entity: "credit_analysis",
            fields: ["*"],
            filters: { id }
        } as any)

        if (!analysis) {
            APIResponse.notFound(res, "Credit analysis not found")
            return
        }

        res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION))
        APIResponse.success(res, analysis)
    } catch (error: any) {
        console.error("Error fetching credit analysis:", error)
        APIResponse.internalError(res, error?.message ?? "Failed to fetch credit analysis")
    }
}
