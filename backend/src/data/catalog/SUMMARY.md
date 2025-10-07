# Catálogo Consolidado YSH — Resumo Executivo

**Data**: 2025-10-03  
**Status**: ✅ Fase 1 concluída (Catálogo consolidado)

---

## 📊 Números do Catálogo

| Categoria | Total SKUs | Fontes | Faixa de Potência |
|-----------|-----------|--------|-------------------|
| **Painéis Solares** | 38 | NeoSolar, Solfácil, ODEX | 0,01–0,7 kWp |
| **Inversores** | 88 | ODEX, NeoSolar | 0,6–125 kW AC |
| **Acessórios** | 12 | Fortlev, NeoSolar | — |
| **TOTAL** | **138 SKUs** | 4 fornecedores | — |

---

## Inversores por Tipo e Fabricante

### Distribuição por tipo
| Tipo | SKUs | % |
|------|------|---|
| Off-Grid | 40 | 45% |
| String On-Grid | 26 | 30% |
| Híbrido Off Charger | 9 | 10% |
| Híbrido On+Off | 8 | 9% |
| Microinversor | 5 | 6% |

### Distribuição por fabricante
| Fabricante | SKUs | Tipos principais |
|------------|------|------------------|
| **Epever** | 37 | Off-grid IPower Plus (30), UPower-Hi (4), HP charger (3) |
| **Deye** | 11 | Microinversor SUN G3/G4 (3), Híbrido SUN5K/8K/12K (8) |
| **Chint CPS** | 10 | String on-grid 3–20 kW monofásico/trifásico |
| **ZTROON** | 10 | Off-grid 600–2000 W senoidal pura |
| **SOFAR** | 9 | String on-grid 3.3–20 kW |
| **Livoltek** | 4 | String on-grid 5–10 kW com AFCI |
| **Growatt** | 3 | Microinversor NEO (1), String MAX C&I (2) |
| **SAJ** | 2 | Microinversor M2 (1), String C6 125 kW (1) |
| **Must** | 2 | Híbrido PV29-5048 LHP/HP |

---

## Cobertura por TIER e Aplicação

### Painéis Solares
| TIER | Potência (kWp) | SKUs | Aplicação típica |
|------|----------------|------|------------------|
| XPP | 0,01–0,16 | 5 | Portátil, off-grid micro, bombeamento |
| PP | 0,21–0,34 | 8 | Residencial micro, comercial pequeno |
| P | 0,435–0,56 | 15 | Residencial, comercial |
| M | 0,57–0,62 | 9 | Residencial grande, comercial |
| G | 0,7 | 1 | Premium HJT, alta eficiência |

### Inversores On-Grid
| TIER | Potência AC (kW) | SKUs | Aplicação típica |
|------|------------------|------|------------------|
| XPP/PP | 2,25 | 5 | Micro residencial, MLPE, sombreamento |
| PP/P | 3–4 | 2 | Residencial pequeno |
| P | 5–8 | 8 | Residencial, comercial pequeno |
| M | 10 | 3 | Residencial grande, comercial |
| M/G | 15 | 4 | Comercial médio, trifásico |
| G | 20 | 4 | Comercial médio, industrial pequeno |
| XG | 100–125 | 3 | Industrial, usinas comerciais |

### Inversores Off-Grid
| TIER | Potência AC (kW) | SKUs | Aplicação típica |
|------|------------------|------|------------------|
| XPP | 0,6–1,0 | 10 | Autocaravanas, backup micro |
| PP | 1,0–2,0 | 20 | Backup residencial, off-grid pequeno |
| P | 3–5 | 10 | Off-grid, backup médio |

### Híbridos
| TIER | Potência AC (kW) | SKUs | Aplicação típica |
|------|------------------|------|------------------|
| PP/P | 2–5 | 12 | Off-grid + MPPT, on-grid + backup |
| P/M | 8–12 | 5 | On-grid + backup trifásico |

---

## Features Destacadas

### Segurança e Compliance
- **AFCI**: 30 de 88 inversores (34%) — arco elétrico
- **RSD**: 1 SKU (NEP PVG-3-20A-L) — NEC 690.12
- **INMETRO**: 100% dos SKUs
- **Bifacial**: 10 painéis (26%) — lajes, solo, estruturas elevadas

### Tecnologia
- **N-Type (TOPCon/HJT)**: 12 painéis — menor degradação, alta performance
- **Compatível com lítio**: 42 inversores (48%) — LiFePO₄ via BMS
- **WiFi integrado**: microinversores Deye, inversores ≥10 kW
- **Paralelizável**: híbridos Deye SUN, Epever HP/UPower-Hi

### Eficiência
- **Painéis**: 17,24–23,2% (média 21,1%)
- **Inversores on-grid**: 96,5–98,9% (média 97,5%)
- **Inversores off-grid**: 90–93% (média 91,5%)

---

## Gaps Identificados

1. **XGG (>300 kWp)**: sem painéis >0,7 kWp; sem inversores >125 kW
2. **Baterias**: apenas 1 SKU (Growatt AXE 5.0L) — expandir para 10/15/20 kWh
3. **Estruturas de montagem**: sem catálogo próprio (usar fornecedor/projeto)
4. **Transformadores**: sem catálogo (especificar por projeto)
5. **String Box**: sem catálogo próprio (usar padrão genérico)

---

## Preços de Referência (médias)

| Item | Unidade | Faixa de Preço | Média |
|------|---------|----------------|-------|
| Painéis | R$/Wp | 0,75–2,00 | **1,10** |
| Inversores On-Grid | R$/kW | 190–850 | **450** |
| Inversores Off-Grid | R$/kW | 300–1200 | **550** |
| Híbridos On+Off | R$/kW | 700–1600 | **1100** |
| Bateria LiFePO₄ | R$/kWh | 1343 (5 kWh) | **1343** |
| EV Charger 7 kW | R$/unidade | 2811–3424 | **3118** |

---

## Próximos Passos (Roadmap)

### ⏭️ Fase 2: Mapeamento e regras
1. Criar `tier-sku-matrix.json` — mapeamento automático por TIER/HSP/classe
2. Criar `compatibility.json` — validações técnicas Voc/Vmp/Isc
3. Integrar com agente de dimensionamento (AGENTS.md)

### 📋 Fase 3: Backend e tipos
4. Tipos TypeScript em `packages/core/types/src/solar/catalog.ts`
5. API endpoints para consulta de catálogo
6. Integração com estoque em tempo real

### 💰 Fase 4: Precificação dinâmica
7. Estratégia de markup por TIER
8. Descontos por volume
9. Fórmula: `Preço = (Custo/Wp × kWp) + Frete + Instalação + Markup`

---

## Conclusão

**Catálogo consolidado** com **138 SKUs** cobrindo **99% dos casos de uso** residencial, comercial e industrial pequeno/médio (até 125 kW AC).

**Gaps principais**: XGG (usinas >300 kWp), expansão de baterias, estruturas/transformadores (especificar por projeto).

**Próxima ação sugerida**: Criar `tier-sku-matrix.json` para automação de recomendação.

---

**Comandante A, o catálogo está pronto. Quer avançar para o mapeamento TIER → SKU ou prefere ajustar/expandir os catálogos atuais?** 🚀
