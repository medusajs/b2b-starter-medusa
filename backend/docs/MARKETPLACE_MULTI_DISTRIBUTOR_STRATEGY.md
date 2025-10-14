# 🔄 Estratégia Multi-Distribuidor - YSH Marketplace

**Data:** 14 de Outubro de 2025  
**Versão:** 1.0.0  
**Documento Base:** MARKETPLACE_KIT_RULES.md

---

## 📋 Sumário Executivo

Este documento complementa as **Regras de Negócio do Marketplace** com **estratégia de contingência multi-distribuidor**, garantindo que cada recomendação de kit tenha **3-4 opções alternativas** para mitigar riscos de falta de estoque.

---

## 🎯 Objetivos da Estratégia

### Problemas Resolvidos

1. **Risco de Ruptura de Estoque**: FortLev domina 85-95% do inventário
2. **Dependência de Fornecedor Único**: Falta de alternativas em caso de indisponibilidade
3. **Variação Regional**: Prazos de entrega diferentes por região
4. **Preferências do Cliente**: Alguns clientes preferem marcas/tecnologias específicas

### Benefícios

- ✅ **Resiliência**: 3-4 opções por cenário de consumo
- ✅ **Flexibilidade**: Cliente escolhe entre custo, tecnologia ou prazo
- ✅ **Cobertura Geográfica**: Distribuidores em diferentes regiões
- ✅ **Diversificação**: Reduz risco comercial

---

## 📊 Mapeamento de Distribuidores

### Distribuidor 1: FortLev 🥇

**Perfil**: Líder de mercado em kits grid-tie completos

- **Estoque**: 85-95% dos kits disponíveis (2-9kWp)
- **Fabricantes**: LONGi, Risen, BYD, Growatt, Sungrow
- **Custo/Watt**: R$ 1,20 - R$ 1,40/Wp (melhor custo/benefício)
- **CD**: São Paulo (entrega 3-5 dias Sudeste, 5-10 dias outras regiões)
- **Vantagens**:
  - Maior variedade de kits prontos
  - Melhor preço por escala
  - Garantia estendida LONGi (30 anos)
- **Desvantagens**:
  - Dependência de fornecedor único
  - Kits > 10kWp limitados

---

### Distribuidor 2: FOTUS 🥈

**Perfil**: Especialista em sistemas modulares e híbridos

- **Estoque**: 3-8% dos kits, foco em sistemas modulares
- **Fabricantes**: Solar N Plus, Deye, Risen (híbridos)
- **Custo/Watt**: R$ 2,00 - R$ 2,50/Wp (premium)
- **CD**: Espírito Santo (entrega 5-7 dias Sudeste, 7-10 dias Nordeste)
- **Vantagens**:
  - Sistemas com microinversor (maior redundância)
  - Kits híbridos com bateria
  - Tecnologia bifacial (Solar N Plus)
- **Desvantagens**:
  - Custo mais alto (+50-80% vs FortLev)
  - Estoque limitado de kits pequenos

---

### Distribuidor 3: NeoSolar 🥉

**Perfil**: Maior catálogo B2B, foco em off-grid e componentes

- **Estoque**: 2-5% dos kits, domina off-grid
- **Fabricantes**: Diversos (Ztroon, Freedom, Epever, JA Solar, Canadian Solar)
- **Custo/Watt**: Variável (R$ 1,50 - R$ 3,00/Wp)
- **CD**: São Paulo, Curitiba, Porto Alegre (entrega 3-7 dias)
- **Vantagens**:
  - Maior variedade de componentes avulsos
  - Forte em sistemas off-grid
  - Cobertura nacional
- **Desvantagens**:
  - Poucos kits grid-tie prontos < 10kWp
  - Preços menos competitivos em kits pequenos

---

### Distribuidor 4: ODEX 🔧

**Perfil**: B2B de componentes, ideal para projetos customizados

- **Estoque**: Componentes avulsos (sem kits prontos)
- **Fabricantes**: SAJ (inversores), diversos painéis
- **Custo/Watt**: R$ 1,50 - R$ 1,80/Wp (componentes)
- **CD**: Plataforma B2B (entrega 7-10 dias)
- **Vantagens**:
  - Inversores SAJ econômicos (R$ 1.599 - R$ 4.299)
  - Flexibilidade total de configuração
  - Bom para grandes projetos (> 30kWp)
- **Desvantagens**:
  - Sem kits prontos (requer montagem)
  - Prazo de entrega maior

---

## 🔀 Matriz de Decisão: Qual Distribuidor Recomendar?

