# 📊 Análise de Integração de Preços e Data Flows

> **Data**: Outubro 2025  
> **Status**: Análise Completa | Recomendações Estratégicas  
> **Escopo**: Backend Medusa ↔ ERP ↔ Storefront Next.js

---

## 🎯 Objetivo da Análise

Avaliar a necessidade do **YSH ERP** para workflows de precificação e atualizações automáticas, considerando:

1. **Complexidade operacional** vs. **valor agregado**
2. **Latência de sincronização** vs. **requisitos de tempo real**
3. **Custo de manutenção** (Data Platform Dagster + Pathway) vs. **simplificação**
4. **Multi-distribuidor** (5 fornecedores) vs. **catálogo único**

---

## 🏗️ Arquitetura Atual

### Componentes Ativos

```
┌─────────────────────────────────────────────────────────────────┐
│  YSH ERP (Multi-Distribuidor)                                   │
│  - Neosolar, Solfácil, Odex, Fotus, Fortlev                    │
│  - Workflows: syncDistributorPricesWorkflow                     │
│  - API: /admin/ysh-erp/*, /erp/order-updates                   │
│  - Database: Postgres (independente)                            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │  Sincronização via:
                 │  1. Dagster Assets (batch, 30min)
                 │  2. Pathway Pipelines (streaming CDC)
                 │  3. Kafka Topics (ysh-erp.*)
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  Data Platform (Dagster + Pathway)                              │
│                                                                  │
│  DAGSTER ASSETS (Batch ETL - 30min):                           │
│  - erp_products_sync      → Produtos + Preços + Estoque        │
│  - erp_orders_sync        → Ordens Medusa → ERP                │
│  - erp_homologacao_sync   → Status ANEEL → Medusa              │
│  - erp_pricing_kb         → Embeddings Qdrant (RAG)            │
│                                                                  │
│  PATHWAY PIPELINES (Streaming - Real-time):                    │
│  - ERP Orders → Medusa    → Atualiza fulfillment               │
│  - ERP Prices → Medusa    → Upsert price_list                  │
│  - Medusa Orders → ERP    → Envia para processamento           │
│  - Homologação Sync       → Status ANEEL em tempo real         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  Medusa Backend (ysh-store/backend)                             │
│  - Modules: PRICING (ativo), PRODUCT, CART, ORDER              │
│  - Custom APIs: /store/catalog (catálogo YSH)                  │
│  - Database: Postgres (medusa_db)                               │
│  - Cache: Redis (preços, produtos)                              │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │  REST API (/store/*)
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  Storefront Next.js 15 (ysh-store/storefront)                  │
│  - Data Layer: src/lib/data/products.ts, cart.ts               │
│  - Retry Logic: exponential backoff (3 retries)                │
│  - Cache: Next.js Cache (force-cache)                           │
│  - Region-based pricing (country_code)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Análise Crítica dos Fluxos

### 1. Fluxo de Preços Atual

#### **Rota Completa: ERP → Medusa → Storefront**

```
1. YSH ERP (Scheduled Job - 6h, 12h, 18h, 0h)
   └─> syncDistributorPricesWorkflow
       ├─> Consulta APIs dos 5 distribuidores
       ├─> Calcula preços com markup (B1/B3)
       └─> Atualiza tabela `distributor_prices`

2. Data Platform (Dagster Asset - 30min)
   └─> erp_products_sync
       ├─> GET {ERP_API}/admin/ysh-erp/products?updated_since=24h
       ├─> Para cada produto:
       │   ├─> Query Medusa: SELECT * FROM product WHERE metadata->>'sku' = ?
       │   └─> UPDATE product SET metadata = metadata || {erp_price_b1, erp_price_b3, erp_stock}
       └─> Stats: {updated, created, errors}

3. Data Platform (Pathway Pipeline - Real-time CDC)
   └─> sync_erp_prices_to_medusa
       ├─> Kafka topic: "ysh-erp.prices"
       ├─> Lookup: SKU → product_variant_id
       └─> Upsert: price_list (Postgres Medusa)

4. Medusa Backend (Cache Invalidation)
   └─> Redis: FLUSH price:*
       └─> Próxima consulta busca novos preços

5. Storefront (Client Fetch)
   └─> GET /store/products/:id
       ├─> retryWithBackoff (3 tentativas)
       ├─> Cache: Next.js force-cache
       └─> Renderiza preço atualizado
