# Workflow Hooks - Validações de Viabilidade Técnica

## 🎯 Overview

**Workflow Hooks** (Medusa v2.10.3) permitem interceptar workflows core do Medusa em pontos específicos para adicionar validações, transformações e lógica customizada sem modificar o código core.

Para projetos solares, implementamos hooks que validam automaticamente a viabilidade técnica antes de permitir o checkout.

## 📋 Validações Implementadas

### Erros Bloqueantes (Impedem Checkout)

#### 1. Irradiação Solar Insuficiente

**Mínimo**: 3.5 kWh/m²/dia  
**Razão**: Abaixo deste valor, o ROI é muito baixo e o projeto não é economicamente viável.

```typescript
if (irradiation < 3.5) {
  throw new Error("Irradiação solar insuficiente para viabilidade econômica");
}
```

#### 2. Área de Telhado Insuficiente

**Cálculo**: ~7m² por kWp (considerando espaçamento entre painéis)  
**Exemplo**: Sistema de 5 kWp precisa de pelo menos 35m²

```typescript
const required_area = capacity_kwp * 7;
if (roof_area_m2 < required_area) {
  throw new Error("Área de telhado insuficiente");
}
```

#### 3. Capacidade Muito Baixa

**Mínimo**: 1.5 kWp  
**Razão**: Custos fixos de instalação (mão de obra, projeto, homologação) inviabilizam sistemas muito pequenos.

```typescript
if (capacity_kwp < 1.5) {
  throw new Error("Capacidade muito baixa - custo fixo inviabiliza o projeto");
}
```

### Warnings (Não Bloqueiam, Mas Alertam)

#### 1. Irradiação Baixa (3.5 - 4.0 kWh/m²/dia)

⚠️ Projeto viável mas ROI será menor que a média nacional (~4.5 kWh/m²/dia)

#### 2. Área Justa (< 20% margem)

⚠️ Pouca margem para manutenção e limpeza

#### 3. Equipamento Especial Necessário

⚠️ Laje + capacidade > 30 kWp → Requer guindaste  
⚠️ Industrial + capacidade > 50 kWp → Estudo estrutural detalhado

#### 4. Logística Complexa

⚠️ Rural + distância > 100km → Prazo e custo aumentados

## 🛠️ Implementação

### Backend Hooks

#### 1. `validateSolarFeasibilityWorkflow`

**Localização**: `backend/src/workflows/hooks/validate-solar-feasibility.ts`

**Workflow standalone** que pode ser executado manualmente ou integrado com outros fluxos.

```typescript
export const validateSolarFeasibilityWorkflow = createWorkflow(
  "validate-solar-feasibility",
  function (input: { cart: CartDTO }) {
    const validation = validateSolarProjectStep({ cart: input.cart });
    return new WorkflowResponse(validation);
  }
);
```

**Output**:

```typescript
{
  is_feasible: boolean;
  blocking_errors: string[];
  warnings: string[];
  validation_details: {
    irradiation_check: { passed, value, minimum };
    roof_area_check: { passed, available_m2, required_m2 };
    capacity_check: { passed, value_kwp, minimum_kwp };
    crane_required: boolean;
    installation_complexity: "low" | "medium" | "high" | "very_high";
  };
}
```

#### 2. `validate-solar-checkout.ts`

**Localização**: `backend/src/workflows/hooks/validate-solar-checkout.ts`

**Hook registrado** no `completeCartWorkflow` que bloqueia checkout se projeto não é viável.

```typescript
completeCartWorkflow.hooks.validate(
  async ({ cart }: { cart: CartDTO }) => {
    if (cart.metadata?.tipo_produto !== "sistema_solar") {
      return; // Skip não-solares
    }
    
    const { result } = await validateSolarFeasibilityWorkflow.run({ input: { cart } });
    
    if (!result.is_feasible) {
      throw new Error("Projeto solar não viável. Checkout bloqueado.");
    }
  }
);
```

**Fluxo**:

1. User clica "Finalizar Pedido"
2. `completeCartWorkflow` inicia
3. Hook `validate` intercepta
4. Executa `validateSolarFeasibilityWorkflow`
5. Se não viável → **throw Error** → Checkout bloqueado
6. Se viável → Prossegue normalmente

#### 3. API Route para Validação Manual

**Localização**: `backend/src/api/store/solar/validate-feasibility/route.ts`

**Endpoint**: POST `/store/solar/validate-feasibility`

**Body**:

```json
{
  "cart_id": "cart_01J..."
}
```

**Response 200 (Viável)**:

```json
{
  "is_feasible": true,
  "blocking_errors": [],
  "warnings": [
    "⚠️ Irradiação baixa (3.8 kWh/m²/dia). ROI será menor que a média."
  ],
  "validation_details": { ... },
  "message": "✅ Projeto solar viável. Pode prosseguir com o checkout."
}
```

**Response 422 (Inviável)**:

```json
{
  "is_feasible": false,
  "blocking_errors": [
    "❌ Irradiação solar insuficiente: 2.8 kWh/m²/dia (mínimo: 3.5)",
    "❌ Área de telhado insuficiente: 25m² disponível, 35.0m² necessário"
  ],
  "warnings": [],
  "validation_details": { ... },
  "message": "❌ Projeto solar não viável. Ajuste os parâmetros antes de prosseguir."
}
```

### Storefront Integration

#### Server Action

