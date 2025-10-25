# 🌞 Regras de Negócio - Marketplace de Kits Solares YSH

**Data:** 14 de Outubro de 2025  
**Versão:** 1.0.0  
**Inventário Base:** 16.532 produtos (15.882 kits disponíveis)

---

## 📋 Sumário Executivo

Este documento define as **regras de negócio** para o marketplace de kits solares YSH, mapeando o **consumo médio mensal** (kWh) de cada classe consumidora aos **kits disponíveis em estoque**, com três níveis de dimensionamento:

- **🟢 Geração Moderada (115%)**: Sistema dimensionado para suprir 115% do consumo médio
- **🟡 Geração Consciente (130%)**: Sistema dimensionado para suprir 130% do consumo médio (recomendado)
- **🔴 Geração Acelerada (145%)**: Sistema dimensionado para suprir 145% do consumo médio

### 💰 Estrutura de Custos Incluída

- **Custo do Kit**: Equipamentos (painéis + inversor + acessórios)
- **Instalação**: 15-25% do valor do kit (varia por complexidade)
- **Manutenção Preventiva**: 0,3-0,5% a.a. do investimento total
- **Manutenção Corretiva**: 0,1-0,2% a.a. do investimento total
- **Seguro RD** (Riscos Diversos): 0,3-0,5% a.a. do valor instalado
- **Seguro RE** (Responsabilidade Civil): 0,1-0,2% a.a. do valor instalado

---

## 🏠 RESIDENCIAL (Classe B1/B2)

### Perfil do Consumidor

- **Tarifa Média**: R$ 0,75 - R$ 0,95/kWh
- **Consumo Típico**: 150 - 1.000 kWh/mês
- **Payback Médio**: 3-5 anos
- **ROI Esperado**: 35-45% a.a. (TIR)

---

### 📊 Faixa 1: Até 200 kWh/mês

#### 🟢 Geração Moderada (115% = 230 kWh/mês)

- **Potência Necessária**: 1,7 - 2,0 kWp
- **Estimativa de Geração**: 230-329 kWh/mês
- **ROI**: ~35% a.a. | **Payback**: ~4 anos
- **Manutenção Anual**: R$ 18-25 (0,5%)
- **Seguro Anual**: R$ 22-30 (0,6%)

**📦 OPÇÕES DE KITS DISPONÍVEIS (Múltiplos Distribuidores):**

**Opção 1: FortLev** ⭐ MELHOR CUSTO/BENEFÍCIO

- **Kit**: `fortlev_kit_001` (2.44kWp)
- **Preço Kit**: R$ 2.923,56
- **Custo com Instalação**: R$ 3.650
- **Componentes**: Painéis 4x ~610W + Growatt 2.0kW Monofásico
- **Custo/Watt**: R$ 1,20/Wp ✅ MAIS BARATO
- **Disponibilidade**: ✅ Pronta Entrega

**Opção 2: FOTUS (Sistema Modular)**

- **Kit**: 2x `FOTUS-KP04` (1.14kWp cada = 2.28kWp total)
- **Preço Kit**: R$ 5.015,98
- **Custo com Instalação**: R$ 6.270
- **Componentes**: 4x Solar N Plus 570W Bifacial + 2x Microinversor Deye 2.25kW
- **Custo/Watt**: R$ 2,20/Wp
- **Disponibilidade**: ✅ CD Espírito Santo
- **Vantagem**: Sistema modular com redundância de microinversores

**Opção 3: NeoSolar (Pequenos Sistemas)**

- **Kit**: Kits Off-Grid disponíveis (160-500Wp)
- **Nota**: ⚠️ NeoSolar foca em sistemas off-grid nesta faixa
- **Recomendação**: Não ideal para grid-tie residencial

**Opção 4: Projeto Customizado (ODEX)**

- **Componentes Avulsos**:
  - 4x Painéis ~550W = R$ 2.200 (estimativa)
  - 1x Inversor SAJ 3kW (R5-3K-T2) = R$ 1.599,00
- **Preço Total**: R$ 3.799,00
- **Custo com Instalação**: R$ 4.750
- **Custo/Watt**: R$ 1,73/Wp
- **Disponibilidade**: ✅ Componentes em estoque

#### 🟡 Geração Consciente (130% = 260 kWh/mês) ⭐ RECOMENDADO

- **Potência Necessária**: 2,0 - 2,5 kWp
- **Estimativa de Geração**: 260-340 kWh/mês
- **ROI**: ~40% a.a. | **Payback**: ~3-4 anos
- **Manutenção Anual**: R$ 19-26 (0,5%)
- **Seguro Anual**: R$ 23-32 (0,6%)

**📦 OPÇÕES DE KITS DISPONÍVEIS (Múltiplos Distribuidores):**

**Opção 1: FortLev** ⭐ RECOMENDADO

- **Kit**: `fortlev_kit_002` (2.52kWp)
- **Preço Kit**: R$ 3.163,70
- **Custo com Instalação**: R$ 3.955
- **Componentes**: 4x LONGi 630W + Growatt 2.0kW Monofásico
- **Custo/Watt**: R$ 1,26/Wp ✅ MELHOR CUSTO/BENEFÍCIO
- **Disponibilidade**: ✅ Pronta Entrega
- **Vantagem**: Painéis LONGi Tier-1 com garantia estendida

**Opção 2: FortLev Alternativo**

