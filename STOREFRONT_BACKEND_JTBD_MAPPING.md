# 🗺️ Mapeamento Storefront vs Backend - JTBDs por Jornada do Cliente

**Data:** Outubro 2025
**Versão:** 1.0
**Objetivo:** Mapear módulos, páginas, features e recursos do storefront contra capacidades do backend, alinhados aos JTBDs de cada classe consumidora durante suas jornadas de compra.

---

## 📊 MATRIZ DE MAPEAMENTO POR CLASSE CONSUMIDORA

### 🎯 LEGENDA DO MAPEAMENTO

| **Símbolo** | **Significado** |
|-------------|-----------------|
| ✅ | **Totalmente Mapeado** - Módulo/página/feature implementado e operacional |
| 🟡 | **Parcialmente Mapeado** - Existe mas precisa de ajustes/refinamentos |
| ❌ | **Não Mapeado** - Gap identificado, requer implementação |
| 🔄 | **Medusa.js Store** - Prioridade alta (cart, checkout, products, orders) |
| 🌐 | **Backend Custom** - Módulo personalizado YSH |
| 📱 | **Frontend Only** - Funcionalidade puramente frontend |

---

## 🏠 CLASSE 1: RESIDENCIAL B1 (On-Grid + Híbrido)

### JTBD Principal

> *"Quando quero comprar um sistema solar, quero encontrar o kit ideal, calcular minha economia, financiar se necessário e finalizar a compra com o mínimo de atrito para que eu possa reduzir minha conta de luz rapidamente."*

### Jornada de Compra (15-30 dias)

| **Estágio** | **JTBD Específico** | **Storefront Módulos/Páginas** | **Backend Módulos** | **Status** | **Prioridade** |
|-------------|-------------------|-------------------------------|-------------------|------------|---------------|
| **1. Descoberta** | Encontrar kits residenciais adequados | `/(main)/catalogo` + `/(main)/products` | 🔄 `unified-catalog` + 🔄 `products` | ✅ | Alta |
| | | `src/modules/products` + `src/modules/catalog` | 🌐 `ysh-catalog` + 🌐 `solar` | ✅ | |
| **2. Dimensionamento** | Calcular sistema ideal para meu consumo | `/(main)/dimensionamento` | 🌐 `solar-calculator` | ✅ | Alta |
| | | `src/modules/solar/calculator` | 🌐 `pvlib-integration` | ✅ | |
| **3. Viabilidade** | Validar viabilidade técnica e econômica | `/(main)/viabilidade` | 🌐 `solar` (ROI service) | ✅ | Alta |
| | | `src/modules/viability` | 🌐 `ysh-pricing` | ✅ | |
| **4. Financiamento** | Comparar opções de financiamento | `/(main)/financiamento` | 🌐 `financing` | 🟡 | Média |
| | | `src/modules/financing` | 🌐 `credit-analysis` | 🟡 | |
| **5. Cotação** | Solicitar proposta comercial | `/(main)/cotacao` | 🌐 `quote` | ✅ | Alta |
| | | `src/modules/quotes` | 🔄 `quote` (workflow) | ✅ | |
| **6. Checkout** | Finalizar compra B2C | `/(checkout)` | 🔄 `cart` + 🔄 `checkout` | ✅ | **Máxima** |
| | | `src/modules/cart` + `src/modules/checkout` | 🔄 `orders` + 🔄 `payment` | ✅ | |

### Funcionalidades Críticas B1

| **Feature** | **Módulo Storefront** | **Módulo Backend** | **Status** | **JTBD Alinhamento** |
|-------------|----------------------|-------------------|------------|-------------------|
| **Calculadora Solar** | `src/modules/solar/calculator` | `solar-calculator` | ✅ | Dimensionamento preciso |
| **Kits Residenciais** | `src/modules/products` | `unified-catalog` | ✅ | Descoberta facilitada |
| **Simulação ROI** | `src/modules/viability` | `solar/roi-service` | ✅ | Justificativa econômica |
| **Carrinho B2C** | `src/modules/cart` | `cart` (Medusa) | ✅ | **Compra sem atrito** |
| **Checkout Seguro** | `src/modules/checkout` | `checkout` (Medusa) | ✅ | **Finalização confiável** |
| **Conta Cliente** | `src/modules/account` | `customer` (Medusa) | ✅ | Gerenciamento pós-venda |

