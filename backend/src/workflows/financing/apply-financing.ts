import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { randomUUID } from "crypto"

/**
 * Financing Application Workflow
 * 
 * Workflow para aplicação de financiamento com schedule de pagamento.
 * Versão simplificada para testes - persiste dados via raw SQL.
 */

export interface ApplyFinancingInput {
    customer_id: string
    quote_id: string
    credit_analysis_id: string
    financing_offer_id?: string
    modality: "CDC" | "LEASING" | "EAAS"
    down_payment_amount?: number
}

// Step: Apply Financing and Generate Schedule
const applyFinancingStep = createStep(
    "apply-financing",
    async (input: ApplyFinancingInput, { container }) => {
        const {
            customer_id,
            quote_id,
            credit_analysis_id,
            financing_offer_id,
            modality,
            down_payment_amount
        } = input

        // Generate IDs
        const application_id = randomUUID()

        // Mock financing data (would query from credit analysis/offer in production)
        const approved_amount = 50000
        const interest_rate = 0.013 // 1.3% a.m.
        const term_months = 60
        const monthly_payment = 1250
        const total_amount = approved_amount + (approved_amount * interest_rate * term_months * 0.6)

        try {
            // Get knex instance for raw SQL
            const knex = container.resolve("knex")

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

            return new StepResponse(
                {
                    application_id,
                    application: {
                        id: application_id,
                        customer_id,
                        quote_id,
                        credit_analysis_id,
                        financing_offer_id,
                        modality,
                        approved_amount,
                        interest_rate,
                        term_months,
                        down_payment_amount: down_payment_amount || 0,
                        total_amount,
                        status: "pending"
                    },
                    schedule: schedule_entries
                },
                {
                    application_id
                }
            )
        } catch (error) {
            console.error("Failed to save financing application:", error)
            throw error
        }
    },
    async (compensate, { container }) => {
        // Rollback: delete created records
        if (!compensate?.application_id) return

        try {
            const knex = container.resolve("knex")

            // Delete schedule entries
            await knex.raw(`DELETE FROM payment_schedule WHERE financing_application_id = ?`, [compensate.application_id])

            // Delete application
            await knex.raw(`DELETE FROM financing_application WHERE id = ?`, [compensate.application_id])
        } catch (error) {
            console.error("Failed to rollback financing application:", error)
        }
    }
)

// Create workflow
export const applyFinancingWorkflow = createWorkflow(
    "apply-financing",
    function (input: ApplyFinancingInput) {
        const result = applyFinancingStep(input)
        return new WorkflowResponse(result)
    }
)
