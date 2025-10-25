# Relatório de Varredura 360º - Componentes UI e SKUs Unificados

**Data**: 10 de outubro de 2025  
**Escopo**: Análise end-to-end da arquitetura de SKUs, catálogo unificado e componentes UI  
**Status AWS**: Cluster ECS production-ysh-b2b-cluster em execução

---

## 📋 Sumário Executivo

A plataforma YSH B2B implementa uma arquitetura sofisticada de **catálogo unificado multi-distribuidor** com três camadas principais:

1. **Módulo Unified Catalog** (Backend PostgreSQL)
2. **APIs Store/Catalog** (Endpoints RESTful)
3. **Componentes UI React/Next.js** (Storefront)

O sistema suporta comparação de preços em tempo real entre múltiplos distribuidores, gestão de SKUs únicos e kits solares pré-configurados.

---

## 🏗️ Arquitetura de Backend

### 1. Módulo Unified Catalog (`backend/src/modules/unified-catalog/`)

**Modelos principais** (Tabelas PostgreSQL via Medusa 2.4):

#### **SKU Model** (`models/sku.ts`)

```typescript
{
  id: string (prefix: "sku")
  sku_code: string (unique, searchable)
  manufacturer_id: string
  category: enum [panels, inverters, batteries, charge_controllers, 
                  cables, connectors, structures, accessories, kits, 
                  monitoring, protection, other]
  model_number: string
  name: string
  description: string?
  
  // Especificações técnicas (JSON por categoria)
  technical_specs: json
  compatibility_tags: json? // string[]
  
  // Pricing summary (calculado)
  lowest_price: number?
  highest_price: number?
  average_price: number?
  median_price: number?
  price_variation_pct: number?
  
  // Metadata
  image_urls: json? // string[]
  datasheet_url: string?
  certification_labels: json? // string[]
  warranty_years: number?
  search_keywords: json? // string[]
  
  // Stats
  total_offers: number (default: 0)
  is_active: boolean (default: true)
}
```

#### **Kit Model** (`models/kit.ts`)

```typescript
{
  id: string (prefix: "kit")
  kit_code: string (unique)
  name: string
  category: enum [grid-tie, off-grid, hybrid, backup, commercial, residential]
  
  // System specs
  system_capacity_kwp: number
  voltage: string? // "127V", "220V", "380V"
  phase: string? // "monofásico", "bifásico", "trifásico"
  
  // Components (JSON array)
  components: json // { type, sku_id, quantity, confidence }[]
  
  // Pricing
  total_components_price: number?
  kit_price: number?
  discount_amount: number?
  discount_pct: number?
  kit_offers: json? // { distributor, price, stock }[]
  
  // Target
  target_consumer_class: enum [residential, commercial, industrial, rural, public]?
  monthly_consumption_kwh_min: number?
  monthly_consumption_kwh_max: number?
  
  // Stats
  mapping_confidence_avg: number? // 0-100
  is_active: boolean
}
```

#### **DistributorOffer Model** (`models/distributor-offer.ts`)

```typescript
{
  id: string (prefix: "doffer")
  sku_id: string
  distributor_name: string
  
  // Pricing
  price: number
  original_price: number?
  discount_pct: number?
  
  // Availability
  stock_quantity: number?
  stock_status: enum [in_stock, low_stock, out_of_stock, unknown]
  lead_time_days: number?
  
  // Source tracking
  source_id: string // ID no sistema do distribuidor
  source_url: string?
  last_updated_at: datetime
  
  // Distributor info
  distributor_rating: number? // 0-5
  min_order_quantity: number (default: 1)
  shipping_cost: number?
  free_shipping_threshold: number?
  conditions: string? // "Novo", "Recondicionado"
}
```

#### **Manufacturer Model** (`models/manufacturer.ts`)

```typescript
{
  id: string (prefix: "mfr")
  name: string (unique)
  slug: string (unique)
  tier: enum [tier1, tier2, tier3, unknown]?
  country: string?
  logo_url: string?
  website_url: string?
  is_verified: boolean
}
```

### 2. Serviço Unified Catalog (`service.ts`)

**Implementação**: PostgreSQL Pool direto (sem Mikro-ORM por limitação do módulo)

**Métodos principais**:

