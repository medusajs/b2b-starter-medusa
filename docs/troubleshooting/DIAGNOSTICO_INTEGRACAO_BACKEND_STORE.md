# 🔍 Diagnóstico de Integração Backend ↔ Storefront

**Data**: 2025-10-09  
**Status**: ⚠️ GAPS CRÍTICOS IDENTIFICADOS

---

## 📊 Visão Geral

### Backend (Medusa v2)

- **Localização**: `backend/`
- **Porta**: `9000`
- **Módulos Ativos**: Product, Pricing, Cart, Order, Payment, Tax, Region
- **Módulos Custom**: `YSH_PRICING_MODULE` ✅, `UNIFIED_CATALOG_MODULE` ✅
- **Módulos Desabilitados**: `YSH_CATALOG_MODULE` ⚠️, `COMPANY_MODULE`, `QUOTE_MODULE`, `APPROVAL_MODULE`

### Storefront (Next.js 15)

- **Localização**: `storefront/`
- **Porta**: `8000`
- **SDK**: `@medusajs/js-sdk` configurado
- **Backend URL**: `http://localhost:9000`
- **Publishable Key**: `pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d`

### Ambiente & CORS

```bash
# Backend
STORE_CORS=http://localhost:8000,http://localhost:3000
PORT=9000

# Storefront  
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_2786...
```

---

## 🚨 GAPS CRÍTICOS (Prioridade 1)

### 1. ❌ Módulo YSH_CATALOG_MODULE Desabilitado

**Problema**:

- Storefront consome `/store/catalog/*` (manufacturers, search, categorias, produtos)
- Rotas do backend resolvem `YSH_CATALOG_MODULE` via `req.scope.resolve()`
- Módulo está **comentado** em `medusa-config.ts` linha 5 e 60

**Arquivos Afetados**:

```
backend/src/api/store/catalog/route.ts:2
backend/src/api/store/catalog/[category]/route.ts:2
backend/src/api/store/catalog/[category]/[id]/route.ts:2
backend/src/api/store/catalog/manufacturers/route.ts:2
backend/src/api/store/catalog/search/route.ts:2
```

**Impacto**: 🔴 **CRÍTICO**

- Backend não inicia (erro: `Cannot resolve YSH_CATALOG_MODULE`)
- Páginas de produtos retornam 500
- Busca e navegação por categoria quebradas

**Solução**: Reativar módulo OU migrar rotas para `UNIFIED_CATALOG_MODULE`

---

### 2. ⚠️ Health Check Endpoint Incorreto

**Problema**:

- Store verifica: `GET ${BACKEND_URL}/health`
- Backend expõe: `GET /store/health`

**Arquivo**: `storefront/src/lib/api/fallback.ts:44`

```typescript
const HEALTH_CHECK_ENDPOINT = '/health'  // ❌ INCORRETO
```

**Impacto**: 🟡 **MÉDIO**

- Health check sempre falha
- Sistema aciona fallback desnecessariamente
- Dados estáticos são servidos mesmo com backend online

**Solução**: Trocar para `'/store/health'`

---

### 3. ⚠️ Publishable Key Ausente em Requisições Diretas

**Problema**:

- `storefront/src/lib/api/resilient.ts` faz `fetch()` direto sem headers
- Medusa v2 **exige** `x-publishable-api-key` para acessar sales channels
- Requisições sem key retornam vazio/erro → fallback é acionado

**Arquivo**: `storefront/src/lib/api/resilient.ts:241`

```typescript
const response = await fetch(`${BACKEND_URL}/store/products`, {
  // ❌ FALTA: headers: { 'x-publishable-api-key': ... }
})
```

**Impacto**: 🟡 **MÉDIO**

- Listagens de produtos vazias
- Fallback acionado incorretamente
- Produtos não vinculados ao sales channel ficam invisíveis

**Solução**: Adicionar header em todas as chamadas diretas

---

## ⚠️ RISCOS DE CONFIGURAÇÃO

### 4. Publishable Key vs Database

**Status**: ⚠️ NÃO VALIDADO

A key `pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d` precisa existir no banco.

**Validação**:

```bash
cd backend
yarn medusa exec ./src/scripts/create-publishable-key.ts
# Copiar key gerada para storefront/.env
```

### 5. Sales Channel × Produtos

