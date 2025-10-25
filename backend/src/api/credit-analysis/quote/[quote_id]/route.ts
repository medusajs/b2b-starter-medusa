/**
 * GET /api/credit-analysis/quote/:quote_id
 * Listar análises de crédito de uma cotação
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const { quote_id } = req.params
        const query = req.scope.resolve("query") as any

        const { data: analyses } = await query.graph({
            entity: "credit_analysis",
            fields: ["*"],
            filters: { quote_id },
            order: { submitted_at: "DESC" }
        } as any)

        res.json({
            success: true,
            count: analyses.length,
            credit_analyses: analyses
        })
    } catch (error: any) {
        console.error("Error listing credit analyses:", error)
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to list credit analyses")
    }
}
