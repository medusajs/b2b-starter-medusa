/**
 * 💳 Credit Analysis API Routes
 * Endpoints para análise de crédito de clientes solares
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CreditAnalysisService from "../../modules/credit-analysis/service"
import type { CreditAnalysisInput } from "../../modules/credit-analysis/service"

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

        res.status(201).json({
            success: true,
            credit_analysis: analysis
        })
    } catch (error: any) {
        console.error("Error creating credit analysis:", error)
        res.status(400).json({
            success: false,
            error: error.message || "Failed to create credit analysis"
        })
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
            res.status(404).json({
                success: false,
                error: "Credit analysis not found"
            })
            return
        }

        res.json({
            success: true,
            credit_analysis: analysis
        })
    } catch (error: any) {
        console.error("Error fetching credit analysis:", error)
        res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch credit analysis"
        })
    }
}
