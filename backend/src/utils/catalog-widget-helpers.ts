/**
 * Helpers de Integração com Widgets ChatKit
 * 
 * Funções utilitárias para buscar produtos do catálogo e formatá-los
 * para uso nos widgets do ChatKit (productCard, comparison, list, etc.)
 * 
 * @module catalog-widget-helpers
 */

import { Pool } from 'pg';
import NodeCache from 'node-cache';
import {
  CatalogProduct,
  InverterProduct,
  KitProduct,
  PanelProduct,
  BatteryProduct,
  validateProductForWidget,
  ensureImageUrl,
  SearchParams,
} from './catalog-validators';

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const productCache = new NodeCache({ stdTTL: 3600 }); // 1 hora de cache

// ============================================================================
// TIPOS
// ============================================================================

interface WidgetProductCard {
  sku: string;
  name: string;
  category: string;
  manufacturer?: string;
  model?: string;
  price_brl: number;
  price_formatted: string;
  image_url: string;
  specs: Record<string, string | number>;
  badges: string[];
  warranty_years?: number;
}

interface WidgetProductComparison {
  products: WidgetProductCard[];
  comparison_matrix: {
    attribute: string;
    values: (string | number)[];
  }[];
}

interface WidgetProductList {
  category: string;
  total_available: number;
  page: number;
  page_size: number;
  products: WidgetProductCard[];
}

interface WidgetSolarKit extends WidgetProductCard {
  power_kwp: number;
  structure_type?: string;
  system_type?: string;
  estimated_generation_kwh_month?: number;
  price_per_kwp?: number;
}

// ============================================================================
// DATABASE HELPERS
// ============================================================================

let dbPool: Pool;

/**
 * Inicializa pool de conexões do banco
 */
export function initializeDatabase(connectionString: string): void {
  dbPool = new Pool({ connectionString });
}

/**
 * Busca produto por SKU
 */
