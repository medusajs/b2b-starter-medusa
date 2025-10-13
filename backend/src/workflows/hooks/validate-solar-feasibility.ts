import {
    createWorkflow,
    createStep,
    StepResponse,
    WorkflowResponse,
    createHook,
} from "@medusajs/workflows-sdk";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type { CartDTO } from "@medusajs/framework/types";

/**
 * Resultado da validação de viabilidade técnica
 */
export type SolarFeasibilityResult = {
    is_feasible: boolean;
    blocking_errors: string[];
    warnings: string[];
    validation_details: {
        irradiation_check: {
            passed: boolean;
            value: number;
            minimum: number;
        };
        roof_area_check: {
            passed: boolean;
            available_m2: number;
            required_m2: number;
        };
        capacity_check: {
            passed: boolean;
            value_kwp: number;
            minimum_kwp: number;
        };
        crane_required: boolean;
        distance_km?: number;
        installation_complexity: "low" | "medium" | "high" | "very_high";
    };
};

/**
 * Step: Validar viabilidade técnica de projeto solar
 */
const validateSolarProjectStep = createStep(
    "validate-solar-project",
    async (input: { cart: CartDTO }) => {
        const { cart } = input;

        // Extrair metadados solares do carrinho
        const metadata = cart.metadata || {};

        // Se não é um carrinho solar, skip validation
        if (metadata.tipo_produto !== "sistema_solar") {
            return new StepResponse({
                is_feasible: true,
                blocking_errors: [],
                warnings: [],
                validation_details: {} as any,
            });
        }

        const blocking_errors: string[] = [];
        const warnings: string[] = [];

        // 1. Validar irradiação solar mínima
        const irradiation = Number(metadata.irradiation_kwh_m2_day || 0);
        const MIN_IRRADIATION = 3.5;
        const irradiation_check = {
            passed: irradiation >= MIN_IRRADIATION,
            value: irradiation,
            minimum: MIN_IRRADIATION,
        };

        if (!irradiation_check.passed) {
            blocking_errors.push(
                `❌ Irradiação solar insuficiente: ${irradiation.toFixed(2)} kWh/m²/dia (mínimo: ${MIN_IRRADIATION}). Projeto não viável nesta localização.`
            );
        } else if (irradiation < 4.0) {
            warnings.push(
                `⚠️ Irradiação baixa (${irradiation.toFixed(2)} kWh/m²/dia). ROI será menor que a média.`
            );
        }

        // 2. Validar área de telhado
        const capacity_kwp = Number(metadata.solar_capacity_kw || 0);
        const roof_area_m2 = Number(metadata.roof_area_m2 || 0);
        const required_area_m2 = capacity_kwp * 7; // ~7m² por kWp considerando espaçamento

        const roof_area_check = {
            passed: roof_area_m2 >= required_area_m2,
            available_m2: roof_area_m2,
            required_m2: required_area_m2,
        };

        if (!roof_area_check.passed) {
            blocking_errors.push(
                `❌ Área de telhado insuficiente: ${roof_area_m2}m² disponível, ${required_area_m2.toFixed(1)}m² necessário para ${capacity_kwp} kWp.`
            );
        } else if (roof_area_m2 < required_area_m2 * 1.2) {
            warnings.push(
                `⚠️ Área justa (${roof_area_m2}m²). Recomendado pelo menos ${(required_area_m2 * 1.2).toFixed(1)}m² para melhor distribuição.`
            );
        }

        // 3. Validar capacidade mínima viável
        const MIN_CAPACITY_KWP = 1.5;
        const capacity_check = {
            passed: capacity_kwp >= MIN_CAPACITY_KWP,
            value_kwp: capacity_kwp,
            minimum_kwp: MIN_CAPACITY_KWP,
        };

        if (!capacity_check.passed) {
            blocking_errors.push(
                `❌ Capacidade muito baixa: ${capacity_kwp} kWp (mínimo viável: ${MIN_CAPACITY_KWP} kWp). Custo fixo de instalação inviabiliza o projeto.`
            );
        }

        // 4. Validar compatibilidade tipo de telhado + capacidade
        const roof_type = String(metadata.roof_type || "");
        const building_type = String(metadata.building_type || "");

        let crane_required = false;
        let installation_complexity: "low" | "medium" | "high" | "very_high" = "low";

        // Telhado de laje em edifícios comerciais/industriais com alta capacidade
        if (roof_type === "laje" && capacity_kwp > 30) {
            crane_required = true;
            installation_complexity = "high";
            warnings.push(
                `⚠️ Instalação requer equipamento especial (guindaste) devido ao porte do sistema (${capacity_kwp} kWp em laje).`
            );
        }

        // Instalações industriais grandes
        if (building_type === "industrial" && capacity_kwp > 50) {
            crane_required = true;
            installation_complexity = "very_high";
            warnings.push(
                `⚠️ Projeto industrial de grande porte (${capacity_kwp} kWp). Necessário estudo estrutural detalhado e equipamentos pesados.`
            );
        }

        // Rural com capacidade média/alta
        if (building_type === "rural" && capacity_kwp > 20) {
            installation_complexity = "high";
            const distance_km = Number(metadata.installation_distance_km || 0);

            if (distance_km > 100) {
                warnings.push(
                    `⚠️ Localização rural distante (${distance_km}km). Logística aumentará prazo e custo de instalação.`
                );
            }
        }

        // Telhado metálico ou cerâmica residencial = baixa complexidade
        if (
            (roof_type === "metalico" || roof_type === "ceramica") &&
            building_type === "residential" &&
            capacity_kwp <= 10
        ) {
            installation_complexity = "low";
        } else if (
            roof_type === "fibrocimento" ||
            (building_type === "commercial" && capacity_kwp <= 30)
        ) {
            installation_complexity = "medium";
        }

        // 5. Validar se há endereço completo para instalação
        const address = metadata.installation_address as any;
        if (!address?.street || !address?.city || !address?.state) {
            warnings.push(
                `⚠️ Endereço de instalação incompleto. Necessário para planejamento logístico.`
            );
        }

        // Resultado final
        const is_feasible = blocking_errors.length === 0;

        return new StepResponse({
            is_feasible,
            blocking_errors,
            warnings,
            validation_details: {
                irradiation_check,
                roof_area_check,
                capacity_check,
                crane_required,
                distance_km: Number(metadata.installation_distance_km || 0),
                installation_complexity,
            },
        });
    }
);

/**
 * Workflow: Validar viabilidade técnica de projeto solar
 */
export const validateSolarFeasibilityWorkflow = createWorkflow(
    "validate-solar-feasibility",
    function (input: { cart: CartDTO }) {
        const validation = validateSolarProjectStep({ cart: input.cart });

        return new WorkflowResponse(validation);
    }
);

/**
 * Hook: Adicionar contexto de viabilidade ao shipping options
 * 
 * Este hook é executado quando o workflow listShippingOptionsForCartWithPricingWorkflow
 * está montando as opções de envio. Usa o hook point setShippingOptionsContext (v2.10.3)
 * para adicionar validação de viabilidade.
 */
export const solarFeasibilityShippingHook = createHook(
    "setShippingOptionsContext",
    async ({ cart, context }: { cart: CartDTO; context: any }) => {
        // Executar validação de viabilidade
        const { result: validation } = await validateSolarFeasibilityWorkflow.run({
            input: { cart },
        });

        // Adicionar validação ao contexto
        return {
            ...context,
            solar_feasibility: validation,
        };
    }
);