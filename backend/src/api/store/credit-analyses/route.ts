import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { analyzeCreditWorkflow } from "../../../workflows/credit-analysis/analyze-credit.js"

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
        // Generate IDs
        const { randomUUID } = await import("crypto")
        const credit_analysis_id = randomUUID()
        const offer_ids = [randomUUID(), randomUUID(), randomUUID()]

        // Mock credit score
        const credit_score = 720
        const approved = credit_score >= 600
        const base_rate = 0.015 // 1.5% a.m.

        // Get knex for raw SQL
        const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

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

        // Create offers
        const offersData = [
            {
                id: offer_ids[0],
                modality: "CDC",
                institution: "Banco Solar",
                interest_rate: base_rate - 0.002,
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
                interest_rate: base_rate - 0.001,
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
                interest_rate: base_rate,
                term_months: requested_term_months,
                approved_amount: requested_amount,
                monthly_payment: (requested_amount * base_rate) / (1 - Math.pow(1 + base_rate, -requested_term_months)),
                iof: 0,
                total_amount: requested_amount * (1 + base_rate * requested_term_months * 0.7),
                recommended: false,
            }
        ]

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

        return res.status(201).json({
            analysis_id: credit_analysis_id,
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
