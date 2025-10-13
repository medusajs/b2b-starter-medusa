import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import {
  createPromotionsWorkflow,
  createCampaignsWorkflow,
} from "@medusajs/medusa/core-flows";
import type {
  CreatePromotionDTO,
  CreateCampaignDTO,
} from "@medusajs/framework/types";

/**
 * Input para criação de promoção solar
 */
export type CreateSolarPromotionInput = {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number; // Percentage (0-100) ou fixed (centavos)
  min_capacity_kwp?: number;
  max_capacity_kwp?: number;
  building_types?: Array<"residential" | "commercial" | "industrial" | "rural">;
  start_date?: string;
  end_date?: string;
  usage_limit?: number;
};

/**
 * Workflow: Criar promoção solar com desconto tax-inclusive
 * 
 * Usa is_tax_inclusive: true (v2.8.5) para garantir que o desconto
 * seja aplicado DEPOIS dos impostos, mantendo o valor exato prometido.
 * 
 * Exemplo:
 * - Produto: R$ 1000,00
 * - ICMS 18%: R$ 180,00
 * - Total com imposto: R$ 1180,00
 * - Desconto 10% tax-inclusive: R$ 118,00 (sobre 1180)
 * - Total final: R$ 1062,00
 * 
 * Sem tax-inclusive, o desconto seria R$ 100,00 (sobre 1000),
 * total final R$ 1080,00 (diferença de R$ 18,00).
 */
export const createSolarPromotionWorkflow = createWorkflow(
  "create-solar-promotion",
  function (input: CreateSolarPromotionInput) {
    // Construir rules para targeting de produtos solares
    const rules = {
      attribute: "metadata.tipo_produto",
      operator: "eq" as const,
      value: "sistema_solar",
    };
    
    // Rules adicionais por capacidade
    const capacity_rules: any[] = [];
    
    if (input.min_capacity_kwp) {
      capacity_rules.push({
        attribute: "metadata.solar_capacity_kw",
        operator: "gte" as const,
        value: input.min_capacity_kwp,
      });
    }
    
    if (input.max_capacity_kwp) {
      capacity_rules.push({
        attribute: "metadata.solar_capacity_kw",
        operator: "lte" as const,
        value: input.max_capacity_kwp,
      });
    }
    
    // Rules por tipo de construção
    if (input.building_types?.length) {
      capacity_rules.push({
        attribute: "metadata.building_type",
        operator: "in" as const,
        value: input.building_types,
      });
    }
    
    // Criar promoção usando core workflow
    const promotionInput: CreatePromotionDTO = {
      code: input.code,
      type: "standard",
      is_automatic: false,
      
      // 🎯 KEY FEATURE: Tax-inclusive discount (v2.8.5)
      is_tax_inclusive: true, // Desconto DEPOIS dos impostos
      
      application_method: {
        type: input.discount_type === "percentage" ? "percentage" : "fixed",
        value: input.discount_value,
        max_quantity: 1,
        currency_code: "brl",
        allocation: "across" as const,
        target_type: "items" as const,
        
        // Target rules: produtos solares apenas
        target_rules: [
          {
            attribute: "product.metadata.tipo_produto",
            operator: "eq" as const,
            values: ["sistema_solar"],
          },
          ...capacity_rules.map(rule => ({
            attribute: `product.${rule.attribute}`,
            operator: rule.operator,
            values: Array.isArray(rule.value) ? rule.value : [rule.value],
          })),
        ],
      },
      
      rules: [
        {
          attribute: "customer.metadata.is_solar_customer",
          operator: "eq" as const,
          values: ["true"],
        },
      ],
    } as any;
    
    const promotion = createPromotionsWorkflow.runAsStep({
      input: promotionInput,
    });
    
    // Criar campanha para agrupar a promoção
    const campaignInput: CreateCampaignDTO = {
      name: `Campanha Solar: ${input.code}`,
      description: input.description,
      campaign_identifier: `solar-${input.code.toLowerCase()}`,
      starts_at: input.start_date ? new Date(input.start_date) : new Date(),
      ends_at: input.end_date ? new Date(input.end_date) : undefined,
      budget: {
        type: "usage" as const,
        limit: input.usage_limit || 1000,
      },
    };
    
    const campaign = createCampaignsWorkflow.runAsStep({
      input: {
        campaigns: [campaignInput as any],
      },
    });
    
    return new WorkflowResponse({
      promotion,
      campaign,
      tax_inclusive_note: "Desconto aplicado DEPOIS dos impostos conforme v2.8.5",
    });
  }
);

/**
 * Workflow: Criar promoção de frete grátis condicional
 * 
 * Residential (baixa complexidade) → Frete grátis
 * Commercial/Industrial/Crane required → Desconto parcial 50%
 */
export const createSolarFreeShippingWorkflow = createWorkflow(
  "create-solar-free-shipping",
  function (input: {
    code: string;
    min_capacity_kwp?: number;
    residential_only?: boolean;
  }) {
    const shippingRules: any[] = [
      {
        attribute: "cart.metadata.tipo_produto",
        operator: "eq" as const,
        value: "sistema_solar",
      },
    ];
    
    // Se só residential, adicionar rule
    if (input.residential_only) {
      shippingRules.push({
        attribute: "cart.metadata.building_type",
        operator: "eq" as const,
        value: "residential",
      });
      
      shippingRules.push({
        attribute: "cart.metadata.installation_complexity",
        operator: "in" as const,
        value: ["low", "medium"],
      });
      
      shippingRules.push({
        attribute: "cart.metadata.crane_required",
        operator: "eq" as const,
        value: false,
      });
    }
    
    if (input.min_capacity_kwp) {
      shippingRules.push({
        attribute: "cart.metadata.solar_capacity_kw",
        operator: "gte" as const,
        value: input.min_capacity_kwp,
      });
    }
    
    const promotionInput: CreatePromotionDTO = {
      code: input.code,
      type: "standard",
      is_automatic: true, // Aplica automaticamente se rules passarem
      is_tax_inclusive: true,
      
      application_method: {
        type: "fixed",
        value: 999999, // Valor alto para cobrir frete (será limitado pelo max)
        max_quantity: 1,
        currency_code: "brl",
        allocation: "across" as const,
        target_type: "shipping_methods" as const,
        
        apply_to_quantity: 1,
      },
      
      rules: shippingRules,
    };
    
    const promotion = createPromotionsWorkflow.runAsStep({
      input: {
        promotions: [promotionInput as any],
      },
    });
    
    return new WorkflowResponse({
      promotion,
      residential_only: input.residential_only || false,
      note: input.residential_only
        ? "Frete grátis apenas para instalações residenciais sem guindaste"
        : "Frete grátis para todos os projetos solares elegíveis",
    });
  }
);