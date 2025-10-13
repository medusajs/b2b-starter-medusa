/**
 * PATCH /api/credit-analysis/:id/status
 * Atualizar status manualmente (admin)
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

export async function PATCH(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const { id } = req.params
        const { status, analyst_notes } = req.body as { status?: string; analyst_notes?: string }
        const query = req.scope.resolve("query") as any

        // Validar status
        const validStatuses = ["pending", "in_review", "approved", "rejected", "conditional"]
        if (!status || !validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
            })
            return
        }

        // Buscar análise
        const { data: [analysis] } = await query.graph({
            entity: "credit_analysis",
            fields: ["*"],
            filters: { id }
        } as any)

        if (!analysis) {
            res.status(404).json({
                success: false,
                error: "Credit analysis not found"
            })
            return
        }

        // Atualizar status
        const updateData: any = {
            status,
            analyst_notes,
            reviewed_at: new Date()
        }

        if (status === "approved") {
            updateData.approved_at = new Date()
            updateData.expires_at = getExpirationDate()
        } else if (status === "rejected") {
            updateData.rejected_at = new Date()
        }

        await query.graph({
            entity: "credit_analysis",
            fields: ["id"],
            filters: { id },
            data: updateData
        } as any)

        // Buscar análise atualizada
        const { data: [updatedAnalysis] } = await query.graph({
            entity: "credit_analysis",
            fields: ["*"],
            filters: { id }
        } as any)

        res.json({
            success: true,
            credit_analysis: updatedAnalysis
        })
    } catch (error: any) {
        console.error("Error updating credit analysis status:", error)
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to update credit analysis status")
    }
}

function getExpirationDate(): Date {
    const date = new Date()
    date.setDate(date.getDate() + 90)
    return date
}