- **Kit**: `fortlev_kit_001` (2.44kWp)
- **Preço Kit**: R$ 2.923,56
- **Custo com Instalação**: R$ 3.650
- **Componentes**: 4x ~610W + Growatt 2.0kW
- **Custo/Watt**: R$ 1,20/Wp ✅ MAIS ECONÔMICO
- **Disponibilidade**: ✅ Pronta Entrega
- **Nota**: ⚠️ Ligeiramente undersized (2.44kWp vs 2.5kWp ideal)

**Opção 3: FOTUS (Sistema Modular)**

- **Kit**: 2x `FOTUS-KP04` (1.14kWp cada = 2.28kWp total)
- **Preço Kit**: R$ 5.015,98
- **Custo com Instalação**: R$ 6.270
- **Componentes**: 4x Solar N Plus 570W Bifacial + 2x Deye 2.25kW Microinversor
- **Custo/Watt**: R$ 2,20/Wp
- **Disponibilidade**: ✅ CD Espírito Santo
- **Vantagem**: Redundância (2 microinversores independentes)

**Opção 4: Projeto Customizado (ODEX + Componentes)**

- **Componentes**:
  - 5x Painéis 550W = R$ 2.750
  - 1x Inversor SAJ 3kW = R$ 1.599,00
- **Preço Total**: R$ 4.349,00
- **Custo com Instalação**: R$ 5.436
- **Custo/Watt**: R$ 1,58/Wp
- **Disponibilidade**: ✅ Componentes em estoque

#### 🔴 Geração Acelerada (145% = 290 kWh/mês)

- **Potência Necessária**: 2,2 - 2,8 kWp
- **Kits Disponíveis**:
  - `fortlev_kit_002` (2.52kWp - R$ 3.163,70)
  - `fortlev_kit_012` (2.65kWp BYD + Growatt - R$ 5.073,84)
  - `fortlev_kit_003` (2.80kWp Risen + Growatt - R$ 3.837,94)
- **Custo com Instalação**: R$ 4.800 - R$ 6.500
- **Estimativa de Geração**: 290-378 kWh/mês
- **ROI**: ~45% a.a. | **Payback**: ~3 anos
- **Manutenção Anual**: R$ 24-33 (0,5%)
- **Seguro Anual**: R$ 29-39 (0,6%)

**📦 Composição do Kit (`fortlev_kit_003`):**

- **Painéis**: 4x Risen 700W (2.80kWp)
- **Inversor**: Growatt 2.0kW
- **Custo/Watt**: R$ 1,37/Wp

---

### 📊 Faixa 2: 200-500 kWh/mês (Média: 350 kWh)

#### 🟢 Geração Moderada (115% = 402 kWh/mês)

- **Potência Necessária**: 3,0 - 4,0 kWp
- **Kits Disponíveis**:
  - `fortlev_kit_005` (2.92kWp LONGi + Growatt - R$ 4.222,76)
  - `fortlev_kit_007` (3.05kWp - R$ 4.394,40)
  - `fortlev_kit_008` (3.15kWp LONGi - R$ 4.694,59)
  - `fortlev_kit_010` (3.51kWp LONGi - R$ 5.056,46)
  - `fortlev_kit_015` (3.78kWp LONGi + Growatt - R$ 5.304,08)
  - `fortlev_kit_020` (4.09kWp LONGi - R$ 5.457,30)
- **Custo com Instalação**: R$ 6.400 - R$ 7.000
- **Estimativa de Geração**: 394-552 kWh/mês
- **ROI**: ~35% a.a. | **Payback**: ~4 anos
- **Manutenção Anual**: R$ 32-42 (0,5%)
- **Seguro Anual**: R$ 38-50 (0,6%)

**📦 Kit Recomendado (`fortlev_kit_015`):**

- **Painéis**: 6x LONGi 630W (3.78kWp)
- **Inversor**: Growatt (provavelmente 3.0-3.6kW)
- **Custo/Watt**: R$ 1,40/Wp

#### 🟡 Geração Consciente (130% = 455 kWh/mês) ⭐ RECOMENDADO

- **Potência Necessária**: 3,4 - 4,5 kWp
- **Estimativa de Geração**: 473-595 kWh/mês
- **ROI**: ~40% a.a. | **Payback**: ~3-4 anos
- **Manutenção Anual**: R$ 34-46 (0,5%)
- **Seguro Anual**: R$ 41-55 (0,6%)

**📦 OPÇÕES DE KITS DISPONÍVEIS (Múltiplos Distribuidores):**

**Opção 1: FortLev Kit 4.09kWp** ⭐ RECOMENDADO

- **Kit**: `fortlev_kit_020` (4.09kWp)
- **Preço Kit**: R$ 5.457,30
- **Custo com Instalação**: R$ 6.822
- **Componentes**: 7x LONGi 585W + Inversor 3.6-5kW (Growatt/Sungrow)
- **Custo/Watt**: R$ 1,33/Wp ✅ EXCELENTE CUSTO/BENEFÍCIO
- **Disponibilidade**: ✅ Pronta Entrega
- **Geração Estimada**: 552 kWh/mês

**Opção 2: FortLev Kit 4.41kWp**

- **Kit**: `fortlev_kit_034` (4.41kWp)
- **Preço Kit**: R$ 5.879,19
- **Custo com Instalação**: R$ 7.349
- **Componentes**: 7x LONGi 630W + Inversor 5kW
- **Custo/Watt**: R$ 1,33/Wp
- **Disponibilidade**: ✅ Pronta Entrega
- **Geração Estimada**: 595 kWh/mês ✅ Margem de segurança

**Opção 3: FortLev Kit 3.78kWp** (Undersized)

