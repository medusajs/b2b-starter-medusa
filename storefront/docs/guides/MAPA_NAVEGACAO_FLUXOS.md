# 🗺️ Mapa de Navegação e Fluxos - YSH Storefront

## Arquitetura de Informação Completa

> **Versão:** 1.0  
> **Data:** 08/10/2025  
> **Status:** ✅ Completo - 🟡 Parcial - ❌ Vazio

---

## 📐 Arquitetura de Navegação

```tsx
┌────────────────────────────────────────────────────────────────┐
│                        HOMEPAGE (/)                             │
│  ✅ Hero + Featured Products + Testimonials + OnboardingCTA    │
└─────┬──────────────────────────────────────────────────────────┘
      │
      ├─────────────────────────────────────────────────────────┐
      │                                                           │
┌─────▼─────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐ │
│ PRODUTOS  │  │ SOLUÇÕES │  │  SOLAR   │  │    CONTA        │ │
│  ✅ 100%  │  │ ✅ 100%  │  │ ✅ 100%  │  │   ✅ 100%       │ │
└─────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────────────┘ │
      │             │              │             │               │
      │             │              │             │               │
```

---

## 🛍️ Módulo: PRODUTOS

### Estrutura de Rotas

```tsx
/produtos ✅
  │
  ├── /produtos/[category] ✅
  │     └── /produtos/[category]/[id] ✅ (Detalhe)
  │
  ├── /produtos/kits ✅
  │
  └── /produtos/comparar ✅

/catalogo ✅ (B2B Dense View)
/store ✅ (Vista Geral)
/search ✅
/categories/[...category] ✅
/collections/[handle] ✅
/products/[handle] ✅ (Rota alternativa)
```

### Jornada de Compra

```tsx
[Produtos] → [Detalhe] → [Add to Cart] → [Cart] → [Checkout]
    ✅          ✅            ✅            ✅         🟡
                                                    (85%)
```

**Gaps:**

- 🟡 Checkout: Payment integration incompleta
- 🟡 Checkout: Gift cards mencionados mas não implementados

---

## 🌞 Módulo: SOLAR (Calculadoras)

### Estrutura de Rotas

```tsx
/dimensionamento ✅
  └── Dimensionamento de sistema FV

/viabilidade ✅
  └── Análise técnico-econômica

/financiamento ✅
  └── Simulador de financiamento

/tarifas ✅
  └── Classificador de tarifas ANEEL

/solar-cv ✅
  ├── Panel Detection (NREL)
  ├── Thermal Analysis (PV-Hawk)
  └── Photogrammetry (ODM)

/compliance ❌ VAZIO
  └── Validação PRODIST + Dossiê

/seguros ❌ VAZIO
  └── Comparador de apólices
```

### Jornada Solar Completa (E2E)

```tsx
[Home] → [OnboardingCTA]
   ↓
[Dimensionamento] → [Viabilidade] → [Tarifas] → [Financiamento]
      ✅                ✅              ✅            ✅
   ↓
[Seguros] → [Compliance] → [Cotação] → [Checkout]
   ❌          ❌            ✅           🟡
```

**Gaps Críticos:**

- ❌ `/seguros` não implementado (jornada quebrada)
- ❌ `/compliance` não implementado (jornada quebrada)
- ⚠️ Dados não persistem entre etapas (falta `SolarJourneyContext`)

---

## 🏢 Módulo: CONTA & B2B

### Estrutura de Rotas

```tsx
/account ✅
  │
  ├── /account/profile ✅
  ├── /account/addresses ✅
  ├── /account/orders ✅
  │     └── /account/orders/details/[id] ✅
  │
  ├── /account/company ✅ (B2B)
  ├── /account/approvals ✅ (B2B)
  └── /account/quotes ✅ (B2B)
        └── /account/quotes/details ✅
```

### Jornada B2B

```tsx
[Catalogo] → [Bulk Add to Cart] → [Request Approval]
    ✅              🟡                    ✅
                (TODO #69)
     ↓
[Approval] → [Checkout B2B] → [Order Confirmed]
    ✅            🟡                ✅
               (85%)
```

**Gaps:**

- 🟡 Catalog: Bulk add to cart não implementado
- 🟡 Checkout: Específico B2B pode ter gaps

---

## 📦 Módulo: LOGÍSTICA & PÓS-VENDA

### Estrutura de Rotas

```tsx
/logistica ❌ VAZIO
  ├── Calculadora de frete
  ├── Rastreamento de pedidos
  ├── Agendamento de entrega
  └── Mapa de cobertura

/operacao-manutencao ❌ VAZIO
  ├── Dashboard de monitoramento
  ├── Alertas de performance
  ├── Tickets de manutenção
  └── Integração com inversores
```

### Jornada Pós-Venda

```tsx
[Order Confirmed] → [Tracking] → [Installation] → [O&M Dashboard]
       ✅              ❌             ❌                ❌
```

**Gaps Críticos:**

