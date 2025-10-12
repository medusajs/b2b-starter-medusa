# 🔄 Tasks Atualizadas - 10/10/2025

**Atualização baseada em**:

- ✅ Varredura 360º SKU/UI Components concluída
- ✅ CloudFormation stack CREATE_COMPLETE
- ✅ Análise de gaps críticos identificados

---

## 📊 Status Atual do Projeto

### Infraestrutura AWS - 80% COMPLETO

```
✅ ECR Repositories        (Task 2.3) - COMPLETO
✅ CloudFormation Stack    (Task 2.1) - CREATE_COMPLETE  
✅ VPC + Networking        (Task 2.1) - COMPLETO
✅ RDS PostgreSQL 15.14    (Task 2.2) - PROVISIONADO
✅ ElastiCache Redis       (Task 2.2) - PROVISIONADO
✅ ECS Cluster             (Task 2.1) - CRIADO
✅ Application Load Balancer (Task 2.1) - CRIADO
⏳ ECS Task Definitions    (Task 2.4) - PENDENTE
⏳ ECS Services            (Task 2.4) - PENDENTE
⏳ Database Initialization (Task 2.2.4) - PENDENTE
```

### Backend & Catalog - 80% COMPLETO

```
✅ Unified Catalog Module   - IMPLEMENTADO (4 modelos)
✅ Catalog APIs             - 5 endpoints funcionais
✅ Service Layer            - 20+ métodos
✅ Workflows B2B            - Quote, Approval, Company
✅ Docker Images            - Buildadas e no ECR
⚠️ Seeding Pipeline         - Estrutura pronta, dados faltando
⚠️ Busca Textual            - Usando service legado
```

### Frontend & UI - 75% COMPLETO

```
✅ ProductPreview           - Implementado
✅ ProductVariantsTable     - Bulk add-to-cart OK
✅ ProductActions           - Preço + variants
✅ ItemFull (Cart)          - Controles completos
✅ Data Loaders             - catalog, products, enriched
✅ PriceComparison Component - CRIADO mas não integrado
❌ Página /products/[id]/compare - NÃO EXISTE
❌ Catalog Pages            - Faltam rotas
❌ Search Page              - Faltando
```

---

## 🚨 PRIORIDADE CRÍTICA - Próximas 24h

### 1. Completar Deployment AWS (2-3 horas)

#### Task A: Configurar Secrets & Endpoints ⏰ 15 min

```powershell
# Obter outputs do CloudFormation
$outputs = (aws cloudformation describe-stacks `
  --stack-name ysh-b2b-infrastructure `
  --profile ysh-production `
  --region us-east-1 | ConvertFrom-Json).Stacks[0].Outputs

$dbEndpoint = ($outputs | Where-Object { $_.OutputKey -eq "DatabaseEndpoint" }).OutputValue
$redisEndpoint = ($outputs | Where-Object { $_.OutputKey -eq "RedisEndpoint" }).OutputValue
$albDns = ($outputs | Where-Object { $_.OutputKey -eq "LoadBalancerDNS" }).OutputValue

# Criar secrets
aws secretsmanager create-secret `
  --name /ysh-b2b/database-url `
  --secret-string "postgresql://medusa_user:SECURE_PASSWORD@$dbEndpoint:5432/medusa_db" `
  --profile ysh-production --region us-east-1

aws secretsmanager create-secret `
  --name /ysh-b2b/redis-url `
  --secret-string "redis://$redisEndpoint:6379" `
  --profile ysh-production --region us-east-1

aws secretsmanager create-secret `
  --name /ysh-b2b/backend-url `
  --secret-string "http://$albDns" `
  --profile ysh-production --region us-east-1
```

**Deliverable**: Todos os secrets configurados

#### Task B: Registrar Task Definitions ⏰ 10 min

```powershell
# Atualizar task definitions com ARNs reais
cd aws

# Backend
aws ecs register-task-definition `
  --cli-input-json file://backend-task-definition.json `
  --profile ysh-production --region us-east-1

# Storefront
aws ecs register-task-definition `
  --cli-input-json file://storefront-task-definition.json `
  --profile ysh-production --region us-east-1