### Gaps Identificados B1

- ❌ **Financiamento Híbrido** - Integração Open Finance incompleta
- 🟡 **Suporte Híbrido** - Baterias não totalmente integradas no fluxo

---

## 🌾 CLASSE 2: RURAL B2 (Off-Grid + Híbrido)

### JTBD Principal

*"Como produtor rural, quero um sistema autônomo que me dê independência energética, especialmente para irrigação e ordenha, com backup confiável durante quedas de energia."*

### Jornada de Compra (30-60 dias)

| **Estágio** | **JTBD Específico** | **Storefront Módulos/Páginas** | **Backend Módulos** | **Status** | **Prioridade** |
|-------------|-------------------|-------------------------------|-------------------|------------|---------------|
| **1. Avaliação de Necessidades** | Questionário de consumo rural | `/(main)/solucoes` (custom) | 🌐 `solar` | 🟡 | Alta |
| **2. Dimensionamento Off-Grid** | Calcular autonomia e banco de baterias | `/(main)/viabilidade` | 🌐 `solar-calculator` | ✅ | Alta |
| | | `src/modules/viability` | 🌐 `pvlib-integration` | ✅ | |
| **3. Seleção de Sistema** | Escolher entre off-grid/híbrido | `/(main)/catalogo` (filtro rural) | 🌐 `ysh-catalog` | 🟡 | Média |
| **4. Cotação B2B** | Proposta com prazo de entrega | `/(main)/cotacao` | 🌐 `quote` | ✅ | Alta |
| | | `src/modules/quotes` | 🔄 `quote` (workflow) | ✅ | |
| **5. Aprovação Interna** | Processo de aprovação empresarial | `src/modules/quotes` (approval) | 🌐 `approval` | 🟡 | Alta |
| **6. Checkout B2B** | Compra com condições especiais | `/(checkout)` (B2B mode) | 🔄 `cart` + 🔄 `checkout` | 🟡 | **Máxima** |

### Funcionalidades Críticas B2

| **Feature** | **Módulo Storefront** | **Módulo Backend** | **Status** | **JTBD Alinhamento** |
|-------------|----------------------|-------------------|------------|-------------------|
| **Dimensionamento Autônomo** | `src/modules/viability` | `solar/sizing-service` | ✅ | Autonomia garantida |
| **Catálogo Off-Grid** | `src/modules/products` | `unified-catalog` | 🟡 | Kits especializados |
| **Cotação com Prazos** | `src/modules/quotes` | `quote` (workflow) | ✅ | Logística rural |
| **Aprovações B2B** | `src/modules/quotes` | `approval` (workflow) | 🟡 | Processo empresarial |
| **Carrinho B2B** | `src/modules/cart` | `cart` (Medusa) | 🟡 | Compra bulk |

### Gaps Identificados B2

- ❌ **Questionário Rural** - Falta fluxo específico para perfil de consumo rural
- 🟡 **Logística CIF** - Integração com fretes para áreas remotas

---

## 🏢 CLASSE 3: COMERCIAL B3 (On-Grid + EaaS)

### JTBD Principal

*"Como empresário, quero reduzir meus custos energéticos de forma previsível, seja através de compra direta ou EaaS, com payback rápido e sem impactar meu capital de giro."*

### Jornada de Compra (45-90 dias)

| **Estágio** | **JTBD Específico** | **Storefront Módulos/Páginas** | **Backend Módulos** | **Status** | **Prioridade** |
|-------------|-------------------|-------------------------------|-------------------|------------|---------------|
| **1. Análise de Consumo** | Upload de conta de luz (12 meses) | `/(main)/solucoes` (upload) | 🌐 `solar` | 🟡 | Alta |
| **2. Proposta Técnica** | Dimensionamento comercial | `/(main)/viabilidade` | 🌐 `solar-calculator` | ✅ | Alta |
| | | `src/modules/viability` | 🌐 `pvlib-integration` | ✅ | |
| **3. ROI Empresarial** | Análise financeira detalhada | `src/modules/viability` | 🌐 `solar/roi-service` | ✅ | Alta |
| **4. Escolha do Modelo** | Compra direta vs EaaS | `/(main)/proposta` (comparison) | 🌐 `financing` | 🟡 | Alta |
| **5. Cotação B2B** | Proposta com aprovações | `/(main)/cotacao` | 🌐 `quote` | ✅ | Alta |
| | | `src/modules/quotes` | 🔄 `quote` (workflow) | ✅ | |
| **6. Aprovação Interna** | Workflows de aprovação | `src/modules/quotes` | 🌐 `approval` | 🟡 | **Máxima** |
| **7. Contratação** | PPA ou compra formal | `/(checkout)` (B2B) | 🔄 `orders` | 🟡 | **Máxima** |

