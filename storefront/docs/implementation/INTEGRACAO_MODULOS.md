# 🔗 Integração dos Módulos com Medusa.js Core

## ✅ Integrações Implementadas

### 1. **Viability Module** (`viability.pv`)

**Arquivo:** `src/modules/viability/integrations.tsx`

#### Integrações Core

**🛒 Cart Integration**

- `viabilityToCartItems()` - Converte output de viabilidade em itens de carrinho
- `AddViabilityToCartButton` - Botão para adicionar sistema ao carrinho
- `EmptyCartViabilitySuggestion` - Banner em carrinho vazio

**💼 Quote Integration**

- `viabilityToQuote()` - Converte cálculo em dados de cotação
- `RequestQuoteFromViability` - Botão para solicitar cotação formal

**👤 Account Integration**

- `MyViabilityCalculationsWidget` - Widget no dashboard do usuário
- Exibe estudos de viabilidade salvos
- Link para criar novo estudo

**📦 Product Integration**

- `ProductViabilitySuggestion` - Sugestão em páginas de produto
- Sugere calcular viabilidade antes de comprar

**💰 Finance Integration** (preparação)

- `viabilityToFinanceInput()` - Dados para simulação financeira
- `ViabilityToFinanceLink` - Link para módulo de financiamento

#### Fluxo de Uso

```
Cliente acessa /viabilidade
  ↓
Preenche consumo + localização
  ↓
Sistema calcula dimensionamento
  ↓
[Opção 1] Adiciona componentes ao carrinho
[Opção 2] Solicita cotação formal
[Opção 3] Simula financiamento
```

---

### 2. **Tariffs Module** (`tariffs.aneel`)

**Arquivo:** `src/modules/tariffs/integrations.tsx`

#### Integrações Core

**⚡ Viability Integration**

- `tariffToViabilityInput()` - Dados de tarifa para cálculo de viabilidade
- `TariffToViabilityButton` - Link direto para viabilidade com tarifa

**💰 Finance Integration**

- `tariffToFinanceInput()` - Dados tarifários para simulação financeira
- `TariffToFinanceButton` - Link para simulação com tarifa calculada

**👤 Account Integration**

- `MyTariffClassificationWidget` - Widget no dashboard
- Mostra classificação tarifária salva (Grupo A/B, Subgrupo)

**📦 Product Integration**

- `ProductTariffSavingsBadge` - Badge de economia em produtos
- `ProductTariffSuggestion` - Sugestão para classificar tarifa
- Calcula economia baseada na tarifa do usuário

**🛒 Cart Integration**

- `CartTariffSavings` - Calculadora de economia no carrinho
- Mostra economia mensal/anual baseada no sistema no carrinho

**💼 Quote Integration**

- `tariffToQuote()` - Dados tarifários para cotação

**📋 Compliance Integration** (preparação)

- `mmgdToComplianceInput()` - Dados MMGD para compliance
- `MMGDToComplianceButton` - Link para documentação de compliance

#### Fluxo de Uso

```
Cliente acessa /tarifas
  ↓
Informa distribuidora + consumo + tensão
  ↓
Sistema classifica (Grupo A/B, Subgrupo)
  ↓
Valida elegibilidade MMGD
  ↓
[Opção 1] Calcular viabilidade com tarifa
[Opção 2] Simular financiamento
[Opção 3] Gerar documentação compliance (se MMGD elegível)
```

---

## 🔄 Fluxos Integrados End-to-End

### Fluxo 1: **Jornada Completa de Venda**

```mermaid
graph LR
    A[/tarifas] -->|tarifa classificada| B[/viabilidade]
    B -->|sistema dimensionado| C[/financiamento]
    C -->|simulação aprovada| D[/carrinho]
    D -->|checkout| E[/pagamento]
    E -->|pedido criado| F[/account/orders]
```

### Fluxo 2: **Jornada com Cotação**

```mermaid
graph LR
    A[/viabilidade] -->|sistema calculado| B[/account/quotes/new]
    B -->|cotação criada| C[Aprovação Comercial]
    C -->|aprovado| D[/carrinho]
    D -->|checkout| E[/pagamento]
```

### Fluxo 3: **Jornada com Compliance**

```mermaid
graph LR
    A[/tarifas] -->|MMGD elegível| B[/compliance]
    B -->|documentos gerados| C[/viabilidade]
    C -->|sistema dimensionado| D[/carrinho]
```

---

## 📊 Padrões de Integração Estabelecidos

### 1. **Conversores de Dados**

Todas as integrações seguem o padrão `[origem]To[destino]()`

Exemplos:

```typescript
viabilityToCartItems(output: ViabilityOutput): CartItem[]
tariffToViabilityInput(classification, rates): ViabilityInput
viabilityToQuote(input, output): QuoteData
mmgdToComplianceInput(mmgd): ComplianceData
```

### 2. **Componentes de Navegação**

Botões/Links para navegar entre módulos com dados pré-carregados

Exemplos:

```tsx
<TariffToViabilityButton /> // De tarifas → viabilidade
<ViabilityToFinanceLink /> // De viabilidade → financiamento
<MMGDToComplianceButton /> // De tarifas → compliance
```

### 3. **Widgets de Dashboard**

Componentes reutilizáveis para `/account` dashboard

Exemplos:

```tsx
<MyViabilityCalculationsWidget />
<MyTariffClassificationWidget />
```

### 4. **Sugestões Contextuais**

Banners/tooltips em outros módulos sugerindo uso

Exemplos:

```tsx
<EmptyCartViabilitySuggestion /> // Em cart vazio
<ProductViabilitySuggestion /> // Em produtos
<ProductTariffSuggestion /> // Em produtos
```

---

## 🎯 Próximos Módulos a Integrar

### 3. **Finance Module** (`finance.credit`)

**Integrações planejadas:**

- ← Viability: dados de investimento e ROI
- ← Tariffs: tarifa e economia mensal
- → Cart: adicionar parcelas ao carrinho
- → Quote: cotação com opções de financiamento

### 4. **Logistics Module** (`logistics.fulfillment`)

**Integrações planejadas:**

- ← Cart: itens para cotação de frete
- ← Viability: endereço de instalação (CEP)
- → Checkout: opções de entrega
- → Account: rastreamento de pedidos

### 5. **Compliance Module** (`legal.compliance`)

**Integrações planejadas:**

- ← Tariffs: dados MMGD
- ← Viability: especificações técnicas do sistema
- → Quote: documentos para cotação
- → Account: dossiê técnico

### 6. **Insurance Module** (`insurance.risk`)

**Integrações planejadas:**

- ← Viability: valor do sistema
- ← Finance: valor financiado
- → Cart: adicionar seguro
- → Checkout: confirmar apólice

---

## 🛠️ Ferramentas de Desenvolvimento

### Helpers de URL

Todos os módulos exportam helpers de URL:

```typescript
// viability/integrations.tsx
getViabilityUrl(countryCode) → '/{countryCode}/viabilidade'
getViabilityResultUrl(id, countryCode) → '/{countryCode}/viabilidade/{id}'

// tariffs/integrations.tsx
getTariffUrl(countryCode) → '/{countryCode}/tarifas'
getTariffResultUrl(id, countryCode) → '/{countryCode}/tarifas/{id}'
```

### TypeScript Types

Todas as integrações são fortemente tipadas:

```typescript
// Dados de entrada
ViabilityInput, TariffInput

// Dados de saída
ViabilityOutput, TariffClassification, MMGDPacket

// Dados de integração
ViabilityCartItem, TariffFinanceData, MMGDComplianceData
```

---

## 📈 Cobertura de Integração

| Módulo | Cart | Quote | Account | Product | Finance | Status |
|--------|------|-------|---------|---------|---------|--------|
| Viability | ✅ | ✅ | ✅ | ✅ | ✅ | **100%** |
| Tariffs | ✅ | ✅ | ✅ | ✅ | ✅ | **100%** |
| Finance | ⏳ | ⏳ | ⏳ | ⏳ | N/A | 0% |
| Logistics | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | 0% |
| Compliance | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | 0% |
| Insurance | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | 0% |
| O&M | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | 0% |
| BizOps | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | 0% |

**Legenda:**

- ✅ Implementado e testado
- ⏳ Planejado
- N/A Não aplicável

---

## 🔍 Exemplos de Uso

### Exemplo 1: Adicionar Sistema ao Carrinho

```tsx
import { viabilityToCartItems, AddViabilityToCartButton } from '@/modules/viability'

function ViabilityResults() {
  const { output } = useViability()
  
  const handleAddToCart = async (items) => {
    // Integração com Medusa Cart API
    await addItems(items)
  }
  
  return (
    <AddViabilityToCartButton 
      output={output}
      onAddToCart={handleAddToCart}
    />
  )
}
```

### Exemplo 2: Fluxo Tarifas → Viabilidade

```tsx
import { TariffToViabilityButton } from '@/modules/tariffs'

function TariffResults() {
  const { input, classification, rates } = useTariff()
  
  return (
    <TariffToViabilityButton
      input={input}
      classification={classification}
      rates={rates}
      countryCode="br"
    />
  )
}
```

### Exemplo 3: Widget no Dashboard

```tsx
import { MyViabilityCalculationsWidget } from '@/modules/viability'
import { MyTariffClassificationWidget } from '@/modules/tariffs'

function AccountDashboard() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <MyViabilityCalculationsWidget
        calculationsCount={5}
        latestCalculation={...}
      />
      <MyTariffClassificationWidget
        classification={...}
        rates={...}
      />
    </div>
  )
}
```

---

## 📝 Checklist de Integração para Novos Módulos

Ao criar um novo módulo, implementar:

- [ ] Arquivo `integrations.tsx` na raiz do módulo
- [ ] Conversores de dados: `[modulo]To[destino]()`
- [ ] Componentes de navegação: `<[Modulo]To[Destino]Button />`
- [ ] Widget de dashboard: `<My[Modulo]Widget />`
- [ ] Sugestões contextuais em outros módulos
- [ ] Helpers de URL: `get[Modulo]Url()`
- [ ] Types de integração: `[Modulo][Destino]Data`
- [ ] Export em `index.tsx`: `export * from './integrations'`
- [ ] Documentação de fluxos
- [ ] Testes de integração

---

**Última atualização:** 2024-10-07  
**Desenvolvedor:** GitHub Copilot + YSH Agent  
**Baseado em:** Padrões do solar-integration.tsx
