import type {
    AuthenticatedMedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http";
import {
    createSolarPromotionWorkflow,
    createSolarFreeShippingWorkflow,
    type CreateSolarPromotionInput,
} from "../../../../workflows/promotion/create-solar-promo";
import { z } from "zod";

const CreateSolarPromoSchema = z.object({
    code: z.string().min(3).max(50),
    description: z.string(),
    discount_type: z.enum(["percentage", "fixed"]),
    discount_value: z.number().positive(),
    min_capacity_kwp: z.number().positive().optional(),
    max_capacity_kwp: z.number().positive().optional(),
    building_types: z.array(z.enum(["residential", "commercial", "industrial", "rural"])).optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    usage_limit: z.number().positive().optional(),
});

/**
 * POST /admin/solar/promotions
 * 
 * Criar promoção solar com desconto tax-inclusive (v2.8.5)
 * 
 * O desconto é aplicado DEPOIS dos impostos, garantindo valor exato.
 * 
 * Exemplo:
 * {
 *   "code": "SOLAR10OFF",
 *   "description": "10% de desconto em sistemas residenciais acima de 5kWp",
 *   "discount_type": "percentage",
 *   "discount_value": 10,
 *   "min_capacity_kwp": 5,
 *   "building_types": ["residential"],
 *   "usage_limit": 100
 * }
 */
export const POST = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const validation = CreateSolarPromoSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({
            error: "Invalid input",
            details: validation.error.errors,
        });
    }

    const input: CreateSolarPromotionInput = validation.data;

    try {
        const { result } = await createSolarPromotionWorkflow(req.scope).run({
            input,
        });

        res.status(201).json({
            promotion: result.promotion,
            campaign: result.campaign,
            tax_inclusive_note: result.tax_inclusive_note,
            message: `Promoção ${input.code} criada com sucesso!`,
        });
    } catch (error: any) {
        console.error("Error creating solar promotion:", error);

        res.status(500).json({
            error: "Failed to create promotion",
            message: error.message,
        });
    }
};