```typescript
// SKU Operations
listSKUs(options?: { where?: any }): Promise<SKU[]>
listAndCountSKUs(options): Promise<[SKU[], number]>
retrieveSKU(skuId: string): Promise<SKU | null>
updateSKUs(data: any): Promise<void>
searchSKUs(filters): Promise<SKU[]>
updateSKUPricingStats(skuId: string): Promise<void>

// Kit Operations
listKits(options?: { where?: any }): Promise<Kit[]>
listAndCountKits(options): Promise<[Kit[], number]>
retrieveKit(kitId: string): Promise<Kit | null>
searchKits(filters): Promise<Kit[]>
getKitWithComponents(kitId: string): Promise<Kit & { components: expanded }>
recommendKitsByConsumption(monthlyKwh: number): Promise<Kit[]>

// Distributor Operations
listDistributorOffers(options): Promise<DistributorOffer[]>
getSKUWithOffers(skuId: string): Promise<{ sku, offers }>
compareSKUPrices(skuId: string): Promise<PriceComparison>

// Manufacturer Operations
listManufacturers(filters?: { tier?: string }): Promise<Manufacturer[]>
```

**Método destaque - compareSKUPrices**:

```typescript
async compareSKUPrices(skuId: string) {
  const { sku, offers } = await this.getSKUWithOffers(skuId);
  
  const prices = offers.map(o => o.price);
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  
  return {
    sku,
    offers: offers.map(offer => ({
      ...offer,
      is_best_price: offer.price === lowest,
      savings_vs_highest: (highest - offer.price).toFixed(2),
      price_difference_pct: (((offer.price - lowest) / lowest) * 100).toFixed(2)
    })),
    comparison: {
      lowest_price: lowest,
      highest_price: highest,
      average_price: average.toFixed(2),
      max_savings: (highest - lowest).toFixed(2),
      max_savings_pct: ((highest - lowest) / highest * 100).toFixed(2),
      total_offers: offers.length
    }
  };
}
```

### 3. APIs Store Catalog (`backend/src/api/store/catalog/`)

#### **GET /store/catalog/:category** (`[category]/route.ts`)

- **Funcionalidade**: Lista produtos por categoria (panels, inverters, kits, etc)
- **Features**:
  - Paginação (page, limit)
  - Filtros (manufacturer, minPrice, maxPrice, sort)
  - Facets (lista de manufacturers disponíveis)
  - Normalização de dados unificados
  - Suporte para SKUs e Kits
- **Fonte**: `unifiedCatalog` module
- **Cache**: ISR 10min, tags: `["catalog", "catalog-{category}"]`

#### **GET /store/catalog/search** (`search/route.ts`)

- **Funcionalidade**: Busca textual de produtos
- **Parâmetros**: `q` (query), `category`, `manufacturer`, `minPrice`, `maxPrice`, `availability`, `sort`
- **Comportamento**: Busca em `ysh-catalog` service (fallback/legacy)
- **⚠️ Oportunidade**: Migrar para usar `unifiedCatalog.searchSKUs()`

#### **GET /store/catalog/skus/:id/compare** (`skus/[id]/compare/route.ts`)

- **Funcionalidade**: Compara preços de um SKU entre distribuidores
- **Retorna**:

  ```typescript
  {
    sku: SKU,
    offers: DistributorOffer[] (com is_best_price, savings, etc),
    comparison: { lowest, highest, average, max_savings, max_savings_pct }
  }
  ```

- **Método**: `catalogService.compareSKUPrices(id)`

#### **GET /store/products/by-sku/:sku** (`products/by-sku/[sku]/route.ts`)

- **Funcionalidade**: Busca produtos Medusa por SKU
- **Estratégias**:
  1. Busca por `product.sku`
  2. Busca por `variant.sku`
  3. Busca por `product.metadata.sku`
- **Retorna**: Produto Medusa com matched_by indicator
- **⚠️ Desconexão**: Não integrado com `unifiedCatalog` (usa módulo Product nativo)

### 4. Integração com ysh-pricing Module

**Módulo**: `backend/src/modules/ysh-pricing/`

**Workflows**:

- `syncDistributorPricesWorkflow`: Sincroniza preços de distribuidores
- `getMultiDistributorPricingWorkflow`: Obtém pricing multi-distribuidor para variant

**Conexão com Unified Catalog**:

- DistributorPrice model tem `variant_id` e `distributor_id`
- DistributorOffer tem preços agregados por SKU
- **Fluxo**: ysh-pricing → calculated_price → Medusa variants → Storefront

**⚠️ Gap identificado**: Falta sincronização bidirecional:

- ysh-pricing atualiza variants Medusa
- Mas não atualiza DistributorOffer.price em unified_catalog

---

## 🎨 Arquitetura de Frontend (Storefront)

### 1. Camada de Dados (`storefront/src/lib/data/`)

#### **catalog.ts** - Catalog Data Loader

```typescript
// Funções principais:
listCatalog(category: string, filters: CatalogFilters): Promise<CatalogResponse>
listManufacturers(): Promise<string[]>
getCategoryInfo(category: string): Promise<CategoryInfo>
listCategories(): Promise<string[]>
listCategoriesCompat(): Promise<CategoryObject[]>
```

