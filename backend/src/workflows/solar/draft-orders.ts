import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { createOrderWorkflow } from "@medusajs/medusa/core-flows";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import type { CreateOrderDTO } from "@medusajs/framework/types";

/**
 * Input para cotação solar customizada
 */
export type CreateSolarQuoteInput = {
  customer_id: string;
  region_id: string;
  sales_channel_id?: string;
  
  // Dados técnicos do projeto solar
  solar_project: {
    capacity_kwp: number;
    irradiation_kwh_m2_day: number;
    roof_type: "ceramica" | "metalico" | "laje" | "fibrocimento";
    building_type: "residential" | "commercial" | "industrial" | "rural";
    roof_area_m2: number;
    address: {
      street: string;
      city: string;
      state: string;
      postal_code: string;
      latitude?: number;
      longitude?: number;
    };
  };
  
  // Items com preços customizados
  items: Array<{
    product_id: string;
    variant_id: string;
    title: string; // Required by CreateOrderLineItemDTO
    quantity: number;
    custom_price?: number; // Preço customizado (centavos)
    custom_discount_percentage?: number;
    metadata?: Record<string, any>;
  }>;
  
  // Descontos/ajustes adicionais
  discounts?: Array<{
    code?: string;
    amount?: number;
    percentage?: number;
    description: string;
  }>;
  
  // Metadata adicional
  metadata?: Record<string, any>;
};

/**
 * Step: Calcular preços customizados baseado no tipo de projeto
 */
const calculateSolarPricingStep = createStep(
  "calculate-solar-pricing",
  async (input: CreateSolarQuoteInput) => {
    const { solar_project, items } = input;
    
    // Multiplicadores por tipo de telhado (complexidade de instalação)
    const roofTypeMultipliers: Record<string, number> = {
      ceramica: 1.0, // Base
      metalico: 0.95, // Mais fácil instalação
      laje: 1.10, // Precisa estrutura elevada
      fibrocimento: 1.05, // Estrutura especial
    };
    
    // Multiplicadores por tipo de construção
    const buildingTypeMultipliers: Record<string, number> = {
      residential: 1.0, // Base
      commercial: 1.15, // Logística + documentação
      industrial: 1.25, // Complexidade + segurança
      rural: 1.20, // Distância + acesso
    };
    
    const roofMultiplier = roofTypeMultipliers[solar_project.roof_type] || 1.0;
    const buildingMultiplier = buildingTypeMultipliers[solar_project.building_type] || 1.0;
    
    // Multiplicador de complexidade total
    const complexityMultiplier = roofMultiplier * buildingMultiplier;
    
    // Aplicar preços customizados aos items
    const pricedItems = items.map((item) => {
      let finalPrice = item.custom_price || 0;
      
      // Se não tem preço customizado, aplicar multiplicadores ao preço base
      if (!item.custom_price) {
        // Aqui seria buscado o preço base do produto
        // Por enquanto, assumir que já vem no custom_price
        finalPrice = Math.round((item.custom_price || 0) * complexityMultiplier);
      }
      
      // Aplicar desconto customizado se houver
      if (item.custom_discount_percentage) {
        finalPrice = Math.round(finalPrice * (1 - item.custom_discount_percentage / 100));
      }
      
      return {
        ...item,
        unit_price: finalPrice,
      };
    });
    
    // Calcular métricas do projeto
    const roi_percentage = ((solar_project.irradiation_kwh_m2_day * 365 * 0.9) / solar_project.capacity_kwp) * 0.15; // Estimativa simplificada
    const payback_years = 100 / roi_percentage;
    
    return new StepResponse(
      {
        priced_items: pricedItems,
        complexity_multiplier: complexityMultiplier,
        project_metrics: {
          roi_percentage,
          payback_years,
          estimated_generation_kwh_year: solar_project.capacity_kwp * solar_project.irradiation_kwh_m2_day * 365 * 0.9,
        },
      },
      { items } // Compensation data
    );
  }
);

/**
 * Step: Validar requisitos técnicos mínimos
 */
