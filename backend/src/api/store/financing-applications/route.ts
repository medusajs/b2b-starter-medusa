import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { applyFinancingWorkflow } from "../../../workflows/financing/apply-financing"

/**
 * POST /store/financing-applications
 * 
 * Cria aplicação de financiamento (PLG: payment schedule transparency)
 */
export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const {
        customer_id,
        quote_id,
        credit_analysis_id,
        financing_offer_id,
        modality,
        down_payment_amount
    } = req.body

    // Validação
    if (!customer_id || !quote_id || !credit_analysis_id || !modality) {
        return res.status(400).json({
            error: "Missing required fields: customer_id, quote_id, credit_analysis_id, modality"
        })
    }

    try {
        // Execute workflow
        const { result } = await applyFinancingWorkflow(req.scope).run({
            input: {
                customer_id,
                quote_id,
                credit_analysis_id,
                financing_offer_id: financing_offer_id || 'default',
                modality,
                down_payment_amount
            }
        })

        // Fetch full application with payment schedule
        const query = req.scope.resolve("query")
        const { data: [application] } = await query.graph({
            entity: "financing_application",
            fields: ["*"],
            filters: { id: result.application_id }
        })        return res.status(201).json({
            application_id: result.application_id,
            status: result.status,
            contract_url: result.contract_url,
            order_id: result.order_id,
            rejection_reason: result.rejection_reason,
            next_steps: result.next_steps,
            // PLG: Payment schedule transparency
            payment_schedule: application?.payment_schedule || [],
            bacen_validation: {
                validated: application?.bacen_validated || false,
                selic_rate: application?.selic_rate_at_application,
                cdi_rate: application?.cdi_rate_at_application
            }
        })
    } catch (error) {
        console.error("Financing application failed:", error)
        return res.status(500).json({
            error: "Failed to apply for financing",
            message: error.message
        })
    }
}

/**
 * GET /store/financing-applications/:id
 * 
 * Retorna aplicação de financiamento com payment schedule
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { id } = req.params
    const entityManager = req.scope.resolve("entityManager")

    try {
        const { FinancingApplication } = await import("../../../entities/financing-application.entity")

        const application = await entityManager.findOne(FinancingApplication, id)

        if (!application) {
            return res.status(404).json({ error: "Financing application not found" })
        }

        return res.json(application.toObject())
    } catch (error) {
        console.error("Failed to fetch financing application:", error)
        return res.status(500).json({
            error: "Failed to fetch financing application",
            message: error.message
        })
    }
}