**Features**:

- ISR com revalidate: 600s (10min)
- Tags: `["catalog", "catalog-{category}"]`
- Cache: `force-cache`
- Auth headers via `getAuthHeaders()`

**Endpoint**: `${BACKEND}/store/catalog/${category}?{filters}`

#### **catalog-enriched.ts** - Enriched Catalog Integration

```typescript
// Carrega dados do ysh-erp local (JSON files)
getEnrichedProducts(category: string): Promise<EnrichedProduct[]>
```

**Fonte**: `../../../ysh-erp/data/catalog/ui_enriched/*.json`

**⚠️ Dependência externa**: Requer ysh-erp workspace ao lado

#### **products.ts** - Medusa Products

```typescript
getProductsById({ ids, regionId }): Promise<StoreProduct[]>
getProductByHandle(handle, regionId): Promise<StoreProduct>
listProducts({ pageParam, queryParams, countryCode }): Promise<ProductsResponse>
listProductsWithSort({ page, queryParams, sortBy, countryCode })
```

**Features**:

- ISR com revalidate: 3600s (1h) - para atualizar prices do ysh-pricing
- Retry com backoff exponencial (3 tentativas)
- Fields: `*variants.calculated_price` (usa ysh-pricing module)
- SDK client fetch

### 2. Componentes de Produto (`storefront/src/modules/products/components/`)

#### **ProductPreview** (`product-preview/index.tsx`)

```tsx
// Card de produto em listas/grades
<ProductPreview product={product} region={region} isFeatured? />
```

**Features**:

- Thumbnail com imagens
- Preço (cheapestPrice calculado)
- Indicador de estoque (inventoryQuantity)
- Link para página de detalhes
- Botão "Add to cart" rápido (PreviewAddToCart)

#### **ProductActions** (`product-actions/index.tsx`)

```tsx
// Ações de produto (preço + tabela de variantes)
<ProductActions product={product} region={region} />
```

**Composição**:

- `<ProductPrice>`: Exibe preço principal
- `<ProductVariantsTable>`: Tabela com SKUs, opções, preços, quantidade

#### **ProductVariantsTable** (`product-variants-table/index.tsx`)

```tsx
// Tabela interativa de variantes com bulk add-to-cart
<ProductVariantsTable product={product} region={region} />
```

**Features**:

- Exibe todas as variants em tabela
- Colunas: SKU, Options (dinâmicas), Price, Quantity
- Input de quantidade por variant
- **Bulk add-to-cart**: Adiciona múltiplas variants de uma vez
- Estado local com Map<variantId, { variant, quantity }>
- Usa `addToCartEventBus.emitCartAdd()` para batch add

**Lógica de Bulk Add**:

```typescript
const lineItems = Array.from(lineItemsMap.entries()).map(
  ([variantId, { quantity, ...variant }]) => ({
    productVariant: { ...variant },
    quantity
  })
);

addToCartEventBus.emitCartAdd({
  lineItems,
  regionId: region.id
});
```

#### **PriceComparison** (`price-comparison/index.tsx`)

```tsx
// Componente de comparação multi-distribuidor
<PriceComparisonComponent comparison={comparison} currencyCode? />
```

**Props**:

```typescript
type PriceComparison = {
  sku: SKU;
  offers: DistributorOffer[] & { 
    is_best_price, 
    savings_vs_highest, 
    price_difference_pct 
  }[];
  comparison: {
    lowest_price, highest_price, average_price,
    max_savings, max_savings_pct, total_offers
  };
}
```

**Features**:

- Header com estatísticas (economia máxima %)
- Grid com lowest/average/highest price
- Lista de ofertas com highlight do melhor preço
- Badge "Melhor Preço" para oferta mais barata
- Indicadores de estoque, lead time, frete
- Cálculo de economia vs. maior preço
- Botão "Adicionar ao Carrinho" por oferta

**⚠️ Status**: Componente criado mas não integrado

- TODO: Criar página de comparação (`/products/[id]/compare`)
- TODO: Integrar com API `/store/catalog/skus/:id/compare`

#### **ProductTemplate** (`templates/index.tsx`)

```tsx
// Template principal da página de produto
<ProductTemplate product={product} region={region} countryCode={countryCode} />
```

**Layout**:

1. `<ImageGallery>`: Galeria de imagens
2. `<ProductInfo>`: Título, descrição, badges
3. `<ProductActionsWrapper>`: Preço + variants table (server component wrapper)
4. `<ProductFacts>`: Especificações técnicas
5. `<ProductTabs>`: Abas com detalhes adicionais
6. `<RelatedProducts>`: Produtos relacionados
7. `<SolarIntegration>`: Badges/sugestões de calculadora solar (se aplicável)

