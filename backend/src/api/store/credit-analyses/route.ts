import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { analyzeCreditWorkflow } from "../../../workflows/credit-analysis/analyze-credit"

/**
 * POST /store/credit-analyses
 * 
 * Cria análise de crédito com ofertas de financiamento (PLG: financing options exposure)
 */
export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const {
        customer_id,
        quote_id,
        solar_calculation_id,
        requested_amount,
        requested_term_months,
        financing_modality
    } = req.body as {
        customer_id: string
        quote_id?: string
        solar_calculation_id?: string
        requested_amount: number
        requested_term_months: number
        financing_modality?: "CDC" | "LEASING" | "EAAS" | "CASH"
    }

    // Validação
    if (!customer_id || !requested_amount || !requested_term_months) {
        return res.status(400).json({
            error: "Missing required fields: customer_id, requested_amount, requested_term_months"
        })
    }

    try {
        // Execute workflow
        const { result } = await analyzeCreditWorkflow.run({
            input: {
                customer_id,
                quote_id,
                solar_calculation_id,
                requested_amount,
                requested_term_months,
                financing_modality
            },
            container: req.scope,
        })

        return res.status(201).json({
            analysis_id: result.analysis_id,
            result: result.result,
            best_offers: result.best_offers, // PLG: Financing options exposure
            notification_sent: result.notification_sent
        })
    } catch (error: any) {
        console.error("Credit analysis failed:", error)
        return res.status(500).json({ error: error.message })
    }
}

/**
 * GET /store/credit-analyses/:id
 * 
 * Retorna análise de crédito com ofertas de financiamento
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { id } = req.params
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    try {
        // Fetch analysis with offers using RemoteQuery
        const { data: [analysis] } = await query.graph({
            entity: "credit_analysis",
            fields: [
                "*",
                "offers.*"
            ],
            filters: { id }
        })

        if (!analysis) {
            return res.status(404).json({ error: "Credit analysis not found" })
        }

        return res.json({
            ...analysis,
            // PLG: Financing options exposure
            offers: analysis.offers || []
        })
    } catch (error: any) {
        console.error("Failed to fetch credit analysis:", error)
        return res.status(500).json({ error: error.message })
    }
}
