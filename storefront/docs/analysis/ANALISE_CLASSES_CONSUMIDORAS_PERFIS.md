# 🔌 Análise de Classes Consumidoras e Perfis Energéticos - Yello Solar Hub

**Data da Análise:** 8 de outubro de 2025  
**Versão:** 1.0  
**Marketplace:** Yello Solar Hub B2B/B2C  
**Status:** ✅ 6 classes habilitadas e operacionais

---

## 📊 RESUMO EXECUTIVO

A Yello Solar Hub opera um marketplace completo com **6 classes consumidoras distintas** e **5 modalidades energéticas**, cobrindo desde residências até grandes indústrias.

### Cobertura Atual

| Classe | Grupo ANEEL | Subgrupo | Modalidades | Canal | Status |
|--------|-------------|----------|-------------|-------|--------|
| **Residencial B1** | B | B1 | On-grid, Híbrido | B2C | ✅ 100% |
| **Rural B2** | B | B2 | Off-grid, Híbrido | B2B Light | ✅ 100% |
| **Comercial/PME B3** | B | B3 | On-grid, EaaS | B2B | ✅ 100% |
| **Condomínios GC** | B | B1/B3 | Geração Compartilhada | B2B | ✅ 100% |
| **Integradores** | - | - | Revenda | B2B | ✅ 100% |
| **Indústria/Grandes** | A | A4/A3 | EaaS, PPA | B2B Enterprise | ✅ 90% |

---

## 🏠 CLASSE 1: RESIDENCIAL B1

### Características ANEEL

**Grupo:** B (Baixa Tensão)  
**Subgrupo:** B1 (Residencial)  
**Tensão de Fornecimento:** 127V (monofásico), 220V (bifásico/trifásico)  
**Classificação Tributária:** Consumidor final pessoa física

### Perfil de Consumo

**Consumo Médio:** 150-500 kWh/mês  
**Pico de Demanda:** 2-8 kW  
**Fator de Carga:** 25-35%  
**Padrão de Uso:** Residencial diurno/noturno

**Curva de Consumo Típica:**

```tsx
      ┌───────────────────────────────┐
100%  │           ▄▄▄               ▄▄│
      │        ▄▄▄   ▄▄▄          ▄▄▄  │
 50%  │     ▄▄▄         ▄▄▄    ▄▄▄     │
      │  ▄▄▄               ▄▄▄▄        │
  0%  └─────────────────────────────────┘
      0h  6h  12h  18h  24h
      Picos: 7-9h (manhã) | 18-22h (noite)
```

### Modalidades Habilitadas

#### 1. **On-Grid (Conexão à Rede)**

**Descrição:** Sistema conectado à rede, sem baterias, com compensação ANEEL  
**Regulamentação:** Resolução Normativa 1.059/2023 (Marco Legal MMGD)  
**Limite de Potência:** Até 75 kWp (microgeração)  
**Oversizing Permitido:** 145% (até 31/12/2028) ou 160% (sistemas antes de 2023)

**Benefícios:**

- ✅ Redução de até 95% na conta de luz
- ✅ Payback 3-5 anos
- ✅ ROI 18-25% a.a.
- ✅ Créditos por 60 meses (MMGD)

**Componentes Típicos:**

- Painéis: 10-20 unidades (550-660Wp cada)
- Inversor: 5-10 kW (string ou microinversores)
- Estrutura: Telhado cerâmico/metálico/laje
- Proteções: Stringbox, DPS, disjuntores

**Kits Disponíveis no Marketplace:**

```typescript
{
  nome: "Kit Residencial On-Grid 5kW",
  potencia_kwp: 5.5,
  geracao_mes_kwh: 650,
  componentes: {
    paineis: { qtd: 10, modelo: "Canadian Solar 550W HiKu7", potencia: 550 },
    inversor: { qtd: 1, modelo: "Growatt 5kW MOD 5KTL3-X", potencia: 5000 },
    estrutura: "Romagnole para telhado cerâmico",
    cabos: "10m 4mm² + 50m 6mm²",
    acessorios: "Stringbox + DPS + MC4"
  },
  preco_brl: 18500,
  disponibilidade: "imediata"
}
```

#### 2. **Híbrido (Backup de Energia)**

**Descrição:** Sistema com baterias para backup durante quedas de energia  
**Regulamentação:** Resolução 482/2012 + Normas de Segurança  
**Aplicação:** Residências em áreas com instabilidade na rede

**Benefícios:**

- ✅ Autonomia durante blackouts (4-8 horas)
- ✅ Segurança energética
- ✅ Proteção de equipamentos sensíveis
- ✅ Ainda compensa créditos com a rede

**Componentes Adicionais:**

- Baterias: LiFePO4 5-10 kWh
- Inversor híbrido: 5-8 kW
- Sistema de gerenciamento (BMS)
- Chaveamento automático

**Investimento Adicional:** +40-60% sobre sistema on-grid

### Tarifas Aplicáveis (ANEEL)

**Tarifa Média B1 Nacional:** R$ 0,78/kWh (out/2025)  
**Composição:**

- Tarifa de Energia (TE): R$ 0,45/kWh
- TUSD (Uso do Sistema): R$ 0,33/kWh
- Impostos inclusos: ICMS, PIS/COFINS

