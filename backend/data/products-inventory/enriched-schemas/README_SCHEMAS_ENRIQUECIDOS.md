# 🤖 YSH Solar - Schemas Enriquecidos com Análise LLM

> **Sistema de Enriquecimento Inteligente v1.0.0**  
> Análise comparativa de preços, KPIs, garantias, vida útil e certificações  
> **Data:** 14 de Outubro de 2025

---

## 🎯 Visão Geral

Este diretório contém **schemas enriquecidos** de todos os 16.532 produtos consolidados, processados por um engine de análise LLM que abstrai distribuidores e adiciona inteligência de negócio.

### ✨ Principais Recursos

- ✅ **Análise Comparativa de Preços** - Melhor preço, variação, recomendações
- ✅ **Scores de Qualidade** - Overall, Value, Quality, Reliability (0-100)
- ✅ **KPIs Técnicos** - Eficiência, degradação, MTBF, lifecycle
- ✅ **Certificações** - INMETRO, CE, TÜV, IEC standards
- ✅ **Garantias** - Produto, performance, extensões
- ✅ **Abstração de Distribuidores** - Melhor preço independente da fonte

---

## 📊 Resultados da Análise

### Scores Médios Globais

```tsx
╔═══════════════════════════════════════════════════╗
║  🎯 SCORES MÉDIOS DO INVENTÁRIO (0-100)           ║
╠═══════════════════════════════════════════════════╣
║  Overall Score:      51.9  🟡 Médio               ║
║  Value Score:        60.4  🟡 Valor médio         ║
║  Quality Score:      34.2  🟡 Qualidade média     ║
║  Reliability Score:  66.8  🟡 Confiabilidade média║
╚═══════════════════════════════════════════════════╝
```

### 💰 Análise de Preços

| Classificação | Produtos | % Total | Descrição |
|---------------|----------|---------|-----------|
| 🌟 **Excellent Deal** | 11.223 | **67.9%** | ≤5% acima do melhor preço |
| ✅ **Good Price** | 2.000 | **12.1%** | ≤ preço médio do mercado |
| 🟡 **Average** | 870 | **5.3%** | ≤15% acima do preço médio |
| 🔴 **Expensive** | 2.439 | **14.8%** | >15% acima do preço médio |

**Insight:** 67.9% dos produtos têm preços excelentes - oportunidade de arbitragem!

### 🏅 Certificações

| Certificação | Cobertura | Status |
|--------------|-----------|--------|
| **INMETRO** | 2.2% (369 produtos) | ⚠️ **GAP CRÍTICO** |
| **CE Marking** | 6.5% (1.072 produtos) | ⚠️ Baixa cobertura |
| **TÜV Certified** | 2.2% (369 produtos) | ⚠️ Baixa cobertura |

**Ação Necessária:** Priorizar fornecedores certificados e validar compliance.

### 📈 Performance por Categoria

| Categoria | Produtos | Overall Score | Preço Médio | Top Marca |
|-----------|----------|---------------|-------------|-----------|
| **Panels** 🥇 | 19 | **73.3** | R$ 617 | JinkoSolar, Longi, BYD |
| **Cables** | 20 | 59.9 | R$ 30 | - |
| **Inverters** | 59 | 57.3 | R$ 2.021 | Growatt, Deye |
| **Batteries** | 6 | 55.0 | R$ 8.476 | - |
| **Structures** | 26 | 54.2 | R$ 131 | - |
| **Kits** | 15.882 | 51.9 | R$ 1.414 | Neosolar, Deye |
| **Accessories** | 493 | 48.0 | R$ 661 | - |
| **Stringboxes** | 27 | 47.1 | R$ 591 | - |

**Destaque:** Painéis solares têm o melhor score geral (73.3) - produtos premium bem representados.

---

## 🏆 Top 10 Produtos (Overall Score)

| # | Produto | Fabricante | Categoria | Overall | Best Price | Recomendação |
|---|---------|------------|-----------|---------|------------|--------------|
| **1** | **Painel Jinko 610W** | JinkoSolar | Panels | **80.6** | **R$ 508** | 🌟 Excellent |
| **2** | **Painel Jinko 615W** | JinkoSolar | Panels | **80.6** | **R$ 508** | 🌟 Excellent |
| **3** | **Painel Longi LR7-72HTH-630M** | Longi | Panels | **80.6** | **R$ 696** | 🌟 Excellent |
| **4** | **Painel BYD BYD-530W-MLK-36** | BYD | Panels | **80.6** | **R$ 728** | 🌟 Excellent |
| 5 | Painel Longi LR7-72HTH-630M | Longi | Panels | 80.6 | R$ 696 | 🌟 Excellent |
| 6 | Painel BYD BYD-530W-MLK-36 | BYD | Panels | 80.6 | R$ 728 | 🌟 Excellent |
| 7 | Painel BYD BYD575HRP72S | BYD | Panels | 74.6 | R$ 728 | 🟡 Average |
| 8 | Painel BYD BYD575HRP72S | BYD | Panels | 74.6 | R$ 728 | 🟡 Average |
| 9 | NEP Dispositivo RSD 20A | Nep | Panels | 72.9 | R$ 912 | 🌟 Excellent |
| 10 | NEP Dispositivo RSD 20A | Nep | Panels | 72.9 | R$ 912 | 🌟 Excellent |

