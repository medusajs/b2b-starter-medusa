import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { applyFinancingWorkflow } from "../../../workflows/financing/apply-financing.js"

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
    } = req.body as {
        customer_id: string
        quote_id: string
        credit_analysis_id: string
        financing_offer_id?: string
        modality: "CDC" | "LEASING" | "EAAS"
        down_payment_amount?: number
    }

    // Validação
    if (!customer_id || !quote_id || !credit_analysis_id || !modality) {
        return res.status(400).json({
            error: "Missing required fields: customer_id, quote_id, credit_analysis_id, modality"
        })
    }

    try {
        // Generate IDs
        const { randomUUID } = await import("crypto")
        const application_id = randomUUID()

        // Mock financing data
        const approved_amount = 50000
        const interest_rate = 0.013 // 1.3% a.m.
        const term_months = 60
        const monthly_payment = 1250
        const total_amount = approved_amount + (approved_amount * interest_rate * term_months * 0.6)

        // Get knex for raw SQL
        const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

        // Insert financing application
        await knex.raw(`
            INSERT INTO financing_application (
                id, customer_id, quote_id, credit_analysis_id, financing_offer_id,
                modality, approved_amount, interest_rate, term_months,
                down_payment_amount, total_amount, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            application_id,
            customer_id,
            quote_id,
            credit_analysis_id,
            financing_offer_id || null,
            modality,
            approved_amount,
            interest_rate,
            term_months,
            down_payment_amount || 0,
            total_amount,
            "pending"
        ])

        // Generate payment schedule
        const schedule_entries = []
        let balance = approved_amount
        const monthly_interest = interest_rate

        for (let i = 1; i <= term_months; i++) {
            const entry_id = randomUUID()
            const due_date = new Date()
            due_date.setMonth(due_date.getMonth() + i)

            const interest_amount = balance * monthly_interest
            const principal_amount = monthly_payment - interest_amount
            balance -= principal_amount

            const entry = {
                id: entry_id,
                installment_number: i,
                due_date: due_date.toISOString().split('T')[0],
                principal_amount: Math.round(principal_amount * 100) / 100,
                interest_amount: Math.round(interest_amount * 100) / 100,
                total_amount: Math.round(monthly_payment * 100) / 100,
                balance: Math.max(0, Math.round(balance * 100) / 100),
                status: "pending"
            }

            schedule_entries.push(entry)

            // Insert payment schedule entry
            await knex.raw(`
                INSERT INTO payment_schedule (
                    id, financing_application_id, installment_number, due_date,
                    principal_amount, interest_amount, total_amount, balance, status,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                entry.id,
                application_id,
                entry.installment_number,
                entry.due_date,
                entry.principal_amount,
                entry.interest_amount,
                entry.total_amount,
                entry.balance,
                entry.status
            ])
        }

        return res.status(201).json({
            application_id,
            status: "pending",
            modality,
            approved_amount,
            interest_rate,
            term_months,
            total_amount,
            payment_schedule: schedule_entries
        })
    } catch (error: any) {
        console.error("Financing application failed:", error)
        return res.status(500).json({ error: error.message })
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
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    try {
        // Fetch application using RemoteQuery
        const { data: [application] } = await query.graph({
            entity: "financing_application",
            fields: ["*"],
            filters: { id }
        })

        if (!application) {
            return res.status(404).json({ error: "Financing application not found" })
        }

        return res.json({
            ...application,
            // PLG: Payment schedule transparency (up to 360 installments)
            payment_schedule: application.payment_schedule || [],
            bacen_validation: {
                validated: application.bacen_validated || false,
                selic_rate: application.selic_rate_at_application,
                cdi_rate: application.cdi_rate_at_application
            }
        })
    } catch (error: any) {
        console.error("Failed to fetch financing application:", error)
        return res.status(500).json({ error: error.message })
    }
}