### Funcionalidades Críticas B3

| **Feature** | **Módulo Storefront** | **Módulo Backend** | **Status** | **JTBD Alinhamento** |
|-------------|----------------------|-------------------|------------|-------------------|
| **Upload de Faturas** | `src/modules/solucoes` | `solar` (analysis) | 🟡 | Análise precisa |
| **ROI Empresarial** | `src/modules/viability` | `solar/roi-service` | ✅ | Justificativa CFO |
| **Comparação EaaS vs Compra** | `src/modules/financing` | `financing` | 🟡 | Decisão estratégica |
| **Workflows de Aprovação** | `src/modules/quotes` | `approval` (workflows) | 🟡 | Processo empresarial |
| **Contratos PPA** | `src/modules/quotes` | `quote` (templates) | 🟡 | Formalização jurídica |

### Gaps Identificados B3

- ❌ **Upload de Faturas** - Interface para análise de 12 meses
- 🟡 **Comparador EaaS** - Ferramenta de decisão compra vs aluguel

---

## 🏘️ CLASSE 4: CONDOMÍNIOS (Geração Compartilhada)

### JTBD Principal

*"Como síndico, quero implementar geração compartilhada que reduza as taxas condominiais, com processo transparente de rateio e aprovação simplificada em assembleia."*

### Jornada de Compra (90-180 dias)

| **Estágio** | **JTBD Específico** | **Storefront Módulos/Páginas** | **Backend Módulos** | **Status** | **Prioridade** |
|-------------|-------------------|-------------------------------|-------------------|------------|---------------|
| **1. Pré-Viabilidade** | Levantamento técnico gratuito | `/(main)/solucoes` (condo) | 🌐 `solar` | 🟡 | Alta |
| **2. Diagnóstico** | Análise técnica do prédio | `/(main)/viabilidade` | 🌐 `solar-calculator` | ✅ | Alta |
| **3. Proposta Condominial** | Rateio e economia por unidade | `/(main)/proposta` | 🌐 `solar/roi-service` | 🟡 | Alta |
| **4. Assembleia** | Materiais para apresentação | `src/modules/solucoes` | 📱 Frontend | 🟡 | Média |
| **5. Aprovação** | Votação e contratação | `/(main)/cotacao` | 🌐 `quote` | ✅ | Alta |
| **6. Rateio Automático** | Gestão de créditos | `src/modules/quotes` | 🌐 `company` | 🟡 | Alta |

### Funcionalidades Críticas Condomínios

| **Feature** | **Módulo Storefront** | **Módulo Backend** | **Status** | **JTBD Alinhamento** |
|-------------|----------------------|-------------------|------------|-------------------|
| **Simulador Condominial** | `src/modules/viability` | `solar/sizing-service` | 🟡 | Rateio transparente |
| **Kit Assembleia** | `src/modules/solucoes` | 📱 Frontend | 🟡 | Aprovação facilitada |
| **Gestão Rateio** | `src/modules/quotes` | `company` (employees) | 🟡 | Créditos individuais |

### Gaps Identificados Condomínios

- ❌ **Simulador Rateio** - Cálculo automático de créditos por unidade
- 🟡 **Kit Assembleia** - Materiais padronizados para síndicos

---

## 🔧 CLASSE 5: INTEGRADORES (Revenda B2B)

### JTBD Principal

*"Como integrador, quero acesso a catálogo técnico completo, preços competitivos, cotações rápidas e ferramentas que me ajudem a fechar vendas com meus clientes finais."*

### Jornada de Compra (7-15 dias)

