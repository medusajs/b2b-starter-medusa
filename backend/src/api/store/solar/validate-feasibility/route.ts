import type {
    AuthenticatedMedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http";
import { validateSolarFeasibilityWorkflow } from "../../../../workflows/hooks/validate-solar-feasibility";
import type { CartDTO } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

/**
 * POST /store/solar/validate-feasibility
 * 
 * Valida viabilidade técnica de projeto solar antes do checkout
 * 
 * Útil para validação prévia e feedback ao usuário durante
 * o processo de configuração do sistema.
 */
export const POST = async (
    req: AuthenticatedMedusaRequest<{ cart_id: string }>,
    res: MedusaResponse
) => {
    const { cart_id } = req.body;

    if (!cart_id) {
        return res.status(400).json({
            error: "cart_id is required",
        });
    }

    try {
        // Buscar carrinho
        const cartModule = req.scope.resolve(Modules.CART);
        const cart = await cartModule.retrieveCart(cart_id, {
            relations: ["items", "items.variant", "items.product"],
        });

        // Executar validação
        const { result: validation } = await validateSolarFeasibilityWorkflow(req.scope).run({
            input: { cart: cart as CartDTO },
        });

        // Determinar status HTTP baseado no resultado
        const statusCode = validation.is_feasible ? 200 : 422;

        res.status(statusCode).json({
            is_feasible: validation.is_feasible,
            blocking_errors: validation.blocking_errors,
            warnings: validation.warnings,
            validation_details: validation.validation_details,
            message: validation.is_feasible
                ? "✅ Projeto solar viável. Pode prosseguir com o checkout."
                : "❌ Projeto solar não viável. Ajuste os parâmetros antes de prosseguir.",
        });
    } catch (error: any) {
        console.error("Error validating solar feasibility:", error);

        res.status(500).json({
            error: "Failed to validate feasibility",
            message: error.message,
        });
    }
};