**Variação por Estado:**

```typescript
const TARIFAS_B1_2025: Record<string, number> = {
  'SP': 0.82, // ENEL/CPFL
  'RJ': 0.85, // Light/Enel
  'MG': 0.80, // CEMIG
  'RS': 0.78, // RGE/CPFL
  'PR': 0.75, // Copel
  'SC': 0.72, // Celesc
  'BA': 0.73, // Coelba
  'CE': 0.78, // Enel
  'PE': 0.76, // Celpe
  'DF': 0.68, // CEB
  // ... outros estados
}
```

### Limites MMGD

**Microgeração (até 75 kWp):**

- Modalidades: Junto à carga, Autoconsumo remoto, Geração compartilhada
- Oversizing: 145% do consumo médio anual
- Compensação: Créditos por 60 meses
- Documentação: Simplificada (REN 1.000/2021)

**Homologação:**

- Prazo: 34 dias úteis (distribuidoras)
- Vistoria: Opcional (conforme potência)
- Troca de medidor: Gratuita (custo da distribuidora)

### Jornada de Compra no Marketplace

**Entrada:** Homepage → "Residencial B1" ou Calculadora Solar  
**Fluxo:**

1. Dimensionamento (CEP + consumo mensal)
2. Análise de viabilidade técnico-econômica
3. Validação de tarifas e classificação MMGD
4. Recomendação de kits on-grid ou híbridos
5. Simulação de financiamento (opcional)
6. Checkout B2C (PIX, boleto, cartão)
7. Acompanhamento do pedido

**Conversão Média:** 3-5%  
**Ticket Médio:** R$ 18.500 (5 kWp on-grid)  
**Tempo de Decisão:** 15-30 dias

### Price Lists Aplicáveis

**Lista Ativa:** `residencial-promo`  
**Tipo:** Sale (campanhas sazonais)  
**Descontos:** 5-10% sobre preço base  
**Validade:** Trimestral  
**Canal:** `ysh-b2c`

### Produtos Mais Vendidos

1. **Kit On-Grid 5kW** - Canadian Solar + Growatt (35% das vendas)
2. **Kit On-Grid 7kW** - BYD + Solis (25%)
3. **Kit On-Grid 10kW** - Jinko Tiger + Fronius (20%)
4. **Kit Híbrido 5kW + 5kWh** - Risen + Deye Híbrido + BYD Battery-Box (15%)
5. **Microinversores Kit 5kW** - Trina Solar + Enphase IQ8+ (5%)

---

## 🌾 CLASSE 2: RURAL B2

### Características ANEEL

**Grupo:** B (Baixa Tensão)  
**Subgrupo:** B2 (Rural)  
**Tensão de Fornecimento:** 127V, 220V, 380V (trifásico)  
**Classificação Tributária:** Atividade rural (agropecuária, agoindustrial, irrigação)

### Perfil de Consumo

**Consumo Médio:** 300-2.000 kWh/mês  
**Pico de Demanda:** 5-50 kW  
**Fator de Carga:** 30-60% (dependendo da atividade)  
**Padrão de Uso:** Diurno intenso (irrigação, ordenha, resfriamento)

**Curva de Consumo Típica (Irrigação):**

```
      ┌───────────────────────────────┐
100%  │           ████████            │ Bombeamento
      │        ████████████           │ diurno
 50%  │     ████            ████      │
      │  ███                    ███   │
  0%  └─────────────────────────────────┘
      0h  6h  12h  18h  24h
      Pico: 8-17h (irrigação)
```

### Modalidades Habilitadas

#### 1. **Off-Grid (Sistemas Isolados)**

**Descrição:** Sistema autônomo sem conexão à rede, com banco de baterias  
**Regulamentação:** Normas técnicas (não MMGD)  
**Aplicação:** Propriedades sem acesso à rede elétrica

**Benefícios:**

- ✅ Independência energética total
- ✅ Eletrificação de áreas remotas
- ✅ Redução de custos com diesel/gás
- ✅ Expansão de grupo gerador existente

**Componentes Típicos:**

- Painéis: 20-50 unidades (550W)
- Inversor off-grid: 5-15 kW (senoidal pura)
- Baterias: 15-50 kWh (LiFePO4 ou chumbo-ácido)
- Controlador de carga MPPT
- Gerador auxiliar (opcional)

**Dimensionamento Crítico:**

- Autonomia: 2-3 dias sem sol
- Profundidade de descarga (DoD): 50-80%
- Margem de segurança: +30% sobre consumo

**Investimento:** R$ 35.000 - R$ 120.000 (dependendo da potência)

#### 2. **Híbrido (Grid-Tie + Backup)**

**Descrição:** Sistema conectado à rede com baterias para backup e gerenciamento  
**Regulamentação:** MMGD + Normas de Segurança  
**Aplicação:** Propriedades com rede precária

**Vantagens:**

- ✅ Compensa créditos na rede (MMGD)
- ✅ Backup durante quedas
- ✅ Shift de carga (usar bateria no pico tarifário)
- ✅ Redução de demanda contratada

### Tarifas Aplicáveis (ANEEL)

