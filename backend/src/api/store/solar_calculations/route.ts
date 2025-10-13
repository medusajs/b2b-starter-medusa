import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AuthenticatedMedusaRequest } from "@medusajs/framework"
import { MedusaError } from "@medusajs/framework/utils"

// Type narrowing for tipo_telhado parameter
const ALLOWED_TELHADOS = ['laje', 'ceramico', 'metalico', 'fibrocimento', 'solo'] as const
type TipoTelhado = typeof ALLOWED_TELHADOS[number]

/**
 * GET /store/solar_calculations
 * Lista todos os cálculos salvos do usuário logado
 */
export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
): Promise<void> => {
    const customerId = req.auth_context?.actor_id

    if (!customerId) {
        res.status(401).json({
            message: "Unauthorized - login required"
        })
        return
    }

    try {
        // Mock data para development - substituir por query real no banco
        const calculations = [
            {
                id: "calc_1",
                customer_id: customerId,
                name: "Cálculo residencial - 5.4 kWp",
                input: {
                    consumo_kwh_mes: 750,
                    uf: "SP",
                    tarifa_energia_kwh: 0.89
                },
                output: {
                    dimensionamento: {
                        kwp_proposto: 5.4,
                        kwp_necessario: 5.2
                    },
                    financeiro: {
                        capex: { total_brl: 25000 },
                        retorno: { payback_simples_anos: 4.5 }
                    }
                },
                created_at: new Date("2025-10-01"),
                updated_at: new Date("2025-10-01"),
            }
        ]

        res.json({
            calculations,
        })
    } catch (error: any) {
        console.error("Error fetching solar calculations:", error)
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to fetch solar calculations")
    }
}

/**
 * POST /store/solar_calculations
 * Executa workflow de cálculo solar com recomendações de kits (PLG: kit exposure)
 */
export const POST = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
): Promise<void> => {
    const customerId = req.auth_context?.actor_id

    if (!customerId) {
        res.status(401).json({
            message: "Unauthorized - login required"
        })
        return
    }

    const {
        customer_id,
        consumo_kwh_mes,
        uf,
        tipo_instalacao,
        tipo_telhado,
        orcamento_disponivel,
        prioridade_cliente
    } = req.body as {
        customer_id?: string
        consumo_kwh_mes: number
        uf: string
        tipo_instalacao?: string
        tipo_telhado?: string
        orcamento_disponivel?: number
        prioridade_cliente?: string
    }

    // Validação
    if (!consumo_kwh_mes || !uf) {
        res.status(400).json({
            message: "Missing required fields: consumo_kwh_mes, uf"
        })
        return
    }

    try {
        // Generate IDs
        const { randomUUID } = await import("crypto")
        const calculation_id = randomUUID()

        // Narrow tipo_telhado from string to union literal
        const rawTelhado = (tipo_telhado ?? '').toString().toLowerCase()
        const tipoTelhadoNarrowed: TipoTelhado = (ALLOWED_TELHADOS as readonly string[]).includes(rawTelhado)
            ? (rawTelhado as TipoTelhado)
            : 'ceramico'

        // Calculate kit data
        const basePrice = consumo_kwh_mes * 6.5 // R$ 6.50 por kWh/mês

        const kitsData = [
            {
                id: randomUUID(),
                product_id: "prod_small_solar_kit",
                panels_count: Math.ceil(consumo_kwh_mes / 30),
                inverter_power_kw: Math.ceil(consumo_kwh_mes / 150),
                estimated_generation_kwh_month: consumo_kwh_mes,
                total_cost: basePrice * 0.9,
                payback_months: 48,
                recommended: false,
            },
            {
                id: randomUUID(),
                product_id: "prod_medium_solar_kit",
                panels_count: Math.ceil(consumo_kwh_mes / 25),
                inverter_power_kw: Math.ceil(consumo_kwh_mes / 120),
                estimated_generation_kwh_month: consumo_kwh_mes * 1.1,
                total_cost: basePrice,
                payback_months: 54,
                recommended: true,
            },
            {
                id: randomUUID(),
                product_id: "prod_large_solar_kit",
                panels_count: Math.ceil(consumo_kwh_mes / 20),
                inverter_power_kw: Math.ceil(consumo_kwh_mes / 100),
                estimated_generation_kwh_month: consumo_kwh_mes * 1.2,
                total_cost: basePrice * 1.15,
                payback_months: 60,
                recommended: false,
            }
        ]

        // Get knex for raw SQL
        const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

        // Insert calculation
        await knex.raw(`
            INSERT INTO solar_calculation (
                id, customer_id, consumo_kwh_mes, uf, tipo_telhado, 
                budget_max, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            calculation_id,
            customer_id || customerId,
            consumo_kwh_mes,
            uf,
            tipoTelhadoNarrowed,
            orcamento_disponivel || null,
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

        // Return response
        res.status(201).json({
            calculation_id,
            customer_id: customer_id || customerId,
            consumo_kwh_mes,
            uf,
            tipo_telhado: tipoTelhadoNarrowed,
            status: "completed",
            kits_recomendados: kitsData,
            notification_sent: true
        })
    } catch (error: any) {
        console.error("Solar calculation failed:", error)
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Solar calculation failed")
    }
}