**Status**: ⚠️ NÃO VALIDADO

Produtos devem estar vinculados ao "Default Sales Channel".

**Validação**:

```bash
cd backend
yarn medusa exec ./src/scripts/check-product-channels.ts
yarn medusa exec ./src/scripts/link-products-to-channel.ts
```

### 6. Regiões

**Status**: ✅ OK (com fallback)

Middleware do store tem fallback mock em dev, mas SDK usa regiões reais.
Em produção, garantir regiões criadas no Admin.

---

## 📦 INTEGRAÇÕES OK

### ✅ Carts + Bulk Line Items

- Store: `storefront/src/lib/data/cart.ts:219`
- Backend: `backend/src/api/store/carts/[id]/line-items/bulk/route.ts`
- Status: **FUNCIONANDO**

### ✅ Approvals

- Store: `storefront/src/lib/data/approvals.ts:44`
- Backend: `backend/src/api/store/approvals/route.ts`
- Status: **FUNCIONANDO** (exige JWT auth)

### ✅ Leads

- Store: `storefront/src/app/[countryCode]/(main)/cotacao/page.tsx:128`
- Backend: `backend/src/api/store/leads/route.ts`
- Status: **FUNCIONANDO**

### ✅ Analytics

- Store: `storefront/src/modules/analytics/events.ts`
- Backend: `backend/src/api/store/events/`
- Status: **FUNCIONANDO**

---

## 🔎 VARREDURA DE MÓDULOS FRONTEND

### APIs Next.js Existentes (17 rotas)

**Catalog** (10 rotas):

```
✅ /api/catalog/products
✅ /api/catalog/product/[id]
✅ /api/catalog/kits
✅ /api/catalog/kit/[id]
✅ /api/catalog/search
✅ /api/catalog/categories
✅ /api/catalog/featured
✅ /api/catalog/distributors
✅ /api/catalog/panels
✅ /api/catalog/inverters
✅ /api/catalog/batteries
```

**Outros**:

```
✅ /api/health
✅ /api/revalidate
✅ /api/finance/bacen-rates
✅ /api/onboarding/simulate
✅ /api/onboarding/geocode
✅ /api/cron/maintenance
```

### ❌ APIs Ausentes (Módulos com Refs Quebradas)

**Orders**:

- Usado em: `storefront/src/modules/account/hooks/useOrders.ts:118`
- Refs: `/api/orders/*` (NÃO EXISTE)

**Quotes**:

- Usado em: `storefront/src/modules/quotes/context/QuotesContext.tsx:91`
- Refs: `/api/quotes/*` (NÃO EXISTE)

**Financing**:

- Usado em: `storefront/src/modules/financing/components/FinancingSummary.tsx:74`
- Refs: `/api/cart/line-items` (NÃO EXISTE)

**Compliance**:

- Usado em: `storefront/src/modules/compliance/page.tsx:59`
- Refs: `/api/compliance/*` (NÃO EXISTE)

**Tariffs**:


---

## 🎨 Melhorias de UI/UX aplicadas

- Filtros e ordenação (RefinementList)
  - Navegação mais suave: `router.replace` em vez de `push` ao alterar filtros/sort (não polui o histórico).
  - Sidebar “sticky” em telas grandes para manter filtros visíveis durante a rolagem.
  - Botão “Limpar filtros” que remove todos os query params e reseta a listagem.
  - Acessibilidade: rotulagem ARIA no container de filtros.
  - Arquivo: `storefront/src/modules/store/components/refinement-list/index.tsx`

- Busca em resultados (SearchInResults)
  - Virou client component funcional com debounce de 350ms e Enter para confirmar.
  - Atualiza a URL com `q` via `router.replace` e reseta `page` ao buscar.
  - Mantém o valor sincronizado quando a navegação altera a URL.
  - Arquivo: `storefront/src/modules/store/components/refinement-list/search-in-results/index.tsx`

- Lista de produtos (PLP)
  - Cabeçalho com “Mostrando X–Y de Z” e `aria-live` para feedback.
  - Marcadores `role=list`/`role=listitem` no grid para melhor leitura assistiva.
  - Suporte a parâmetro `q` integrado à chamada da Store API.
  - Arquivo: `storefront/src/modules/store/templates/paginated-products.tsx`

