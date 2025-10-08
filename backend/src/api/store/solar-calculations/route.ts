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
 * Cria um novo cálculo solar
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

    const { name, input, output, calculation_hash, notes } = req.body as {
        name?: string
        input: any
        output: any
        calculation_hash?: string
        notes?: string
    }

    if (!input || !output) {
        res.status(400).json({
            message: "Missing required fields: input and output"
        })
        return
    }

    try {
        // Mock save - substituir por persistência real no banco
        const calculation = {
            id: `calc_${Date.now()}`,
            customer_id: customerId,
            name,
            input,
            output,
            calculation_hash,
            notes,
            is_favorite: false,
            created_at: new Date(),
            updated_at: new Date(),
        }

        res.status(201).json({
            calculation,
        })
    } catch (error) {
        console.error("Error creating solar calculation:", error)
        res.status(500).json({
            message: "Failed to create calculation",
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
}