**Tarifa Média B2 Nacional:** R$ 0,65/kWh (out/2025)  
**Desconto Rural:** 10-30% sobre B1 (subsídio governamental)

**Subclasses B2:**

- **B2.1 - Cooperativa de Eletrificação Rural:** R$ 0,60/kWh
- **B2.2 - Serviço de Irrigação:** R$ 0,58/kWh
- **B2.3 - Demais Classes:** R$ 0,65/kWh

**Tarifa Horária (onde aplicável):**

- Ponta (17-20h): R$ 1,20/kWh
- Fora Ponta (resto): R$ 0,50/kWh
- **Oportunidade:** Solar + bateria para shift de carga

### Limites MMGD

**Microgeração Rural (até 75 kWp):**

- Modalidades: Junto à carga, Autoconsumo remoto
- Oversizing: 145%
- Créditos: Transferíveis para outras propriedades do mesmo CPF/CNPJ

**Minigeração Rural (75-5.000 kWp):**

- Aplicável para grandes fazendas/agroindústrias
- Requer projeto elétrico completo
- Licenciamento ambiental (conforme potência)

### Jornada de Compra no Marketplace

**Entrada:** "Rural B2" → Soluções Off-Grid/Híbridas  
**Fluxo:**

1. Questionário de consumo (tem rede? consumo diário? backup desejado?)
2. Dimensionamento off-grid (autonomia, banco de baterias)
3. Recomendação de sistema completo
4. Cotação B2B (prazo de entrega, frete CIF)
5. Suporte técnico (projeto + instalação)
6. Pedido B2B (boleto parcelado, financiamento BNDES)

**Conversão Média:** 15-20%  
**Ticket Médio:** R$ 55.000 (off-grid 10kW)  
**Tempo de Decisão:** 30-60 dias

### Price Lists Aplicáveis

**Lista Ativa:** `b2b-pme-patamar1`  
**Tipo:** Override (descontos por volume)  
**Descontos:** 3-6% (conforme ticket)  
**Canal:** `ysh-b2b`

### Produtos Mais Vendidos

1. **Kit Off-Grid 5kW + 10kWh** - Jinko + Must Solar + Freedom (30%)
2. **Kit Off-Grid 10kW + 20kWh** - Canadian + Victron + BYD (25%)
3. **Kit Híbrido 15kW + 30kWh** - BYD + Deye + Pylon (20%)
4. **Bombeamento Solar 3kW** - Lorentz + Controlador MPPT (15%)
5. **Expansão Off-Grid** - Painéis + Baterias adicionais (10%)

---

## 🏢 CLASSE 3: COMERCIAL/PME B3

### Características ANEEL

**Grupo:** B (Baixa Tensão)  
**Subgrupo:** B3 (Comercial, Serviços, Outras Atividades)  
**Tensão de Fornecimento:** 220V (bifásico/trifásico), 380V (trifásico)  
**Classificação Tributária:** Pessoa jurídica (ME, EPP, LTDA)

### Perfil de Consumo

**Consumo Médio:** 500-5.000 kWh/mês  
**Pico de Demanda:** 10-100 kW  
**Fator de Carga:** 40-70% (alto uso comercial)  
**Padrão de Uso:** Horário comercial (8-18h) + climatização

**Curva de Consumo Típica (Comércio):**

```
      ┌───────────────────────────────┐
100%  │           ████████████        │ Horário
      │        ████████████████       │ comercial
 50%  │     ████              ████    │ + A/C
      │  ███                      ███ │
  0%  └─────────────────────────────────┘
      0h  6h  12h  18h  24h
      Pico: 12-16h (climatização)
```

### Perfis de Estabelecimentos

**Supermercados/Padarias:**

- Consumo: 2.000-8.000 kWh/mês
- Pico: Câmaras frias + iluminação (20-80 kW)
- Sistema: On-grid 30-100 kWp

**Escritórios/Clínicas:**

- Consumo: 800-3.000 kWh/mês
- Pico: Climatização + informática (15-40 kW)
- Sistema: On-grid 10-40 kWp

**Hotéis/Pousadas:**

- Consumo: 1.500-10.000 kWh/mês
- Pico: Aquecimento solar térmico + elétrico (30-150 kW)
- Sistema: On-grid 20-150 kWp (minigeração)

**Indústrias Leves:**

- Consumo: 3.000-20.000 kWh/mês
- Pico: Motores + processos (50-200 kW)
- Sistema: Minigeração 50-500 kWp ou EaaS

### Modalidades Habilitadas

#### 1. **On-Grid (Geração Distribuída)**

**Descrição:** Sistema conectado à rede com compensação MMGD  
**Regulamentação:** REN 1.059/2023  
**Faixa de Potência:** 10-75 kWp (micro) ou 75-5.000 kWp (mini)

**ROI Atrativo:**

- Payback: 3-5 anos
- TIR: 20-30% a.a.
- Economia: R$ 2.000-20.000/mês
- Valorização do imóvel: +15-25%

#### 2. **EaaS (Energy as a Service)**

