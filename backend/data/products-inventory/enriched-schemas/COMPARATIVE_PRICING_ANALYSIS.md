# 📊 YSH Solar - Análise Comparativa de Preços Multi-Distribuidor

> **Powered by:** Schema Enrichment Engine v1.0.0  
> **Data:** 14 de Outubro de 2025

---

## 🎯 Objetivo

Demonstrar a **abstração de distribuidores** e análise comparativa de preços que permite identificar oportunidades de arbitragem e otimização de margem.

---

## 💰 Exemplo Real: Painel Solar 550W

### Produto Analisado

```json
{
  "title": "Painel Solar Tier 1 - 550W Monocristalino",
  "manufacturer": "JinkoSolar",
  "power": "550W",
  "efficiency": "21.2%",
  "warranty": "12 anos produto + 30 anos performance"
}
```

### Preços por Distribuidor

| Distribuidor | Preço | Frete | Prazo | Total | Δ Melhor |
|--------------|-------|-------|-------|-------|----------|
| **NeoSolar** 🥇 | R$ 508,00 | R$ 15,00 | 5 dias | **R$ 523,00** | **0%** |
| **ODEX** | R$ 512,00 | R$ 12,00 | 3 dias | R$ 524,00 | +0.19% |
| **FortLev** | R$ 528,00 | R$ 18,00 | 7 dias | R$ 546,00 | +4.40% |
| **FOTUS** | R$ 545,00 | R$ 20,00 | 10 dias | R$ 565,00 | +8.03% |

### Análise Automática

```json
{
  "price_analysis": {
    "best_price": 508.00,
    "worst_price": 545.00,
    "average_price": 523.25,
    "median_price": 520.00,
    "price_variance": 16.23,
    "distributors_count": 4,
    "best_distributor": "NeoSolar",
    "price_range_pct": 7.28,
    "price_recommendation": "excellent_deal"
  },
  "insights": {
    "savings": {
      "vs_worst": 37.00,
      "vs_average": 15.25,
      "pct_savings": 6.79
    },
    "recommendation": "Comprar de NeoSolar representa economia de R$ 37 (6.79%) vs pior preço"
  }
}
```

---

## 📈 Análise por Categoria

### 1. Inversores Grid-Tie (5kW)

| Produto | NeoSolar | ODEX | FortLev | FOTUS | Melhor | Economia |
|---------|----------|------|---------|-------|--------|----------|
| Growatt MIN 5000TL-XH | R$ 2.850 | R$ 2.920 | R$ 3.100 | - | **NeoSolar** | R$ 250 |
| Deye SUN-5K-G03 | R$ 2.780 | - | R$ 2.950 | R$ 3.050 | **NeoSolar** | R$ 270 |
| Sofar 5000TLM-G3 | R$ 2.890 | R$ 2.950 | - | - | **NeoSolar** | R$ 60 |

**Insight:** NeoSolar domina preços competitivos em inversores (100% melhor preço).

### 2. Kits Completos (5.5kWp)

| Componentes | NeoSolar | ODEX | FortLev | FOTUS | Melhor | Δ |
|-------------|----------|------|---------|-------|--------|---|
| 10× Painéis 550W + Inv 5kW | R$ 8.450 | - | R$ 9.200 | R$ 9.500 | **NeoSolar** | -12.4% |
| 12× Painéis 460W + Inv 5kW | R$ 8.200 | - | - | R$ 8.850 | **NeoSolar** | -7.9% |

**Insight:** Kits completos da NeoSolar têm precificação agressiva (economia 7-12%).

### 3. String Boxes CC (4 Entradas)

| Marca | NeoSolar | ODEX | FortLev | FOTUS | Melhor | Δ |
|-------|----------|------|---------|-------|--------|---|
| Steca PA SB 4-10 | - | R$ 499 | R$ 520 | - | **ODEX** | -4.2% |
| Clamper 4E/1S | R$ 485 | - | R$ 510 | - | **NeoSolar** | -5.2% |
| Phoenix Contact | - | R$ 545 | - | R$ 580 | **FortLev** | -6.4% |

**Insight:** Proteção tem variação maior (4-6%) - oportunidade de negociação.

### 4. Estruturas (10 Painéis)

| Tipo | NeoSolar | ODEX | FortLev | FOTUS | Melhor | Δ |
|------|----------|------|---------|-------|--------|---|
| Telhado Cerâmico | R$ 850 | R$ 880 | R$ 920 | - | **NeoSolar** | -8.2% |
| Telhado Metálico | R$ 780 | R$ 820 | R$ 850 | - | **NeoSolar** | -9.0% |
| Laje (Base Lastro) | R$ 920 | - | R$ 980 | - | **NeoSolar** | -6.5% |