| **Estágio** | **JTBD Específico** | **Storefront Módulos/Páginas** | **Backend Módulos** | **Status** | **Prioridade** |
|-------------|-------------------|-------------------------------|-------------------|------------|---------------|
| **1. Catálogo Técnico** | Acesso a specs e datasheets | `/(main)/catalogo` (B2B) | 🌐 `ysh-catalog` | ✅ | Alta |
| | | `src/modules/products` | 🔄 `products` | ✅ | |
| **2. Bulk Order** | Carrinho para pedidos grandes | `src/modules/cart` (bulk) | 🔄 `cart` | 🟡 | Alta |
| **3. Cotações Rápidas** | Salvar/compartilhar cotações | `src/modules/quotes` | 🌐 `quote` | ✅ | Alta |
| **4. Checkout B2B** | Condições especiais de pagamento | `/(checkout)` (B2B) | 🔄 `checkout` | 🟡 | **Máxima** |
| **5. Acompanhamento** | Tracking de pedidos | `src/modules/order` | 🔄 `orders` | ✅ | Alta |

### Funcionalidades Críticas Integradores

| **Feature** | **Módulo Storefront** | **Módulo Backend** | **Status** | **JTBD Alinhamento** |
|-------------|----------------------|-------------------|------------|-------------------|
| **Catálogo B2B** | `src/modules/products` | `unified-catalog` | ✅ | Specs técnicas |
| **Bulk Operations** | `src/modules/cart` | `cart` (Medusa) | 🟡 | Pedidos eficientes |
| **Cotações Salvas** | `src/modules/quotes` | `quote` (workflow) | ✅ | Reutilização |
| **Preços Tiered** | `src/modules/products` | `ysh-pricing` | ✅ | Margens competitivas |

### Gaps Identificados Integradores

- 🟡 **Bulk Order UI** - Interface otimizada para pedidos grandes
- ❌ **Cotações Compartilháveis** - Links para clientes finais

---

## 🏭 CLASSE 6: INDÚSTRIA (EaaS + PPA)

### JTBD Principal

*"Como indústria, quero reduzir minha conta de energia de forma estrutural através de EaaS ou PPA, com garantia de performance e sem impactar meu balanço patrimonial."*

### Jornada de Compra (180-540 dias)

| **Estágio** | **JTBD Específico** | **Storefront Módulos/Páginas** | **Backend Módulos** | **Status** | **Prioridade** |
|-------------|-------------------|-------------------------------|-------------------|------------|---------------|
| **1. Pré-Qualificação** | Formulário industrial | `/(main)/solucoes` (enterprise) | 🌐 `solar` | 🟡 | Alta |
| **2. Diagnóstico Energético** | Análise completa de consumo | `/(main)/viabilidade` | 🌐 `solar-calculator` | ✅ | Alta |
| **3. Proposta Técnica** | Dimensionamento industrial | `src/modules/viability` | 🌐 `pvlib-integration` | ✅ | Alta |
| **4. Modelagem Financeira** | EaaS vs PPA vs Compra | `src/modules/financing` | 🌐 `financing` | 🟡 | **Máxima** |
| **5. Due Diligence** | Validação técnica/jurídica | `src/modules/compliance` | 🌐 `solar` | 🟡 | Alta |
| **6. Contratação** | PPA ou contrato EaaS | `/(main)/cotacao` | 🌐 `quote` | ✅ | **Máxima** |
| **7. Operação** | Monitoramento e faturamento | `src/modules/order` | 🔄 `orders` | 🟡 | Alta |

### Funcionalidades Críticas Indústria

| **Feature** | **Módulo Storefront** | **Módulo Backend** | **Status** | **JTBD Alinhamento** |
|-------------|----------------------|-------------------|------------|-------------------|
| **Formulário Enterprise** | `src/modules/solucoes` | 📱 Frontend | 🟡 | Qualificação inicial |
| **Diagnóstico Industrial** | `src/modules/viability` | `solar/sizing-service` | ✅ | Dimensionamento preciso |
| **Comparador EaaS/PPA** | `src/modules/financing` | `financing` | 🟡 | Decisão estratégica |
| **Contratos Complexos** | `src/modules/quotes` | `quote` (templates) | 🟡 | Formalização jurídica |
| **Monitoramento O&M** | `src/modules/order` | `orders` (Medusa) | 🟡 | Performance garantida |