- Página inicial (Home)
  - Imports dinâmicos (`ssr: false`) para seções pesadas (Videos*, Testimonials, DesignSystemTest) com skeletons de carregamento.
  - Mantém SEO dos blocos críticos (Hero/CTAs) renderizados no server.
  - Arquivo: `storefront/src/app/[countryCode]/(main)/page.tsx`

- Landing de categorias
  - `aria-label` nos cartões, foco visível (focus ring) e ícone decorativo marcado como `aria-hidden`.
  - Arquivo: `storefront/src/app/[countryCode]/(main)/categories/page.tsx`

---

## ✅ Checklists

### UI/UX (pendências recomendadas)
- [ ] Empty states consistentes em loja/coleções com CTA duplo (“Voltar à loja” e “Falar com especialista”).
- [ ] Mostrar badge de filtros ativos e atalho “Limpar” no cabeçalho da ordenação.
- [ ] Avaliar `next/image` em galerias/banners adicionais para placeholders e lazy.
- [ ] Landmarks HTML5 (`<main>`, `<section aria-label>`), onde ainda faltar, para navegação assistiva.
- [ ] Telemetria: instrumentar busca (q) e interações de filtro para analytics.

### Integração (seguir sequência após UI)
- [ ] Corrigir health check no store: `HEALTH_CHECK_ENDPOINT` → `/store/health` em `storefront/src/lib/api/fallback.ts`.
- [ ] Adicionar header `x-publishable-api-key` em `storefront/src/lib/api/resilient.ts` nas chamadas diretas.
- [ ] Habilitar `YSH_CATALOG_MODULE` (ou migrar rotas para `UNIFIED_CATALOG_MODULE`).
- [ ] Gerar/validar Publishable Key no backend e atualizar `.env` do store.
- [ ] Vincular produtos ao “Default Sales Channel” (scripts já disponíveis).

- Usado em: `storefront/src/modules/tariffs/context/TariffContext.tsx:40`
- Refs: `/api/tariffs/*` (NÃO EXISTE)

**Viability**:

- Usado em: `storefront/src/modules/viability/context/ViabilityContext.tsx:41`
- Refs: `/api/viability/*` (NÃO EXISTE)

### Módulos OK (Usam lib/data + SDK)

✅ **Cart** → `storefront/src/lib/data/cart.ts`  
✅ **Checkout** → `storefront/src/lib/data/checkout.ts`  
✅ **Products** → `storefront/src/lib/data/products.ts`  
✅ **Categories** → `storefront/src/lib/data/categories.ts`  
✅ **Collections** → `storefront/src/lib/data/collections.ts`  
✅ **Store** → `storefront/src/lib/data/regions.ts`

---

## 🛠️ PLANO DE CORREÇÃO

### Fase 1: CRÍTICO (Imediato)

#### 1.1 Escolher Estratégia de Catálogo

**Opção A**: Reativar `YSH_CATALOG_MODULE`

```typescript
// backend/medusa-config.ts
import { YSH_CATALOG_MODULE } from "./src/modules/ysh-catalog";

modules: {
  [YSH_CATALOG_MODULE]: {
    resolve: "./modules/ysh-catalog",
  },
}
```

**Opção B**: Migrar Rotas para `UNIFIED_CATALOG_MODULE` ⭐ **RECOMENDADO**

- Já possui PostgreSQL com dados seeded (37 mfrs, 511 SKUs, 724 offers)
- Service reescrito com conexão PG
- Manter consistência com catálogo unificado

#### 1.2 Corrigir Health Check

```typescript
// storefront/src/lib/api/fallback.ts:44
- const HEALTH_CHECK_ENDPOINT = '/health'
+ const HEALTH_CHECK_ENDPOINT = '/store/health'
```

#### 1.3 Adicionar Publishable Key Header

```typescript
// storefront/src/lib/api/resilient.ts
const headers = {
  'Content-Type': 'application/json',
  'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
}

const response = await fetch(`${BACKEND_URL}/store/products`, {
  headers,
  ...options
})
```

### Fase 2: VALIDAÇÃO (Curto Prazo)

#### 2.1 Validar Publishable Key

```bash
cd backend
yarn medusa exec ./src/scripts/create-publishable-key.ts
# Atualizar storefront/.env com key gerada
```

#### 2.2 Vincular Produtos ao Sales Channel