- **Kit**: `fortlev_kit_015` (3.78kWp)
- **Preço Kit**: R$ 5.304,08
- **Custo com Instalação**: R$ 6.630
- **Componentes**: 6x LONGi 630W + Growatt 3-3.6kW
- **Custo/Watt**: R$ 1,40/Wp
- **Disponibilidade**: ✅ Pronta Entrega
- **Geração Estimada**: 510 kWh/mês
- **Nota**: ⚠️ Ligeiramente abaixo do ideal (3.78kWp vs 4.5kWp)

**Opção 4: Projeto Customizado Multi-Distribuidor**

- **Componentes**:
  - 8x Painéis LONGi 550W (ODEX/Outros) = R$ 4.400
  - 1x Inversor SAJ 4.2kW Monofásico (ODEX) = R$ 1.899
- **Preço Total**: R$ 6.299,00
- **Custo com Instalação**: R$ 7.874
- **Potência**: 4.4kWp
- **Custo/Watt**: R$ 1,43/Wp
- **Disponibilidade**: ✅ Componentes em estoque
- **Vantagem**: Flexibilidade na escolha de marcas

#### 🔴 Geração Acelerada (145% = 507 kWh/mês)

- **Potência Necessária**: 3,8 - 5,0 kWp
- **Kits Disponíveis**:
  - `fortlev_kit_020` (4.09kWp LONGi - R$ 5.457,30)
  - `fortlev_kit_034` (4.41kWp LONGi - R$ 5.879,19)
  - `fortlev_kit_042` (4.20kWp Risen + Growatt - R$ 6.358,53)
  - `fortlev_kit_061` (5.85kWp LONGi - R$ 7.634,01) ⚠️ Oversized
- **Custo com Instalação**: R$ 7.000 - R$ 9.600
- **Estimativa de Geração**: 552-789 kWh/mês
- **ROI**: ~45% a.a. | **Payback**: ~3 anos
- **Manutenção Anual**: R$ 35-58 (0,5%)
- **Seguro Anual**: R$ 42-70 (0,6%)

**📦 Kit Recomendado (`fortlev_kit_034`):**

- **Painéis**: 7x LONGi 630W (4.41kWp)
- **Inversor**: Não especificado
- **Custo/Watt**: R$ 1,33/Wp

---

### 📊 Faixa 3: 500-1000 kWh/mês (Média: 750 kWh)

#### 🟢 Geração Moderada (115% = 862 kWh/mês)

- **Potência Necessária**: 6,5 - 8,0 kWp
- **Kits Disponíveis**:
  - `fortlev_kit_082` (6.93kWp LONGi - R$ 8.707,04)
  - `fortlev_kit_075` (7.02kWp LONGi - R$ 8.584,90)
  - `fortlev_kit_076` (7.32kWp - R$ 8.587,70)
  - `fortlev_kit_098` (7.0kWp Risen - R$ 9.857,44)
- **Custo com Instalação**: R$ 11.000 - R$ 12.600
- **Estimativa de Geração**: 935-988 kWh/mês
- **ROI**: ~35% a.a. | **Payback**: ~4-5 anos
- **Manutenção Anual**: R$ 55-76 (0,5%)
- **Seguro Anual**: R$ 66-91 (0,6%)

**📦 Kit Recomendado (`fortlev_kit_075`):**

- **Painéis**: 12x LONGi 585W (7.02kWp)
- **Inversor**: Não especificado (provavelmente 6kW Trifásico)
- **Custo/Watt**: R$ 1,22/Wp

#### 🟡 Geração Consciente (130% = 975 kWh/mês) ⭐ RECOMENDADO

- **Potência Necessária**: 7,3 - 9,0 kWp
- **Kits Disponíveis**:
  - `fortlev_kit_076` (7.32kWp - R$ 8.587,70)
  - `fortlev_kit_082` (6.93kWp LONGi - R$ 8.707,04) ⚠️ Undersized
  - `fortlev_kit_096` (8.54kWp - R$ 9.841,25)
  - `fortlev_kit_105` (8.78kWp LONGi - R$ 10.378,82)
  - `fortlev_kit_110` (8.82kWp LONGi - R$ 10.681,77)
- **Custo com Instalação**: R$ 11.000 - R$ 13.700
- **Estimativa de Geração**: 988-1190 kWh/mês
- **ROI**: ~40% a.a. | **Payback**: ~4 anos
- **Manutenção Anual**: R$ 55-82 (0,5%)
- **Seguro Anual**: R$ 66-99 (0,6%)

**📦 Kit Recomendado (`fortlev_kit_105`):**

- **Painéis**: 15x LONGi 585W (8.78kWp)
- **Inversor**: Não especificado (provavelmente 8kW Bifásico/Trifásico)
- **Custo/Watt**: R$ 1,18/Wp

#### 🔴 Geração Acelerada (145% = 1087 kWh/mês)

- **Potência Necessária**: 8,2 - 10,0 kWp
- **Kits Disponíveis**:
  - `fortlev_kit_096` (8.54kWp - R$ 9.841,25)
  - `fortlev_kit_105` (8.78kWp LONGi - R$ 10.378,82)
  - `fortlev_kit_110` (8.82kWp LONGi - R$ 10.681,77)
- **Custo com Instalação**: R$ 12.600 - R$ 13.700
- **Estimativa de Geração**: 1152-1190 kWh/mês
- **ROI**: ~45% a.a. | **Payback**: ~3-4 anos
- **Manutenção Anual**: R$ 63-82 (0,5%)
- **Seguro Anual**: R$ 76-99 (0,6%)

**📦 Kit Recomendado (`fortlev_kit_105`):**