| Cenário | 1ª Escolha | 2ª Escolha | 3ª Escolha | 4ª Escolha |
|---------|-----------|-----------|-----------|-----------|
| **Residencial < 3kWp** | FortLev (custo) | FOTUS (modular) | NeoSolar (off-grid) | ODEX (custom) |
| **Residencial 3-7kWp** | FortLev (variedade) | FortLev (alternativo) | NeoSolar (componentes) | ODEX (custom) |
| **Residencial 7-10kWp** | FortLev (kits prontos) | FortLev (oversized) | ODEX (componentes) | NeoSolar (custom) |
| **Comercial 10-30kWp** | Combinar 2 kits FortLev | ODEX (componentes) | NeoSolar (B2B) | Projeto customizado |
| **Comercial 30-100kWp** | Projeto customizado | ODEX (inversores) | NeoSolar (painéis) | FortLev (estruturas) |
| **Rural/Industrial > 100kWp** | Engenharia dedicada | Mix distribuidores | - | - |
| **Híbrido com bateria** | FOTUS (kits prontos) | NeoSolar (componentes) | Projeto customizado | - |
| **Off-Grid** | NeoSolar (especialista) | FOTUS (híbridos) | Projeto customizado | - |

---

## 📐 Regras de Recomendação por Tier

### Tier 1: Opção Principal (FortLev)

**Quando recomendar:**

- Cliente busca melhor custo/benefício
- Sistema residencial 2-9kWp
- Entrega rápida (3-5 dias Sudeste)
- Preferência por painéis Tier-1 (LONGi)

**Exemplo:**

```markdown
**Opção 1: FortLev** ⭐ RECOMENDADO
- Kit: fortlev_kit_020 (4.09kWp)
- Preço: R$ 5.457,30
- Componentes: 7x LONGi 585W + Growatt 3.6kW
- Custo/Watt: R$ 1,33/Wp ✅ MELHOR CUSTO/BENEFÍCIO
```

---

### Tier 2: Opção Alternativa (FOTUS/Outro FortLev)

**Quando recomendar:**

- Kit principal FortLev esgotado
- Cliente prefere microinversor (mais redundância)
- Sistema bifacial (maior geração em telhados brancos)
- Região Nordeste (CD Espírito Santo mais próximo)

**Exemplo:**

```markdown
**Opção 2: FOTUS (Sistema Modular)**
- Kit: 4x FOTUS-KP04 (4.56kWp total)
- Preço: R$ 10.032,00
- Componentes: 8x Solar N Plus 570W Bifacial + 4x Deye 2.25kW
- Vantagem: 4 microinversores independentes (maior confiabilidade)
```

---

### Tier 3: Opção Budget (Kit Ajustado)

**Quando recomendar:**

- Cliente com orçamento limitado
- Aceita sistema ligeiramente undersized (±10%)
- Não precisa de margem de segurança
- Consumo estável (sem crescimento esperado)

**Exemplo:**

```markdown
**Opção 3: FortLev Kit 3.78kWp** (Undersized)
- Kit: fortlev_kit_015 (3.78kWp)
- Preço: R$ 5.304,08
- Nota: ⚠️ 13% abaixo do ideal (3.78kWp vs 4.5kWp)
- Recomendação: Aceitar se consumo não crescer
```

---

### Tier 4: Opção Customizada (Componentes)

**Quando recomendar:**

- Todos os kits prontos esgotados
- Cliente quer marcas específicas
- Projeto comercial/industrial > 30kWp
- Preferência por inversores premium (SAJ, WEG, Fronius)

**Exemplo:**

```markdown
**Opção 4: Projeto Customizado (ODEX)**
- Componentes:
  - 8x Painéis LONGi 550W (ODEX) = R$ 4.400
  - 1x Inversor SAJ 4.2kW (ODEX) = R$ 1.899
- Preço Total: R$ 6.299,00
- Vantagem: Flexibilidade total de configuração
```

---

## 🚨 Cenários de Contingência

### Cenário 1: Kit Principal Esgotado

**Situação**: `fortlev_kit_020` (4.09kWp) fora de estoque

**Estratégia de Fallback**:

1. **Buscar kit equivalente FortLev** (±10% potência)
   - `fortlev_kit_015` (3.78kWp) ❌ -7,5% (undersized)
   - `fortlev_kit_034` (4.41kWp) ✅ +7,8% (aceitável)
2. **Se não houver, combinar 2 kits menores**
   - 2x `fortlev_kit_010` (3.51kWp cada = 7.02kWp) ⚠️ Oversized
3. **Recomendar FOTUS modular**
   - 4x `FOTUS-KP04` (1.14kWp cada = 4.56kWp)
4. **Última opção: componentes ODEX**
   - 8x Painéis 550W + Inversor SAJ 4.2kW

---

### Cenário 2: Região Sem CD Próximo

**Situação**: Cliente no Nordeste, FortLev demora 10-15 dias

**Estratégia de Fallback**:

1. **Priorizar FOTUS** (CD Espírito Santo → Nordeste 7-10 dias)
2. **Verificar NeoSolar** (CDs regionais em algumas capitais)
3. **Se urgente, aceitar custo maior** FOTUS modular
4. **Se pode esperar, manter FortLev** (melhor custo)

---

### Cenário 3: Cliente Prefere Tecnologia Específica

**Situação**: Cliente quer microinversor (Enphase/Deye)

**Estratégia**:

1. **FOTUS como 1ª opção** (microinversores Deye disponíveis)
2. **Projeto customizado** (importar Enphase via NeoSolar/outros)
3. **Educar sobre custo** (microinversor ~50-80% mais caro)
4. **Mostrar ROI** (payback 1-2 anos maior, mas confiabilidade superior)

