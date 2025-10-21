/**
 * Validadores de Produtos do Catálogo
 * 
 * Validações críticas antes de renderizar produtos em widgets ChatKit
 * Baseado no catálogo AWS CDN (cdn.yellosolarhub.com)
 * 
 * @module catalog-validators
 */

import { z } from 'zod';

// ============================================================================
// SCHEMAS ZOD PARA VALIDAÇÃO
// ============================================================================

/**
 * Schema base para todos os produtos
 */
const BaseProductSchema = z.object({
  // Campos obrigatórios
  sku: z.string().min(1, 'SKU é obrigatório'),
  filename: z.string().min(1, 'Filename é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  image_url: z.string().url('URL da imagem inválida'),
  price_brl: z.number().positive('Preço deve ser positivo'),
  cdn_published: z.boolean(),
  
  // Campos opcionais comuns
  manufacturer: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  distributor: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  warranty_years: z.number().int().positive().optional().nullable(),
  
  // Pricing metadata
  price_source: z.enum(['direct', 'similar', 'estimated']).default('estimated'),
  price_confidence: z.number().min(0).max(1).default(0.4),
  
  // Status
  is_active: z.boolean().default(true),
  out_of_stock: z.boolean().default(false),
});

/**
 * Schema para inversores
 */
const InverterSchema = BaseProductSchema.extend({
  category: z.literal('inversores'),
  power_kw: z.number().positive('Potência (kW) obrigatória para inversores').optional().nullable(),
  power_w: z.number().positive().optional().nullable(),
  voltage_v: z.number().positive().optional().nullable(),
  phase: z.enum(['monofásico', 'bifásico', 'trifásico']).optional().nullable(),
  mppt_count: z.number().int().positive().optional().nullable(),
  efficiency_percent: z.number().min(0).max(100).optional().nullable(),
}).refine(
  (data) => data.power_kw || data.power_w,
  { message: 'Inversor deve ter power_kw ou power_w definido' }
);

/**
 * Schema para kits solares
 */
const KitSchema = BaseProductSchema.extend({
  category: z.literal('kits'),
  power_kwp: z.number().positive('Potência (kWp) obrigatória para kits'),
  structure_type: z.enum(['ceramico', 'fibrocimento', 'metalico', 'solo', 'laje']).optional().nullable(),
  system_type: z.enum(['grid-tie', 'off-grid', 'hybrid', 'on-grid', 'hibrido']).optional().nullable(),
  price_per_kwp: z.number().positive().optional().nullable(),
  estimated_generation_kwh_month: z.number().int().positive().optional().nullable(),
});

/**
 * Schema para painéis solares
 */
const PanelSchema = BaseProductSchema.extend({
  category: z.literal('paineis'),
  power_w: z.number().positive('Potência (W) obrigatória para painéis'),
  cell_type: z.enum(['monocrystalline', 'polycrystalline', 'thin-film', 'bifacial']).optional().nullable(),
  efficiency_percent: z.number().min(0).max(100).optional().nullable(),
  dimensions_mm: z.string().optional().nullable(),
  weight_kg: z.number().positive().optional().nullable(),
  price_per_wp: z.number().positive().optional().nullable(),
});

/**
 * Schema para baterias
 */
const BatterySchema = BaseProductSchema.extend({
  category: z.literal('baterias'),
  capacity_kwh: z.number().positive().optional().nullable(),
  capacity_ah: z.number().positive().optional().nullable(),
  technology: z.enum(['LFP', 'Li-Ion', 'Lead-Acid', 'NMC', 'LTO']).optional().nullable(),
  voltage_v: z.number().positive().optional().nullable(),
  cycle_life: z.number().int().positive().optional().nullable(),
  dod_percent: z.number().min(0).max(100).optional().nullable(),
}).refine(
  (data) => data.capacity_kwh || data.capacity_ah,
  { message: 'Bateria deve ter capacity_kwh ou capacity_ah definido' }
);

/**
 * Schema para estruturas
 */
const StructureSchema = BaseProductSchema.extend({
  category: z.literal('estruturas'),
  roof_type: z.string().optional().nullable(),
  size: z.enum(['pequeno', 'medio', 'grande', 'extra-grande']).optional().nullable(),
  material: z.string().optional().nullable(),
  max_panels: z.number().int().positive().optional().nullable(),
});

/**
 * Schema discriminado por categoria
 */
const CatalogProductSchema = z.discriminatedUnion('category', [
  InverterSchema,
  KitSchema,
  PanelSchema,
  BatterySchema,
  StructureSchema,
  BaseProductSchema.extend({ category: z.string() }), // fallback para outras categorias
]);

export type CatalogProduct = z.infer<typeof CatalogProductSchema>;
export type InverterProduct = z.infer<typeof InverterSchema>;
export type KitProduct = z.infer<typeof KitSchema>;
export type PanelProduct = z.infer<typeof PanelSchema>;
export type BatteryProduct = z.infer<typeof BatterySchema>;

// ============================================================================
// VALIDADORES DE PRODUTO
// ============================================================================

/**
 * Resultado de validação
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  product?: CatalogProduct;
}

/**
 * Valida produto para uso em widgets
 */
export function validateProductForWidget(product: unknown): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  try {
    // Validação básica com Zod
    const validated = CatalogProductSchema.parse(product);
    result.product = validated;

    // Validações adicionais
    validateCDNPublished(validated, result);
    validatePricing(validated, result);
    validateCriticalFields(validated, result);
    validateImageAccessibility(validated, result);

    // Se houver erros críticos, marcar como inválido
    result.valid = result.errors.length === 0;

  } catch (error) {
    result.valid = false;
    if (error instanceof z.ZodError) {
      result.errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
    } else {
      result.errors.push('Erro desconhecido na validação');
    }
  }

  return result;
}