- ❌ Sem rastreamento de pedidos
- ❌ Sem dashboard de O&M
- ❌ Experiência pós-compra incompleta

---

## 🔍 Módulo: COTAÇÃO & LEAD

### Estrutura de Rotas

```tsx
/cotacao ✅
  └── Formulário de lead/cotação

/suporte ✅ (2 rotas)
  └── Central de ajuda
```

### Jornada de Lead

```
[Qualquer página] → [CTA Cotação] → [Form Cotação] → [Lead Created]
                          ✅              ✅                ✅
     ↓
[CRM Backend] → [Follow-up] → [Proposal] → [Conversion]
  (não visível)      ❌           ⚠️           ✅
```

**Gaps:**

- ❌ Sem dashboard de status de cotação (lado cliente)
- ⚠️ Lead criado mas follow-up não visível no frontend

---

## 📊 Módulo: BIZOPS (Interno)

### Estrutura de Rotas

```tsx
/dashboard ❌ VAZIO (Admin only)
  ├── KPIs de vendas (LTV, CAC, CR)
  ├── Pipeline de leads
  ├── Funil de conversão
  ├── Cohort analysis
  └── Métricas de produto
```

**Status:** Baixa prioridade (interno)

---

## 🎯 Fluxos Críticos (Status)

### 1. Compra Simples (B2C)

```tsx
Homepage → Produtos → Detalhe → Add to Cart → Cart → Checkout → Order
  ✅         ✅         ✅          ✅           ✅       🟡        ✅

Status: 95% (falta completar payment)
```

### 2. Cotação Solar Completa

```tsx
Home → Onboarding → Dimensionamento → Viabilidade → Tarifas → Financiamento
 ✅        ✅             ✅               ✅           ✅          ✅
  ↓
Seguros → Compliance → Cotação → Checkout
  ❌         ❌           ✅         🟡

Status: 65% (seguros e compliance faltando)
```

### 3. Compra B2B (Bulk)

```tsx
Login → Catalogo → Bulk Add → Cart → Approval → Checkout B2B → Order
 ✅       ✅         🟡       ✅       ✅          🟡           ✅

Status: 90% (bulk add e checkout específico)
```

### 4. Pós-Venda Completo

```tsx
Order → Payment → Tracking → Installation → O&M → Support
 ✅       ✅         ❌           ❌          ❌       ✅

Status: 40% (tracking, installation, O&M faltando)
```

---

## 🔗 Matriz de Conexões (Módulo → Módulo)

| De \ Para | Produtos | Solar | Checkout | Conta | Logística | O&M |
|-----------|----------|-------|----------|-------|-----------|-----|
| **Produtos** | - | ⚠️ (weak) | ✅ | ✅ | ❌ | ❌ |
| **Solar** | ⚠️ (weak) | ✅ | 🟡 | ✅ | ❌ | ❌ |
| **Checkout** | ✅ | ✅ | - | ✅ | ❌ | ❌ |
| **Conta** | ✅ | ✅ | ✅ | - | ❌ | ❌ |
| **Logística** | ❌ | ❌ | ❌ | ❌ | - | ❌ |
| **O&M** | ❌ | ⚠️ (solar-cv) | ❌ | ❌ | ❌ | - |

**Legenda:**

- ✅ Bem conectado
- 🟡 Parcialmente conectado
- ⚠️ Conexão fraca
- ❌ Não conectado

**Insights:**

- 🔴 Logística isolado (nenhuma conexão)
- 🔴 O&M isolado (apenas solar-cv)
- 🟡 Solar → Produtos conexão fraca (deveria sugerir produtos após viabilidade)
- 🟡 Produtos → Solar conexão fraca (deveria sugerir dimensionamento em PDPs)

---

## 📱 Componentes de Navegação

### Header Navigation

```tsx
┌─────────────────────────────────────────────────────────────┐
│ [Logo YSH]  [Produtos ▾]  [Soluções]  [Cotação]  [🛒] [👤] │
└─────────────────────────────────────────────────────────────┘
      ✅          ✅           ✅          ✅       ✅    ✅
```

**Mega Menu (Produtos):**

- ✅ Categorias
- ✅ Kits
- ✅ Catálogo (B2B)
- ✅ Comparar

**Dropdown (Conta):**

- ✅ Dashboard
- ✅ Pedidos
- ✅ Endereços
- ✅ Perfil
- ✅ Empresa (B2B)
- ✅ Cotações (B2B)

### Footer Navigation

```tsx
┌─────────────────────────────────────────────────────────────┐
│ [Produtos] [Soluções] [Ferramentas] [Empresa] [Suporte]    │
│    ✅         ✅           🟡           ✅         ✅        │
└─────────────────────────────────────────────────────────────┘
```

**Ferramentas (Footer):**

- ✅ Dimensionamento
- ✅ Financiamento
- ❌ Logística (link quebrado)
- ❌ O&M (link quebrado)

---

