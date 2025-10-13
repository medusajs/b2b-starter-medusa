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
        // Import workflow
        const { calculateSolarSystemWorkflow } = await import("../../../workflows/solar/calculate-solar-system.js")

        // Narrow tipo_telhado from string to union literal
        const rawTelhado = (tipo_telhado ?? '').toString().toLowerCase()
        const tipoTelhadoNarrowed: TipoTelhado = (ALLOWED_TELHADOS as readonly string[]).includes(rawTelhado)
            ? (rawTelhado as TipoTelhado)
            : 'ceramico'

        // Execute workflow
        const { result } = await calculateSolarSystemWorkflow(req.scope).run({
            input: {
                customer_id: customer_id || customerId,
                consumo_kwh_mes,
                uf,
                tipo_telhado: tipoTelhadoNarrowed,
                budget_max: orcamento_disponivel
            }
        })

        // Enrich kits with product details via RemoteQuery
        const query = req.scope.resolve("query")
        const { data: kits } = await query.graph({
            entity: "solar_calculation_kit",
            fields: [
                "*",
                "product.id",
                "product.title",
                "product.thumbnail",
                "product.variants.*"
            ],
            filters: { solar_calculation_id: result.calculation_id }
        })

        // Fix: Access properties from result.calculation (not result directly)
        res.status(201).json({
            calculation_id: result.calculation_id,
            dimensionamento: result.calculation.dimensionamento,
            producao: result.calculation.dimensionamento.geracao_mensal_kwh, // producao is inside dimensionamento
            financeiro: result.calculation.financeiro,
            // PLG: Kit recommendations with product exposure
            kits_recomendados: kits || [],
            notification_sent: result.saved
        })
    } catch (error: any) {
        console.error("Solar calculation failed:", error)
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Solar calculation failed")
    }
}