/**
 * Valida se produto está publicado na CDN
 */
function validateCDNPublished(product: CatalogProduct, result: ValidationResult): void {
  if (!product.cdn_published) {
    result.errors.push(`Produto ${product.sku} não está publicado na CDN`);
  }

  if (!product.image_url) {
    result.errors.push(`Produto ${product.sku} sem URL de imagem`);
  }

  if (!product.image_url.startsWith('https://cdn.yellosolarhub.com')) {
    result.warnings.push(`Produto ${product.sku} com URL de imagem fora da CDN oficial`);
  }
}

/**
 * Valida pricing
 */
function validatePricing(product: CatalogProduct, result: ValidationResult): void {
  if (product.price_brl <= 0) {
    result.errors.push(`Produto ${product.sku} com preço inválido: R$ ${product.price_brl}`);
  }

  // Avisar sobre preços estimados
  if (product.price_source === 'estimated' && product.price_confidence < 0.5) {
    result.warnings.push(
      `Produto ${product.sku} com preço estimado de baixa confiança (${product.price_confidence})`
    );
  }

  // Validar faixas de preço por categoria
  const priceRanges: Record<string, { min: number; max: number }> = {
    inversores: { min: 500, max: 200000 },
    kits: { min: 2000, max: 10000000 },
    paineis: { min: 200, max: 2000 },
    baterias: { min: 3000, max: 50000 },
    cabos: { min: 50, max: 1000 },
  };

  const range = priceRanges[product.category];
  if (range && (product.price_brl < range.min || product.price_brl > range.max)) {
    result.warnings.push(
      `Produto ${product.sku} com preço fora da faixa esperada para ${product.category}: ` +
      `R$ ${product.price_brl} (esperado: R$ ${range.min} - R$ ${range.max})`
    );
  }
}

/**
 * Valida campos críticos por categoria
 */