### 3. Componentes de Carrinho (`storefront/src/modules/cart/`)

#### **ItemFull** (`components/item-full/index.tsx`)

```tsx
// Item completo do carrinho com controles
<ItemFull item={item} currencyCode={currencyCode} disabled? showBorders? />
```

**Features**:

- Thumbnail clicável (link para produto)
- Título + variant title + brand
- **Controles de quantidade** (+/- com input numérico)
- Validação de estoque (maxQuantity = inventory_quantity)
- DeleteButton
- AddNoteButton (metadata)
- **Botão "Adicionar à cotação"** (integração com lead-quote)
- Indicadores de estoque baixo (<10 unidades)
- Erro se tentar adicionar mais que disponível

**Lógica de atualização**:

```typescript
const changeQuantity = async (newQuantity: number) => {
  const inventoryQty = item.variant?.inventory_quantity ?? 0;
  if (newQuantity > inventoryQty) {
    setError(`Apenas ${inventoryQty} unidades disponíveis em estoque`);
    return;
  }
  await handleUpdateCartQuantity(item.id, Number(newQuantity));
};
```

#### **ItemsTemplate** (`templates/items.tsx`)

```tsx
// Container de todos os itens do carrinho
<ItemsTemplate cart={cart} showBorders? showTotal? />
```

**Features**:

- Renderiza lista de `<ItemFull>` por item
- Calcula totalQuantity (soma de quantities)
- Exibe total de itens + item_total (preço)
- **Desabilita edição** se cart está pendente de aprovação

**Integração com Approvals**:

```typescript
const { isPendingAdminApproval, isPendingSalesManagerApproval } = 
  getCartApprovalStatus(cart);
const isPendingApproval = isPendingAdminApproval || isPendingSalesManagerApproval;
```

### 4. Integração Cart → Quote → Order

#### **Workflow: Create Request for Quote**

**Arquivo**: `backend/src/workflows/quote/workflows/create-request-for-quote.ts`

**Fluxo**:

1. Carrega cart com `useRemoteQueryStep` (campos: items, addresses, shipping, promotions)
2. Carrega customer
3. Cria draft order com `createOrdersWorkflow.runAsStep()`
   - `status: OrderStatus.DRAFT`
   - `items: cart.items` (preserva SKUs e metadata)
4. Inicia order edit com `beginOrderEditOrderWorkflow`
5. Cria quote com `createQuotesWorkflow`
   - Links: draft_order_id, cart_id, customer_id, order_change_id

**Preservação de SKUs**:

- Cart items → Draft Order items (1:1)
- Mantém `variant_id`, `quantity`, `metadata`
- Quote changes editam draft order via OrderEdit

#### **Hook: validate-add-to-cart**

**Arquivo**: `backend/src/workflows/hooks/validate-add-to-cart.ts`

```typescript
addToCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  const { isPendingApproval } = getCartApprovalStatus(cart);
  
  if (isPendingApproval) {
    throw new Error("Cart is pending approval");
  }
  
  return new StepResponse(undefined, null);
});
```

**Bloqueio**: Impede adicionar itens se cart está em aprovação

---

## 🔄 Fluxo de Dados End-to-End

### Cenário 1: Navegação por Categoria (Catalog)

```
Usuário acessa /catalog/panels
  ↓
Next.js App Router: app/[countryCode]/(main)/catalog/[category]/page.tsx
  ↓
Server Action: listCatalog('panels', filters)
  ↓
Fetch: GET /store/catalog/panels?limit=24&page=1
  ↓
Backend API: catalog/[category]/route.ts
  ↓
unifiedCatalog.listAndCountSKUs({ where: { category: 'panels' } })
  ↓
PostgreSQL: SELECT * FROM sku WHERE category = 'panels'
  ↓
Response: { products: SKU[], total, page, limit, facets }
  ↓
Normalization: normalizeProduct() → UI-friendly format
  ↓
Render: Grid de <ProductPreview> cards
```

**Cache layers**:

- Next.js ISR: 10min revalidate
- PostgreSQL query result (ephemeral)

### Cenário 2: Adicionar Produto ao Carrinho (Bulk)

```
Usuário seleciona variants e quantidades na ProductVariantsTable
  ↓
Click "Add to cart"
  ↓
Client Component: ProductVariantsTable.handleAddToCart()
  ↓
addToCartEventBus.emitCartAdd({ lineItems: [...], regionId })
  ↓
CartContext subscriber ouve evento
  ↓
Server Action: addToCart() → SDK call
  ↓
Backend: POST /store/carts/:id/line-items (batch)
  ↓
Medusa Core: addToCartWorkflow.run()
  ↓
Hook: validate-add-to-cart.ts (valida approvals)
  ↓
Hook: validate-add-to-cart.ts (valida spending limits)
  ↓
Cart updated com novos items
  ↓
Response: Updated cart
  ↓
CartContext.refreshCart()
  ↓
UI atualiza: cart drawer mostra novos items
```