- **Painéis**: 15x LONGi 585W (8.78kWp)
- **Inversor**: Não especificado
- **Custo/Watt**: R$ 1,18/Wp

---

### 📊 Faixa 4: Acima de 1000 kWh/mês (Média: 1.500 kWh)

#### 🟢 Geração Moderada (115% = 1.725 kWh/mês)

- **Potência Necessária**: 13,0 - 15,0 kWp
- **Kits Disponíveis**: ⚠️ **INVENTÁRIO INSUFICIENTE**
- **Recomendação**: Projeto customizado com múltiplos kits ou painéis avulsos
- **Custo Estimado**: R$ 22.000 - R$ 27.000
- **ROI**: ~35% a.a. | **Payback**: ~4-5 anos

#### 🟡 Geração Consciente (130% = 1.950 kWh/mês)

- **Potência Necessária**: 14,7 - 17,0 kWp
- **Kits Disponíveis**: ⚠️ **INVENTÁRIO INSUFICIENTE**
- **Recomendação**: Projeto customizado
- **Custo Estimado**: R$ 25.000 - R$ 30.000
- **ROI**: ~40% a.a. | **Payback**: ~4 anos

#### 🔴 Geração Acelerada (145% = 2.175 kWh/mês)

- **Potência Necessária**: 16,4 - 19,0 kWp
- **Kits Disponíveis**: ⚠️ **INVENTÁRIO INSUFICIENTE**
- **Recomendação**: Projeto customizado
- **Custo Estimado**: R$ 28.000 - R$ 34.000
- **ROI**: ~45% a.a. | **Payback**: ~3-4 anos

---

## 🏪 COMERCIAL (Classe B3/B4)

### Perfil do Consumidor

- **Tarifa Média**: R$ 0,85 - R$ 1,10/kWh (com tributos)
- **Consumo Típico**: 500 - 10.000 kWh/mês
- **Payback Médio**: 3-5 anos
- **ROI Esperado**: 35-45% a.a.
- **Demanda Contratada**: Possível cobrança adicional

---

### 📊 Faixa 1: Até 500 kWh/mês

**Seguir tabela RESIDENCIAL Faixa 2** (200-500 kWh/mês)

---

### 📊 Faixa 2: 500-2000 kWh/mês (Média: 1.250 kWh)

#### 🟢 Geração Moderada (115% = 1.437 kWh/mês)

- **Potência Necessária**: 10,8 - 13,0 kWp
- **Kits Disponíveis**: ⚠️ **INVENTÁRIO INSUFICIENTE** (máximo 8.82kWp em estoque)
- **Recomendação**: Combinar 2 kits de ~7kWp
  - 2x `fortlev_kit_075` (7.02kWp cada = 14.04kWp total)
  - **Custo Total**: 2 x R$ 8.584,90 = R$ 17.169,80
- **Custo com Instalação**: R$ 21.500 - R$ 23.000
- **Estimativa de Geração**: 1.894 kWh/mês (oversized)
- **ROI**: ~35% a.a. | **Payback**: ~4 anos

#### 🟡 Geração Consciente (130% = 1.625 kWh/mês) ⭐ RECOMENDADO

- **Potência Necessária**: 12,2 - 15,0 kWp
- **Recomendação**: Projeto customizado ou combinar kits
  - 2x `fortlev_kit_075` (7.02kWp) = 14.04kWp
  - Ou 2x `fortlev_kit_105` (8.78kWp) = 17.56kWp
- **Custo Estimado**: R$ 22.000 - R$ 28.000
- **ROI**: ~40% a.a. | **Payback**: ~3-4 anos

#### 🔴 Geração Acelerada (145% = 1.812 kWh/mês)

- **Potência Necessária**: 13,7 - 17,0 kWp
- **Recomendação**: Combinar kits grandes
  - 2x `fortlev_kit_105` (8.78kWp) = 17.56kWp
  - **Custo Total**: 2 x R$ 10.378,82 = R$ 20.757,64
- **Custo com Instalação**: R$ 26.000 - R$ 28.000
- **Estimativa de Geração**: 2.370 kWh/mês
- **ROI**: ~45% a.a. | **Payback**: ~3 anos

---

### 📊 Faixa 3: 2000-5000 kWh/mês (Média: 3.500 kWh)

#### 🟢 Geração Moderada (115% = 4.025 kWh/mês)

- **Potência Necessária**: 30,0 - 35,0 kWp
- **Recomendação**: Projeto customizado com painéis avulsos
- **Componentes Sugeridos**:
  - 50x LONGi 630W = 31.5kWp
  - 1x Inversor Sungrow/Growatt 30-33kW Trifásico
- **Custo Estimado**: R$ 63.000 - R$ 70.000
- **ROI**: ~35% a.a. | **Payback**: ~5 anos

#### 🟡 Geração Consciente (130% = 4.550 kWh/mês) ⭐ RECOMENDADO

- **Potência Necessária**: 34,0 - 40,0 kWp
- **Recomendação**: Projeto customizado
- **Custo Estimado**: R$ 68.000 - R$ 80.000
- **ROI**: ~40% a.a. | **Payback**: ~4 anos

#### 🔴 Geração Acelerada (145% = 5.075 kWh/mês)

- **Potência Necessária**: 38,0 - 45,0 kWp
- **Recomendação**: Projeto customizado
- **Custo Estimado**: R$ 76.000 - R$ 90.000
- **ROI**: ~45% a.a. | **Payback**: ~3-4 anos

---

### 📊 Faixa 4: 5000-10000 kWh/mês (Média: 7.500 kWh)

