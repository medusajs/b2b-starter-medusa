import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { randomUUID } from "crypto"

/**
 * Solar System Calculation Workflow
 * 
 * Workflow para calcular sistemas solares e recomendar kits.
 * Versão simplificada para testes - persiste dados via raw SQL.
 */

export interface CalculateSolarSystemInput {
    customer_id: string
    consumo_kwh_mes: number
    uf: string
    tipo_telhado?: "ceramico" | "metalico" | "laje" | "fibrocimento"
    budget_max?: number
}

// Step: Save Solar Calculation
const saveSolarCalculationStep = createStep(
    "save-solar-calculation",
    async (input: CalculateSolarSystemInput, { container }) => {
        const { customer_id, consumo_kwh_mes, uf, tipo_telhado, budget_max } = input

        // Generate IDs
        const calculation_id = randomUUID()
        const kit_ids = [randomUUID(), randomUUID(), randomUUID()]

        // Calculate kit data
        const basePrice = consumo_kwh_mes * 6.5 // R$ 6.50 por kWh/mês

        const kitsData = [
            {
                id: kit_ids[0],
                product_id: "prod_small_solar_kit",
                panels_count: Math.ceil(consumo_kwh_mes / 30),
                inverter_power_kw: Math.ceil(consumo_kwh_mes / 150),
                estimated_generation_kwh_month: consumo_kwh_mes,
                total_cost: basePrice * 0.9,
                payback_months: 48,
                recommended: false,
            },
            {
                id: kit_ids[1],
                product_id: "prod_medium_solar_kit",
                panels_count: Math.ceil(consumo_kwh_mes / 25),
                inverter_power_kw: Math.ceil(consumo_kwh_mes / 120),
                estimated_generation_kwh_month: consumo_kwh_mes * 1.1,
                total_cost: basePrice,
                payback_months: 54,
                recommended: true,
            },
            {
                id: kit_ids[2],
                product_id: "prod_large_solar_kit",
                panels_count: Math.ceil(consumo_kwh_mes / 20),
                inverter_power_kw: Math.ceil(consumo_kwh_mes / 100),
                estimated_generation_kwh_month: consumo_kwh_mes * 1.2,
                total_cost: basePrice * 1.15,
                payback_months: 60,
                recommended: false,
            }
        ]

        try {
            // Get knex instance for raw SQL
            const knex = container.resolve("knex")

            // Insert calculation
            await knex.raw(`
                INSERT INTO solar_calculation (
                    id, customer_id, consumo_kwh_mes, uf, tipo_telhado, 
                    budget_max, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                calculation_id,
                customer_id,
                consumo_kwh_mes,
                uf,
                tipo_telhado || "ceramico",
                budget_max || null,
                "completed"
            ])

            // Insert kits
            for (const kit of kitsData) {
                await knex.raw(`
                    INSERT INTO solar_calculation_kit (
                        id, solar_calculation_id, product_id, panels_count, inverter_power_kw,
                        estimated_generation_kwh_month, total_cost, payback_months, recommended,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `, [
                    kit.id,
                    calculation_id,
                    kit.product_id,
                    kit.panels_count,
                    kit.inverter_power_kw,
                    kit.estimated_generation_kwh_month,
                    kit.total_cost,
                    kit.payback_months,
                    kit.recommended ? 1 : 0
                ])
            }

            return new StepResponse(
                {
                    calculation_id,
                    calculation: {
                        id: calculation_id,
                        customer_id,
                        consumo_kwh_mes,
                        uf,
                        tipo_telhado: tipo_telhado || "ceramico",
                        budget_max,
                        status: "completed"
                    },
                    kits: kitsData
                },
                {
                    calculation_id,
                    kit_ids
                }
            )
        } catch (error) {
            console.error("Failed to save solar calculation:", error)
            throw error
        }
    },
    async (compensate, { container }) => {
        // Rollback: delete created records
        if (!compensate?.calculation_id) return

        try {
            const knex = container.resolve("knex")

            // Delete kits
            await knex.raw(`DELETE FROM solar_calculation_kit WHERE solar_calculation_id = ?`, [compensate.calculation_id])

            // Delete calculation
            await knex.raw(`DELETE FROM solar_calculation WHERE id = ?`, [compensate.calculation_id])
        } catch (error) {
            console.error("Failed to rollback solar calculation:", error)
        }
    }
)

// Create workflow
export const calculateSolarSystemWorkflow = createWorkflow(
    "calculate-solar-system",
    function (input: CalculateSolarSystemInput) {
        const result = saveSolarCalculationStep(input)
        return new WorkflowResponse(result)
    }
)