function validateCriticalFields(product: CatalogProduct, result: ValidationResult): void {
  switch (product.category) {
    case 'inversores':
      validateInverter(product as InverterProduct, result);
      break;
    case 'kits':
      validateKit(product as KitProduct, result);
      break;
    case 'paineis':
      validatePanel(product as PanelProduct, result);
      break;
    case 'baterias':
      validateBattery(product as BatteryProduct, result);
      break;
  }
}

/**
 * Validações específicas para inversores
 */
function validateInverter(product: InverterProduct, result: ValidationResult): void {
  if (!product.power_kw && !product.power_w) {
    result.warnings.push(`Inversor ${product.sku} sem potência definida`);
  }

  if (!product.manufacturer) {
    result.warnings.push(`Inversor ${product.sku} sem fabricante definido`);
  }

  if (product.power_kw && product.power_kw > 500) {
    result.warnings.push(
      `Inversor ${product.sku} com potência muito alta: ${product.power_kw}kW (verificar se correto)`
    );
  }

  if (!product.voltage_v) {
    result.warnings.push(`Inversor ${product.sku} sem tensão nominal definida`);
  }

  if (!product.phase) {
    result.warnings.push(`Inversor ${product.sku} sem fase definida (monofásico/trifásico)`);
  }
}

/**
 * Validações específicas para kits
 */
function validateKit(product: KitProduct, result: ValidationResult): void {
  if (!product.power_kwp) {
    result.errors.push(`Kit ${product.sku} sem potência (kWp) definida`);
  }

  if (!product.structure_type) {
    result.warnings.push(`Kit ${product.sku} sem tipo de estrutura definido`);
  }

  if (!product.system_type) {
    result.warnings.push(`Kit ${product.sku} sem tipo de sistema definido (grid-tie/off-grid/hybrid)`);
  }

  if (product.power_kwp && product.power_kwp > 2000) {
    result.warnings.push(
      `Kit ${product.sku} com potência muito alta: ${product.power_kwp}kWp (industrial/fazenda)`
    );
  }

  // Validar R$/kWp
  if (product.price_per_kwp) {
    if (product.price_per_kwp < 2000 || product.price_per_kwp > 10000) {
      result.warnings.push(
        `Kit ${product.sku} com R$/kWp fora da faixa normal: R$ ${product.price_per_kwp}/kWp`
      );
    }
  }
}

/**
 * Validações específicas para painéis
 */
function validatePanel(product: PanelProduct, result: ValidationResult): void {
  if (!product.power_w) {
    result.errors.push(`Painel ${product.sku} sem potência (W) definida`);
  }

  if (product.power_w && (product.power_w < 100 || product.power_w > 1000)) {
    result.warnings.push(
      `Painel ${product.sku} com potência atípica: ${product.power_w}W`
    );
  }

  if (!product.cell_type) {
    result.warnings.push(`Painel ${product.sku} sem tipo de célula definido`);
  }

  if (!product.manufacturer) {
    result.warnings.push(`Painel ${product.sku} sem fabricante definido`);
  }

  // Validar R$/Wp
  if (product.price_per_wp) {
    if (product.price_per_wp < 0.5 || product.price_per_wp > 5) {
      result.warnings.push(
        `Painel ${product.sku} com R$/Wp fora da faixa normal: R$ ${product.price_per_wp}/Wp`
      );
    }
  }
}

/**
 * Validações específicas para baterias
 */
function validateBattery(product: BatteryProduct, result: ValidationResult): void {
  if (!product.capacity_kwh && !product.capacity_ah) {
    result.errors.push(`Bateria ${product.sku} sem capacidade definida`);
  }

  if (!product.technology) {
    result.warnings.push(`Bateria ${product.sku} sem tecnologia definida (LFP/Li-Ion/etc)`);
  }

  if (!product.voltage_v) {
    result.warnings.push(`Bateria ${product.sku} sem tensão nominal definida`);
  }

  if (product.capacity_kwh && product.capacity_kwh > 100) {
    result.warnings.push(
      `Bateria ${product.sku} com capacidade muito alta: ${product.capacity_kwh}kWh (verificar)`
    );
  }
}