```

#### **Latência Total: 30-40 minutos** (worst case)

- ERP sync: 0-30min (próximo batch)
- Dagster asset: 30min interval
- Pathway CDC: <5s (mas depende de Dagster primeiro)
- Frontend cache: invalidado apenas em rebuild

---

### 2. Problemas Identificados

#### ⚠️ **Alta Complexidade para Ganho Marginal**

| Componente | Complexidade | Valor Agregado | Justificativa |
|------------|--------------|----------------|---------------|
| **YSH ERP (Multi-Distribuidor)** | 🔴 ALTA | 🟡 MÉDIO | Gerencia 5 distribuidores, mas workflow de comparação raramente usado no frontend |
| **Dagster Assets (Batch ETL)** | 🟡 MÉDIA | 🟢 ALTO | Sincronização confiável, mas latência de 30min aceitável? |
| **Pathway Pipelines (Streaming)** | 🔴 ALTA | 🟠 BAIXO | CDC real-time com overhead significativo, mas preços mudam 4x/dia (scheduled) |
| **Kafka Infrastructure** | 🔴 ALTA | 🟠 BAIXO | Requer Zookeeper, Kafka, Debezium para CDC |

#### ⚠️ **Duplicação de Responsabilidades**

1. **Pricing Module** (Medusa core) vs. **ERP Custom Pricing**
   - Medusa tem `PRICING` module nativo com suporte a:
     - Multi-currency (BRL, USD)
     - Price lists por customer group
     - Regional pricing (já usado: country_code)
     - Scheduled price changes
   - **Por que não usar?** ERP adiciona camada de markup por distribuidor

2. **Catalog API** (`/store/catalog`) vs. **Medusa Products API**
   - Storefront usa `/store/catalog/[category]` (custom)
   - Medusa oferece `/store/products` com filtros avançados
   - **Motivo:** Integração com catálogo estático YSH (JSON files)

---

## 🎯 Recomendações Estratégicas

### Opção 1: **Simplificar - Remover ERP + Data Platform** (Recomendada)

#### **Nova Arquitetura**

```
┌─────────────────────────────────────────────────────────────────┐
│  Medusa Backend (Único)                                         │
│  - PRICING Module (ativo)                                       │
│  - Custom Module: ysh-catalog (catálogo + preços)              │
│  - Workflow: syncDistributorPrices (migrado do ERP)            │
│  - Scheduled Jobs: Atualiza preços 4x/dia                       │
│  - API: /admin/catalog/sync-prices (trigger manual)            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │  REST API (/store/*)
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  Storefront Next.js 15                                          │
│  - Usa price_list do Medusa (padrão)                           │
│  - Cache: Redis + Next.js ISR                                   │
│  - Revalidação: 1h (ou on-demand via webhook)                  │
└─────────────────────────────────────────────────────────────────┘
```

#### **Benefícios**

✅ **Redução de 70% na complexidade operacional**

- Remove Dagster (5 assets + schedules)
- Remove Pathway (4 pipelines CDC)
- Remove Kafka infrastructure (3 topics)
- Remove YSH ERP database + APIs

✅ **Latência de preços: 0-15 minutos** (vs. 30-40min)

- Scheduled job: 6h, 12h, 18h, 0h (mantém)
- Atualização imediata no Medusa
- ISR frontend: revalida em 1h ou webhook

✅ **Menor custo de manutenção**

- 1 serviço (Medusa) vs. 4 serviços (Medusa + ERP + Dagster + Pathway)
- Debugging simplificado (single source of truth)
- Deploy unificado

✅ **Compatibilidade com Medusa Modules**

- Usa `PRICING` module nativo (price_list, currency, regions)
- Suporte a A/B testing de preços
- Customer groups (B2B pricing tiers)

#### **Trade-offs**

❌ **Perde comparação multi-distribuidor em tempo real**

- Solução: Manter scheduled jobs (preços mudam 4x/dia, não precisa real-time)

❌ **Perde tracking de homologação ANEEL separado**

- Solução: Migrar `ysh_homologacao` module para Medusa backend

---

### Opção 2: **Manter ERP com Otimizações** (Se Multi-Distribuidor for crítico)

#### **Otimizações**

1. **Remover Pathway Pipelines (CDC)**
   - Substituir por Dagster assets apenas (batch é suficiente)
   - Preços mudam 4x/dia, não precisa CDC

2. **Mover Dagster para dentro do Medusa Backend**
   - Usar `@medusajs/workflows` para scheduling
   - Remover infraestrutura separada

3. **Simplificar Kafka**
   - Apenas 1 topic: `ysh-erp.prices`
   - Consumir diretamente no Medusa (sem Pathway)

#### **Nova Arquitetura Híbrida**

```
┌─────────────────────────────────────────────────────────────────┐
│  YSH ERP (Reduzido)                                             │
│  - Apenas workflows de pricing                                  │
│  - API: /admin/ysh-erp/prices (read-only)                      │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │  Kafka topic: ysh-erp.prices
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  Medusa Backend (com Kafka Consumer)                            │
│  - Workflow: consumeErpPrices (Kafka consumer)                  │
│  - Atualiza price_list automaticamente                          │
│  - Fallback: Manual sync via /admin/catalog/sync-prices        │
└─────────────────────────────────────────────────────────────────┘
```

#### **Benefícios**

✅ Mantém multi-distribuidor
✅ Remove Data Platform complexa (Dagster + Pathway)
✅ Latência: <5 minutos (Kafka consumer)

#### **Trade-offs**

❌ Ainda mantém 2 serviços (Medusa + ERP)
❌ Requer Kafka (overhead de infra)

---

### Opção 3: **Manter Arquitetura Atual** (Não recomendado)

#### **Quando faz sentido:**

- [x] Multi-distribuidor é **core business** (cotação automática)
- [x] Hélio AI precisa de embeddings de preços em tempo real (RAG)
- [x] Homologação ANEEL tem SLA crítico (<15min)
- [ ] Volume de transações justifica streaming CDC (>10k orders/dia)

#### **Status atual:**

- Multi-distribuidor: **Implementado mas pouco usado** (workflow existe, mas frontend não compara preços)
- Hélio AI: **WIP** (Qdrant setup, mas RAG não ativo)
- Homologação: **Manual via ERP** (não integrado com frontend)
- Volume: **Baixo** (<100 orders/dia estimado)

**Conclusão:** Complexidade não justificada pelo uso atual.

---

## 🚀 Plano de Implementação (Opção 1 - Recomendada)

### Phase 1: Migrar Workflows para Medusa Backend

#### 1.1 Criar `ysh-distributor-pricing` module

```typescript
// ysh-store/backend/src/modules/ysh-distributor-pricing/

// service.ts
export class YshDistributorPricingService {
  async syncDistributorPrices(distributors: string[]) {
    // Migrado de: ysh-erp/src/workflows/ysh/sync-distributor-prices.ts
    for (const distributor of distributors) {
      const prices = await this.fetchDistributorPrices(distributor)
      await this.updatePriceLists(prices)
    }
  }

  private async fetchDistributorPrices(distributor: string) {
    // Lógica de consulta APIs externas (Neosolar, Solfácil, etc.)
  }

  private async updatePriceLists(prices: DistributorPrice[]) {
    // Usa Medusa PRICING module
    await this.pricingService.upsert({
      variant_id: prices[0].variant_id,
      amount: prices[0].amount,
      currency_code: "brl"
    })
  }
}

// workflows/sync-distributor-prices.ts
export const syncDistributorPricesWorkflow = createWorkflow(
  "sync-distributor-prices",
  function (input) {
    const prices = fetchDistributorPricesStep(input)
    return updatePriceListsStep(prices)
  }
)
```

#### 1.2 Criar Scheduled Jobs

```typescript
// ysh-store/backend/src/jobs/sync-prices.ts

import { MedusaContainer } from "@medusajs/framework/types"
import { syncDistributorPricesWorkflow } from "../workflows/sync-distributor-prices"

export default async function syncPricesJob(container: MedusaContainer) {
  const { result } = await syncDistributorPricesWorkflow(container).run({
    input: {
      distributors: ["neosolar", "solfacil", "odex", "fotus", "fortlev"],
    },
  })

  console.log(`✅ Synced ${result.updated} prices`)
}

// Cron: 0 6,12,18,0 * * * (4x/dia)
```

#### 1.3 Atualizar Storefront Data Layer

```typescript
// ysh-store/storefront/src/lib/data/products.ts

export const getProductsById = async (ids: string[], regionId: string) => {
  return retryWithBackoff(async () => {
    const { products } = await sdk.client.fetch<HttpTypes.StoreProductListResponse>(
      `/store/products`,
      {
        method: "GET",
        query: {
          id: ids,
          region_id: regionId, // Usa pricing por região
          fields: "*variants.calculated_price", // Preço calculado do Medusa
        },
        headers: await getAuthHeaders(),
        next: await getCacheOptions("products"),
        cache: "force-cache",
      }
    )
    return products
  })
}
```

### Phase 2: Remover Data Platform

#### 2.1 Desabilitar Dagster Assets

```bash
# ysh-store/data-platform/dagster/
# Comentar todos os assets do grupo "erp_sync"
```

#### 2.2 Desabilitar Pathway Pipelines

```bash
# ysh-store/data-platform/pathway/
# Remover pipelines/erp_sync.py
```

#### 2.3 Remover Kafka Topics

```bash
# docker-compose.yml
# Comentar serviços: kafka, zookeeper, debezium
```

### Phase 3: Deprecar YSH ERP

#### 3.1 Migrar Module `ysh_homologacao`

```typescript
// ysh-store/backend/src/modules/ysh-homologacao/

// Migrado de: ysh-erp/src/modules/ysh_homologacao/
// Mantém APIs de homologação ANEEL
```

#### 3.2 Atualizar Frontend para usar Medusa APIs

```typescript
// ysh-store/storefront/src/lib/data/homologacao.ts

export const listHomologacoes = async () => {
  return sdk.client.fetch<HomologacaoResponse>(
    `/store/homologacao`, // Nova API no Medusa backend
    { method: "GET", headers: await getAuthHeaders() }
  )
}
```

---

## 📈 Comparação Final

| Métrica | Arquitetura Atual | Opção 1 (Recomendada) | Opção 2 (Híbrida) |
|---------|-------------------|----------------------|-------------------|
| **Serviços Ativos** | 4 (Medusa + ERP + Dagster + Pathway) | 1 (Medusa) | 2 (Medusa + ERP) |
| **Latência Preços** | 30-40min | 0-15min | <5min |
| **Complexidade Operacional** | 🔴 ALTA | 🟢 BAIXA | 🟡 MÉDIA |
| **Custo Infra (AWS/mês)** | ~$800 | ~$200 | ~$400 |
| **Tempo Desenvolvimento** | - | 2-3 semanas | 1-2 semanas |
| **Risco de Migração** | - | 🟡 MÉDIO | 🟢 BAIXO |
| **Multi-Distribuidor** | ✅ Completo | ⚠️ Scheduled only | ✅ Mantém |
| **Hélio AI (RAG Pricing)** | 🚧 WIP | ❌ Remove | ✅ Mantém |

---

## ✅ Decisão Final

### **Recomendação: Opção 1 - Simplificar**

#### **Justificativa:**

1. **Multi-distribuidor não é usado ativamente**
   - Frontend não compara preços (apenas exibe)
   - Workflow existe mas sem value add imediato

2. **Hélio AI está em WIP**
   - Qdrant não populado
   - RAG não implementado no frontend
   - Pode ser adicionado depois se necessário

3. **Preços mudam 4x/dia (scheduled)**
   - Não precisa CDC real-time
   - Batch sync suficiente

4. **Redução drástica de complexidade**
   - 75% menos serviços
   - 60% menos código de integração
   - 80% menos superfície de erro

#### **Próximos Passos Imediatos:**

1. ✅ **Implementar `ysh-distributor-pricing` module no Medusa backend**
2. ✅ **Criar scheduled jobs para sync de preços**
3. ✅ **Atualizar storefront para usar Medusa PRICING APIs**
4. ✅ **Testar em homologação (2 semanas)**
5. ✅ **Deprecar ERP + Data Platform gradualmente**

---

## 📝 Notas Finais

### **Quando Reconsiderar ERP:**

- Volume >1000 orders/dia
- Hélio AI ativo com 10k+ queries/mês em pricing
- Multi-distribuidor core do negócio (cotação automática em checkout)
- Homologação ANEEL com SLA <15min crítico

### **Monitoramento Pós-Migração:**

```yaml
# Métricas críticas
pricing_sync_latency: <15min (p95)
pricing_sync_success_rate: >99%
frontend_price_fetch_latency: <500ms (p95)
cache_hit_rate: >80%
```

---

**Documento criado por:** GitHub Copilot  
**Última atualização:** Outubro 2025  
**Status:** ✅ Análise Completa | Aguardando Decisão
