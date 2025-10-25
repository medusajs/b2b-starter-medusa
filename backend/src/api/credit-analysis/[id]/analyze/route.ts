/**
 * POST /api/credit-analysis/:id/analyze
 * Executar análise automática de crédito
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import CreditAnalysisService from "../../../../modules/credit-analysis/service"

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const { id } = req.params
        const creditAnalysisService = req.scope.resolve("creditAnalysisService") as CreditAnalysisService
        const query = req.scope.resolve("query") as any

        // Buscar análise
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

        // Executar análise automática
        const result = await creditAnalysisService.analyzeCreditAutomatically(analysis)

        // Atualizar análise no banco
        const status = result.approved ? "approved" : "rejected"
        const updateData = {
            status,
            analysis_result: result,
            approved_amount: result.approved_amount,
            approved_term_months: result.approved_term_months,
            approved_interest_rate: result.approved_interest_rate,
            approval_conditions: result.approval_conditions,
            rejection_reason: result.rejection_reason,
            reviewed_at: new Date(),
            approved_at: result.approved ? new Date() : null,
            rejected_at: result.approved ? null : new Date(),
            expires_at: result.approved ? getExpirationDate() : null
        }

        await query.graph({
            entity: "credit_analysis",
            fields: ["id"],
            filters: { id },
            data: updateData
        } as any)

        // Buscar análise atualizada
        const { data: [updatedAnalysis] } = await query.graph({
            entity: "credit_analysis",
            fields: ["*"],
            filters: { id }
        } as any)

        res.json({
            success: true,
            credit_analysis: updatedAnalysis,
            analysis_result: result
        })
    } catch (error: any) {
        console.error("Error analyzing credit:", error)
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to analyze credit")
    }
}

/**
 * Helper: Data de expiração (90 dias)
 */
function getExpirationDate(): Date {
    const date = new Date()
    date.setDate(date.getDate() + 90)
    return date
}