const validateSolarFeasibilityStep = createStep(
  "validate-solar-feasibility",
  async (input: { solar_project: CreateSolarQuoteInput["solar_project"] }) => {
    const { solar_project } = input;
    const errors: string[] = [];
    
    // Validar irradiação mínima (3.5 kWh/m²/dia considerado mínimo viável)
    if (solar_project.irradiation_kwh_m2_day < 3.5) {
      errors.push(
        `Irradiação solar insuficiente: ${solar_project.irradiation_kwh_m2_day} kWh/m²/dia (mínimo: 3.5)`
      );
    }
    
    // Validar área de telhado mínima
    const minAreaM2 = solar_project.capacity_kwp * 7; // ~7m² por kWp
    if (solar_project.roof_area_m2 < minAreaM2) {
      errors.push(
        `Área de telhado insuficiente: ${solar_project.roof_area_m2}m² (necessário: ${minAreaM2.toFixed(1)}m²)`
      );
    }
    
    // Validar capacidade mínima (sistemas muito pequenos não são viáveis)
    if (solar_project.capacity_kwp < 1.5) {
      errors.push(
        `Capacidade muito baixa: ${solar_project.capacity_kwp} kWp (mínimo recomendado: 1.5 kWp)`
      );
    }
    
    const is_feasible = errors.length === 0;
    
    return new StepResponse(
      {
        is_feasible,
        validation_errors: errors,
        validated_at: new Date().toISOString(),
      },
      { solar_project }
    );
  }
);

/**
 * Workflow principal: Criar Draft Order para cotação solar
 * 
 * Usa createDraftOrderWorkflow (v2.10.0) com preços customizados
 */
export const createSolarQuoteWorkflow = createWorkflow(
  "create-solar-quote",
  function (input: CreateSolarQuoteInput) {
    // 1. Validar viabilidade técnica
    const feasibility = validateSolarFeasibilityStep({
      solar_project: input.solar_project,
    });
    
    // 2. Calcular preços customizados
    const pricing = calculateSolarPricingStep(input);
    
    // 3. Criar Draft Order usando core workflow
    const draftOrderInput: CreateOrderDTO = {
      customer_id: input.customer_id,
      region_id: input.region_id,
      sales_channel_id: input.sales_channel_id,
      status: "draft",
      
      items: pricing.priced_items.map((item) => ({
        variant_id: item.variant_id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        metadata: {
          ...item.metadata,
          custom_price: true,
          complexity_multiplier: pricing.complexity_multiplier,
        },
      })),
      
      metadata: {
        tipo_produto: "sistema_solar",
        solar_capacity_kw: input.solar_project.capacity_kwp,
        project_stage: "quotation",
        roof_type: input.solar_project.roof_type,
        building_type: input.solar_project.building_type,
        installation_address: input.solar_project.address,
        irradiation_kwh_m2_day: input.solar_project.irradiation_kwh_m2_day,
        roof_area_m2: input.solar_project.roof_area_m2,
        solar_roi_percentage: pricing.project_metrics.roi_percentage,
        solar_payback_years: pricing.project_metrics.payback_years,
        estimated_generation_kwh_year: pricing.project_metrics.estimated_generation_kwh_year,
        complexity_multiplier: pricing.complexity_multiplier,
        feasibility_validation: feasibility,
        quotation_date: new Date().toISOString(),
        ...input.metadata,
      },
    };
    
    const draftOrder = createOrderWorkflow.runAsStep({
      input: draftOrderInput as any,
    });
    
    return new WorkflowResponse({
      draft_order: draftOrder,
      project_metrics: pricing.project_metrics,
      complexity_multiplier: pricing.complexity_multiplier,
      feasibility_validation: feasibility,
    });
  }
);

/**
 * Workflow: Converter Draft Order em Order final (após aprovação)
 */
export const completeSolarQuoteWorkflow = createWorkflow(
  "complete-solar-quote",
  function (input: { draft_order_id: string; approved_by?: string }) {
    // Este workflow seria implementado usando updateOrderWorkflow
    // Para converter status de "draft" para "pending"
    
    // TODO: Implementar após aprovação do cliente
    
    return new WorkflowResponse({
      order_id: input.draft_order_id,
      status: "pending",
      approved_at: new Date().toISOString(),
      approved_by: input.approved_by,
    });
  }
);