```

**Antes**: Atualizar nos JSONs:

- `773235999227` (Account ID) ✅ Já correto
- ARNs dos secrets criados
- Region: us-east-1

**Deliverable**: Task definitions registradas

#### Task C: Criar ECS Services ⏰ 20 min

```powershell
# Obter IDs dos outputs
$privateSubnets = ($outputs | Where-Object { $_.OutputKey -eq "PrivateSubnetIds" }).OutputValue
$ecsSG = ($outputs | Where-Object { $_.OutputKey -eq "ECSSecurityGroupId" }).OutputValue
$backendTG = ($outputs | Where-Object { $_.OutputKey -eq "BackendTargetGroupArn" }).OutputValue
$storefrontTG = ($outputs | Where-Object { $_.OutputKey -eq "StorefrontTargetGroupArn" }).OutputValue

# Backend Service
aws ecs create-service `
  --cluster production-ysh-b2b-cluster `
  --service-name ysh-b2b-backend `
  --task-definition ysh-b2b-backend:1 `
  --desired-count 2 `
  --launch-type FARGATE `
  --network-configuration "awsvpcConfiguration={subnets=[$privateSubnets],securityGroups=[$ecsSG],assignPublicIp=DISABLED}" `
  --load-balancers "targetGroupArn=$backendTG,containerName=ysh-b2b-backend,containerPort=9000" `
  --health-check-grace-period-seconds 60 `
  --profile ysh-production --region us-east-1

# Storefront Service
aws ecs create-service `
  --cluster production-ysh-b2b-cluster `
  --service-name ysh-b2b-storefront `
  --task-definition ysh-b2b-storefront:1 `
  --desired-count 2 `
  --launch-type FARGATE `
  --network-configuration "awsvpcConfiguration={subnets=[$privateSubnets],securityGroups=[$ecsSG],assignPublicIp=DISABLED}" `
  --load-balancers "targetGroupArn=$storefrontTG,containerName=ysh-b2b-storefront,containerPort=8000" `
  --health-check-grace-period-seconds 30 `
  --profile ysh-production --region us-east-1
```

**Deliverable**: Services rodando com 2 tasks cada

#### Task D: Database Initialization ⏰ 15 min

```powershell
# Run migrations
aws ecs run-task `
  --cluster production-ysh-b2b-cluster `
  --task-definition ysh-b2b-backend:1 `
  --launch-type FARGATE `
  --network-configuration "awsvpcConfiguration={subnets=[$privateSubnets],securityGroups=[$ecsSG],assignPublicIp=DISABLED}" `
  --overrides '{
    "containerOverrides": [{
      "name": "ysh-b2b-backend",
      "command": ["yarn", "medusa", "db:migrate"]
    }]
  }' `
  --profile ysh-production --region us-east-1

# Aguardar task completar (2-3 min)
# Verificar logs para sucesso

# Run seed
aws ecs run-task `
  --cluster production-ysh-b2b-cluster `
  --task-definition ysh-b2b-backend:1 `
  --launch-type FARGATE `
  --network-configuration "awsvpcConfiguration={subnets=[$privateSubnets],securityGroups=[$ecsSG],assignPublicIp=DISABLED}" `
  --overrides '{
    "containerOverrides": [{
      "name": "ysh-b2b-backend",
      "command": ["yarn", "run", "seed"]
    }]
  }' `
  --profile ysh-production --region us-east-1