/**
 * Valida acessibilidade da imagem
 */
function validateImageAccessibility(product: CatalogProduct, result: ValidationResult): void {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const hasValidExtension = validExtensions.some(ext => 
    product.image_url.toLowerCase().endsWith(ext)
  );

  if (!hasValidExtension) {
    result.warnings.push(
      `Produto ${product.sku} com extensão de imagem incomum: ${product.image_url}`
    );
  }

  // Validar padrão de URL
  const cdnBaseUrl = 'https://cdn.yellosolarhub.com/products/';
  if (!product.image_url.startsWith(cdnBaseUrl)) {
    result.warnings.push(
      `Produto ${product.sku} com URL fora do padrão CDN: ${product.image_url}`
    );
  }
}

// ============================================================================
// VALIDADORES DE LISTA
// ============================================================================

/**
 * Valida lista de produtos
 */
export function validateProductList(products: unknown[]): {
  valid: CatalogProduct[];
  invalid: Array<{ product: unknown; errors: string[] }>;
  warnings: string[];
} {
  const valid: CatalogProduct[] = [];
  const invalid: Array<{ product: unknown; errors: string[] }> = [];
  const warnings: string[] = [];

  for (const product of products) {
    const result = validateProductForWidget(product);
    
    if (result.valid && result.product) {
      valid.push(result.product);
      warnings.push(...result.warnings);
    } else {
      invalid.push({
        product,
        errors: result.errors,
      });
    }
  }

  return { valid, invalid, warnings };
}

// ============================================================================
// HELPERS DE FALLBACK
// ============================================================================

/**
 * Retorna URL de placeholder para categoria
 */
export function getPlaceholderImageUrl(category: string): string {
  const placeholders: Record<string, string> = {
    inversores: 'https://cdn.yellosolarhub.com/placeholders/inverter.png',
    paineis: 'https://cdn.yellosolarhub.com/placeholders/panel.png',
    kits: 'https://cdn.yellosolarhub.com/placeholders/kit.png',
    baterias: 'https://cdn.yellosolarhub.com/placeholders/battery.png',
    estruturas: 'https://cdn.yellosolarhub.com/placeholders/structure.png',
    cabos: 'https://cdn.yellosolarhub.com/placeholders/cable.png',
  };

  return placeholders[category] || 'https://cdn.yellosolarhub.com/placeholders/generic.png';
}

/**
 * Garante que produto tenha imagem válida (com fallback)
 */
export function ensureImageUrl(product: CatalogProduct): string {
  if (!product.image_url || !product.cdn_published) {
    return getPlaceholderImageUrl(product.category);
  }
  return product.image_url;
}

// ============================================================================
// VALIDADORES DE QUERY
// ============================================================================

/**
 * Valida parâmetros de busca de produtos
 */
export const SearchParamsSchema = z.object({
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  min_power_kw: z.number().positive().optional(),
  max_power_kw: z.number().positive().optional(),
  page: z.number().int().positive().default(1),
  page_size: z.number().int().positive().max(100).default(10),
  sort_by: z.enum(['price_asc', 'price_desc', 'power_asc', 'power_desc', 'popularity']).default('price_asc'),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

/**
 * Valida parâmetros de busca
 */
export function validateSearchParams(params: unknown): ValidationResult {
  try {
    const validated = SearchParamsSchema.parse(params);
    return {
      valid: true,
      errors: [],
      warnings: [],
      product: validated as any,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        warnings: [],
      };
    }
    return {
      valid: false,
      errors: ['Erro desconhecido na validação dos parâmetros'],
      warnings: [],
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  BaseProductSchema,
  InverterSchema,
  KitSchema,
  PanelSchema,
  BatterySchema,
  StructureSchema,
  CatalogProductSchema,
};