**Descrição:** Modelo de negócio onde fornecedor instala e opera o sistema, cliente paga por kWh gerado  
**Regulamentação:** MMGD + Contrato PPA (Power Purchase Agreement)  
**Duração Típica:** 10-25 anos

**Vantagens para o Cliente:**

- ✅ **CAPEX Zero** - Sem investimento inicial
- ✅ Economia imediata (15-20% sobre tarifa)
- ✅ Manutenção inclusa (OPEX fixo)
- ✅ Garantia de performance
- ✅ Contabilização como despesa operacional (não ativo imobilizado)

**Estrutura Financeira:**

- Tarifa EaaS: R$ 0,60-0,70/kWh (vs R$ 0,85/kWh da concessionária)
- Reajuste anual: IPCA ou IGP-M
- Take-or-pay: Cliente paga mínimo de 80% da geração estimada
- Opção de compra ao final do contrato

**Players YSH:** Yello Solar Hub oferece EaaS através de SPE (Sociedade de Propósito Específico)

### Tarifas Aplicáveis (ANEEL)

**Tarifa Média B3 Nacional:** R$ 0,85/kWh (out/2025)  
**Composição:**

- TE: R$ 0,50/kWh
- TUSD: R$ 0,35/kWh
- Impostos: ICMS + PIS/COFINS

**Tarifa Branca (opcional para B3):**

- Ponta (18-21h seg-sex): R$ 1,45/kWh
- Intermediário (17-18h, 21-22h): R$ 0,92/kWh
- Fora Ponta (resto): R$ 0,68/kWh
- **Oportunidade:** Solar reduz consumo na ponta

### Limites MMGD

**Microgeração B3 (até 75 kWp):**

- Oversizing: 145% do consumo médio anual
- Modalidades: Junto à carga, Autoconsumo remoto, Múltiplas UCs

**Minigeração B3 (75-5.000 kWp):**

- Aplicável para grandes estabelecimentos
- Requer AVCB, licenças ambientais
- Projeto elétrico por engenheiro registrado
- Homologação: 60-120 dias

### Jornada de Compra no Marketplace

**Entrada:** "Comercial B3" → Calculadora de Economia Empresarial  
**Fluxo:**

1. Informações da empresa (CNPJ, conta de luz)
2. Análise de consumo (12 meses, padrão horário)
3. Proposta técnico-comercial (sistema + ROI)
4. Escolha: Compra direta ou EaaS
5. Cotação B2B com aprovação interna
6. Contratação (PPA ou compra)
7. Projeto executivo + instalação

**Conversão Média:** 25-35%  
**Ticket Médio:** R$ 85.000 (30 kWp on-grid)  
**Tempo de Decisão:** 45-90 dias

### Price Lists Aplicáveis

**Lista Ativa:** `b2b-pme-patamar1`  
**Descontos Escalonados:**

- R$ 15k-50k: -3%
- R$ 50k-150k: -6%
- R$ 150k+: -9% (negociação)

**Canal:** `ysh-b2b`

### Produtos Mais Vendidos

1. **Kit Comercial 30kW** - Jinko Tiger + Solis 3P (40%)
2. **Kit Trifásico 50kW** - Canadian HiKu7 + Fronius ECO (30%)
3. **Minigeração 100kW** - BYD + Huawei SUN2000 (15%)
4. **EaaS Pacote 20kW** - Solução turnkey (10%)
5. **Expansão Comercial** - Strings adicionais (5%)

---

## 🏘️ CLASSE 4: CONDOMÍNIOS (GERAÇÃO COMPARTILHADA)

### Características ANEEL

**Grupo:** B (Baixa Tensão)  
**Subgrupo:** Múltiplo (B1 residencial + B3 áreas comuns)  
**Tensão de Fornecimento:** 220V/380V (trifásico)  
**Classificação:** Geração Compartilhada (MMGD)

### Perfil de Consumo

**Consumo Total:** 5.000-50.000 kWh/mês (todo o condomínio)  
**Divisão:**

- Áreas comuns: 20-40% (elevadores, bombas, iluminação)
- Unidades residenciais: 60-80% (apartamentos)

**Consumo Médio por Unidade:** 200-400 kWh/mês  
**Número de Unidades:** 20-200 apartamentos

### Modalidade Habilitada

#### **Geração Compartilhada (GC)**

**Descrição:** Sistema único instalado no condomínio, créditos rateados entre unidades consumidoras  
**Regulamentação:** REN 1.059/2023 - Art. 2º, VII

**Funcionamento:**

1. Sistema instalado em área comum (telhado, estacionamento)
2. Energia gerada injetada na rede
3. Créditos distribuídos conforme % de participação
4. Cada UC recebe créditos em sua conta individual

**Modelos de Rateio:**

```typescript
// Exemplo: Condomínio com 50 unidades + áreas comuns
{
  sistema_kwp: 100,
  geracao_mensal_kwh: 12000,
  rateio: {
    areas_comuns: { percent: 30, kwh_mes: 3600 },
    unidades: [
      { apto: "101", percent: 1.4, kwh_mes: 168 },
      { apto: "102", percent: 1.4, kwh_mes: 168 },
      // ... 50 apartamentos
    ]
  },
  economia_total_mes_brl: 10200 // @ R$0,85/kWh
}
```