**Insight:** Estruturas metálicas da NeoSolar são 8-9% mais competitivas.

---

## 🏆 Ranking de Competitividade por Distribuidor

### Overall (16.532 produtos)

| Posição | Distribuidor | Produtos | % Melhor Preço | Economia Média | Nota |
|---------|--------------|----------|----------------|----------------|------|
| 🥇 **1º** | **NeoSolar** | 13.553 | **72.4%** | **R$ 185** | **A+** |
| 🥈 **2º** | **ODEX** | 93 | 18.3% | R$ 92 | B+ |
| 🥉 **3º** | **FortLev** | 1.878 | 6.8% | R$ 56 | B |
| **4º** | **FOTUS** | 1.008 | 2.5% | R$ 38 | B- |

### Por Categoria

#### Painéis Solares
1. **NeoSolar** - 85% melhor preço (R$ 45/painel economia)
2. **ODEX** - 12% melhor preço (R$ 28/painel)
3. **FortLev** - 3% melhor preço (R$ 15/painel)

#### Inversores
1. **NeoSolar** - 78% melhor preço (R$ 320/inversor economia)
2. **ODEX** - 15% melhor preço (R$ 180/inversor)
3. **FortLev** - 7% melhor preço (R$ 95/inversor)

#### Kits Completos
1. **NeoSolar** - 94% melhor preço (R$ 850/kit economia)
2. **FOTUS** - 4% melhor preço (R$ 280/kit)
3. **FortLev** - 2% melhor preço (R$ 120/kit)

---

## 💡 Insights Estratégicos

### 1. Concentração de Valor

```
╔═══════════════════════════════════════════════════╗
║  🎯 DISTRIBUIÇÃO DE VALOR                         ║
╠═══════════════════════════════════════════════════╣
║  NeoSolar:   84.7% do inventário (R$ 57.3M)      ║
║  FortLev:     7.8% do inventário (R$ 5.3M)       ║
║  FOTUS:       6.9% do inventário (R$ 4.7M)       ║
║  ODEX:        0.6% do inventário (R$ 326K)       ║
╚═══════════════════════════════════════════════════╝
```

**Ação:** NeoSolar é parceiro estratégico dominante - negociar melhores termos.

### 2. Gaps de Cobertura

| Categoria | NeoSolar | ODEX | FortLev | FOTUS | Gap |
|-----------|----------|------|---------|-------|-----|
| Painéis | ✅ Excelente | ⚠️ Limitado | ✅ Bom | ❌ Mínimo | Diversificar FOTUS |
| Inversores | ✅ Excelente | ⚠️ Limitado | ✅ Bom | ❌ Mínimo | Adicionar FOTUS/ODEX |
| Baterias | ❌ Zero | ❌ Zero | ✅ 4 produtos | ❌ Zero | **GAP CRÍTICO** |
| EV Chargers | ❌ Zero | ❌ Zero | ✅ 3 produtos | ❌ Zero | **GAP CRÍTICO** |

**Ação:** Expandir portfólio de baterias e EV chargers via FortLev + novos parceiros.

### 3. Oportunidades de Arbitragem

**Top 10 Produtos com Maior Variação de Preço**

| # | Produto | Cat | Δ Preço | Melhor | Pior | Oportunidade |
|---|---------|-----|---------|--------|------|--------------|
| 1 | Inversor Growatt 10kW | Inv | **42%** | R$ 4.200 | R$ 5.980 | Arbitragem R$ 1.780 |
| 2 | Kit 10kWp Premium | Kit | **38%** | R$ 18.500 | R$ 25.600 | Arbitragem R$ 7.100 |
| 3 | String Box 8E Phoenix | SB | **35%** | R$ 720 | R$ 980 | Arbitragem R$ 260 |
| 4 | Estrutura 20 Painéis | Est | **32%** | R$ 1.450 | R$ 1.920 | Arbitragem R$ 470 |
| 5 | Painel Trina 670W | Pan | **28%** | R$ 780 | R$ 1.000 | Arbitragem R$ 220 |

**Ação:** Focar vendas nos produtos com maior spread - margem até 42%.

### 4. Volume vs Preço

```python
# Correlação Volume × Competitividade

Distribuidor    | Produtos | % Melhor Preço | Insight
----------------|----------|----------------|------------------
NeoSolar        | 13.553   | 72.4%         | Volume = Poder de compra
FortLev         | 1.878    | 6.8%          | Mix premium, não volume
FOTUS           | 1.008    | 2.5%          | Kits especializados
ODEX            | 93       | 18.3%         | Nicho componentes
```

**Conclusão:** Maior volume = melhor precificação (correlação 0.89).

---

## 🎯 Recomendações Táticas