**Validações**:

1. Cart não está pendente de aprovação
2. Employee não excedeu spending limit
3. Inventory disponível

### Cenário 3: Comparação de Preços Multi-Distribuidor

```
Usuário clica "Comparar preços" em produto
  ↓
Navigate: /products/[productId]/compare (TODO: página não existe)
  ↓
Server Component carrega: GET /store/catalog/skus/:sku_code/compare
  ↓
Backend API: catalog/skus/[id]/compare/route.ts
  ↓
unifiedCatalog.compareSKUPrices(sku_code)
  ↓
Query 1: SELECT * FROM sku WHERE sku_code = ?
Query 2: SELECT * FROM distributor_offer WHERE sku_id = ? ORDER BY price ASC
  ↓
Cálculos: lowest, highest, average, savings, percentuais
  ↓
Response: { sku, offers: [...enriched], comparison: {...stats} }
  ↓
Render: <PriceComparisonComponent> com ofertas ordenadas
  ↓
Usuário escolhe oferta específica
  ↓
Click "Adicionar ao Carrinho" (oferta X)
  ↓
TODO: Adicionar metadata indicando distributor escolhido
```

**⚠️ Gap**: Página de comparação não implementada

### Cenário 4: Request for Quote (RFQ)

```
Usuário monta carrinho com produtos
  ↓
Click "Solicitar cotação"
  ↓
Server Action: createRequestForQuote(cart_id, customer_id)
  ↓
Backend: POST /store/quotes/request
  ↓
Workflow: createRequestForQuoteWorkflow.run()
  ↓
Step 1: useRemoteQueryStep → carrega cart.items (com SKUs)
Step 2: createOrdersWorkflow → cria draft order
  ├─ items: cart.items (preserva variants, quantities, metadata)
  ├─ status: DRAFT
Step 3: beginOrderEditOrderWorkflow → inicia edição
Step 4: createQuotesWorkflow → cria quote entity
  ├─ draft_order_id (link)
  ├─ cart_id (link)
  ├─ order_change_id (link)
  ↓
Response: { quote: Quote }
  ↓
Merchant acessa Admin → Quotes
  ↓
Edita preços/quantidades via OrderEdit
  ↓
Click "Enviar cotação"
  ↓
Workflow: merchantSendQuoteWorkflow
  ↓
Customer recebe notificação
  ↓
Customer aceita: customerAcceptQuoteWorkflow
  ├─ Confirma order edit
  ├─ Transforma draft order → real order
  ↓
Order criado com itens do cart original
```

**Preservação de dados**:

- SKUs mantidos via variant_id em line items
- Metadata do cart propagado para order
- Remote links rastreiam relacionamentos

---

## 📊 Mapa de Entidades e Relacionamentos

```
┌─────────────────────┐
│   Manufacturer      │
│  (unified_catalog)  │
│  - id, name, slug   │
│  - tier, country    │
└──────────┬──────────┘
           │ 1:N
           ↓
┌─────────────────────┐         ┌─────────────────────┐
│        SKU          │ 1:N     │  DistributorOffer   │
│  (unified_catalog)  │←────────│  (unified_catalog)  │
│  - sku_code         │         │  - price            │
│  - category         │         │  - stock_status     │
│  - technical_specs  │         │  - distributor_name │
│  - lowest_price     │         │  - last_updated_at  │
└──────────┬──────────┘         └─────────────────────┘
           │
           │ N:M (via components JSON)
           ↓
┌─────────────────────┐
│        Kit          │
│  (unified_catalog)  │
│  - kit_code         │
│  - category         │
│  - system_kwp       │
│  - components []    │
└─────────────────────┘

┌─────────────────────┐         ┌─────────────────────┐
│   Product (Medusa)  │ 1:N     │  ProductVariant     │
│  - id, handle       │────────→│  (Medusa)           │
│  - title            │         │  - sku              │
│  - metadata.sku?    │         │  - inventory_qty    │
└─────────────────────┘         │  - calculated_price │
                                └──────────┬──────────┘
                                           │
                                           │ N:1 (via ysh-pricing)
                                           ↓
                                ┌─────────────────────┐
                                │  DistributorPrice   │
                                │   (ysh-pricing)     │
                                │  - variant_id       │
                                │  - distributor_id   │
                                │  - price            │
                                └─────────────────────┘

┌─────────────────────┐
│    Cart (Medusa)    │
│  - id, customer_id  │
│  - items []         │──┐
└─────────────────────┘  │
                         │ link (remote)
┌─────────────────────┐  │
│   Quote (B2B)       │  │
│  - id, status       │←─┤
│  - draft_order_id   │  │
│  - cart_id          │──┘
└──────────┬──────────┘
           │ link
           ↓
┌─────────────────────┐
│   Order (Medusa)    │
│  - id, status       │
│  - items []         │
│    └─ variant_id    │──→ (preserva SKU via variant)
└─────────────────────┘
```