#### 🟢 Geração Moderada (115% = 8.625 kWh/mês)

- **Potência Necessária**: 65,0 - 75,0 kWp
- **Recomendação**: Projeto customizado industrial
- **Custo Estimado**: R$ 130.000 - R$ 150.000
- **ROI**: ~35% a.a. | **Payback**: ~5 anos

#### 🟡 Geração Consciente (130% = 9.750 kWh/mês) ⭐ RECOMENDADO

- **Potência Necessária**: 73,0 - 85,0 kWp
- **Custo Estimado**: R$ 146.000 - R$ 170.000
- **ROI**: ~40% a.a. | **Payback**: ~4 anos

#### 🔴 Geração Acelerada (145% = 10.875 kWh/mês)

- **Potência Necessária**: 82,0 - 95,0 kWp
- **Custo Estimado**: R$ 164.000 - R$ 190.000
- **ROI**: ~45% a.a. | **Payback**: ~3-4 anos

---

### 📊 Faixa 5: Acima de 10.000 kWh/mês

**Categoria**: Projetos Industriais / GD (Geração Distribuída)  
**Recomendação**: Engenharia customizada com visita técnica obrigatória  
**Potência Típica**: 100+ kWp  
**ROI**: 30-40% a.a. | **Payback**: 4-6 anos

---

## 🌾 RURAL (Classe B2 Rural / Irrigante)

### Perfil do Consumidor

- **Tarifa Média**: R$ 0,65 - R$ 0,85/kWh (tarifa rural subsidiada)
- **Consumo Típico**: 500 - 20.000 kWh/mês (alta variabilidade sazonal)
- **Payback Médio**: 4-6 anos (tarifa mais baixa)
- **ROI Esperado**: 30-40% a.a.
- **Peculiaridades**: Bombeamento solar, secadores de grãos, ordenha

---

### 📊 Faixa 1: Até 1000 kWh/mês

**Seguir tabela RESIDENCIAL Faixa 3** (500-1000 kWh/mês)

---

### 📊 Faixa 2: 1000-5000 kWh/mês (Média: 3.000 kWh)

**Seguir tabela COMERCIAL Faixa 3** (2000-5000 kWh/mês)

---

### 📊 Faixa 3: 5000-10000 kWh/mês (Média: 7.500 kWh)

**Seguir tabela COMERCIAL Faixa 4** (5000-10000 kWh/mês)

**Atenção Especial Rural:**

- **Sistemas de Bombeamento**: Considerar inversores com entrada DC para bombeamento direto
- **Variação Sazonal**: Dimensionar para pico de safra (pode exigir +20-30% de capacidade)
- **Estruturas**: Terreno favorável permite estruturas de solo (mais baratas que telhado)

---

### 📊 Faixa 4: 10000-20000 kWh/mês (Média: 15.000 kWh)

#### 🟢 Geração Moderada (115% = 17.250 kWh/mês)

- **Potência Necessária**: 130,0 - 150,0 kWp
- **Custo Estimado**: R$ 260.000 - R$ 300.000
- **ROI**: ~30% a.a. | **Payback**: ~5-6 anos

#### 🟡 Geração Consciente (130% = 19.500 kWh/mês) ⭐ RECOMENDADO

- **Potência Necessária**: 147,0 - 170,0 kWp
- **Custo Estimado**: R$ 294.000 - R$ 340.000
- **ROI**: ~35% a.a. | **Payback**: ~5 anos

#### 🔴 Geração Acelerada (145% = 21.750 kWh/mês)

- **Potência Necessária**: 164,0 - 190,0 kWp
- **Custo Estimado**: R$ 328.000 - R$ 380.000
- **ROI**: ~40% a.a. | **Payback**: ~4-5 anos

---

### 📊 Faixa 5: Acima de 20.000 kWh/mês

**Categoria**: Projetos Rurais de Grande Porte (Pivôs, Granjas, Agroindústria)  
**Recomendação**: Engenharia customizada + análise de demanda horária  
**Potência Típica**: 200+ kWp  
**ROI**: 28-38% a.a. | **Payback**: 5-7 anos

---

## 🏭 INDUSTRIAL (Classe A3/A4)

### Perfil do Consumidor

- **Tarifa Média**: R$ 0,90 - R$ 1,20/kWh (ponta + fora ponta + demanda)
- **Consumo Típico**: 10.000 - 500.000 kWh/mês
- **Payback Médio**: 4-6 anos
- **ROI Esperado**: 30-40% a.a.
- **Complexidade**: Análise de demanda, horário ponta, fator de potência

---

### 📊 Faixa 1: Até 10.000 kWh/mês

**Seguir tabela COMERCIAL Faixa 4** (5000-10000 kWh/mês)

---

### 📊 Faixa 2: 10.000-50.000 kWh/mês (Média: 30.000 kWh)

#### 🟢 Geração Moderada (115% = 34.500 kWh/mês)

- **Potência Necessária**: 260,0 - 300,0 kWp
- **Custo Estimado**: R$ 520.000 - R$ 600.000
- **ROI**: ~30% a.a. | **Payback**: ~5-6 anos

#### 🟡 Geração Consciente (130% = 39.000 kWh/mês) ⭐ RECOMENDADO

- **Potência Necessária**: 293,0 - 340,0 kWp
- **Custo Estimado**: R$ 586.000 - R$ 680.000
- **ROI**: ~35% a.a. | **Payback**: ~4-5 anos

#### 🔴 Geração Acelerada (145% = 43.500 kWh/mês)

