import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { 
  createSolarQuoteWorkflow,
  type CreateSolarQuoteInput 
} from "../../../../workflows/solar/draft-orders";
import { z } from "zod";

/**
 * Zod schema para validação de cotação solar
 */
const CreateSolarQuoteSchema = z.object({
  customer_id: z.string(),
  region_id: z.string(),
  sales_channel_id: z.string().optional(),
  
  solar_project: z.object({
    capacity_kwp: z.number().min(1.5).max(1000),
    irradiation_kwh_m2_day: z.number().min(3.0).max(7.0),
    roof_type: z.enum(["ceramica", "metalico", "laje", "fibrocimento"]),
    building_type: z.enum(["residential", "commercial", "industrial", "rural"]),
    roof_area_m2: z.number().min(10).max(100000),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      postal_code: z.string(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }),
  }),
  
  items: z.array(z.object({
    product_id: z.string(),
    variant_id: z.string(),
    title: z.string(),
    quantity: z.number().min(1),
    custom_price: z.number().optional(),
    custom_discount_percentage: z.number().min(0).max(100).optional(),
    metadata: z.record(z.any()).optional(),
  })),
  
  discounts: z.array(z.object({
    code: z.string().optional(),
    amount: z.number().optional(),
    percentage: z.number().optional(),
    description: z.string(),
  })).optional(),
  
  metadata: z.record(z.any()).optional(),
});

export type CreateSolarQuoteRequest = z.infer<typeof CreateSolarQuoteSchema>;

/**
 * POST /store/solar-quotes
 * 
 * Cria cotação solar usando Draft Orders (v2.10.0)
 * 
 * Features:
 * - Preços customizados por tipo de telhado/construção
 * - Validação automática de viabilidade técnica
 * - Cálculo de ROI e payback
 * - Estimativa de geração anual
 * - Multiplicadores de complexidade
 */
export const POST = async (
  req: AuthenticatedMedusaRequest<CreateSolarQuoteRequest>,
  res: MedusaResponse
) => {
  // Validar input
  const validation = CreateSolarQuoteSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: validation.error.errors,
    });
  }
  
  const input: CreateSolarQuoteInput = validation.data;
  
  try {
    // Executar workflow de criação de cotação
    const { result } = await createSolarQuoteWorkflow(req.scope).run({
      input,
    });
    
    // Verificar se projeto é viável
    if (!result.feasibility_validation.is_feasible) {
      return res.status(422).json({
        error: "Solar project not feasible",
        validation_errors: result.feasibility_validation.validation_errors,
        suggestion: "Ajuste os parâmetros do projeto (capacidade, área, localização) e tente novamente",
      });
    }
    
    res.status(201).json({
      draft_order: result.draft_order,
      project_metrics: {
        roi_percentage: result.project_metrics.roi_percentage.toFixed(2),
        payback_years: result.project_metrics.payback_years.toFixed(1),
        estimated_generation_kwh_year: Math.round(result.project_metrics.estimated_generation_kwh_year),
      },
      complexity_multiplier: result.complexity_multiplier,
      feasibility_validation: result.feasibility_validation,
      message: "Cotação criada com sucesso. Aguardando aprovação do cliente.",
    });
  } catch (error: any) {
    console.error("Error creating solar quote:", error);
    
    res.status(500).json({
      error: "Failed to create solar quote",
      message: error.message,
    });
  }
};