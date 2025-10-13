/**
 * Workflow Hooks Registration
 * 
 * Este arquivo importa todos os hooks customizados para que sejam
 * registrados automaticamente no Medusa.
 * 
 * Hooks são executados em pontos específicos dos workflows core:
 * - validateSolarCheckout: Valida viabilidade técnica antes de concluir carrinho
 * - solarFeasibilityShipping: Adiciona contexto de viabilidade às opções de envio
 */

// Import hooks to register them
import "./validate-solar-checkout";

// Export hooks for direct usage if needed
export {
    validateSolarFeasibilityWorkflow,
    solarFeasibilityShippingHook,
    type SolarFeasibilityResult
} from "./validate-solar-feasibility";