**Fabricantes Destaque:** JinkoSolar, Longi, BYD (Tier 1 internacional)

---

## 📁 Estrutura de Arquivos

```tsx
enriched-schemas/
├── README_SCHEMAS_ENRIQUECIDOS.md          # Este arquivo
│
├── enriched_products_2025-10-14_*.json     # 16.532 produtos completos
│
├── Por Categoria (8 arquivos):
│   ├── enriched_kits_*.json                # 15.882 kits
│   ├── enriched_accessories_*.json         # 493 acessórios
│   ├── enriched_inverters_*.json           # 59 inversores
│   ├── enriched_stringboxes_*.json         # 27 string boxes
│   ├── enriched_structures_*.json          # 26 estruturas
│   ├── enriched_cables_*.json              # 20 cabos
│   ├── enriched_panels_*.json              # 19 painéis
│   └── enriched_batteries_*.json           # 6 baterias
│
├── Relatórios de Análise:
│   ├── ENRICHED_SCHEMA_REPORT_*.md         # Relatório markdown completo
│   ├── price_analysis_report_*.json        # Análise de preços agregada
│   └── top_products_*.json                 # Top 50 por score/value/quality
│
└── Script Gerador:
    └── ../enrich_schemas_with_llm.py       # Engine de enriquecimento
```

---

## 🔍 Estrutura de Schema Enriquecido

Cada produto contém:

```json
{
  "id": "odex_panels_ODEX-PAINEL-ODEX-585W",
  "title": "Painel Solar Odex 585W",
  "sku": "ODEX-0W",
  "manufacturer": "Odex",
  "category": "panels",
  
  "price_analysis": {
    "best_price": 490.0,
    "worst_price": 519.0,
    "average_price": 505.6,
    "median_price": 505.0,
    "price_variance": 11.78,
    "distributors_count": 1,
    "best_distributor": "ODEX",
    "price_range_pct": 5.59,
    "price_recommendation": "excellent_deal"
  },
  
  "warranty": {
    "product_warranty_years": 12,
    "performance_warranty_years": 25,
    "performance_guarantee_pct": 80.0,
    "extendable": false,
    "coverage_scope": "standard"
  },
  
  "certifications": {
    "inmetro": false,
    "inmetro_code": null,
    "iec_standards": ["IEC 61215", "IEC 61730"],
    "ce_marking": true,
    "ul_listed": false,
    "tuv_certified": false,
    "iso_9001": false,
    "iso_14001": false,
    "certification_score": 35.0
  },
  
  "kpis": {
    "efficiency_pct": null,
    "performance_ratio": 0.85,
    "degradation_rate_annual": 0.5,
    "temperature_coefficient": -0.37,
    "mtbf_hours": null,
    "lifecycle_years": 30,
    "energy_payback_time_months": 24,
    "carbon_footprint_kg": null
  },
  
  "overall_score": 69.59,
  "value_score": 77.7,
  "quality_score": 55.4,
  "reliability_score": 80.4
}
```

---

## 📐 Metodologia de Scoring

### Overall Score (0-100)

**Fórmula:** `40% Quality + 30% Value + 30% Reliability`

Combina qualidade técnica, custo-benefício e confiabilidade em score unificado.

### Quality Score (0-100)

**Componentes:**

- **40% Certificações** - INMETRO (30pts), CE (20pts), TÜV (20pts), UL (15pts), IEC (15pts)
- **30% KPIs Técnicos** - Eficiência normalizada por categoria
- **30% Garantias** - Produto (60%) + Performance (40%)

### Value Score (0-100)

**Componentes:**

- **50% Preço Relativo** - Excellent (100pts), Good (80pts), Average (60pts), Expensive (40pts)
- **50% Qualidade vs Preço** - Quality Score ponderado

### Reliability Score (0-100)

**Componentes:**

- **40% MTBF** - Mean Time Between Failures normalizado (50k-150k horas)
- **30% Vida Útil** - Lifecycle years (normalizado para 30 anos)
- **30% Garantias** - Score de garantia do produto

---

## 🎯 Recomendações de Uso

### Para Equipe de Vendas

1. **Foque nos "Excellent Deals"** (67.9% do inventário)
   - Margem de lucro mais alta
   - Competitivos no mercado