```bash
cd backend
yarn medusa exec ./src/scripts/check-product-channels.ts
yarn medusa exec ./src/scripts/link-products-to-channel.ts
```

### Fase 3: REFATORAÇÃO (Médio Prazo)

#### 3.1 Criar Next APIs Ausentes OU Refatorar

**Opção A**: Criar rotas em `storefront/src/app/api/`:

- `/api/orders/*`
- `/api/quotes/*`
- `/api/cart/line-items`
- `/api/compliance/*`
- `/api/tariffs/*`
- `/api/viability/*`

**Opção B**: Refatorar módulos para usar `lib/data/*` diretamente ⭐ **RECOMENDADO**

- Evita duplicação de lógica
- Melhor manutenibilidade
- Consistência com outros módulos

---

## 📋 CHECKLIST DE VALIDAÇÃO

### Ambiente

- [x] CORS configurado: `http://localhost:8000,3000`
- [x] Backend rodando na porta `9000`
- [x] Storefront aponta para `http://localhost:9000`
- [x] Publishable key definida no `.env`

### Módulos

- [ ] `YSH_CATALOG_MODULE` ou `UNIFIED_CATALOG_MODULE` ativo
- [x] `YSH_PRICING_MODULE` ativo
- [x] `UNIFIED_CATALOG_MODULE` ativo
- [ ] Validar módulos custom: COMPANY, QUOTE, APPROVAL

### APIs

- [ ] Health check retorna 200: `GET /store/health`
- [ ] Manufacturers lista: `GET /store/catalog/manufacturers`
- [ ] SKUs lista: `GET /store/catalog/skus`
- [ ] Kits lista: `GET /store/catalog/kits`
- [ ] Products com publishable key funcionam

### Database

- [x] PostgreSQL rodando (porta 5432)
- [x] Catálogo unificado seeded (37+511+724+101 registros)
- [ ] Publishable key existe no banco
- [ ] Produtos vinculados ao sales channel
- [ ] Regiões criadas

---

## 🎯 DECISÃO RECOMENDADA

### Opção: Migrar Totalmente para UNIFIED_CATALOG_MODULE

**Motivos**:

1. ✅ Database já populado com 1,373 registros
2. ✅ Service PostgreSQL implementado e testado
3. ✅ Estrutura padronizada (manufacturers, SKUs, offers, kits)
4. ✅ Melhor performance (queries SQL vs leitura de JSON)
5. ✅ Suporte a preços multi-distribuidor
6. ✅ Integração futura com Hélio Copilot

**Ações**:

1. Manter `UNIFIED_CATALOG_MODULE` ativo
2. Migrar 5 rotas de `/store/catalog/*` para usar `UNIFIED_CATALOG_MODULE`
3. Atualizar imports de `YSH_CATALOG_MODULE` → `UNIFIED_CATALOG_MODULE`
4. Testar endpoints com dados reais do PostgreSQL

**Arquivos a Alterar**:

```
backend/src/api/store/catalog/route.ts
backend/src/api/store/catalog/[category]/route.ts
backend/src/api/store/catalog/[category]/[id]/route.ts
backend/src/api/store/catalog/manufacturers/route.ts
backend/src/api/store/catalog/search/route.ts
```

---

## 📈 IMPACTO ESPERADO

### Após Correções Críticas (Fase 1)

- ✅ Backend inicia sem erros
- ✅ Páginas de produtos funcionam
- ✅ Busca e filtros operacionais
- ✅ Health check correto
- ✅ Fallback usado apenas quando necessário

### Após Validação (Fase 2)

- ✅ Produtos visíveis no storefront
- ✅ Preços corretos por sales channel
- ✅ Regiões funcionando

### Após Refatoração (Fase 3)

- ✅ Todos os módulos frontend operacionais
- ✅ Arquitetura consistente
- ✅ Manutenibilidade melhorada

---

## 🔗 Próximos Passos

1. **Decidir**: YSH_CATALOG vs UNIFIED_CATALOG
2. **Aplicar**: Correções críticas (Fase 1)
3. **Validar**: Endpoints e database (Fase 2)
4. **Testar**: Fluxo completo storefront → backend
5. **Refatorar**: APIs ausentes (Fase 3)

---

**Gerado em**: 2025-10-09  
**Próxima Revisão**: Após aplicação das correções críticas