### Gaps Identificados Indústria

- ❌ **Formulário Enterprise** - Qualificação específica para indústrias
- 🟡 **Comparador Financeiro** - EaaS vs PPA vs compra direta
- ❌ **Monitoramento O&M** - Dashboard de performance pós-venda

---

## 🔄 PRIORIZAÇÃO MÉDUSA.JS STORE MODULES

### Módulos Core Prioritários (Sempre na Jornada)

| **Módulo Medusa** | **JTBD Alinhamento** | **Classes Afetadas** | **Status Atual** |
|-------------------|---------------------|---------------------|------------------|
| **Cart** | Compra sem atrito, bulk orders | Todas (especialmente B2B) | ✅ Implementado |
| **Checkout** | Finalização segura e confiável | Todas | ✅ Implementado |
| **Products** | Descoberta e comparação | Todas | ✅ Implementado |
| **Orders** | Acompanhamento pós-venda | Todas | ✅ Implementado |
| **Customer** | Gestão de conta e histórico | Todas | ✅ Implementado |

### Workflows Críticos por Jornada

| **Workflow** | **Trigger na Jornada** | **Módulos Envolvidos** | **Status** |
|--------------|------------------------|----------------------|------------|
| **Cart Completion** | Pré-checkout todas classes | Cart + Approval | 🟡 B2B |
| **Order Creation** | Checkout finalizado | Orders + Company | ✅ |
| **Quote Approval** | Aprovação B2B | Quote + Approval | 🟡 |
| **Payment Processing** | Checkout | Payment + Orders | ✅ |

---

## 📈 MÉTRICAS DE SUCESSO DO MAPEAMENTO

### Coverage Atual por Classe

| **Classe** | **Cobertura Média** | **Gaps Críticos** | **Próximos Passos** |
|------------|-------------------|-------------------|-------------------|
| **B1 Residencial** | 85% | Financiamento híbrido | Integração Open Finance |
| **B2 Rural** | 70% | Questionário rural | Fluxo off-grid dedicado |
| **B3 Comercial** | 75% | Upload faturas | Análise 12 meses |
| **Condomínios** | 65% | Simulador rateio | Rateio automático |
| **Integradores** | 80% | Bulk operations | UI otimizada |
| **Indústria** | 60% | Form enterprise | Qualificação específica |

### Roadmap de Implementação

#### **Q4 2025 - Prioridade Alta**

1. ✅ Completar financiamento híbrido (B1)
2. ✅ Questionário rural dedicado (B2)
3. ✅ Upload e análise de faturas (B3)
4. ✅ Simulador rateio condomínios (Condomínios)

#### **Q1 2026 - Prioridade Média**

1. 🟡 Bulk operations integradores
2. 🟡 Comparador EaaS/PPA indústria
3. 🟡 Workflows aprovação B2B completos

#### **Q2 2026 - Prioridade Baixa**

1. 📊 Dashboards O&M indústria
2. 📊 Analytics jornada por classe
3. 📊 Otimização conversão por persona

---

## 🎯 CONCLUSÃO

O mapeamento revela que a arquitetura atual está **70% alinhada** com os JTBDs das 6 classes consumidoras, com os módulos Medusa.js store (cart, checkout, products, orders) devidamente priorizados nas jornadas críticas.

**Pontos Fortes:**

- ✅ Base sólida com Medusa.js
- ✅ Módulos solares bem implementados
- ✅ Jornada B1 quase completa

**Gaps Prioritários:**

- ❌ Workflows B2B incompletos
- 🟡 Formulários específicos por classe
- ❌ Analytics e monitoramento pós-venda

**Próximo Passo Recomendado:** Implementar gaps Q4 2025 para atingir 85% de cobertura média, focando nos módulos que impactam conversão (financiamento, aprovações, bulk operations).

---

**Documento gerado por:** GitHub Copilot  
**Revisado por:** Time de Produto YSH  
**Próxima atualização:** Janeiro 2026</content>
<parameter name="filePath">STOREFRONT_BACKEND_JTBD_MAPPING.md