```

**Deliverable**: Database migrado e com dados seed

#### Task E: Validação Smoke Tests ⏰ 15 min

```bash
# Obter ALB DNS
ALB_DNS=$(aws cloudformation describe-stacks \
  --stack-name ysh-b2b-infrastructure \
  --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerDNS'].OutputValue" \
  --output text \
  --profile ysh-production --region us-east-1)

# Health checks
curl -I http://$ALB_DNS/health
# Esperado: 200 OK

curl -I http://$ALB_DNS/
# Esperado: 200 OK (Storefront)

# Catalog endpoints
curl "http://$ALB_DNS/store/catalog/manufacturers" | jq '.manufacturers | length'
# Esperado: 37

curl "http://$ALB_DNS/store/catalog/panels?limit=5" | jq '.products | length'
# Esperado: 5

# Verificar logs
aws logs tail /ecs/ysh-b2b-backend --since 5m --profile ysh-production --region us-east-1
aws logs tail /ecs/ysh-b2b-storefront --since 5m --profile ysh-production --region us-east-1
```

**Deliverable**: Sistema funcional em produção

---

## 🔴 GAPS CRÍTICOS - P0 (Baseado em Varredura 360º)

### Gap 1: Página de Comparação de Preços ⏰ 2 horas

**Problema**: Componente `<PriceComparisonComponent>` existe mas não tem rota

**Implementação**:

```tsx
// storefront/src/app/[countryCode]/(main)/products/[handle]/compare/page.tsx
import { getProductByHandle } from "@/lib/data/products"
import { PriceComparisonComponent } from "@/modules/products/components/price-comparison"
import { notFound } from "next/navigation"

export default async function ProductComparePage({ params }) {
  const { countryCode, handle } = params
  
  // Buscar produto
  const product = await getProductByHandle(handle, countryCode)
  
  if (!product) {
    return notFound()
  }
  
  // Buscar SKU code (metadata ou primeira variant)
  const skuCode = product.metadata?.sku_code || product.variants?.[0]?.sku
  
  if (!skuCode) {
    return <div>SKU não encontrado para comparação</div>
  }
  
  // Buscar comparison data
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const comparison = await fetch(
    `${backendUrl}/store/catalog/skus/${skuCode}/compare`,
    { next: { revalidate: 300 } } // Cache 5 min
  ).then(r => r.json())
  
  return (
    <div className="content-container my-8">
      <h1 className="text-3xl font-bold mb-6">
        Comparação de Preços - {product.title}
      </h1>
      <PriceComparisonComponent 
        comparison={comparison} 
        currencyCode={countryCode === 'br' ? 'brl' : 'usd'} 
      />
    </div>
  )
}
```

**Adicionar botão no ProductTemplate**:

```tsx
// storefront/src/modules/products/templates/index.tsx
import LocalizedClientLink from "@/modules/common/components/localized-client-link"

// Dentro do ProductTemplate, adicionar após ProductInfo:
{isSolarProduct && (
  <LocalizedClientLink 
    href={`/products/${product.handle}/compare`}
    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
  >
    <CompareIcon />
    Comparar preços entre distribuidores
  </LocalizedClientLink>
)}
```

**Deliverable**: Página funcional de comparação de preços

### Gap 2: Seleção de Distribuidor ao Adicionar ⏰ 1 hora

**Problema**: Cliente não pode escolher distribuidor específico ao adicionar

**Implementação**:

```tsx
// Modificar PriceComparisonComponent button
<button
  onClick={() => handleAddToCart(offer)}
  className="..."
>
  Adicionar ao Carrinho
</button>

// Função handleAddToCart
const handleAddToCart = async (offer: DistributorOffer) => {
  // Buscar variant_id do produto Medusa correspondente ao SKU
  const variant = await findVariantBySKU(offer.sku_code)
  
  if (!variant) {
    toast.error("Produto não disponível no momento")
    return
  }
  
  // Adicionar com metadata de distribuidor
  await addToCart({
    variant_id: variant.id,
    quantity: 1,
    metadata: {
      preferred_distributor: offer.distributor_name,
      distributor_offer_id: offer.id,
      offer_price: offer.price,
      unified_sku_code: offer.sku_code
    }
  })
  
  toast.success(`Adicionado ao carrinho via ${offer.distributor_name}`)
}
```

**Exibir em ItemFull**:

```tsx
// storefront/src/modules/cart/components/item-full/index.tsx
{item.metadata?.preferred_distributor && (
  <div className="text-xs text-gray-600 flex items-center gap-1">
    <TruckIcon className="w-3 h-3" />
    Distribuidor: <strong>{item.metadata.preferred_distributor}</strong>
  </div>
)}
```

**Deliverable**: Usuário pode escolher distribuidor e ver no carrinho

### Gap 3: Sincronização ysh-pricing ↔ DistributorOffer ⏰ 1.5 horas

**Problema**: Preços podem divergir entre sistemas

**Implementação**:

```typescript
// backend/src/modules/ysh-pricing/workflows/steps/sync-to-unified-catalog-step.ts
import { createStep, StepResponse } from "@medusajs/workflows-sdk"
import { UNIFIED_CATALOG_MODULE } from "../../../modules/unified-catalog"

export const syncToUnifiedCatalogStep = createStep(
  "sync-distributor-prices-to-unified-catalog",
  async ({ distributorPrices }, { container }) => {
    const catalogService = container.resolve(UNIFIED_CATALOG_MODULE)
    const productService = container.resolve("productModuleService")
    
    const updates = []
    
    for (const dp of distributorPrices) {
      // Buscar variant
      const variant = await productService.retrieveVariant(dp.variant_id)
      const skuCode = variant.sku
      
      if (!skuCode) continue
      
      // Buscar SKU no unified catalog
      const sku = await catalogService.retrieveSKU(skuCode)
      
      if (!sku) {
        console.warn(`SKU ${skuCode} não encontrado no unified catalog`)
        continue
      }
      
      // Upsert DistributorOffer
      const offer = {
        sku_id: sku.id,
        distributor_name: dp.distributor.name,
        price: dp.price,
        original_price: dp.original_price,
        discount_pct: dp.discount_pct,
        stock_quantity: dp.stock_quantity,
        stock_status: dp.stock_status || "unknown",
        source_id: dp.source_id,
        last_updated_at: new Date()
      }
      
      await catalogService.upsertDistributorOffer(offer)
      updates.push(offer)
    }
    
    // Recalcular pricing stats dos SKUs afetados
    const affectedSKUs = [...new Set(updates.map(u => u.sku_id))]
    
    for (const skuId of affectedSKUs) {
      await catalogService.updateSKUPricingStats(skuId)
    }
    
    return new StepResponse({ synced: updates.length }, null)
  }
)
```

**Adicionar ao workflow**:

```typescript
// backend/src/modules/ysh-pricing/workflows/sync-distributor-prices.ts
import { syncToUnifiedCatalogStep } from "./steps/sync-to-unified-catalog-step"

export const syncDistributorPricesWorkflow = createWorkflow(
  "sync-distributor-prices",
  (input: SyncDistributorPricesInput) => {
    const prices = syncDistributorPricesStep(input)
    
    // NOVO: Sincronizar com unified catalog
    const catalogSync = syncToUnifiedCatalogStep(prices)
    
    return new WorkflowResponse({ prices, catalogSync })
  }
)
```

**Deliverable**: Sincronização automática de preços

---

## 📋 PRIORIDADE MÉDIA - Próximos 7 dias

### 1. Migrar Busca para Unified Catalog ⏰ 2 horas

```typescript
// backend/src/api/store/catalog/search/route.ts
const catalogService = req.scope.resolve(UNIFIED_CATALOG_MODULE)

// Busca com PostgreSQL ILIKE
const [skus] = await catalogService.listAndCountSKUs({
  where: {
    // Implementar raw SQL query com ILIKE ou tsvector
  },
  take: limit,
  skip: offset
})
```

### 2. Pipeline de Seeding Automatizado ⏰ 3 horas

```typescript
// backend/src/scripts/normalize-distributor-catalogs.ts
// 1. Ler CSVs/JSONs de distribuidores
// 2. Normalizar para schemas unificados
// 3. Gerar manufacturers.json, skus_unified.json, kits_normalized.json
// 4. Executar seed-unified-catalog.ts
```

### 3. Filtros Avançados em Catalog Pages ⏰ 2 horas

```tsx
// Componente CatalogFilters com:
// - Slider de preço (minPrice, maxPrice)
// - Multi-select manufacturers
// - Ordenação (preço, potência, efficiency)
// - Checkboxes de disponibilidade
```

---

## 🎯 MÉTRICAS DE SUCESSO

### Deployment AWS

- [ ] 2 tasks backend RUNNING
- [ ] 2 tasks storefront RUNNING
- [ ] Target groups 100% healthy
- [ ] Health endpoints 200 OK
- [ ] Response time < 500ms (p95)
- [ ] Database com 511 SKUs, 101 Kits, 37 Manufacturers

### Funcionalidades P0

- [ ] Página /products/[handle]/compare funcional
- [ ] Comparação de preços exibindo 3+ ofertas
- [ ] Seleção de distribuidor ao adicionar
- [ ] Metadata de distribuidor visível no carrinho
- [ ] Sincronização ysh-pricing ↔ unified_catalog automática

### Performance

- [ ] Catalog endpoints < 200ms
- [ ] Homepage < 1s (LCP)
- [ ] Category pages < 1.5s
- [ ] 0 errors nos últimos 5 min de logs

---

## 📅 Timeline Atualizado

| Dia | Foco | Entregáveis |
|-----|------|-------------|
| **Dia 1** (Hoje) | Deployment AWS + Gap P0.1 | Sistema em produção + Página de comparação |
| **Dia 2** | Gaps P0.2 + P0.3 | Seleção distribuidor + Sync pricing |
| **Dia 3** | Busca + Filtros | Unified catalog search + Advanced filters |
| **Dia 4** | Seeding + Testes | Pipeline automatizado + E2E tests |
| **Dia 5** | Performance + Monitoring | Otimizações + CloudWatch setup |
| **Dia 6-7** | Polish + Docs | UI improvements + Runbooks |

---

**Última Atualização**: 10/10/2025  
**Próxima Ação**: Executar Task A (Configurar Secrets)  
**Bloqueador**: Nenhum - infraestrutura pronta  
**Progresso Geral**: 44% → Meta: 80% até fim da semana