**Localização**: `storefront/src/lib/data/solar-validation.ts`

```typescript
export const validateSolarFeasibility = async (
  cart_id: string
): Promise<{ success: boolean; data?: SolarFeasibilityValidation; error?: string }> => {
  const response = await sdk.client.fetch<SolarFeasibilityValidation>(
    `/store/solar/validate-feasibility`,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ cart_id }),
    }
  );
  
  return { success: response.is_feasible, data: response };
};
```

#### Componente React

**Localização**: `storefront/src/modules/solar/components/feasibility-checker.tsx`

**Features**:

- Botão de validação com loading state
- Cards de status (verde/vermelho) baseado em viabilidade
- Lista de erros bloqueantes (se houver)
- Lista de warnings (amarelo)
- Grid de detalhes técnicos (irradiação, área, capacidade)
- Badge de complexidade de instalação
- Indicador de necessidade de guindaste

**Usage**:

```tsx
<SolarFeasibilityChecker
  cart_id={cart.id}
  onValidationComplete={(is_feasible) => {
    if (is_feasible) {
      // Permitir checkout
    } else {
      // Bloquear botão de checkout
    }
  }}
/>
```

## 🔄 Fluxo Completo de Validação

### Durante Configuração do Projeto

1. User preenche calculadora solar (capacidade, localização, tipo telhado)
2. Dados são salvos no metadata do carrinho
3. **User clica "Validar Viabilidade"**
4. Component chama `validateSolarFeasibility(cart_id)`
5. Backend executa workflow de validação
6. Frontend exibe resultado:
   - ✅ Verde → "Projeto viável, pode prosseguir"
   - ⚠️ Amarelo → "Viável mas com ressalvas"
   - ❌ Vermelho → "Não viável, ajuste parâmetros"

### Durante Checkout

1. User clica "Finalizar Pedido" após aprovações
2. `completeCartWorkflow` inicia
3. **Hook `validate-solar-checkout` intercepta**
4. Executa validação automática
5. Se não viável:
   - **throw Error** com mensagem detalhada
   - Checkout é bloqueado
   - User vê erro na UI
6. Se viável:
   - Workflow prossegue
   - Pedido é criado

## 📊 Complexidade de Instalação

| Tipo | Telhado | Capacidade | Complexidade | Detalhes |
|------|---------|-----------|--------------|----------|
| Residential | Cerâmica/Metálico | ≤ 10 kWp | **Baixa** | Instalação padrão |
| Residential | Laje | ≤ 10 kWp | **Média** | Estrutura elevada |
| Commercial | Qualquer | ≤ 30 kWp | **Média** | Logística + documentação |
| Laje | Qualquer | > 30 kWp | **Alta** | 🏗️ Requer guindaste |
| Industrial | Qualquer | > 50 kWp | **Muito Alta** | Estudo estrutural + equipamentos pesados |
| Rural | Qualquer | > 20 kWp | **Alta** | Logística complexa |

## 🎯 Casos de Uso Reais

### ✅ Caso 1: Residencial Viável

```json
{
  "capacity_kwp": 5.5,
  "irradiation_kwh_m2_day": 5.2,
  "roof_type": "ceramica",
  "building_type": "residential",
  "roof_area_m2": 45
}
```

**Resultado**: ✅ Viável (sem warnings)  
**Complexidade**: Baixa

### ⚠️ Caso 2: Comercial com Warnings

```json
{
  "capacity_kwp": 25,
  "irradiation_kwh_m2_day": 3.9,
  "roof_type": "laje",
  "building_type": "commercial",
  "roof_area_m2": 180
}
```

**Resultado**: ✅ Viável (com warnings)  
**Warnings**:

- Irradiação baixa (3.9 < 4.0)
- Área justa (180m² vs 175m² necessário)

**Complexidade**: Média

### ❌ Caso 3: Inviável - Irradiação Baixa

```json
{
  "capacity_kwp": 8,
  "irradiation_kwh_m2_day": 3.2,
  "roof_type": "metalico",
  "building_type": "residential",
  "roof_area_m2": 60
}
```

**Resultado**: ❌ Não viável  
**Erros Bloqueantes**:

- Irradiação insuficiente (3.2 < 3.5)

### ❌ Caso 4: Inviável - Área Insuficiente

```json
{
  "capacity_kwp": 10,
  "irradiation_kwh_m2_day": 5.0,
  "roof_type": "ceramica",
  "building_type": "residential",
  "roof_area_m2": 50
}
```

**Resultado**: ❌ Não viável  
**Erros Bloqueantes**:

- Área insuficiente (50m² vs 70m² necessário)

## 🚀 Próximos Passos

1. **Logging**: Adicionar logs de validações para analytics
2. **Metrics**: Track taxa de projetos inviáveis por região
3. **AI Suggestions**: Sugerir ajustes automáticos (ex: reduzir capacidade para caber no telhado)
4. **Integration**: Conectar com API de irradiação solar (CRESESB/INPE)

## 📚 References

- [Medusa Workflow Hooks](https://docs.medusajs.com/resources/references/workflows/hooks)
- [completeCartWorkflow](https://docs.medusajs.com/resources/references/core-flows#completecartworkflow)
- Internal: `backend/src/workflows/hooks/validate-solar-feasibility.ts`
- Internal: `backend/src/workflows/hooks/validate-solar-checkout.ts`
