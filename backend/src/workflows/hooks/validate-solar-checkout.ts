import { completeCartWorkflow } from "@medusajs/medusa/core-flows";
import { validateSolarFeasibilityWorkflow } from "./validate-solar-feasibility";
import type { CartDTO } from "@medusajs/framework/types";

/**
 * Hook: Validar viabilidade técnica antes de concluir checkout
 * 
 * Integra com completeCartWorkflow do Medusa para bloquear
 * conclusão de pedidos solares que não atendem requisitos técnicos mínimos.
 * 
 * Erros bloqueantes:
 * - Irradiação solar < 3.5 kWh/m²/dia
 * - Área de telhado insuficiente
 * - Capacidade < 1.5 kWp (inviável economicamente)
 */
completeCartWorkflow.hooks.validate(
    async ({ cart }: { cart: CartDTO }) => {
        // Skip se não é carrinho solar
        if (cart.metadata?.tipo_produto !== "sistema_solar") {
            return;
        }

        // Executar workflow de validação
        const { result: validation } = await validateSolarFeasibilityWorkflow.run({
            input: { cart },
        });

        // Se não é viável, bloquear checkout
        if (!validation.is_feasible) {
            const errorMessage = [
                "🚫 Projeto solar não viável. Checkout bloqueado:",
                "",
                ...validation.blocking_errors,
                "",
                "Por favor, ajuste os parâmetros do projeto (capacidade, localização, área de telhado) antes de prosseguir.",
            ].join("\n");

            throw new Error(errorMessage);
        }

        // Se viável mas com warnings, adicionar ao metadata
        if (validation.warnings.length > 0) {
            cart.metadata = {
                ...cart.metadata,
                solar_feasibility_warnings: validation.warnings,
                solar_feasibility_validated_at: new Date().toISOString(),
                installation_complexity: validation.validation_details.installation_complexity,
                crane_required: validation.validation_details.crane_required,
            };
        }
    }
);