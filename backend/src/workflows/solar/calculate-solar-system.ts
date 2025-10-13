import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

/**
 * Solar System Calculation Workflow
 * 
 * Workflow para calcular sistemas solares e recomendar kits.
 * Este workflow persiste SolarCalculation e SolarCalculationKit usando MikroORM.
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

        // Get MikroORM entity manager
        const mikroORM = container.resolve("@mikro-orm/core")
        const em = mikroORM.em.fork()

        // Import entities
        const { SolarCalculation } = await import("../../models/solar-calculation")
        const { SolarCalculationKit } = await import("../../models/solar-calculation-kit")

        // Create calculation record
        const calculation = em.create(SolarCalculation, {
            customer_id,
            consumo_kwh_mes,
            uf,
            tipo_telhado: tipo_telhado || "ceramico",
            budget_max,
            status: "completed",
            created_at: new Date(),
        })

        // Simple kit recommendations (mock data for testing)
        // In production, this would call solar calculator service
        const kits = []
        const basePrice = consumo_kwh_mes * 6.5 // R$ 6.50 por kWh/mês

        // Kit 1: Small system
        const kit1 = em.create(SolarCalculationKit, {
            solar_calculation: calculation,
            product_id: "prod_small_solar_kit",
            panels_count: Math.ceil(consumo_kwh_mes / 30),
            inverter_power_kw: Math.ceil(consumo_kwh_mes / 150),
            estimated_generation_kwh_month: consumo_kwh_mes,
            total_cost: basePrice * 0.9,
            payback_months: 48,
            recommended: false,
            created_at: new Date(),
        })
        kits.push(kit1)

        // Kit 2: Medium system (recommended)
        const kit2 = em.create(SolarCalculationKit, {
            solar_calculation: calculation,
            product_id: "prod_medium_solar_kit",
            panels_count: Math.ceil(consumo_kwh_mes / 25),
            inverter_power_kw: Math.ceil(consumo_kwh_mes / 120),
            estimated_generation_kwh_month: consumo_kwh_mes * 1.1,
            total_cost: basePrice,
            payback_months: 54,
            recommended: true,
            created_at: new Date(),
        })
        kits.push(kit2)

        // Kit 3: Large system
        const kit3 = em.create(SolarCalculationKit, {
            solar_calculation: calculation,
            product_id: "prod_large_solar_kit",
            panels_count: Math.ceil(consumo_kwh_mes / 20),
            inverter_power_kw: Math.ceil(consumo_kwh_mes / 100),
            estimated_generation_kwh_month: consumo_kwh_mes * 1.2,
            total_cost: basePrice * 1.15,
            payback_months: 60,
            recommended: false,
            created_at: new Date(),
        })
        kits.push(kit3)

        // Persist to database
        await em.persistAndFlush([calculation, ...kits])

        return new StepResponse(
            {
                calculation_id: calculation.id,
                kits: kits.map(k => ({
                    id: k.id,
                    product_id: k.product_id,
                    panels_count: k.panels_count,
                    inverter_power_kw: k.inverter_power_kw,
                    estimated_generation_kwh_month: k.estimated_generation_kwh_month,
                    total_cost: k.total_cost,
                    payback_months: k.payback_months,
                    recommended: k.recommended,
                }))
            },
            {
                calculation_id: calculation.id,
                kit_ids: kits.map(k => k.id)
            }
        )
    },
    async (compensate, { container }) => {
        // Rollback: delete created records
        if (!compensate?.calculation_id) return

        try {
            const mikroORM = container.resolve("@mikro-orm/core")
            const em = mikroORM.em.fork()

            const { SolarCalculation } = await import("../../models/solar-calculation")
            const { SolarCalculationKit } = await import("../../models/solar-calculation-kit")

            // Delete kits
            if (compensate.kit_ids && compensate.kit_ids.length > 0) {
                await em.nativeDelete(SolarCalculationKit, { id: { $in: compensate.kit_ids } })
            }

            // Delete calculation
            await em.nativeDelete(SolarCalculation, { id: compensate.calculation_id })

            await em.flush()
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