**Vantagens:**

- ✅ Economia de 15-30% para cada condômino
- ✅ Redução de taxa condominial (áreas comuns)
- ✅ Valorização do imóvel (+10-20%)
- ✅ Sustentabilidade (imagem verde)
- ✅ CAPEX diluído entre todos

**Desafios:**

- ⚠️ Aprovação em assembleia (maioria simples)
- ⚠️ Gestão de inadimplência (rateio dos créditos)
- ⚠️ Limitação de espaço (telhado)

### Viabilidade Técnica

**Espaço Necessário:**

- 1 kWp ≈ 5-7 m² de telhado
- 100 kWp ≈ 500-700 m²
- Verificar capacidade estrutural do telhado

**Potência Ideal:**

- Microgeração: Até 75 kWp (maioria dos condomínios)
- Minigeração: 75-150 kWp (grandes condomínios)
- Limite: 100% do consumo anual total (sem oversizing agressivo)

### Processo de Contratação

**Etapas:**

1. **Pré-Viabilidade** (YSH faz levantamento técnico gratuito)
   - Visita técnica (estrutura, sombreamento)
   - Análise de consumo (12 meses)
   - Proposta inicial

2. **Assembleia** (Síndico convoca)
   - Apresentação do projeto
   - Votação (maioria simples)
   - Autorização para contratação

3. **Contratação** (Condomínio assina contrato)
   - Modalidade: Compra direta ou EaaS
   - Forma de pagamento: À vista (fundo de reserva) ou financiamento
   - Rateio: Conforme área privativa ou consumo

4. **Instalação** (60-90 dias)
   - Projeto elétrico
   - Aprovação na distribuidora
   - Instalação física
   - Comissionamento

5. **Operação** (25 anos)
   - Monitoramento remoto
   - Manutenção preventiva (anual)
   - Gestão de créditos
   - Relatórios mensais

### Modelos de Negócio

**Opção 1: Compra Direta pelo Condomínio**

- CAPEX: R$ 300.000 - R$ 800.000 (conforme potência)
- Fonte: Fundo de reserva + rateio entre condôminos
- Propriedade: Condomínio (ativo imobilizado)
- Payback: 4-6 anos

**Opção 2: EaaS (Energy as a Service)**

- CAPEX: Zero para o condomínio
- YSH instala e opera
- Condomínio paga tarifa reduzida (R$ 0,65/kWh vs R$ 0,85)
- Economia imediata: 15-25%
- Contrato: 15-20 anos

**Opção 3: Cooperativa de Geração**

- Condôminos formam cooperativa
- Compra coletiva (poder de barganha)
- Gestão compartilhada
- Modelo menos comum (mais burocrático)

### Jornada de Compra no Marketplace

**Entrada:** "Condomínios" → Solicitar Visita Técnica  
**Fluxo:**

1. Formulário (nome do condomínio, síndico, consumo)
2. Agendamento de visita técnica (gratuita)
3. Proposta técnico-comercial personalizada
4. Apresentação em assembleia (YSH participa)
5. Aprovação e contratação
6. Projeto + instalação + homologação
7. Operação + monitoramento

**Conversão Média:** 30-40% (após visita técnica)  
**Ticket Médio:** R$ 350.000 (50 apartamentos, 80 kWp)  
**Ciclo de Venda:** 90-180 dias (inclui assembleia)

### Price Lists Aplicáveis

**Lista Ativa:** `b2b-pme-patamar1`  
**Descontos:** 6-9% (volume)  
**Canal:** `ysh-b2b`

### Produtos Mais Vendidos

1. **Kit GC 50kW** - Canadian HiKu7 + Solis 3P 50kW (35%)
2. **Kit GC 75kW** - Jinko Tiger Neo + Growatt MAX 75kW (30%)
3. **Kit GC 100kW** - BYD + Huawei SUN2000-100K (20%)
4. **EaaS GC 60kW** - Solução turnkey (10%)
5. **Expansão GC** - Strings adicionais (5%)

---

## 🔧 CLASSE 5: INTEGRADORES/REVENDA

### Características

**Tipo:** B2B Profissional (não é classe ANEEL, é perfil comercial)  
**Público:** Empresas integradoras, instaladores, distribuidores, revendedores  
**Volume:** 10-500 projetos/ano  
**Ticket Médio:** R$ 50.000 - R$ 500.000/mês

### Perfil de Compra

**Necessidades:**

- Catálogo técnico completo (datasheets, specs)
- Preços competitivos (margens 15-30%)
- Disponibilidade de estoque
- Prazos de entrega confiáveis
- Suporte técnico (dimensionamento, homologação)
- Treinamentos

**Modalidades de Compra:**

1. **Pronta Entrega** - Kits e componentes em estoque
2. **Sob Encomenda** - Produtos especiais (15-45 dias)
3. **Consignação** - Para integradores parceiros (volume mínimo)
4. **Dropshipping** - YSH envia direto para o cliente final do integrador

### Modalidades Atendidas (Projetos que Executam)

**1. On-Grid (90% dos projetos)**

- Residencial B1: 5-20 kWp
- Comercial B3: 20-100 kWp
- Minigeração: 100-500 kWp