2. **Priorize Top 50 Overall Score**
   - Melhor relação qualidade-preço-confiabilidade
   - Satisfação garantida do cliente

3. **Use Value Score para B2B**
   - Clientes B2B valorizam custo-benefício
   - Destaque economia total (TCO)

### Para Equipe de Compras

1. **GAP Crítico: Certificações**
   - INMETRO: apenas 2.2% cobertos
   - Priorizar fornecedores certificados

2. **Oportunidade: Baterias**
   - Apenas 6 produtos
   - Mercado híbrido em crescimento

3. **Diversificação de Fabricantes**
   - 33 fabricantes identificados
   - Foco em Tier 1: JinkoSolar, Longi, BYD, Canadian Solar

### Para Marketing

1. **Destaque Top Produtos**
   - JinkoSolar 610W/615W (Overall 80.6)
   - Longi LR7-72HTH-630M (Overall 80.6)
   - BYD BYD-530W (Overall 80.6)

2. **Messaging por Score**
   - **High Quality** → "Certificado e confiável"
   - **High Value** → "Melhor custo-benefício"
   - **High Reliability** → "Garantia estendida"

3. **Segmentação**
   - **Painéis (73.3)** → Premium positioning
   - **Kits (51.9)** → Volume e conveniência
   - **Inversores (57.3)** → Tecnologia e eficiência

---

## 🔄 Atualização Automática

### Frequência

- **Semanal** - Automática aos domingos 00:00
- **On-demand** - Manual via script

### Executar Manualmente

```powershell
cd products-inventory
& ..\.venv\Scripts\python.exe enrich_schemas_with_llm.py
```

### Saída

- Novos arquivos com timestamp
- Histórico preservado
- Comparação de versões disponível

---

## 📊 KPIs de Acompanhamento

### Metas Q4 2025

| Métrica | Atual | Meta | Status |
|---------|-------|------|--------|
| Overall Score Médio | 51.9 | 65.0 | 🟡 |
| Certificação INMETRO | 2.2% | 50% | 🔴 |
| Excellent Deals | 67.9% | 75% | 🟡 |
| Top Quality Products (>70) | 19 | 100 | 🔴 |

### Ações Prioritárias

1. ⚠️ **Urgente:** Certificação INMETRO
   - Foco em painéis e inversores
   - Parceria com laboratórios certificados

2. 📈 **Alto Impacto:** Aumentar produtos premium
   - Adicionar 50+ painéis Tier 1
   - Expandir inversores híbridos

3. 💰 **Oportunidade:** Baterias e armazenamento
   - De 6 para 50+ produtos
   - Sistemas modulares (5-20kWh)

---

## 🤝 Integração com Medusa.js

### Campos Disponíveis para Import

```typescript
// Schema pronto para Medusa Product Module
interface EnrichedProductForMedusa {
  // Core Product
  title: string
  handle: string
  description: string
  is_giftcard: false
  discountable: true
  
  // Variante principal
  variants: [{
    title: "Default",
    sku: string,
    manage_inventory: true,
    prices: [{
      amount: number, // price_analysis.best_price * 100
      currency_code: "BRL"
    }]
  }],
  
  // Metadata enriquecido
  metadata: {
    overall_score: number,
    value_score: number,
    quality_score: number,
    reliability_score: number,
    
    best_price: number,
    price_recommendation: string,
    
    warranty_years: number,
    warranty_performance_years: number,
    
    inmetro_certified: boolean,
    ce_certified: boolean,
    certification_score: number,
    
    efficiency_pct: number,
    lifecycle_years: number,
    degradation_rate: number
  },
  
  // Imagens
  images: string[],
  
  // Categorias (via Product Categories)
  categories: [{ id: string }],
  
  // Tags
  tags: [
    { value: manufacturer },
    { value: category },
    { value: price_recommendation }
  ]
}
```

### Workflow de Importação

```typescript
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

// Carregar schemas enriquecidos
const enrichedProducts = require('./enriched_products_*.json')

// Filtrar por score mínimo
const topProducts = enrichedProducts.filter(p => p.overall_score >= 60)

// Converter para formato Medusa
const medusaProducts = topProducts.map(convertToMedusaSchema)

// Importar via workflow
await createProductsWorkflow(container).run({
  input: { products: medusaProducts }
})
```

---

## 📞 Suporte

**Desenvolvido por:** YSH Solar Development Team  
**Versão:** 1.0.0  
**Data:** 14 de Outubro de 2025

**Contato:**

- 📧 Email: <dev@yshsolar.com.br>
- 📱 WhatsApp: +55 11 XXXX-XXXX
- 🌐 Portal: <https://yshsolar.com.br>

---

**Próxima Atualização:** 21 de Outubro de 2025 (automática)