export async function getProductBySKU(sku: string): Promise<CatalogProduct | null> {
  // Verificar cache
  const cached = productCache.get<CatalogProduct>(sku);
  if (cached) {
    return cached;
  }

  const result = await dbPool.query(
    'SELECT * FROM catalog WHERE sku = $1 AND cdn_published = true',
    [sku]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const product = result.rows[0] as CatalogProduct;
  
  // Validar antes de cachear
  const validation = validateProductForWidget(product);
  if (!validation.valid) {
    console.warn(`Produto ${sku} falhou na validação:`, validation.errors);
    return null;
  }

  // Cachear
  productCache.set(sku, product);
  
  // Incrementar view count
  await dbPool.query('SELECT increment_view_count($1)', [sku]);

  return product;
}

/**
 * Busca produtos por categoria
 */
export async function getProductsByCategory(
  category: string,
  params: Partial<SearchParams> = {}
): Promise<{ products: CatalogProduct[]; total: number }> {
  const page = params.page || 1;
  const pageSize = params.page_size || 10;
  const offset = (page - 1) * pageSize;

  // Construir query dinâmica
  let query = `
    SELECT * FROM catalog
    WHERE category = $1
      AND cdn_published = true
      AND is_active = true
  `;
  const queryParams: any[] = [category];
  let paramIndex = 2;

  // Filtros adicionais
  if (params.manufacturer) {
    query += ` AND manufacturer = $${paramIndex}`;
    queryParams.push(params.manufacturer);
    paramIndex++;
  }

  if (params.min_price) {
    query += ` AND price_brl >= $${paramIndex}`;
    queryParams.push(params.min_price);
    paramIndex++;
  }

  if (params.max_price) {
    query += ` AND price_brl <= $${paramIndex}`;
    queryParams.push(params.max_price);
    paramIndex++;
  }

  if (params.min_power_kw) {
    query += ` AND COALESCE(power_kw, power_kwp, power_w / 1000.0) >= $${paramIndex}`;
    queryParams.push(params.min_power_kw);
    paramIndex++;
  }

  if (params.max_power_kw) {
    query += ` AND COALESCE(power_kw, power_kwp, power_w / 1000.0) <= $${paramIndex}`;
    queryParams.push(params.max_power_kw);
    paramIndex++;
  }

  // Ordenação
  const sortMap: Record<string, string> = {
    price_asc: 'price_brl ASC',
    price_desc: 'price_brl DESC',
    power_asc: 'COALESCE(power_kw, power_kwp, power_w / 1000.0) ASC',
    power_desc: 'COALESCE(power_kw, power_kwp, power_w / 1000.0) DESC',
    popularity: 'view_count DESC',
  };
  query += ` ORDER BY ${sortMap[params.sort_by || 'price_asc']}`;

  // Paginação
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(pageSize, offset);

  // Executar queries em paralelo
  const [productsResult, countResult] = await Promise.all([
    dbPool.query(query, queryParams),
    dbPool.query(
      'SELECT COUNT(*) FROM catalog WHERE category = $1 AND cdn_published = true AND is_active = true',
      [category]
    ),
  ]);

  return {
    products: productsResult.rows as CatalogProduct[],
    total: parseInt(countResult.rows[0].count),
  };
}

/**
 * Busca produtos similares por potência
 */
export async function getSimilarProducts(
  sku: string,
  tolerance: number = 10,
  limit: number = 5
): Promise<CatalogProduct[]> {
  const result = await dbPool.query(
    'SELECT * FROM find_similar_by_power($1, $2, $3)',
    [sku, tolerance, limit]
  );

  return result.rows as CatalogProduct[];
}

/**
 * Busca full-text
 */
export async function searchProducts(
  query: string,
  limit: number = 10
): Promise<CatalogProduct[]> {
  const result = await dbPool.query(
    `SELECT * FROM catalog
     WHERE search_vector @@ to_tsquery('portuguese', $1)
       AND cdn_published = true
       AND is_active = true
     ORDER BY ts_rank(search_vector, to_tsquery('portuguese', $1)) DESC
     LIMIT $2`,
    [query, limit]
  );

  return result.rows as CatalogProduct[];
}

// ============================================================================
// FORMATADORES PARA WIDGETS
// ============================================================================

/**
 * Formata preço em BRL
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

/**
 * Gera badges para produto
 */
function generateBadges(product: CatalogProduct): string[] {
  const badges: string[] = [];

  // Badge de preço estimado
  if (product.price_source === 'estimated' && product.price_confidence < 0.5) {
    badges.push('Preço Estimado');
  }

  // Badge de destaque
  if (product.featured) {
    badges.push('Em Destaque');
  }

  // Badge de garantia
  if (product.warranty_years && product.warranty_years >= 10) {
    badges.push(`Garantia ${product.warranty_years} anos`);
  }

  // Badge de eficiência (inversores/painéis)
  if ('efficiency_percent' in product && product.efficiency_percent && product.efficiency_percent >= 95) {
    badges.push(`${product.efficiency_percent}% Eficiência`);
  }

  // Badge de tecnologia (baterias)
  if (product.category === 'baterias' && 'technology' in product) {
    const battery = product as BatteryProduct;
    if (battery.technology === 'LFP') {
      badges.push('LFP - Longa Vida');
    }
  }

  return badges;
}

/**
 * Extrai specs do produto para exibição
 */
function extractSpecs(product: CatalogProduct): Record<string, string | number> {
  const specs: Record<string, string | number> = {};

  switch (product.category) {
    case 'inversores':
      const inverter = product as InverterProduct;
      if (inverter.power_kw) specs['Potência'] = `${inverter.power_kw} kW`;
      if (inverter.voltage_v) specs['Tensão'] = `${inverter.voltage_v}V`;
      if (inverter.phase) specs['Fase'] = inverter.phase;
      if (inverter.mppt_count) specs['MPPT'] = inverter.mppt_count;
      if (inverter.efficiency_percent) specs['Eficiência'] = `${inverter.efficiency_percent}%`;
      break;

    case 'kits':
      const kit = product as KitProduct;
      if (kit.power_kwp) specs['Potência'] = `${kit.power_kwp} kWp`;
      if (kit.structure_type) specs['Estrutura'] = kit.structure_type;
      if (kit.system_type) specs['Tipo'] = kit.system_type;
      if (kit.price_per_kwp) specs['R$/kWp'] = formatPrice(kit.price_per_kwp);
      if (kit.estimated_generation_kwh_month) {
        specs['Geração/mês'] = `${kit.estimated_generation_kwh_month} kWh`;
      }
      break;

    case 'paineis':
      const panel = product as PanelProduct;
      if (panel.power_w) specs['Potência'] = `${panel.power_w}W`;
      if (panel.cell_type) specs['Tipo de Célula'] = panel.cell_type;
      if (panel.efficiency_percent) specs['Eficiência'] = `${panel.efficiency_percent}%`;
      if (panel.weight_kg) specs['Peso'] = `${panel.weight_kg}kg`;
      if (panel.price_per_wp) specs['R$/Wp'] = formatPrice(panel.price_per_wp);
      break;

    case 'baterias':
      const battery = product as BatteryProduct;
      if (battery.capacity_kwh) specs['Capacidade'] = `${battery.capacity_kwh} kWh`;
      if (battery.capacity_ah) specs['Capacidade'] = `${battery.capacity_ah} Ah`;
      if (battery.technology) specs['Tecnologia'] = battery.technology;
      if (battery.voltage_v) specs['Tensão'] = `${battery.voltage_v}V`;
      if (battery.cycle_life) specs['Ciclos'] = battery.cycle_life;
      if (battery.dod_percent) specs['DoD'] = `${battery.dod_percent}%`;
      break;

    default:
      // Campos genéricos
      if ('power_w' in product && product.power_w) {
        specs['Potência'] = `${product.power_w}W`;
      }
      if ('voltage_v' in product && product.voltage_v) {
        specs['Tensão'] = `${product.voltage_v}V`;
      }
  }

  return specs;
}

/**
 * Gera nome amigável do produto
 */
function generateProductName(product: CatalogProduct): string {
  const parts: string[] = [];

  if (product.manufacturer) {
    parts.push(product.manufacturer);
  }

  if (product.model) {
    parts.push(product.model);
  } else if (product.sku) {
    parts.push(product.sku);
  }

  // Adicionar potência se disponível
  if ('power_kw' in product && product.power_kw) {
    parts.push(`${product.power_kw}kW`);
  } else if ('power_kwp' in product && product.power_kwp) {
    parts.push(`${product.power_kwp}kWp`);
  } else if ('power_w' in product && product.power_w) {
    parts.push(`${product.power_w}W`);
  }

  return parts.join(' ');
}

/**
 * Converte produto para formato Widget Card
 */
export function formatProductForCard(product: CatalogProduct): WidgetProductCard {
  return {
    sku: product.sku,
    name: generateProductName(product),
    category: product.category,
    manufacturer: product.manufacturer || undefined,
    model: product.model || undefined,
    price_brl: product.price_brl,
    price_formatted: formatPrice(product.price_brl),
    image_url: ensureImageUrl(product),
    specs: extractSpecs(product),
    badges: generateBadges(product),
    warranty_years: product.warranty_years || undefined,
  };
}

/**
 * Converte lista de produtos para Widget Comparison
 */
export function formatProductsForComparison(products: CatalogProduct[]): WidgetProductComparison {
  if (products.length === 0) {
    throw new Error('Lista de produtos vazia para comparação');
  }

  // Todos produtos devem ser da mesma categoria
  const category = products[0].category;
  if (!products.every(p => p.category === category)) {
    throw new Error('Produtos de categorias diferentes não podem ser comparados');
  }

  const cards = products.map(formatProductForCard);

  // Construir matriz de comparação
  const attributes = new Set<string>();
  cards.forEach(card => {
    Object.keys(card.specs).forEach(attr => attributes.add(attr));
  });

  const comparison_matrix = Array.from(attributes).map(attribute => ({
    attribute,
    values: cards.map(card => card.specs[attribute] || '-'),
  }));

  return {
    products: cards,
    comparison_matrix,
  };
}

/**
 * Formata lista de produtos para Widget List
 */
export function formatProductsForList(
  products: CatalogProduct[],
  category: string,
  total: number,
  page: number,
  pageSize: number
): WidgetProductList {
  return {
    category,
    total_available: total,
    page,
    page_size: pageSize,
    products: products.map(formatProductForCard),
  };
}

/**
 * Formata kit solar para widget específico
 */
export function formatKitForWidget(product: KitProduct): WidgetSolarKit {
  const card = formatProductForCard(product);

  return {
    ...card,
    power_kwp: product.power_kwp,
    structure_type: product.structure_type || undefined,
    system_type: product.system_type || undefined,
    estimated_generation_kwh_month: product.estimated_generation_kwh_month || undefined,
    price_per_kwp: product.price_per_kwp || undefined,
  };
}

// ============================================================================
// FUNÇÕES DE ALTO NÍVEL PARA WIDGETS
// ============================================================================

/**
 * Gera widget de produto único
 */
export async function generateProductCardWidget(sku: string): Promise<WidgetProductCard> {
  const product = await getProductBySKU(sku);
  
  if (!product) {
    throw new Error(`Produto ${sku} não encontrado ou não disponível`);
  }

  // Incrementar contador de widget
  await dbPool.query('SELECT increment_widget_count($1)', [sku]);

  return formatProductForCard(product);
}

/**
 * Gera widget de comparação de inversores
 */
export async function generateInverterComparisonWidget(
  powerKw: number,
  limit: number = 3
): Promise<WidgetProductComparison> {
  const { products } = await getProductsByCategory('inversores', {
    min_power_kw: powerKw * 0.9,
    max_power_kw: powerKw * 1.1,
    page_size: limit,
    sort_by: 'price_asc',
  });

  if (products.length === 0) {
    throw new Error(`Nenhum inversor encontrado na faixa de ${powerKw}kW`);
  }

  return formatProductsForComparison(products.slice(0, limit));
}

/**
 * Gera widget de lista de categoria
 */
export async function generateCategoryListWidget(
  category: string,
  page: number = 1,
  pageSize: number = 10,
  filters: Partial<SearchParams> = {}
): Promise<WidgetProductList> {
  const { products, total } = await getProductsByCategory(category, {
    ...filters,
    page,
    page_size: pageSize,
  });

  return formatProductsForList(products, category, total, page, pageSize);
}

/**
 * Gera widget de kit solar
 */
export async function generateSolarKitWidget(
  powerKwp: number,
  structureType?: string
): Promise<WidgetSolarKit> {
  const params: Partial<SearchParams> = {
    min_power_kw: powerKwp * 0.95,
    max_power_kw: powerKwp * 1.05,
    page_size: 1,
    sort_by: 'price_asc',
  };

  const { products } = await getProductsByCategory('kits', params);

  // Filtrar por tipo de estrutura se fornecido
  let kit = products[0] as KitProduct;
  
  if (structureType && products.length > 1) {
    const filtered = products.find(p => 
      'structure_type' in p && p.structure_type === structureType
    ) as KitProduct | undefined;
    
    if (filtered) {
      kit = filtered;
    }
  }

  if (!kit) {
    throw new Error(
      `Kit de ${powerKwp}kWp ${structureType ? `com estrutura ${structureType}` : ''} não encontrado`
    );
  }

  await dbPool.query('SELECT increment_widget_count($1)', [kit.sku]);

  return formatKitForWidget(kit);
}

/**
 * Gera widget de produtos similares
 */
export async function generateSimilarProductsWidget(
  sku: string,
  limit: number = 5
): Promise<WidgetProductList> {
  const [product, similarProducts] = await Promise.all([
    getProductBySKU(sku),
    getSimilarProducts(sku, 10, limit),
  ]);

  if (!product) {
    throw new Error(`Produto ${sku} não encontrado`);
  }

  return formatProductsForList(
    similarProducts,
    product.category,
    similarProducts.length,
    1,
    limit
  );
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Limpa cache de produto específico
 */
export function clearProductCache(sku: string): void {
  productCache.del(sku);
}

/**
 * Limpa todo o cache
 */
export function clearAllCache(): void {
  productCache.flushAll();
}

/**
 * Estatísticas do cache
 */
export function getCacheStats(): {
  keys: number;
  hits: number;
  misses: number;
  ksize: number;
  vsize: number;
} {
  return productCache.getStats();
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  WidgetProductCard,
  WidgetProductComparison,
  WidgetProductList,
  WidgetSolarKit,
};