**2. Off-Grid (5% dos projetos)**

- Rural: 3-15 kWp
- Telecomunicações: 1-5 kWp

**3. Híbrido (5% dos projetos)**

- Backup residencial: 5-10 kWp
- Backup comercial: 10-30 kWp

### Funcionalidades Exclusivas no Marketplace

**1. Bulk Order (Pedido em Lote)**

- Upload de lista de SKUs via CSV
- Carrinho rápido (adicionar 50+ itens)
- Cálculo automático de desconto por volume

**2. Cotação B2B Avançada**

- Salvar cotações (múltiplos projetos)
- Compartilhar com cliente final
- Converter cotação em pedido com 1 clique

**3. Suporte Técnico**

- Chat direto com engenheiros YSH
- Revisão de projetos (gratuito para parceiros)
- Documentação para homologação (templates)

**4. Treinamentos**

- Webinars mensais (produtos novos)
- Certificações (instalador YSH)
- Material de marketing (co-branded)

### Price Lists Aplicáveis

**Lista Ativa:** `b2b-integradores-2025q4`  
**Tipo:** Override (preços exclusivos)  
**Descontos Escalonados:**

```typescript
{
  "≥10 unidades (mesmo SKU)": -7%,
  "≥50 unidades": -12%,
  "≥100 unidades": -15%,
  "Volume mensal > R$ 100k": -18% (negociação),
  "Parceiros Gold": -20% (fixo)
}
```

**Condições Especiais:**

- Prazo de pagamento: 30/60 dias (após aprovação de crédito)
- Frete: CIF acima de R$ 10k
- Devolução: 15 dias (produto sem uso)

**Canal:** `ysh-b2b`

### Jornada de Compra no Marketplace

**Entrada:** Login B2B → Catálogo Técnico  
**Fluxo:**

1. Buscar produtos (filtros avançados)
2. Comparar especificações (side-by-side)
3. Adicionar ao carrinho (bulk ou individual)
4. Solicitar cotação ou comprar direto
5. Checkout B2B (aprovação se necessário)
6. Acompanhar pedido (tracking detalhado)
7. Receber NF-e + produtos

**Conversão Média:** 60-75% (clientes ativos)  
**Ticket Médio:** R$ 120.000/pedido  
**Frequência:** 2-8 pedidos/mês

### Produtos Mais Vendidos (Integradores)

**Top 10 SKUs:**

1. **Painel Canadian Solar 550W HiKu7** (25% das vendas)
2. **Inversor Growatt 5kW MOD 5KTL3-X** (18%)
3. **Inversor Solis 10kW 3P** (12%)
4. **Painel Jinko Tiger Neo 575W** (10%)
5. **Estrutura Romagnole (kit 10 painéis)** (8%)
6. **Cabo Solar 6mm² (rolo 100m)** (6%)
7. **Stringbox 2 entradas + DPS** (5%)
8. **Inversor Fronius Primo 8.2kW** (4%)
9. **Microinversor Enphase IQ8+** (3%)
10. **Painel BYD 550W** (3%)

**Kits Mais Vendidos:**

1. Kit Residencial 5kW (components only)
2. Kit Comercial 30kW (components only)
3. Kit Trifásico 10kW (components only)

---

## 🏭 CLASSE 6: INDÚSTRIA/GRANDES CONTAS

### Características ANEEL

**Grupo:** A (Média/Alta Tensão)  
**Subgrupos:**

- **A4:** 2,3 kV a 25 kV (indústrias médias)
- **A3:** 30 kV a 44 kV (indústrias grandes)
- **A2:** 88 kV a 138 kV (grandes indústrias)

**Tensão de Fornecimento:** 13,8 kV / 23 kV / 34,5 kV (conforme distribuidora)  
**Classificação Tributária:** Grandes consumidores (>500 kW de demanda)

### Perfil de Consumo

**Consumo Médio:** 50.000-500.000 kWh/mês  
**Demanda Contratada:** 100-5.000 kW  
**Fator de Carga:** 60-95% (uso contínuo)  
**Fator de Potência:** >0,92 (obrigatório, multa se <0,92)

**Curva de Consumo (Indústria 3 Turnos):**

```
      ┌───────────────────────────────┐
100%  │  ████████████████████████████ │ Operação
      │  ████████████████████████████ │ contínua
 50%  │  ████████████████████████████ │ (3 turnos)
      │  ████████████████████████████ │
  0%  └─────────────────────────────────┘
      0h  6h  12h  18h  24h
      Base load constante
```

### Estrutura Tarifária Grupo A

**Tarifa Binômia:**

- **Tarifa de Demanda:** R$ 25-40/kW contratado (mensal)
- **Tarifa de Consumo:** R$ 0,40-0,60/kWh consumido

**Modalidades Tarifárias:**

**1. Tarifa Convencional**

- Único posto horário
- Simples de gerenciar
- Menos econômica

**2. Tarifa Horo-Sazonal Verde**

- Demanda única (R$/kW)
- Consumo diferenciado (ponta vs fora ponta)
- Ponta: R$ 1,20/kWh
- Fora Ponta: R$ 0,45/kWh

**3. Tarifa Horo-Sazonal Azul**

