import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

/**
 * GET /store/solar_calculations/:id
 * Obtém detalhes de um cálculo específico
 */
export const GET = async (
    req: MedusaRequest<{ id: string }>,
    res: MedusaResponse
): Promise<void> => {
    const customerId = (req as any).auth_context?.actor_id
    const { id } = req.params

    if (!customerId) {
        res.status(401).json({
            message: "Unauthorized - login required"
        })
        return
    }

    try {
        // Mock data - substituir por query real
        const calculation = {
            id,
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
                },
                financeiro: {
                    capex: { total_brl: 25000 },
                    retorno: { payback_simples_anos: 4.5 }
                }
            },
            created_at: new Date(),
            updated_at: new Date(),
        }

        res.json({ calculation })
    } catch (error: any) {
        console.error("Error fetching calculation:", error)
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to fetch calculation")
    }
}

/**
 * DELETE /store/solar_calculations/:id
 * Deleta um cálculo
 */
export const DELETE = async (
    req: MedusaRequest<{ id: string }>,
    res: MedusaResponse
): Promise<void> => {
    const customerId = (req as any).auth_context?.actor_id
    const { id } = req.params

    if (!customerId) {
        res.status(401).json({
            message: "Unauthorized - login required"
        })
        return
    }

    try {
        res.status(204).send()
    } catch (error: any) {
        console.error("Error deleting calculation:", error)
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to delete calculation")
    }
}

/**
 * PATCH /store/solar_calculations/:id
 * Atualiza um cálculo (nome, notas, favorito)
 */
export const PATCH = async (
    req: MedusaRequest<{ id: string }>,
    res: MedusaResponse
): Promise<void> => {
    const customerId = (req as any).auth_context?.actor_id
    const { id } = req.params
    const { name, notes, is_favorite } = req.body as {
        name?: string
        notes?: string
        is_favorite?: boolean
    }

    if (!customerId) {
        res.status(401).json({
            message: "Unauthorized - login required"
        })
        return
    }

    try {
        const calculation = {
            id,
            customer_id: customerId,
            name: name || "Updated calculation",
            notes,
            is_favorite,
            updated_at: new Date(),
        }

        res.json({ calculation })
    } catch (error: any) {
        console.error("Error updating calculation:", error)
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to update calculation")
    }
}
