import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { executeWorkflow } from "@medusajs/workflows-sdk"
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
    } = req.body

    // Validação
    if (!customer_id || !requested_amount || !requested_term_months) {
        return res.status(400).json({
            error: "Missing required fields: customer_id, requested_amount, requested_term_months"
        })
    }

    try {
        // Execute workflow
        const { result } = await executeWorkflow(
            analyzeCreditWorkflow,
            {
                input: {
                    customer_id,
                    quote_id,
                    solar_calculation_id,
                    requested_amount,
                    requested_term_months,
                    financing_modality
                },
                context: { container: req.scope }
            }
        )

        return res.status(201).json({
            analysis_id: result.analysis_id,
            result: result.result,
            best_offers: result.best_offers, // PLG: Financing options exposure
            notification_sent: result.notification_sent
        })
    } catch (error) {
        console.error("Credit analysis failed:", error)
        return res.status(500).json({
            error: "Failed to analyze credit",
            message: error.message
        })
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
    const entityManager = req.scope.resolve("entityManager")

    try {
        const { CreditAnalysis, FinancingOffer } = await import("../../../entities/credit-analysis.entity")

        // Fetch analysis with offers
        const analysis = await entityManager.findOne(CreditAnalysis, id, {
            populate: ['offers']
        })

        if (!analysis) {
            return res.status(404).json({ error: "Credit analysis not found" })
        }

        const offers = analysis.offers?.toArray() || []

        return res.json({
            ...analysis.toObject(),
            offers: offers.map(o => o.toObject())
        })
    } catch (error) {
        console.error("Failed to fetch credit analysis:", error)
        return res.status(500).json({
            error: "Failed to fetch credit analysis",
            message: error.message
        })
    }
}