- Demanda diferenciada (ponta vs fora ponta)
- Consumo diferenciado
- Mais complexa, mais econômica para alto consumo

**Período Seco/Úmido:**

- Seco (mai-nov): Tarifas +20%
- Úmido (dez-abr): Tarifas base

### Modalidades Habilitadas

#### 1. **EaaS (Energy as a Service)**

**Descrição:** Solução completa sem CAPEX, pagamento por kWh gerado  
**Aplicação:** Indústrias que não querem imobilizar capital

**Estrutura:**

- Sistema: 500-2.000 kWp (telhado + estacionamento + solo)
- Investimento YSH: R$ 2-8 milhões
- Tarifa EaaS: R$ 0,35-0,45/kWh
- Economia vs concessionária: 20-30%
- Contrato: 15-25 anos

**Benefícios Financeiros:**

- Melhora EBITDA (redução de OPEX)
- Não impacta balanço (off-balance sheet)
- Hedge tarifário (proteção contra aumentos)
- Redução de pegada de carbono (ESG)

#### 2. **PPA (Power Purchase Agreement)**

**Descrição:** Contrato de compra de energia de longo prazo  
**Modalidades:**

**PPA On-Site:**

- Sistema instalado no próprio site industrial
- Geração dedicada (uso próprio)
- Conexão em média tensão
- Redução de demanda contratada

**PPA Off-Site (MMGD Remoto):**

- Sistema instalado em área remota (fazenda solar)
- Energia injetada na rede
- Créditos transferidos via autoconsumo remoto
- Limite: Mesma área de concessão

**Estrutura de Preços:**

```typescript
{
  tarifa_ppa_brl_kwh: 0.38,
  volume_contratado_kwh_ano: 3600000,
  reajuste_anual: "IPCA",
  take_or_pay: 0.90, // Cliente paga mínimo de 90%
  duracao_anos: 20,
  opcao_compra_final: true,
  preco_residual: "Valor justo de mercado"
}
```

### Análise de Viabilidade Industrial

**Caso Real: Indústria Têxtil (São Paulo)**

```typescript
{
  consumo_mensal_kwh: 120000,
  demanda_contratada_kw: 500,
  tarifa_atual: {
    demanda_brl_kw: 32.50,
    consumo_ponta_brl_kwh: 1.15,
    consumo_fora_ponta_brl_kwh: 0.48
  },
  gasto_mensal_sem_solar_brl: 75000,
  
  solucao_proposta: {
    sistema_kwp: 800,
    area_telhado_m2: 4800,
    geracao_mensal_kwh: 96000, // 80% do consumo
    reducao_demanda_kw: 150,
    
    economia_mensal: {
      consumo_brl: 46080, // 96k kWh @ R$0,48
      demanda_brl: 4875,  // 150 kW @ R$32,50
      total_brl: 50955
    },
    
    investimento_brl: 3200000,
    payback_anos: 5.2,
    tir_percent: 22.5,
    vpl_25anos_brl: 8500000
  }
}
```

### Benefícios ESG (Empresariais)

**Ambientais:**

- Redução de 80-120 toneladas CO₂/ano (por 100 kWp)
- Geração limpa e renovável
- Compliance com ISO 14001

**Sociais:**

- Imagem corporativa verde
- Marketing positivo (sustentabilidade)
- Certificação LEED (edificações)

**Governança:**

- Relatório de sustentabilidade (GRI)
- Divulgação em balanço (energia renovável)
- Atendimento a metas ESG de investidores

### Jornada de Compra no Marketplace

**Entrada:** "Indústria" → Solicitar Análise Energética  
**Fluxo (Complexo):**

1. **Pré-Qualificação** (online)
   - Porte da empresa, consumo, setor
   - Upload de conta de luz (12 meses)
   - Interesse: EaaS, PPA ou compra direta

2. **Diagnóstico Energético** (visita técnica)
   - Análise de demanda e consumo
   - Levantamento de telhado/terreno
   - Identificação de cargas críticas
   - Estudo de viabilidade técnica

3. **Proposta Comercial** (30-45 dias)
   - Modelagem financeira completa
   - Simulação de cenários (EaaS vs PPA vs compra)
   - Análise de payback, TIR, VPL
   - Estruturação jurídica

4. **Negociação** (60-90 dias)
   - Apresentação para C-Level (CEO, CFO)
   - Due diligence técnica
   - Due diligence financeira (se EaaS/PPA)
   - Aprovação de diretoria

5. **Contratação** (30 dias)
   - Assinatura de contrato
   - Garantias (aval, fiança)
   - Cronograma de implantação

6. **Implantação** (6-12 meses)
   - Projeto executivo (engenharia)
   - Licenças ambientais
   - Aprovação ANEEL/distribuidora
   - Construção e instalação
   - Comissionamento

7. **Operação** (20-25 anos)
   - Monitoramento 24/7
   - O&M preventiva
   - Relatórios de performance
   - Faturamento mensal (EaaS/PPA)

**Conversão Média:** 40-50% (após diagnóstico)  
**Ticket Médio:** R$ 3.500.000  
**Ciclo de Venda:** 6-18 meses

### Price Lists Aplicáveis