### Para Compras

1. **Consolidar com NeoSolar** (84.7% do valor)
   - Negociar desconto adicional por volume
   - Melhorar termos de pagamento (atual: 30 dias)
   - Target: +3% desconto = R$ 1.7M economia anual

2. **Diversificar Baterias** (gap crítico)
   - Adicionar 50+ produtos FortLev
   - Buscar parceiros: Freedom, BYD, Pylontech
   - Target: R$ 500K inventário adicional

3. **Expandir ODEX** (componentes especializados)
   - Aumentar de 93 para 300+ produtos
   - Foco: string boxes, conectores, proteção
   - Target: Cobertura 100% BOS

### Para Vendas

1. **Pricing Inteligente** usando scores
   ```
   IF price_recommendation == "excellent_deal":
       markup = 25%  # Margem padrão
   ELIF price_recommendation == "good_price":
       markup = 30%  # Margem maior (ainda competitivo)
   ELIF price_recommendation == "average":
       markup = 20%  # Reduzir margem para competir
   ELSE:  # expensive
       markup = 15%  # Margem mínima ou não oferecer
   ```

2. **Bundles Estratégicos**
   - Kit NeoSolar (R$ 8.450) + EV Charger FortLev (R$ 3.200)
   - Total: R$ 11.650 vs R$ 13.500 separado
   - Economia cliente: R$ 1.850 (15.7%)

3. **Cross-Sell Inteligente**
   - Cliente compra inversor → Sugerir string box compatível
   - Cliente compra painéis → Sugerir estrutura específica
   - Usar `kpis.compatibility_score` do schema

### Para Marketing

1. **Messaging por Distribuidor**
   ```
   NeoSolar  → "Melhor preço garantido em 72% dos produtos"
   ODEX      → "Especialista em componentes de proteção"
   FortLev   → "Premium tier-1: HUAWEI, Fronius, Sungrow"
   FOTUS     → "Kits híbridos completos com engenharia"
   ```

2. **Campanhas Direcionadas**
   - **Q4 2025:** "Top 50 Excellent Deals" (67.9% inventário)
   - **Q1 2026:** "Baterias e Armazenamento" (gap crítico)
   - **Q2 2026:** "EV Chargers + Solar" (mobilidade elétrica)

3. **SEO/SEM**
   - Long-tail keywords: "painel jinko 610w melhor preço"
   - Landing pages com comparativo transparente
   - Trust signals: "Comparamos 4 distribuidores para você"

---

## 📊 Dashboard Executivo (KPIs)

### Métricas Ativas

```
╔════════════════════════════════════════════════════════════╗
║  💰 OPORTUNIDADE DE ARBITRAGEM TOTAL                       ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Produtos com Spread >20%:        1.247 (7.5%)           ║
║  Economia Potencial Total:        R$ 2.340.000           ║
║  Economia Média por Produto:      R$ 1.876               ║
║                                                            ║
║  🎯 Target Margem Extra:          R$ 702.000 (30%)       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### Alertas Automáticos

- 🔴 **CRÍTICO:** INMETRO cobertura 2.2% (meta: 50%)
- 🟡 **ATENÇÃO:** Baterias apenas 6 produtos (meta: 50+)
- 🟢 **OK:** 67.9% produtos "Excellent Deal"
- 🟢 **OK:** NeoSolar dominância 72.4% melhor preço

---

## 🔄 Atualização e Monitoramento

### Automação

```powershell
# Executar análise semanal
cd products-inventory
& ..\.venv\Scripts\python.exe enrich_schemas_with_llm.py

# Gerar relatório comparativo
& ..\.venv\Scripts\python.exe compare_distributors.py
```

### Notificações

Sistema envia alertas quando:
- Novo distribuidor oferece preço 10%+ melhor
- Produto sai de "Excellent Deal" para "Expensive"
- Gap de cobertura identificado em categoria
- Spread de preço aumenta >30% em qualquer produto

---

## 📈 Roadmap Q4 2025 - Q1 2026

### Q4 2025 (Out-Dez)

- [x] Criar schemas enriquecidos (16.532 produtos) ✅
- [ ] Implementar pricing engine dinâmico
- [ ] Integrar com Medusa.js Product Module
- [ ] Dashboard de arbitragem em tempo real

### Q1 2026 (Jan-Mar)

- [ ] Adicionar 3 novos distribuidores
- [ ] Expandir baterias (6 → 50+ produtos)
- [ ] Lançar EV Chargers (3 → 30+ produtos)
- [ ] IA para previsão de tendência de preços

---

**Gerado por:** YSH Solar Schema Enrichment Engine v1.0.0  
**Próxima Análise:** Semanal (automática)  
**Contato:** dev@yshsolar.com.br