- **Potência Necessária**: 328,0 - 380,0 kWp
- **Custo Estimado**: R$ 656.000 - R$ 760.000
- **ROI**: ~40% a.a. | **Payback**: ~4 anos

---

### 📊 Faixa 3: 50.000-100.000 kWh/mês (Média: 75.000 kWh)

#### 🟢 Geração Moderada (115% = 86.250 kWh/mês)

- **Potência Necessária**: 650,0 - 750,0 kWp
- **Custo Estimado**: R$ 1.300.000 - R$ 1.500.000
- **ROI**: ~30% a.a. | **Payback**: ~5-6 anos

#### 🟡 Geração Consciente (130% = 97.500 kWh/mês) ⭐ RECOMENDADO

- **Potência Necessária**: 735,0 - 850,0 kWp
- **Custo Estimado**: R$ 1.470.000 - R$ 1.700.000
- **ROI**: ~35% a.a. | **Payback**: ~4-5 anos

#### 🔴 Geração Acelerada (145% = 108.750 kWh/mês)

- **Potência Necessária**: 820,0 - 950,0 kWp
- **Custo Estimado**: R$ 1.640.000 - R$ 1.900.000
- **ROI**: ~40% a.a. | **Payback**: ~4 anos

---

### 📊 Faixa 4: 100.000-500.000 kWh/mês

**Categoria**: Projetos Industriais de Grande Porte (Usinas < 5MWp)  
**Recomendação**: Engenharia especializada + EPC turnkey  
**Potência Típica**: 1.000 - 5.000 kWp  
**ROI**: 25-35% a.a. | **Payback**: 5-7 anos  
**Observação**: Projetos acima de 1MWp podem se enquadrar em Geração Centralizada (ACL)

---

### 📊 Faixa 5: Acima de 500.000 kWh/mês

**Categoria**: Usinas Fotovoltaicas (> 5MWp) - Geração Centralizada ou Mercado Livre  
**Recomendação**: Consórcio de engenharia + EPCista + análise de viabilidade ACL  
**ROI**: 20-30% a.a. | **Payback**: 6-10 anos

---

## � Estratégia de Contingência Multi-Distribuidor

### Princípios de Recomendação

**Sempre oferecer 3-4 opções** para cada cenário de consumo:

1. **Opção Principal (Tier 1)**: Kit completo do distribuidor principal (FortLev)
   - Melhor custo/benefício
   - Garantia estendida
   - Pronta entrega

2. **Opção Alternativa (Tier 2)**: Kit de distribuidor secundário (FOTUS/NeoSolar)
   - Sistema modular ou tecnologia diferenciada
   - Redundância geográfica (CD diferente)
   - Pode ter custo ligeiramente superior

3. **Opção Budget (Tier 3)**: Kit com especificações ajustadas
   - Mesma faixa de potência mas fabricante econômico
   - Boa relação custo/benefício
   - Pode ter garantia padrão (10-12 anos)

4. **Opção Customizada (Tier 4)**: Componentes avulsos
   - Flexibilidade total na escolha de marcas
   - Mix de distribuidores (ODEX + outros)
   - Ideal quando kits pré-montados estão esgotados

### Mapeamento de Distribuidores por Região

**Sudeste (SP/MG/RJ/ES)**

- **FortLev**: CD Principal (São Paulo) - Entrega 3-5 dias
- **FOTUS**: CD Espírito Santo - Entrega 5-7 dias
- **NeoSolar**: CD São Paulo - Entrega 3-5 dias
- **ODEX**: Plataforma B2B - Entrega 7-10 dias

**Sul (PR/SC/RS)**

- **FortLev**: CD São Paulo → Sul (5-7 dias)
- **FOTUS**: CD ES → Sul (7-10 dias)
- **NeoSolar**: CD Sul (Curitiba/Porto Alegre) - Entrega 3-5 dias

**Nordeste (BA/PE/CE)**

- **FOTUS**: CD Espírito Santo → Nordeste (7-10 dias)
- **NeoSolar**: CD Nordeste (disponibilidade verificar)
- **FortLev**: CD SP → Nordeste (10-15 dias)

### Regras de Fallback (Falta de Estoque)

```typescript
function applyFallbackStrategy(requestedKWp: number, distributor: string) {
  // 1. Buscar kit equivalente (±10% potência)
  const alternatives = findEquivalentKits(requestedKWp, 0.10);
  
  // 2. Se não houver, combinar 2 kits menores
  if (alternatives.length === 0) {
    const twoKitsCombination = findTwoKitsCombination(requestedKWp);
    if (twoKitsCombination) return twoKitsCombination;
  }
  
  // 3. Se ainda não houver, sugerir componentes avulsos
  const customBuild = buildCustomKit(requestedKWp, [
    'ODEX',  // Inversores SAJ
    'NeoSolar',  // Painéis diversos
    'FortLev'  // Estruturas e acessórios
  ]);
  
  return customBuild;
}
```

### Checklist de Disponibilidade

**Antes de recomendar um kit, verificar:**

- [ ] **Estoque principal**: FortLev tem o kit em estoque?
- [ ] **Alternativa 1**: FOTUS tem kit equivalente?
- [ ] **Alternativa 2**: NeoSolar tem kit equivalente?
- [ ] **Componentes avulsos**: ODEX tem inversores + painéis suficientes?
- [ ] **Prazo de entrega**: Cliente aceita esperar 7-10 dias por opção alternativa?
- [ ] **Orçamento**: Cliente tem flexibilidade para kit 10-15% mais caro?

---

## �📦 Inventário de Kits por Faixa de Potência

### Micro Sistemas (< 3 kWp) - **1.321+ kits disponíveis**