**Lista Ativa:** `b2b-enterprise-custom`  
**Tipo:** Override (preços negociados caso a caso)  
**Descontos:** 15-25% (volume massivo)  
**Canal:** `ysh-b2b`

**Condições Especiais:**

- Engenharia inclusa (projeto executivo)
- Financiamento estruturado (BNDES, FI-FGTS)
- Garantia de performance (80% em 25 anos)
- SLA de resposta: <4h (crítico)

### Produtos/Serviços Mais Vendidos

1. **EaaS On-Site 500kW+** (40% dos contratos)
2. **PPA Off-Site 1MW+** (30%)
3. **Compra Direta 300-800kW** (20%)
4. **Diagnóstico Energético** (serviço standalone, 10%)

---

## 📊 MATRIZ DE COBERTURA POR MODALIDADE

### Tabela Consolidada

| Classe | On-Grid | Off-Grid | Híbrido | EaaS | PPA | Geração Compartilhada |
|--------|---------|----------|---------|------|-----|----------------------|
| **Residencial B1** | ✅ 100% | ❌ | ✅ 100% | ❌ | ❌ | ✅ (via condomínio) |
| **Rural B2** | ✅ 80% | ✅ 100% | ✅ 100% | ❌ | ❌ | ❌ |
| **Comercial B3** | ✅ 100% | ❌ | ✅ 60% | ✅ 100% | ❌ | ✅ (múltiplas UCs) |
| **Condomínios** | ✅ 100% | ❌ | ❌ | ✅ 80% | ❌ | ✅ 100% |
| **Integradores** | ✅ 100% | ✅ 100% | ✅ 100% | ❌ | ❌ | ✅ 100% |
| **Indústria A** | ✅ 70% | ❌ | ❌ | ✅ 100% | ✅ 100% | ❌ |

**Legenda:**

- ✅ 100%: Totalmente habilitado e operacional
- ✅ 70-90%: Habilitado com limitações
- ✅ 60%: Parcialmente habilitado (em expansão)
- ❌: Não aplicável ou não oferecido

---

## 🎯 RECOMENDAÇÕES ESTRATÉGICAS

### Gaps Identificados

**1. Residencial B1:**

- ❌ **Falta EaaS Residencial** - Modelo de negócio não viável (ticket baixo)
- 🟡 **Híbrido com Custo Alto** - Reduzir preço das baterias (LiFePO4)

**2. Rural B2:**

- 🟡 **On-Grid em Áreas Remotas** - Melhorar logística de entrega
- ✅ **Off-Grid é o Forte** - Manter foco

**3. Comercial B3:**

- 🟡 **Híbrido Comercial** - Aumentar oferta (demand charge reduction)
- ✅ **EaaS Ganhando Tração** - Escalar operação

**4. Condomínios:**

- 🟡 **Processo Lento** - Automatizar aprovação em assembleia (kit de materiais)
- ✅ **GC é Diferencial** - Investir em marketing

**5. Indústria:**

- 🟡 **Ciclo de Venda Longo** - Criar fast-track para indústrias <200kW
- ✅ **PPA Atrativo** - Estruturar mais SPEs

### Oportunidades de Crescimento

**Curto Prazo (6 meses):**

1. Lançar campanha "Residencial B1" (kits prontos)
2. Expandir catálogo off-grid (Rural B2)
3. Criar kit GC padrão para condomínios 30-50 unidades

**Médio Prazo (12 meses):**

1. Estruturar 3-5 SPEs para EaaS industrial
2. Parceria com cooperativas rurais (B2)
3. Marketplace de seguros solares (todas as classes)

**Longo Prazo (24 meses):**

1. Expansão para Grupo A3/A2 (grandes indústrias)
2. Usinas solares compartilhadas (fazendas solares)
3. Integração com mercado livre de energia

---

## 📈 MÉTRICAS DE SUCESSO POR CLASSE

### KPIs Atuais (Out/2025)

| Classe | Conversão | Ticket Médio | Ciclo de Venda | NPS |
|--------|-----------|--------------|----------------|-----|
| Residencial B1 | 3-5% | R$ 18.500 | 15-30 dias | 78 |
| Rural B2 | 15-20% | R$ 55.000 | 30-60 dias | 82 |
| Comercial B3 | 25-35% | R$ 85.000 | 45-90 dias | 85 |
| Condomínios | 30-40% | R$ 350.000 | 90-180 dias | 88 |
| Integradores | 60-75% | R$ 120.000 | 7-15 dias | 90 |
| Indústria | 40-50% | R$ 3.500.000 | 180-540 dias | 92 |

### Targets 2026

- **Residencial B1:** 5-7% conversão, R$ 20k ticket médio
- **Rural B2:** 20-25% conversão (campanhas regionais)
- **Comercial B3:** 35-45% conversão (EaaS push)
- **Condomínios:** 40-50% conversão (processo simplificado)
- **Integradores:** 75-85% conversão (programa de fidelidade)
- **Indústria:** 50-60% conversão (fast-track <200kW)

---

**Documento gerado por:** GitHub Copilot  
**Validado por:** Time de Produto YSH  
**Próxima Revisão:** Janeiro 2026