## 🎨 CTAs e Entry Points

### Homepage CTAs

```tsx
[Hero CTA] → /dimensionamento ✅
[Onboarding CTA] → /dimensionamento ✅
[Featured Products] → /produtos ✅
[Solutions by Class] → /solucoes ✅
[Testimonials] → (não tem CTA direto)
```

### Product Page CTAs

```tsx
[Add to Cart] → /cart ✅
[Comparar] → /produtos/comparar ✅
[Dimensionar para mim] → /dimensionamento ⚠️ (link fraco)
```

### Solar Journey CTAs

```tsx
[Viabilidade: Ver Kits] → /produtos/kits ✅
[Viabilidade: Cotação] → /cotacao ✅
[Financiamento: Solicitar] → /cotacao ✅
[Tarifas: Viabilidade] → /viabilidade ✅
[Tarifas: Compliance] → /compliance ❌ (link quebrado)
```

---

## 🚦 Gaps por Prioridade

### 🔴 Críticos (Bloqueiam Conversão)

1. `/compliance` não implementado
2. `/seguros` não implementado
3. Jornada solar quebrada (dados não persistem)
4. Checkout payment incompleto

### 🟡 Altos (Impactam UX)

1. `/logistica` não implementado (sem tracking)
2. `/operacao-manutencao` não implementado (sem pós-venda)
3. Bulk add to cart não implementado (B2B)
4. Solar → Produtos conexão fraca

### 🟢 Médios (Melhorias)

1. `/dashboard` BizOps não implementado
2. PDF exports pendentes
3. Produtos → Solar conexão fraca
4. Lead follow-up não visível

### 🔵 Baixos (Polish)

1. Image typings
2. Price list access
3. Deprecated code cleanup
4. Testes E2E

---

## 🎯 Recomendações de Arquitetura

### 1. Implementar Solar Journey Context

```typescript
// Unifica toda a jornada solar
const journey = useSolarJourney()

// Persiste dados entre etapas
journey.updateViability(data)
journey.next() // → Tarifas

// Retomar jornada
journey.resume('abc123')
```

### 2. Criar Product → Solar Bridge

```typescript
// Em Product Detail Page
<SolarCTA
  product={product}
  action="dimension"
  prefill={{ kwp: product.power_wp / 1000 }}
/>
// → Leva para /dimensionamento com pre-fill
```

### 3. Conectar Logística com Orders

```typescript
// Em Order Detail
<TrackingWidget orderId={order.id} />
// → Consome /api/logistics/track/[orderId]
```

### 4. Adicionar O&M ao Account Menu

```tsx
Conta
  ├── Dashboard
  ├── Pedidos
  ├── Meus Sistemas ← NOVO
  │   └── Monitoramento O&M
  └── ...
```

---

## 📊 Métricas de Navegação (Sugeridas)

### Implementar Tracking de

1. **Abandono de Jornada**
   - Qual etapa solar tem mais drop-off?
   - Onde usuários desistem no checkout?

2. **Navegação Cruzada**
   - % de usuários que vão de Produtos → Solar
   - % de usuários que vão de Solar → Produtos

3. **Efetividade de CTAs**
   - CTR de cada CTA principal
   - Conversão por entry point

4. **Profundidade de Navegação**
   - Número médio de páginas por sessão
   - Taxa de retorno ao home

---

## 🛠️ Ferramentas de Navegação Sugeridas

### Breadcrumbs

```tsx
✅ Implementado em:
  - Categories
  - Collections
  - Product Detail

❌ Faltando em:
  - Solar Journey (Dimensionamento → Viabilidade → ...)
  - Account (Dashboard → Orders → Detail)
```

### Progress Indicators

```tsx
❌ Faltando:
  - Solar Journey Stepper
  - Checkout Stepper
  - Onboarding Progress
```

### Mega Menu

```tsx
✅ Implementado:
  - Produtos (com categorias)

❌ Faltando:
  - Ferramentas (solar, logística, O&M)
  - Recursos (blog, guias, vídeos)
```

---

## 📈 Roadmap de Navegação

### Curto Prazo (Sprint 1-2)

- [ ] Implementar `/compliance` e `/seguros`
- [ ] Criar `SolarJourneyContext`
- [ ] Adicionar Solar Journey Stepper
- [ ] Completar checkout payment

### Médio Prazo (Sprint 3-4)

- [ ] Implementar `/logistica`
- [ ] Conectar Product → Solar
- [ ] Conectar Solar → Product (sugestão de kits)
- [ ] Adicionar breadcrumbs faltantes

### Longo Prazo (Sprint 5-7)

- [ ] Implementar `/operacao-manutencao`
- [ ] Adicionar Mega Menu de Ferramentas
- [ ] Implementar `/dashboard` BizOps
- [ ] Otimizar navegação mobile

---

**Preparado por:** GitHub Copilot (Hélio)  
**Data:** 08/10/2025  
**Versão:** 1.0