| Potência | Quantidade | Fabricantes | Preço Médio | Custo/Watt | Distribuidores |
|----------|------------|-------------|-------------|------------|----------------|
| 1,0-2,0 kWp | 156 | Solar N Plus, Ztroon, Growatt | R$ 2.400 | R$ 2,00/Wp | FOTUS (60%), NeoSolar (40%) |
| 2,0-2,5 kWp | 423 | Growatt, LONGi, Risen | R$ 3.200 | R$ 1,28/Wp | FortLev (87%), FOTUS (8%), NeoSolar (5%) |
| 2,5-3,0 kWp | 898 | LONGi, Risen, BYD | R$ 4.100 | R$ 1,37/Wp | FortLev (92%), FOTUS (5%), NeoSolar (3%) |

**Distribuidores Principais**:

- **FortLev**: 95% do estoque (kits grid-tie completos)
- **FOTUS**: 3% do estoque (sistemas modulares com microinversor)
- **NeoSolar**: 2% do estoque (off-grid e pequenos sistemas)
- **ODEX**: Componentes avulsos (inversores SAJ 3-12kW)

---

### Pequenos Sistemas (3-6 kWp) - **8.942 kits disponíveis**

| Potência | Quantidade | Fabricantes | Preço Médio | Custo/Watt |
|----------|------------|-------------|-------------|------------|
| 3,0-4,0 kWp | 3.254 | LONGi, Risen, BYD | R$ 5.200 | R$ 1,44/Wp |
| 4,0-5,0 kWp | 4.123 | LONGi, Risen, Growatt | R$ 6.400 | R$ 1,42/Wp |
| 5,0-6,0 kWp | 1.565 | LONGi, Sungrow | R$ 7.800 | R$ 1,38/Wp |

**Distribuidores**: NeoSolar (78%), FortLev (18%), FOTUS (4%)

---

### Médios Sistemas (6-10 kWp) - **4.826 kits disponíveis**

| Potência | Quantidade | Fabricantes | Preço Médio | Custo/Watt |
|----------|------------|-------------|-------------|------------|
| 6,0-7,0 kWp | 2.114 | LONGi, Risen | R$ 8.900 | R$ 1,32/Wp |
| 7,0-8,0 kWp | 1.856 | LONGi, Sungrow | R$ 10.200 | R$ 1,29/Wp |
| 8,0-10,0 kWp | 856 | LONGi, Deye | R$ 11.800 | R$ 1,25/Wp |

**Distribuidores**: NeoSolar (85%), FOTUS (10%), FortLev (5%)

---

### Grandes Sistemas (> 10 kWp) - **793 kits disponíveis**

| Potência | Quantidade | Fabricantes | Preço Médio | Custo/Watt |
|----------|------------|-------------|-------------|------------|
| 10-15 kWp | 542 | LONGi, Growatt, Sungrow | R$ 14.500 | R$ 1,21/Wp |
| 15-20 kWp | 187 | Trina, LONGi, Deye | R$ 19.200 | R$ 1,18/Wp |
| > 20 kWp | 64 | Trina, Solis, Huawei | R$ 28.000 | R$ 1,15/Wp |

**Distribuidores**: NeoSolar (92%), FOTUS (8%)

---

## 🏷️ Fabricantes Recomendados por Classe

### 🟢 Econômica (Residencial Até 5kWp)

- **Painéis**: Risen, JA Solar, Jinko Solar
- **Inversores**: Growatt, Goodwe, Sofar Solar
- **Custo/Watt**: R$ 1,20 - R$ 1,45/Wp
- **Garantia Painéis**: 12 anos produto / 25 anos performance
- **Garantia Inversores**: 5 anos (extensível a 10 anos)

### 🟡 Intermediária (Comercial 5-30kWp) ⭐ MAIS VENDIDA

- **Painéis**: LONGi, Trina Solar, Canadian Solar
- **Inversores**: Sungrow, Fronius, SolarEdge
- **Custo/Watt**: R$ 1,15 - R$ 1,35/Wp
- **Garantia Painéis**: 15 anos produto / 30 anos performance
- **Garantia Inversores**: 10 anos padrão

### 🔴 Premium (Industrial > 30kWp)

- **Painéis**: LONGi Hi-MO 6, Trina Vertex, JA Solar DeepBlue
- **Inversores**: Huawei SUN2000, ABB, Sungrow
- **Custo/Watt**: R$ 1,10 - R$ 1,25/Wp
- **Garantia Painéis**: 15 anos produto / 30 anos performance
- **Garantia Inversores**: 10-15 anos

---

## 📊 Distribuidores por Região (Sudeste)

### São Paulo

1. **Photon Energy** - Kits residenciais e comerciais até 50kWp
2. **SolarVolt** - Foco em projetos industriais > 100kWp
3. **Krannich Solar** - Componentes avulsos e inversores premium
4. **Aldo Solar** - Kits econômicos residenciais

### Minas Gerais

1. **Aldo Solar (BH)** - Maior distribuidor MG, kits completos
2. **Ecorie Solar** - Projetos customizados rurais
3. **Grupo Iguá Solar** - Irrigação e bombeamento solar
4. **MG Solar** - Kits residenciais e comerciais

### Rio de Janeiro

1. **RJ Solar Distribuidora** - Kits premium LONGi/Trina
2. **Solar Energy RJ** - Projetos comerciais e industriais
3. **SunVolt Distribuidora** - Componentes e inversores

---

## 🎯 Lógica de Recomendação no Marketplace

### Algoritmo de Seleção de Kit