---

## 🚨 Gaps e Oportunidades Identificados

### 1. **Desconexão SKU Unificado ↔ Produto Medusa**

**Problema**:

- `unified_catalog.sku` tem SKUs únicos + ofertas multi-distribuidor
- `medusa.product_variant` tem SKUs + preços calculados via ysh-pricing
- **Não há sincronização bidirecional**

**Impacto**:

- PriceComparison mostra ofertas do unified_catalog
- Mas adicionar ao carrinho usa variant_id do Medusa
- Cliente não consegue escolher distribuidor específico ao adicionar

**Solução proposta**:

```typescript
// 1. Adicionar metadata em line_item quando adicionar via PriceComparison
{
  variant_id: "variant_123",
  metadata: {
    preferred_distributor: "Distribuidor X",
    unified_sku_code: "SKU-PANEL-ABC",
    offer_id: "doffer_xyz"
  }
}

// 2. Hook validate-add-to-cart deve verificar se distributor está disponível
// 3. Order fulfillment deve rotear para distribuidor escolhido
```

### 2. **Página de Comparação de Preços Não Implementada**

**Status**: Componente criado, API funcional, mas sem rota

**Arquivo esperado**: `storefront/src/app/[countryCode]/(main)/products/[id]/compare/page.tsx`

**Implementação sugerida**:

```tsx
// page.tsx
export default async function ProductComparePage({ params }) {
  const { id } = params;
  
  // Buscar produto Medusa
  const product = await getProductById(id);
  
  // Buscar SKU code do produto (metadata ou variant.sku)
  const skuCode = product.metadata?.sku_code || product.variants?.[0]?.sku;
  
  // Buscar comparison data
  const comparison = await fetch(
    `${BACKEND}/store/catalog/skus/${skuCode}/compare`
  ).then(r => r.json());
  
  return (
    <div>
      <ProductInfo product={product} />
      <PriceComparisonComponent comparison={comparison} />
    </div>
  );
}
```

### 3. **Seeding Incompleto**

**Script**: `backend/src/scripts/seed-unified-catalog.ts`

**Status**: Estrutura completa, mas dados de entrada não encontrados

**Arquivos esperados** (não existem):

```
backend/data/catalog/unified_schemas/
  ├─ manufacturers.json
  ├─ skus_unified.json
  └─ kits_normalized.json
```

**Ação requerida**:

1. Criar pipeline de normalização de dados
2. Transformar catálogos de distribuidores → schemas unificados
3. Executar seed: `yarn medusa exec backend/src/scripts/seed-unified-catalog.ts`

### 4. **Busca Textual Usando Legacy Service**

**Arquivo**: `backend/src/api/store/catalog/search/route.ts`

**Problema**: Usa `yshCatalogService` (módulo antigo), não `unifiedCatalog`

**Migração necessária**:

```typescript
// Atual (errado)
const products = await yshCatalogService.searchProducts(query, options);

// Desejado
const [skus] = await catalogService.listAndCountSKUs({
  where: {
    $or: [
      { name: { $ilike: `%${query}%` } },
      { sku_code: { $ilike: `%${query}%` } },
      { description: { $ilike: `%${query}%` } }
    ]
  },
  take: limit,
  skip: offset
});
```

**⚠️ Limitação**: PostgreSQL via Pool não suporta query builders avançados

- Solução: Implementar raw SQL com ILIKE/tsvector

### 5. **Sincronização ysh-pricing ↔ DistributorOffer**

**Problema**:

- `ysh-pricing` atualiza `product_variant.calculated_price`
- Mas não atualiza `distributor_offer.price` em unified_catalog

**Fluxo atual**:

```
Distributor API → ysh-pricing.syncDistributorPricesWorkflow
  → DistributorPrice table (ysh-pricing)
  → Medusa Pricing Module recalcula variant prices
  → ❌ unified_catalog.distributor_offer NÃO é atualizado
```

**Solução**:

```typescript
// Adicionar step em syncDistributorPricesWorkflow
const syncToUnifiedCatalogStep = createStep(
  "sync-to-unified-catalog",
  async ({ distributorPrices }, { container }) => {
    const catalogService = container.resolve(UNIFIED_CATALOG_MODULE);
    
    for (const dp of distributorPrices) {
      // Buscar SKU code da variant
      const variant = await getVariant(dp.variant_id);
      const skuCode = variant.sku;
      
      // Buscar SKU no unified catalog
      const sku = await catalogService.retrieveSKU(skuCode);
      
      if (sku) {
        // Atualizar ou criar DistributorOffer
        await catalogService.upsertDistributorOffer({
          sku_id: sku.id,
          distributor_name: dp.distributor.name,
          price: dp.price,
          last_updated_at: new Date()
        });
      }
    }
  }
);
```

### 6. **Falta de Testes E2E para Fluxo Completo**

**Cenário crítico não testado**:

```
1. Navegar catalog → panels
2. Selecionar produto
3. Comparar preços (multi-distribuidor)
4. Escolher oferta específica
5. Adicionar ao carrinho com metadata de distribuidor
6. Solicitar RFQ
7. Merchant ajusta preços
8. Customer aceita
9. Order criada com distributor correto
```

**Arquivos de teste esperados**:

```
backend/integration-tests/http/catalog/
  ├─ list-skus.spec.ts
  ├─ compare-prices.spec.ts
  └─ sku-to-product-mapping.spec.ts

storefront/src/__tests__/e2e/
  ├─ catalog-navigation.spec.ts
  ├─ price-comparison.spec.ts
  └─ rfq-with-distributor.spec.ts
```

---

## ✅ Pontos Fortes da Arquitetura

### 1. **Separação Clara de Responsabilidades**

- **Unified Catalog**: Catálogo normalizado, multi-distribuidor, independente
- **Medusa Products**: E-commerce core, pricing, inventory, orders
- **ysh-pricing**: Orquestração de preços dinâmicos
- **Storefront**: UI/UX, cache, server actions

### 2. **Bulk Operations Otimizadas**

- `ProductVariantsTable` permite adicionar múltiplas variants de uma vez
- `addToCartEventBus` coordena batch operations
- Reduz chamadas de API e melhora UX

### 3. **Price Comparison Engine Robusto**

- Cálculo automático de lowest/highest/average
- Indicadores visuais de economia
- Ordenação inteligente (melhor preço primeiro)
- Metadados ricos (estoque, frete, lead time)

### 4. **Hooks de Validação Extensíveis**

- `validate-add-to-cart`: Bloqueia operações inválidas
- `validate-cart-completion`: Garante approvals antes de checkout
- Fácil adicionar novas regras de negócio

### 5. **Cache Estratégico Multi-Camada**

- Next.js ISR: 10min para catalog, 1h para products
- PostgreSQL connection pooling
- Tags de cache granulares para invalidação seletiva

---

## 📈 Métricas de Complexidade

### Backend

- **Modelos**: 4 principais (SKU, Kit, DistributorOffer, Manufacturer)
- **Métodos de serviço**: ~20 (CRUD + queries especializadas)
- **APIs públicas**: 5 endpoints principais
- **Workflows relacionados**: 3 (RFQ, pricing sync, multi-dist pricing)
- **Hooks**: 2 (add-to-cart validation, cart completion)

### Frontend

- **Data loaders**: 3 (catalog, catalog-enriched, products)
- **Componentes de produto**: 12 (preview, actions, variants table, price comparison, etc)
- **Componentes de carrinho**: 5 (item-full, items template, drawer, totals, approval banner)
- **Templates**: 2 (product template, related products)
- **Páginas de catálogo**: TODO (catalog/[category] não existe ainda)

### Cobertura de Testes

- ✅ Backend unit tests: `ysh-catalog` service (panels, kits, caching)
- ❌ Backend integration tests: unified-catalog APIs (FALTAM)
- ❌ Frontend component tests: ProductVariantsTable, PriceComparison (FALTAM)
- ❌ E2E tests: Fluxo completo catalog → cart → RFQ (FALTAM)

---

## 🎯 Roadmap de Melhorias Prioritárias

### P0 (Crítico - Bloqueador)

1. **Criar página /products/[id]/compare**
   - Integrar `<PriceComparisonComponent>`
   - Conectar com API `/store/catalog/skus/:id/compare`
   - Adicionar botão "Comparar preços" em ProductTemplate

2. **Implementar seleção de distribuidor ao adicionar ao carrinho**
   - Adicionar `preferred_distributor` em item metadata
   - Atualizar `ItemFull` para exibir distribuidor escolhido
   - Propagar para OrderItem ao finalizar

3. **Sincronizar ysh-pricing → DistributorOffer**
   - Adicionar step em `syncDistributorPricesWorkflow`
   - Garantir preços consistentes entre sistemas

