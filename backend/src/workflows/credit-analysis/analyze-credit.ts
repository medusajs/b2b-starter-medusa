import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { randomUUID } from "crypto"

/**
 * Credit Analysis Workflow
 * 
 * Workflow para análise de crédito com ofertas de financiamento.
 * Versão simplificada para testes - persiste dados via raw SQL.
 */

export interface AnalyzeCreditInput {
    customer_id: string
    quote_id?: string
    solar_calculation_id?: string
    requested_amount: number
    requested_term_months: number
    financing_modality?: "CDC" | "LEASING" | "EAAS" | "CASH"
}

// Step: Analyze Credit and Create Offers
const analyzeCreditStep = createStep(
    "analyze-credit",
    async (input: AnalyzeCreditInput, { container }) => {
        const {
            customer_id,
            quote_id,
            solar_calculation_id,
            requested_amount,
            requested_term_months,
            financing_modality
        } = input

        // Generate IDs
        const credit_analysis_id = randomUUID()
        const offer_ids = [randomUUID(), randomUUID(), randomUUID()]

        // Mock credit score (would come from service in production)
        const credit_score = 720
        const approved = credit_score >= 600
        const base_rate = 0.015 // 1.5% a.m.

        // Create offers for different modalities
        const offersData = [
            {
                id: offer_ids[0],
                modality: "CDC",
                institution: "Banco Solar",
                interest_rate: base_rate - 0.002, // 1.3% a.m.
                term_months: requested_term_months,
                approved_amount: requested_amount,
                monthly_payment: (requested_amount * (base_rate - 0.002)) / (1 - Math.pow(1 + (base_rate - 0.002), -requested_term_months)),
                iof: requested_amount * 0.0038,
                total_amount: requested_amount * (1 + (base_rate - 0.002) * requested_term_months * 0.6),
                recommended: true,
            },
            {
                id: offer_ids[1],
                modality: "LEASING",
                institution: "Leasing Solar",
                interest_rate: base_rate - 0.001, // 1.4% a.m.
                term_months: requested_term_months,
                approved_amount: requested_amount,
                monthly_payment: (requested_amount * (base_rate - 0.001)) / (1 - Math.pow(1 + (base_rate - 0.001), -requested_term_months)),
                iof: 0,
                total_amount: requested_amount * (1 + (base_rate - 0.001) * requested_term_months * 0.65),
                recommended: false,
            },
            {
                id: offer_ids[2],
                modality: "EAAS",
                institution: "EaaS Solar",
                interest_rate: base_rate, // 1.5% a.m.
                term_months: requested_term_months,
                approved_amount: requested_amount,
                monthly_payment: (requested_amount * base_rate) / (1 - Math.pow(1 + base_rate, -requested_term_months)),
                iof: 0,
                total_amount: requested_amount * (1 + base_rate * requested_term_months * 0.7),
                recommended: false,
            }
        ]

        try {
            // Get knex instance for raw SQL
            const knex = container.resolve("knex")

            // Insert credit analysis
            await knex.raw(`
                INSERT INTO credit_analysis (
                    id, customer_id, quote_id, solar_calculation_id,
                    requested_amount, requested_term_months, financing_modality,
                    credit_score, approved, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                credit_analysis_id,
                customer_id,
                quote_id || null,
                solar_calculation_id || null,
                requested_amount,
                requested_term_months,
                financing_modality || "CDC",
                credit_score,
                approved ? 1 : 0,
                "completed"
            ])

            // Insert offers
            for (const offer of offersData) {
                await knex.raw(`
                    INSERT INTO financing_offer (
                        id, credit_analysis_id, modality, institution,
                        interest_rate, term_months, approved_amount, monthly_payment,
                        iof, total_amount, recommended, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `, [
                    offer.id,
                    credit_analysis_id,
                    offer.modality,
                    offer.institution,
                    offer.interest_rate,
                    offer.term_months,
                    offer.approved_amount,
                    offer.monthly_payment,
                    offer.iof,
                    offer.total_amount,
                    offer.recommended ? 1 : 0
                ])
            }

            return new StepResponse(
                {
                    credit_analysis_id,
                    credit_analysis: {
                        id: credit_analysis_id,
                        customer_id,
                        quote_id,
                        solar_calculation_id,
                        requested_amount,
                        requested_term_months,
                        financing_modality: financing_modality || "CDC",
                        credit_score,
                        approved,
                        status: "completed"
                    },
                    offers: offersData
                },
                {
                    credit_analysis_id,
                    offer_ids
                }
            )
        } catch (error) {
            console.error("Failed to save credit analysis:", error)
            throw error
        }
    },
    async (compensate, { container }) => {
        // Rollback: delete created records
        if (!compensate?.credit_analysis_id) return

        try {
            const knex = container.resolve("knex")

            // Delete offers
            await knex.raw(`DELETE FROM financing_offer WHERE credit_analysis_id = ?`, [compensate.credit_analysis_id])

            // Delete analysis
            await knex.raw(`DELETE FROM credit_analysis WHERE id = ?`, [compensate.credit_analysis_id])
        } catch (error) {
            console.error("Failed to rollback credit analysis:", error)
        }
    }
)

// Create workflow
export const analyzeCreditWorkflow = createWorkflow(
    "analyze-credit",
    function (input: AnalyzeCreditInput) {
        const result = analyzeCreditStep(input)
        return new WorkflowResponse(result)
    }
)
