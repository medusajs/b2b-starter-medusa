import type {
    AuthenticatedMedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http";
import { createSolarFreeShippingWorkflow } from "../../../../../workflows/promotion/create-solar-promo";
import { z } from "zod";

const CreateFreeShippingSchema = z.object({
    code: z.string().min(3).max(50),
    min_capacity_kwp: z.number().positive().optional(),
    residential_only: z.boolean().default(true),
});

/**
 * POST /admin/solar/promotions/free-shipping
 * 
 * Criar promoção de frete grátis para projetos solares
 * 
 * Opções:
 * - residential_only: true → Apenas residential sem guindaste
 * - residential_only: false → Todos os projetos elegíveis
 * 
 * Exemplo:
 * {
 *   "code": "FREESHIP-RESIDENTIAL",
 *   "min_capacity_kwp": 3,
 *   "residential_only": true
 * }
 */
export const POST = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const validation = CreateFreeShippingSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({
            error: "Invalid input",
            details: validation.error.errors,
        });
    }

    const input = validation.data;

    try {
        const { result } = await createSolarFreeShippingWorkflow(req.scope).run({
            input,
        });

        res.status(201).json({
            promotion: result.promotion,
            residential_only: result.residential_only,
            note: result.note,
            message: `Promoção de frete grátis ${input.code} criada com sucesso!`,
        });
    } catch (error: any) {
        console.error("Error creating free shipping promotion:", error);

        res.status(500).json({
            error: "Failed to create promotion",
            message: error.message,
        });
    }
};