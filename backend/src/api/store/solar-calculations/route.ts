import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * GET /store/solar-calculations
 * Lista todos os cálculos salvos do usuário logado
 */
export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> => {
    const customerId = (req as any).auth?.actor_id || (req as any).user?.id

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
    } catch (error) {
        console.error("Error fetching solar calculations:", error)
        res.status(500).json({
            message: "Failed to fetch calculations",
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
}

/**
 * POST /store/solar-calculations
 * Executa workflow de cálculo solar com recomendações de kits (PLG: kit exposure)
 */
export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> => {
    const customerId = (req as any).auth?.actor_id || (req as any).user?.id

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
        const { calculateSolarSystemWorkflow } = await import("../../../workflows/solar/calculate-solar-system")

        // Execute workflow
        const { result } = await calculateSolarSystemWorkflow(req.scope).run({
            input: {
                customer_id: customer_id || customerId,
                consumo_kwh_mes,
                uf,
                tipo_instalacao: tipo_instalacao || "residencial",
                tipo_telhado: tipo_telhado || "ceramico",
                orcamento_disponivel,
                prioridade_cliente: prioridade_cliente || "custo_beneficio"
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

        res.status(201).json({
            calculation_id: result.calculation_id,
            dimensionamento: result.dimensionamento,
            producao: result.producao,
            financeiro: result.financeiro,
            // PLG: Kit recommendations with product exposure
            kits_recomendados: kits || [],
            notification_sent: result.notification_sent
        })
    } catch (error) {
        console.error("Solar calculation failed:", error)
        res.status(500).json({
            message: "Failed to calculate solar system",
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
}