---

### Cenário 4: Projeto > 30kWp (Comercial/Industrial)

**Situação**: Nenhum distribuidor tem kit pronto > 30kWp

**Estratégia**:

1. **Combinar múltiplos kits FortLev** (ex: 4x 8kWp = 32kWp)
2. **Componentes separados ODEX**:
   - Inversores SAJ 6-12kW (R$ 2.899 - R$ 4.299)
   - Painéis em grandes quantidades (negociar desconto)
3. **Mix de distribuidores**:
   - Painéis: NeoSolar (volume)
   - Inversores: ODEX (SAJ econômicos)
   - Estruturas: FortLev (acessórios)
4. **Engenharia dedicada** (> 100kWp): EPCista especializado

---

## 📊 Indicadores de Desempenho (KPIs)

### KPIs de Contingência

| Métrica | Meta | Atual | Status |
|---------|------|-------|--------|
| **Taxa de Disponibilidade** | > 95% | ? | 🟡 Medir |
| **Tempo Médio de Entrega** | < 7 dias | ? | 🟡 Medir |
| **Taxa de Fallback Tier 2** | < 15% | ? | 🟡 Medir |
| **Taxa de Fallback Tier 3+** | < 5% | ? | 🟡 Medir |
| **Satisfação com Alternativa** | > 85% | ? | 🟡 Medir |

### Alertas de Estoque

**Implementar notificações quando:**

- Kit com > 50 vendas/mês atinge < 20 unidades
- Distribuidor principal com disponibilidade < 80%
- Prazo de entrega > 10 dias (redirecionar para alternativa)
- Diferença de preço Tier 1 vs Tier 2 > 50% (revisar estratégia)

---

## 🔄 Workflow de Recomendação

```typescript
interface RecommendationRequest {
  monthlyConsumption: number;  // kWh/mês
  customerClass: 'residential' | 'commercial' | 'rural' | 'industrial';
  generationTier: 'moderate' | 'conscious' | 'accelerated';
  region: string;              // SP, MG, RJ, ES, etc.
  budget?: number;             // R$ (opcional)
  preferredBrand?: string;     // LONGi, Risen, etc. (opcional)
  urgency?: 'low' | 'medium' | 'high';  // Prazo de entrega
}

interface RecommendationResponse {
  tier1: KitRecommendation;    // FortLev principal
  tier2: KitRecommendation;    // Alternativa (FOTUS/outro FortLev)
  tier3?: KitRecommendation;   // Budget (undersized)
  tier4?: KitRecommendation;   // Customizado (ODEX)
  fallbackReason?: string;     // Motivo de fallback se Tier 1 indisponível
}

function recommendKits(request: RecommendationRequest): RecommendationResponse {
  // 1. Calcular potência necessária
  const requiredKWp = calculateRequiredPower(
    request.monthlyConsumption,
    request.generationTier
  );
  
  // 2. Buscar Tier 1 (FortLev)
  const tier1 = findBestFortLevKit(requiredKWp);
  
  // 3. Verificar disponibilidade Tier 1
  if (!tier1.inStock) {
    // Fallback: Buscar kit equivalente FortLev
    const alternativeFortLev = findEquivalentFortLevKit(requiredKWp, 0.10);
    if (alternativeFortLev) {
      tier1 = alternativeFortLev;
    }
  }
  
  // 4. Buscar Tier 2 (FOTUS ou alternativa)
  const tier2 = request.region in ['BA', 'PE', 'CE', 'AL'] 
    ? findFOTUSModularKit(requiredKWp)  // Priorizar FOTUS no Nordeste
    : findAlternativeFortLevKit(requiredKWp);
  
  // 5. Buscar Tier 3 (Budget - undersized aceitável)
  const tier3 = findBudgetKit(requiredKWp, 0.90);  // Aceitar até -10%
  
  // 6. Buscar Tier 4 (Componentes ODEX)
  const tier4 = buildCustomKitFromODEX(requiredKWp);
  
  return {
    tier1,
    tier2,
    tier3,
    tier4,
    fallbackReason: !tier1.inStock ? 'Tier 1 out of stock' : undefined
  };
}
```

---

## 📚 Documentação Relacionada

- **MARKETPLACE_KIT_RULES.md**: Regras de negócio completas (48 cenários)
- **ANALISE_EXECUTIVA_CONSOLIDADA.md**: Inventário consolidado de produtos
- **Backend Workflows**: `recommendation-engine.ts` (a implementar)

---

## 🔄 Versionamento

- **v1.0.0** (14/10/2025): Criação inicial com estratégia multi-distribuidor
- **Próximas Atualizações**:
  - Integrar API de estoque em tempo real
  - Implementar alertas de ruptura
  - Dashboard de KPIs de contingência

---

**Documento Confidencial - YSH Solar Hub**  
**Última Atualização:** 14 de Outubro de 2025, 16:45 BRT  
**Próxima Revisão:** 21 de Outubro de 2025