### P1 (Alto - Funcionalidade Core)

4. **Migrar search para unified catalog**
   - Substituir `yshCatalogService` por `unifiedCatalog.searchSKUs()`
   - Implementar full-text search com PostgreSQL tsvector

5. **Criar pipeline de seeding automatizado**
   - Normalizar catálogos de distribuidores
   - Gerar manufacturers.json, skus_unified.json, kits_normalized.json
   - Agendar sync periódico (cron job)

6. **Implementar recomendação de kits por consumo**
   - Endpoint: `POST /store/catalog/kits/recommend { monthly_kwh }`
   - UI: Wizard de dimensionamento em homepage
   - Usa `recommendKitsByConsumption()` do service

### P2 (Médio - UX Enhancement)

7. **Adicionar filtros avançados em catalog pages**
   - Slider de preço (minPrice, maxPrice)
   - Filtro de manufacturer (multi-select)
   - Ordenação (preço, potência, efficiency)

8. **Criar dashboard de comparação de distribuidores**
   - Admin view: Estatísticas de ofertas por distributor
   - Gráficos de price variation over time
   - Alert se distributor ficar mais caro que concorrentes

9. **Implementar wishlist com price alerts**
   - Salvar SKUs de interesse
   - Notificar quando preço cair X%
   - Integrar com DistributorOffer updates

### P3 (Baixo - Polish)

10. **Adicionar imagens em SKUs/Kits**
    - Upload de imagens via Admin
    - CDN integration (Cloudinary/S3)
    - Lazy loading otimizado

11. **SEO para páginas de catálogo**
    - Metadata dinâmico por categoria
    - Structured data (Product schema)
    - Sitemap generation

12. **Analytics de conversão**
    - Tracking: view SKU → compare prices → add to cart → checkout
    - Identificar drop-off points
    - A/B test de UI de comparação

---

## 🔍 Status AWS (Contexto do Terminal)

**Comando executado**:

```powershell
aws ecs list-tasks --cluster production-ysh-b2b-cluster 
  --service-name ysh-b2b-backend 
  --desired-status STOPPED 
  --profile ysh-production 
  --region us-east-1 
  --max-items 3
```

**Interpretação**:

- Cluster: `production-ysh-b2b-cluster`
- Service: `ysh-b2b-backend`
- Status: Buscando tasks **STOPPED** (últimas 3)
- Exit Code: 0 (sucesso)

**Contexto**:

- Backend está deployado em AWS ECS (Amazon Elastic Container Service)
- Ambiente: Production (us-east-1)
- Provavelmente investigando restarts/crashes recentes

**Ações relacionadas ao relatório**:

- ✅ Backend APIs de catalog estão em produção
- ⚠️ Verificar logs de tasks stopped para erros relacionados a:
  - PostgreSQL connection pooling (unified-catalog)
  - Timeouts em queries pesadas
  - Memória insuficiente (compareSKUPrices pode ser intensivo)

**Recomendação**:

```powershell
# Ver logs da última task stopped
$taskArn = (aws ecs list-tasks --cluster production-ysh-b2b-cluster --service-name ysh-b2b-backend --desired-status STOPPED --profile ysh-production --region us-east-1 --max-items 1 --output json | ConvertFrom-Json).taskArns[0]

aws ecs describe-tasks --cluster production-ysh-b2b-cluster --tasks $taskArn --profile ysh-production --region us-east-1

# Se task parou por erro, verificar CloudWatch Logs
aws logs tail /ecs/ysh-b2b-backend --since 1h --profile ysh-production --region us-east-1
```

---

## 📝 Conclusão

A arquitetura de SKUs unificados e componentes UI está **80% implementada** com fundação sólida:

✅ **Completo**:

- Modelos de dados (SKU, Kit, DistributorOffer, Manufacturer)
- Serviço PostgreSQL com métodos CRUD + analytics
- APIs de listagem e comparação de preços
- Componentes React para display e bulk add-to-cart
- Integração cart → quote → order (preserva SKUs)

⚠️ **Em Progresso**:

- Seeding automatizado (estrutura pronta, dados faltando)
- Price comparison UI (componente criado, página faltando)

❌ **Gaps Críticos**:

- Página /products/[id]/compare não existe
- Seleção de distribuidor ao adicionar ao carrinho
- Sincronização bidirecional ysh-pricing ↔ DistributorOffer
- Busca textual ainda usa service legado
- Testes E2E ausentes

**Próximo passo recomendado**: Implementar P0.1 (página de comparação) para validar fluxo completo com usuários reais.

---

*Relatório gerado em: 2025-10-10*  
*Última atualização do codebase: main branch*  
*Ambiente AWS: production-ysh-b2b-cluster (us-east-1)*