```typescript
interface ConsumptionTier {
  consumptionMin: number;      // kWh/mês
  consumptionMax: number;      // kWh/mês
  moderateMultiplier: 1.15;   // 115%
  consciousMultiplier: 1.30;  // 130% ⭐ DEFAULT
  acceleratedMultiplier: 1.45; // 145%
}

interface KitRecommendation {
  kitId: string;
  power: number;              // kWp
  price: number;              // R$ (kit only)
  installationCost: number;   // R$ (15-25% do kit)
  totalCost: number;          // R$ (kit + instalação)
  estimatedGeneration: number; // kWh/mês
  roi: number;                // % a.a.
  payback: number;            // anos
  annualMaintenance: number;  // R$ (0,3-0,5% a.a.)
  annualInsurance: number;    // R$ (0,4-0,7% a.a.)
  manufacturer: string;
  inverter: string;
  costPerWatt: number;        // R$/Wp
  tier: 'moderate' | 'conscious' | 'accelerated';
}

function recommendKit(
  consumption: number,          // kWh/mês
  customerClass: 'residential' | 'commercial' | 'rural' | 'industrial',
  tier: 'moderate' | 'conscious' | 'accelerated' = 'conscious'
): KitRecommendation[] {
  
  const multiplier = {
    moderate: 1.15,
    conscious: 1.30,
    accelerated: 1.45
  }[tier];
  
  const targetGeneration = consumption * multiplier;
  const requiredPower = targetGeneration / 135; // Fator solar médio Brasil
  
  // Query inventário
  const availableKits = queryInventory({
    powerMin: requiredPower * 0.9,
    powerMax: requiredPower * 1.15,
    orderBy: 'costPerWatt ASC',
    limit: 5
  });
  
  return availableKits.map(kit => ({
    ...kit,
    installationCost: kit.price * 0.20, // 20% médio
    totalCost: kit.price * 1.20,
    estimatedGeneration: kit.power * 135, // kWh/mês
    roi: calculateROI(kit, customerClass, consumption),
    payback: calculatePayback(kit, customerClass, consumption),
    annualMaintenance: kit.totalCost * 0.004, // 0,4%
    annualInsurance: kit.totalCost * 0.005, // 0,5%
    tier
  }));
}
```

### Regras de Negócio para UI/UX

1. **Default Tier**: Sempre sugerir **"Consciente (130%)"** como opção padrão
2. **Highlight ROI**: Mostrar badge de "Melhor Custo-Benefício" em kits com ROI > 40%
3. **Alertas de Inventário**:
   - 🟢 **> 50 kits**: "Pronta Entrega"
   - 🟡 **10-50 kits**: "Estoque Limitado"
   - 🔴 **< 10 kits**: "Últimas Unidades"
   - ⚠️ **0 kits**: "Projeto Customizado - Consulte"
4. **Filtros Obrigatórios**:
   - Consumo médio mensal (kWh)
   - Classe consumidora
   - Tier de geração
   - Faixa de preço
5. **Comparação**: Permitir comparar até 3 kits lado a lado
6. **Financiamento**: Integrar simulador de financiamento BACEN em tempo real

---

## 💡 Observações Importantes

### ⚠️ Gaps de Inventário Identificados

1. **Sistemas Grandes (> 10kWp)**: Apenas **793 kits** disponíveis (4,8% do estoque)
   - **Impacto**: Clientes comerciais/industriais dependem de projetos customizados
   - **Recomendação**: Expandir linha 10-30kWp em +500 kits

2. **Micro Inversores**: Ausentes no catálogo
   - **Impacto**: Não atende segmento residencial premium (Enphase/APsystems)
   - **Recomendação**: Adicionar 50-100 kits com microinversores

3. **Sistemas Híbridos com Bateria**: Apenas **6 baterias** em estoque
   - **Impacto**: Mercado de backup/off-grid não atendido
   - **Recomendação**: Adicionar 50+ baterias (BYD, Pylontech, LG Chem)

### 📈 Oportunidades de Expansão

1. **Kits Premium com Rastreamento Solar**: 0 kits com trackers
2. **Sistemas Bifaciais**: Apenas LONGi, expandir para Trina/JA Solar
3. **Inversores String Premium**: Fronius/SMA ausentes, apenas Growatt/Sungrow
4. **Otimizadores de Potência**: SolarEdge/Tigo ausentes

---

## 📚 Fontes e Metodologia

### Dados de Custo

- **Portal Solar 2025**: Preços médios de kits por potência
- **Greener Database**: ROI e payback por classe consumidora
- **Canal Solar**: Custos de manutenção e seguros

### Dados de Geração

- **Fator Solar Médio Brasil**: 135 kWh/kWp/mês (varia 110-160 por região)
- **NASA POWER**: Irradiância solar média anual
- **PVGIS**: Simulações de performance ratio

### Inventário

- **Fonte**: Consolidated Inventory YSH (14/10/2025)
- **Total de Produtos**: 16.532
- **Total de Kits**: 15.882 (96,1%)
- **Distribuidores**: NeoSolar, FortLev, FOTUS, ODEX

---

## 🔄 Versionamento

- **v1.0.0** (14/10/2025): Criação inicial com base em inventário consolidado
- **Próximas Atualizações**:
  - Adicionar tarifas regionais específicas (ANEEL 2025)
  - Integrar API de financiamento em tempo real
  - Expandir para classes A1/A2 (alta tensão)

---

**Documento Confidencial - YSH Solar Hub**  
**Última Atualização:** 14 de Outubro de 2025, 15:30 BRT  
**Próxima Revisão:** 21 de Outubro de 2025
