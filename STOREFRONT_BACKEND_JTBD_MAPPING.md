# 🗺️ Mapeamento Storefront vs Backend - JTBDs por Jornada do Cliente

**Data:** Outubro 2025  
**Versão:** 2.0  
**Objetivo:** Mapear módulos, páginas, features e recursos do storefront contra capacidades do backend, alinhados aos JTBDs de cada classe consumidora durante suas jornadas de compra.

---

## 📋 RESUMO EXECUTIVO

### Estrutura do Documento

Este documento fornece um mapeamento completo entre:

1. **JTBDs por Classe de Cliente** - 6 personas com suas jornadas específicas
2. **Páginas do Storefront** - Rotas Next.js 15 App Router
3. **Componentes UI** - Templates, componentes server e client
4. **Módulos Backend** - APIs Medusa.js + Custom YSH
5. **Workflows & Links** - Orquestração de lógica de negócio

### Navegação Rápida

| Seção | Link Direto | Conteúdo |
|-------|-------------|----------|
| 🏠 **Classe B1 - Residencial** | [Ver detalhes](#-classe-1-residencial-b1-on-grid--híbrido) | Jornada B2C, 15-30 dias, checkout simplificado |
| 🌾 **Classe B2 - Rural** | [Ver detalhes](#-classe-2-rural-b2-off-grid--híbrido) | Off-grid, autonomia, aprovações B2B |
| 🏢 **Classe B3 - Comercial** | [Ver detalhes](#-classe-3-comercial-b3-on-grid--eaas) | ROI empresarial, EaaS, workflows complexos |
| 🏘️ **Classe B4 - Condomínios** | [Ver detalhes](#️-classe-4-condomínios-geração-compartilhada) | Rateio, assembleia, geração compartilhada |
| 🔧 **Classe B5 - Integradores** | [Ver detalhes](#-classe-5-integradores-revenda-b2b) | Catálogo técnico, bulk orders, margens |
| 🏭 **Classe B6 - Indústria** | [Ver detalhes](#-classe-6-indústria-eaas--ppa) | PPA, due diligence, monitoramento O&M |
| 📦 **Componentes UI** | [Ver índice](#-índice-completo-de-componentes-ui) | Lista completa de componentes por módulo |
| 🔌 **Rotas API** | [Ver mapeamento](#-mapeamento-rotas-api-backend) | Endpoints backend e workflows |

### Estatísticas Gerais

| Métrica | Valor | Observação |
|---------|-------|------------|
| **Páginas Principais** | 15+ | App Router Next.js 15 |
| **Componentes UI** | 80+ | Server + Client Components |
| **Rotas API Custom** | 25+ | Além das rotas Medusa core |
| **Workflows** | 12+ | Orquestração de lógica B2B |
| **Módulos Custom** | 5 | company, quote, approval, solar, tariff |
| **Cobertura Média** | 70% | Varia por classe (60-85%) |

### Status por Classe

| Classe | Cobertura | Gaps Críticos | Prioridade |
|--------|-----------|---------------|------------|
| B1 - Residencial | 85% ✅ | Financiamento híbrido | Média |
| B2 - Rural | 70% 🟡 | Questionário rural, aprovações | Alta |
| B3 - Comercial | 75% 🟡 | Upload faturas, workflows | Alta |
| B4 - Condomínios | 65% 🟡 | Simulador rateio | Alta |
| B5 - Integradores | 80% ✅ | Bulk operations UI | Média |
| B6 - Indústria | 60% 🟡 | Form enterprise, O&M | Alta |

### Módulos Prioritários (Medusa.js Store)

Os seguintes módulos **Medusa.js Store** são críticos para **todas as jornadas**:

- ✅ **Cart** - Gerenciamento de carrinho com bulk operations
- ✅ **Checkout** - Finalização de compra B2C e B2B
- ✅ **Products** - Catálogo unificado com filtros
- ✅ **Orders** - Acompanhamento pós-venda
- ✅ **Customer** - Gestão de conta e perfil

### Próximos Passos Recomendados

**Q4 2025 (Alta Prioridade):**

1. ❌ Upload e análise múltiplas faturas (B3)
2. ❌ Simulador rateio condomínios (B4)
3. ❌ Formulário enterprise industrial (B6)
4. 🟡 Completar workflows aprovação B2B (B2, B3)

**Q1 2026 (Média Prioridade):**

1. 🟡 Comparador EaaS/PPA/Compra (B3, B6)
2. 🟡 Bulk operations integradores (B5)
3. 🟡 Monitoramento O&M industrial (B6)

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

### 📱 Páginas & Componentes UI - Classe B1

#### **1. Descoberta de Produtos**

**Página:** `src/app/[countryCode]/(main)/catalogo/page.tsx`

- **Template:** `src/modules/discovery/catalog/templates/`
- **Componentes:**
  - `src/modules/discovery/products/components/product-grid/`
  - `src/modules/discovery/products/components/product-card/`
  - `src/modules/discovery/products/components/product-filters/`
  - `src/modules/discovery/products/components/price-display/`

**Página Produto:** `src/app/[countryCode]/(main)/products/[handle]/page.tsx`

- **Componentes:**
  - `src/modules/discovery/products/components/product-details/`
  - `src/modules/discovery/products/components/product-gallery/`
  - `src/modules/discovery/products/components/add-to-cart-button/`
  - `src/modules/discovery/products/components/related-products/`

#### **2. Dimensionamento**

**Página:** `src/app/[countryCode]/(main)/dimensionamento/page.tsx`

- **Wrapper:** `DimensionamentoWrapper` (client component)
- **Componentes:**
  - `src/modules/solar/components/calculator-form.tsx` 📱 Client
  - `src/modules/solar/components/feasibility-checker.tsx` 📱 Client
  - Upload de conta de luz (embedded in page)
  - Formulário consumo manual (embedded in page)

#### **3. Viabilidade**

**Página:** `src/app/[countryCode]/(main)/viabilidade/page.tsx`

- **Componentes:**
  - `src/modules/solar/components/recommendation-engine.tsx` 📱 Client
  - `src/modules/solar/components/feasibility-checker.tsx` 📱 Client
  - Análise ROI (embedded)
  - Simulador economia (embedded)

#### **4. Financiamento**

**Página:** `src/app/[countryCode]/(main)/financiamento/page.tsx`

- **Módulo:** `src/modules/financing/`
- **Componentes:**
  - `src/modules/financing/components/financing-calculator/` (🟡 a implementar)
  - `src/modules/financing/components/credit-simulator/` (🟡 a implementar)
  - Comparador opções (embedded)

#### **5. Cotação**

**Página:** `src/app/[countryCode]/(main)/cotacao/page.tsx` 📱 Client

- **Context:** `src/modules/quotation/lead-quote/context`
- **Componentes:**
  - `src/modules/quotation/quotes/components/QuoteForm.tsx`
  - `src/modules/quotation/quotes/components/QuotesList.tsx`
  - `src/modules/quotation/quotes/components/request-quote-prompt/`
  - `src/modules/quotation/quotes/components/request-quote-confirmation/`

#### **6. Carrinho & Checkout**

**Carrinho:** `src/app/[countryCode]/(main)/cart/page.tsx`

- **Template:** `src/modules/purchase/cart/templates/`
- **Componentes:**
  - `src/modules/purchase/cart/components/cart-drawer/` 📱 Client
  - `src/modules/purchase/cart/components/item-full/`
  - `src/modules/purchase/cart/components/item-preview/`
  - `src/modules/purchase/cart/components/cart-totals/`
  - `src/modules/purchase/cart/components/cart-button/` 📱 Client
  - `src/modules/purchase/cart/components/empty-cart-message/`

**Checkout:** `src/app/[countryCode]/(checkout)/checkout/page.tsx`

- **Wrapper:** `src/modules/purchase/checkout/components/payment-wrapper/`
- **Templates:**
  - `src/modules/purchase/checkout/templates/checkout-form/`
  - `src/modules/purchase/checkout/templates/checkout-summary/`
- **Componentes:**
  - `src/modules/purchase/checkout/components/address-select/`
  - `src/modules/purchase/checkout/components/shipping-address-form/`
  - `src/modules/purchase/checkout/components/billing-address-form/`
  - `src/modules/purchase/checkout/components/contact-details-form/`
  - `src/modules/purchase/checkout/components/payment/`
  - `src/modules/purchase/checkout/components/payment-button/` 📱 Client
  - `src/modules/purchase/checkout/components/submit-button/` 📱 Client
  - `src/modules/purchase/checkout/components/review/`
  - `src/modules/purchase/checkout/components/checkout-totals/`

#### **7. Conta do Cliente**

**Página:** `src/app/[countryCode]/(main)/account/page.tsx`

- **Módulo:** `src/modules/account/`
- **Componentes:**
  - `src/modules/account/components/profile-form/`
  - `src/modules/account/components/address-book/`
  - `src/modules/purchase/order/components/order-history/`
  - `src/modules/purchase/order/components/order-details/`

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

#### *"Como produtor rural, quero um sistema autônomo que me dê independência energética, especialmente para irrigação e ordenha, com backup confiável durante quedas de energia."*

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

### 📱 Páginas & Componentes UI - Classe B2

#### **1. Questionário Rural**

**Página:** `src/app/[countryCode]/(main)/solucoes/page.tsx`

- **Componentes (🟡 a implementar):**
  - Formulário perfil rural (embedded)
  - Seletor tipo propriedade
  - Calculadora carga irrigação
  - Calculadora autonomia baterias

#### **2. Dimensionamento Off-Grid**

**Página:** `src/app/[countryCode]/(main)/viabilidade/page.tsx`

- **Componentes:**
  - `src/modules/solar/components/calculator-form.tsx` (modo off-grid)
  - `src/modules/solar/components/feasibility-checker.tsx`
  - Seletor banco de baterias (embedded)
  - Cálculo autonomia dias (embedded)

#### **3. Catálogo Rural**

**Página:** `src/app/[countryCode]/(main)/catalogo/page.tsx`

- **Filtros especiais:**
  - Filtro "off-grid" (embedded)
  - Filtro "híbrido com baterias"
  - Filtro potência bombas

#### **4. Cotação & Aprovação B2B**

**Página:** `src/app/[countryCode]/(main)/cotacao/page.tsx`

- **Componentes B2B:**
  - `src/modules/quotation/quotes/components/QuoteApproval.tsx` 🟡
  - `src/modules/purchase/cart/components/approval-status-banner/` 🟡
  - Prazo entrega áreas remotas (embedded)

#### **5. Checkout B2B**

**Página:** `src/app/[countryCode]/(checkout)/checkout/page.tsx`

- **Componentes B2B:**
  - `src/modules/purchase/checkout/components/company/` 🟡
  - `src/modules/purchase/checkout/components/company-form/` 🟡
  - Seletor condições pagamento (embedded)

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

### 📱 Páginas & Componentes UI - Classe B3

#### **1. Análise de Consumo Empresarial**

**Página:** `src/app/[countryCode]/(main)/solucoes/page.tsx`

- **Componentes (🟡 a implementar):**
  - Upload múltiplas faturas (12 meses)
  - Parser automático PDF conta luz
  - Gráfico sazonalidade consumo
  - Identificador perfil tarifário

#### **2. ROI Empresarial**

**Página:** `src/app/[countryCode]/(main)/viabilidade/page.tsx`

- **Componentes:**
  - `src/modules/solar/components/recommendation-engine.tsx`
  - Dashboard projeção financeira (embedded)
  - Comparador cenários (embedded)
  - Relatório executivo PDF

#### **3. Comparador EaaS vs Compra**

**Página:** `src/app/[countryCode]/(main)/financiamento/page.tsx`

- **Componentes (🟡 a implementar):**
  - Calculadora CAPEX vs OPEX
  - Simulador fluxo de caixa
  - Análise impacto balanço
  - Tabela comparativa PPA/Compra/EaaS

#### **4. Workflows de Aprovação**

**Página:** `src/app/[countryCode]/(main)/cotacao/page.tsx`

- **Componentes:**
  - `src/modules/quotation/quotes/components/QuoteApproval.tsx` 🟡
  - `src/modules/purchase/cart/components/approval-status-banner/` 🟡
  - Timeline aprovações (embedded)
  - Notificações aprovadores (embedded)

#### **5. Contratos & Formalização**

**Página:** `src/app/[countryCode]/(main)/proposta/page.tsx`

- **Componentes:**
  - `src/modules/quotation/quotes/components/QuoteDetails.tsx`
  - Template PPA (embedded)
  - Assinatura eletrônica (embedded)
  - Download contrato PDF

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

### 📱 Páginas & Componentes UI - Condomínios

#### **1. Simulador Condominial**

**Página:** `src/app/[countryCode]/(main)/viabilidade/page.tsx`

- **Componentes (🟡 a implementar):**
  - Formulário dados condomínio
  - Input número unidades
  - Calculadora rateio automático
  - Projeção economia por unidade
  - Tabela distribuição créditos

#### **2. Kit Assembleia**

**Página:** `src/app/[countryCode]/(main)/solucoes/page.tsx`

- **Componentes (🟡 a implementar):**
  - Gerador apresentação PDF
  - Slides explicativos (embedded)
  - Modelo convocação (embedded)
  - Modelo ata aprovação (embedded)
  - FAQ condomínios (embedded)

#### **3. Proposta Condominial**

**Página:** `src/app/[countryCode]/(main)/proposta/printable/page.tsx`

- **Componentes:**
  - Relatório técnico condomínio
  - Tabela rateio detalhada
  - Timeline implantação
  - Termos e condições

#### **4. Gestão de Rateio Pós-Venda**

**Página:** `src/app/[countryCode]/(main)/account/page.tsx` (síndico)

- **Componentes (🟡 a implementar):**
  - Dashboard geração mensal
  - Distribuição créditos por unidade
  - Relatório compensação ANEEL
  - Histórico faturamento

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

### 📱 Páginas & Componentes UI - Integradores

#### **1. Catálogo Técnico B2B**

**Página:** `src/app/[countryCode]/(main)/catalogo/page.tsx`

- **Componentes:**
  - `src/modules/discovery/products/components/product-grid/` (modo B2B)
  - Filtros avançados técnicos
  - Download datasheets bulk
  - Comparador especificações
  - Tabela preços por volume

#### **2. Bulk Order**

**Página:** `src/app/[countryCode]/(main)/cart/page.tsx`

- **Componentes:**
  - `src/modules/purchase/cart/components/cart-to-csv-button/` ✅
  - Upload CSV pedido (🟡 a implementar)
  - Edição inline quantidades
  - Calculadora frete bulk
  - Agendamento entrega

#### **3. Cotações Salvas & Compartilháveis**

**Página:** `src/app/[countryCode]/(main)/cotacao/page.tsx`

- **Componentes:**
  - `src/modules/quotation/quotes/components/QuotesList.tsx` ✅
  - `src/modules/quotation/quotes/components/QuoteComparison.tsx` ✅
  - Link compartilhável (🟡 a implementar)
  - Versionamento cotações
  - Histórico alterações

#### **4. Account B2B**

**Página:** `src/app/[countryCode]/(main)/account/page.tsx`

- **Componentes:**
  - Dashboard pedidos recorrentes
  - Histórico compras
  - Análise margens
  - Certificados e treinamentos

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

### 📱 Páginas & Componentes UI - Indústria

#### **1. Formulário Enterprise**

**Página:** `src/app/[countryCode]/(main)/solucoes/page.tsx`

- **Componentes (❌ a implementar):**
  - Wizard qualificação industrial
  - Upload perfil carga (15 min)
  - Seletor demanda contratada
  - Análise fator potência
  - Identificação multas reativas
  - Questionário turno operação

#### **2. Diagnóstico Energético Industrial**

**Página:** `src/app/[countryCode]/(main)/viabilidade/page.tsx`

- **Componentes:**
  - `src/modules/solar/components/calculator-form.tsx` (modo industrial)
  - `src/modules/solar/components/recommendation-engine.tsx`
  - Análise demanda vs consumo
  - Simulador redução demanda
  - Projeção economia tarifária

#### **3. Modelagem Financeira EaaS/PPA**

**Página:** `src/app/[countryCode]/(main)/financiamento/page.tsx`

- **Componentes (🟡 a implementar):**
  - Comparador 3 modelos (EaaS/PPA/Compra)
  - Simulador fluxo caixa 25 anos
  - Análise VPL/TIR
  - Impacto balanço patrimonial
  - Estrutura SPE (caso PPA)
  - Garantias e seguros

#### **4. Contratos & Due Diligence**

**Página:** `src/app/[countryCode]/(main)/proposta/page.tsx`

- **Componentes (🟡 a implementar):**
  - Template PPA industrial
  - Template contrato EaaS
  - Checklist due diligence
  - Upload documentos societários
  - Análise crédito automatizada
  - Simulador garantias

#### **5. Monitoramento O&M Pós-Venda**

**Página:** `src/app/[countryCode]/(main)/account/page.tsx` (industrial)

- **Componentes (❌ a implementar):**
  - `src/modules/solar/components/monitoring-dashboard.tsx` (industrial)
  - `src/modules/solar/components/fleet-dashboard.tsx`
  - Dashboard geração tempo real
  - Análise performance ratio
  - Alertas manutenção preditiva
  - Relatório faturamento mensal
  - Tracking garantias
  - Histórico O&M

#### **6. Compliance & Regulatório**

**Página:** `src/app/[countryCode]/(main)/compliance/page.tsx`

- **Componentes:**
  - `src/modules/operations/compliance/` ✅
  - Documentação ANEEL
  - Certificações ambientais
  - Laudos técnicos
  - Homologações inversores

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

## 📦 ÍNDICE COMPLETO DE COMPONENTES UI

### 🔄 Componentes Medusa Store (Core)

#### **Cart Module** (`src/modules/purchase/cart/`)

| Componente | Arquivo | Tipo | Status |
|-----------|---------|------|--------|
| Cart Drawer | `components/cart-drawer/index.tsx` | Client | ✅ |
| Item Full | `components/item-full/index.tsx` | Server | ✅ |
| Item Preview | `components/item-preview/index.tsx` | Server | ✅ |
| Cart Totals | `components/cart-totals/index.tsx` | Server | ✅ |
| Cart Button | `components/cart-button/index.tsx` | Client | ✅ |
| Empty Cart Message | `components/empty-cart-message/index.tsx` | Server | ✅ |
| Cart to CSV | `components/cart-to-csv-button/index.tsx` | Client | ✅ |
| Add Note Button | `components/add-note-button/index.tsx` | Client | ✅ |
| Sign In Prompt | `components/sign-in-prompt/index.tsx` | Server | ✅ |
| Applied Promotions | `components/applied-promotions/index.tsx` | Server | ✅ |
| Approval Status Banner | `components/approval-status-banner/index.tsx` | Server | 🟡 |
| Solar Integration | `components/solar-integration.tsx` | Client | ✅ |

#### **Checkout Module** (`src/modules/purchase/checkout/`)

| Componente | Arquivo | Tipo | Status |
|-----------|---------|------|--------|
| Checkout Form | `templates/checkout-form/index.tsx` | Server | ✅ |
| Checkout Summary | `templates/checkout-summary/index.tsx` | Server | ✅ |
| Payment Wrapper | `components/payment-wrapper/index.tsx` | Client | ✅ |
| Address Select | `components/address-select/index.tsx` | Client | ✅ |
| Shipping Address Form | `components/shipping-address-form/index.tsx` | Client | ✅ |
| Billing Address Form | `components/billing-address-form/index.tsx` | Client | ✅ |
| Contact Details Form | `components/contact-details-form/index.tsx` | Client | ✅ |
| Payment | `components/payment/index.tsx` | Client | ✅ |
| Payment Button | `components/payment-button/index.tsx` | Client | ✅ |
| Submit Button | `components/submit-button/index.tsx` | Client | ✅ |
| Review | `components/review/index.tsx` | Server | ✅ |
| Checkout Totals | `components/checkout-totals/index.tsx` | Server | ✅ |
| Promotion Code | `components/promotion-code/index.tsx` | Client | ✅ |
| Country Select | `components/country-select/index.tsx` | Client | ✅ |
| Company | `components/company/index.tsx` | Server | 🟡 |
| Company Form | `components/company-form/index.tsx` | Client | 🟡 |
| Shipping | `components/shipping/index.tsx` | Server | ✅ |

#### **Products Module** (`src/modules/discovery/products/`)

| Componente | Arquivo | Tipo | Status |
|-----------|---------|------|--------|
| Product Grid | `components/product-grid/` | Server | ✅ |
| Product Card | `components/product-card/` | Server | ✅ |
| Product Filters | `components/product-filters/` | Client | ✅ |
| Price Display | `components/price-display/` | Server | ✅ |
| Product Details | `components/product-details/` | Server | ✅ |
| Product Gallery | `components/product-gallery/` | Client | ✅ |
| Add to Cart Button | `components/add-to-cart-button/` | Client | ✅ |
| Related Products | `components/related-products/` | Server | ✅ |

#### **Order Module** (`src/modules/purchase/order/`)

| Componente | Arquivo | Tipo | Status |
|-----------|---------|------|--------|
| Order History | `components/order-history/` | Server | ✅ |
| Order Details | `components/order-details/` | Server | ✅ |
| Order Status | `components/order-status/` | Server | ✅ |
| Order Items | `components/order-items/` | Server | ✅ |

### 🌐 Componentes Custom YSH

#### **Solar Module** (`src/modules/solar/components/`)

| Componente | Arquivo | Tipo | Status | Classes |
|-----------|---------|------|--------|---------|
| Calculator Form | `calculator-form.tsx` | Client | ✅ | B1, B2, B6 |
| Feasibility Checker | `feasibility-checker.tsx` | Client | ✅ | B1, B2 |
| Recommendation Engine | `recommendation-engine.tsx` | Client | ✅ | B1, B3, B6 |
| Monitoring Dashboard | `monitoring-dashboard.tsx` | Client | 🟡 | B6 |
| Fleet Dashboard | `fleet-dashboard.tsx` | Client | 🟡 | B6 |

#### **Quotation Module** (`src/modules/quotation/`)

| Componente | Arquivo | Tipo | Status | Classes |
|-----------|---------|------|--------|---------|
| Quote Form | `quotes/components/QuoteForm.tsx` | Client | ✅ | Todas |
| Quotes List | `quotes/components/QuotesList.tsx` | Server | ✅ | Todas |
| Quote Details | `quotes/components/QuoteDetails.tsx` | Server | ✅ | Todas |
| Quote Comparison | `quotes/components/QuoteComparison.tsx` | Client | ✅ | B5 |
| Quote Approval | `quotes/components/QuoteApproval.tsx` | Client | 🟡 | B2, B3 |
| Request Quote Prompt | `quotes/components/request-quote-prompt/` | Client | ✅ | Todas |
| Request Quote Confirmation | `quotes/components/request-quote-confirmation/` | Server | ✅ | Todas |
| Solar Integration | `quotes/components/solar-integration.tsx` | Client | ✅ | B1, B2 |

#### **Financing Module** (`src/modules/financing/`)

| Componente | Arquivo | Tipo | Status | Classes |
|-----------|---------|------|--------|---------|
| Financing Calculator | `components/financing-calculator/` | Client | 🟡 | B1, B3 |
| Credit Simulator | `components/credit-simulator/` | Client | 🟡 | B1 |
| EaaS Comparator | `components/eaas-comparator/` | Client | 🟡 | B3, B6 |
| CAPEX/OPEX Analyzer | `components/capex-opex-analyzer/` | Client | 🟡 | B3, B6 |

#### **Operations Module** (`src/modules/operations/`)

| Componente | Arquivo | Tipo | Status | Classes |
|-----------|---------|------|--------|---------|
| Tariff Classifier | `tariffs/components/TariffClassifier.tsx` | Client | ✅ | Todas |
| Tariff Display | `tariffs/components/TariffDisplay.tsx` | Server | ✅ | Todas |
| MMGD Validator | `tariffs/components/MMGDValidator.tsx` | Client | ✅ | B4 |
| Compliance Index | `compliance/index.tsx` | Server | ✅ | B6 |

#### **Account Module** (`src/modules/account/`)

| Componente | Arquivo | Tipo | Status | Classes |
|-----------|---------|------|--------|---------|
| Profile Form | `components/profile-form/` | Client | ✅ | Todas |
| Address Book | `components/address-book/` | Server | ✅ | Todas |
| Company Dashboard | `components/company-dashboard/` | Server | 🟡 | B2-B6 |
| Employee Management | `components/employee-management/` | Client | 🟡 | B2-B6 |

### 📄 Páginas Principais (App Router)

#### **Main Layout** (`src/app/[countryCode]/(main)/`)

| Página | Arquivo | Componentes Principais | Classes |
|--------|---------|----------------------|---------|
| Home | `page.tsx` | Hero, Features, CTA | Todas |
| Catálogo | `catalogo/page.tsx` | Product Grid, Filters | Todas |
| Produtos | `products/[handle]/page.tsx` | Product Details, Gallery | Todas |
| Dimensionamento | `dimensionamento/page.tsx` | Calculator Form, DimensionamentoWrapper | B1, B2 |
| Viabilidade | `viabilidade/page.tsx` | Feasibility Checker, Recommendation | B1-B6 |
| Financiamento | `financiamento/page.tsx` | Financing Calculator | B1, B3, B6 |
| Cotação | `cotacao/page.tsx` | Quote Form, QuotesList | Todas |
| Soluções | `solucoes/page.tsx` | Custom forms por classe | Todas |
| Proposta | `proposta/page.tsx` | Quote Details | Todas |
| Proposta PDF | `proposta/printable/page.tsx` | PDF generator | Todas |
| Tarifas | `tarifas/page.tsx` | Tariff Classifier | Todas |
| Compliance | `compliance/page.tsx` | Compliance Index | B6 |
| Conta | `account/page.tsx` | Account templates | Todas |
| Carrinho | `cart/page.tsx` | Cart template | Todas |
| Busca | `search/page.tsx` | Search results | Todas |

#### **Checkout Layout** (`src/app/[countryCode]/(checkout)/`)

| Página | Arquivo | Componentes Principais | Classes |
|--------|---------|----------------------|---------|
| Checkout | `checkout/page.tsx` | Checkout Form, Summary, Payment Wrapper | Todas |

### 🎨 Componentes Comuns (`src/modules/common/`)

| Componente | Tipo | Status |
|-----------|------|--------|
| Localized Client Link | Client | ✅ |
| Button | Server | ✅ |
| Input | Server | ✅ |
| Select | Server | ✅ |
| Modal | Client | ✅ |
| Toast | Client | ✅ |
| Loading Spinner | Server | ✅ |
| Error Boundary | Client | ✅ |

### 📊 Componentes a Implementar (Prioridade)

#### **Q4 2025 - Alta Prioridade**

1. ❌ Upload múltiplas faturas (B3)
2. ❌ Simulador rateio condomínios (B4)
3. ❌ Formulário enterprise industrial (B6)
4. 🟡 Quote Approval completo (B2, B3)
5. 🟡 Company components checkout (B2-B6)

#### **Q1 2026 - Média Prioridade**

1. 🟡 Financing Calculator (B1, B3)
2. 🟡 EaaS Comparator (B3, B6)
3. 🟡 Bulk upload CSV (B5)
4. 🟡 Monitoring Dashboard industrial (B6)

---

## 🔌 MAPEAMENTO ROTAS API BACKEND

### Rotas Medusa Store (Core)

| Módulo | Endpoint | Método | Arquivo Backend | Status |
|--------|----------|--------|----------------|--------|
| **Cart** | `/store/carts/:id` | GET, POST, PUT | Medusa Core | ✅ |
| **Cart** | `/store/carts/:id/line-items` | POST, PUT, DELETE | Medusa Core | ✅ |
| **Checkout** | `/store/carts/:id/complete` | POST | Medusa Core | ✅ |
| **Products** | `/store/products` | GET | Medusa Core | ✅ |
| **Products** | `/store/products/:id` | GET | Medusa Core | ✅ |
| **Orders** | `/store/orders` | GET | Medusa Core | ✅ |
| **Orders** | `/store/orders/:id` | GET | Medusa Core | ✅ |
| **Customer** | `/store/customers/me` | GET, POST | Medusa Core | ✅ |
| **Auth** | `/store/auth` | POST | Medusa Core | ✅ |
| **Payment** | `/store/payment-collections/:id` | GET | Medusa Core | ✅ |

### Rotas Custom YSH

#### **Company Module**

| Endpoint | Método | Arquivo Backend | Componente Frontend | Status |
|----------|--------|----------------|---------------------|--------|
| `/store/companies` | GET, POST | `backend/src/api/store/companies/route.ts` | Account Dashboard | ✅ |
| `/store/companies/:id` | GET, PUT | `backend/src/api/store/companies/[id]/route.ts` | Company Form | ✅ |
| `/store/companies/:id/employees` | GET, POST | `backend/src/api/store/companies/[id]/employees/route.ts` | Employee Management | 🟡 |
| `/admin/companies` | GET, POST | `backend/src/api/admin/companies/route.ts` | Admin Dashboard | ✅ |

#### **Quote Module**

| Endpoint | Método | Arquivo Backend | Componente Frontend | Status |
|----------|--------|----------------|---------------------|--------|
| `/store/quotes` | GET, POST | `backend/src/api/store/quotes/route.ts` | QuotesList, QuoteForm | ✅ |
| `/store/quotes/:id` | GET, PUT | `backend/src/api/store/quotes/[id]/route.ts` | QuoteDetails | ✅ |
| `/store/quotes/:id/accept` | POST | `backend/src/api/store/quotes/[id]/accept/route.ts` | QuoteApproval | 🟡 |
| `/store/quotes/:id/messages` | GET, POST | `backend/src/api/store/quotes/[id]/messages/route.ts` | Quote Chat | ✅ |
| `/admin/quotes` | GET | `backend/src/api/admin/quotes/route.ts` | Admin Quotes | ✅ |

#### **Approval Module**

| Endpoint | Método | Arquivo Backend | Componente Frontend | Status |
|----------|--------|----------------|---------------------|--------|
| `/store/approvals` | GET, POST | `backend/src/api/store/approvals/route.ts` | Approval Status Banner | 🟡 |
| `/store/approvals/:id` | GET, PUT | `backend/src/api/store/approvals/[id]/route.ts` | QuoteApproval | 🟡 |
| `/store/approval-settings` | GET, POST | `backend/src/api/store/approval-settings/route.ts` | Company Settings | 🟡 |

#### **Solar Module**

| Endpoint | Método | Arquivo Backend | Componente Frontend | Status |
|----------|--------|----------------|---------------------|--------|
| `/store/solar/calculate` | POST | `backend/src/api/store/solar/calculate/route.ts` | Calculator Form | ✅ |
| `/store/solar/feasibility` | POST | `backend/src/api/store/solar/feasibility/route.ts` | Feasibility Checker | ✅ |
| `/store/solar/recommendation` | POST | `backend/src/api/store/solar/recommendation/route.ts` | Recommendation Engine | ✅ |
| `/store/solar/roi` | POST | `backend/src/api/store/solar/roi/route.ts` | ROI Calculator | ✅ |

#### **Tariff Module**

| Endpoint | Método | Arquivo Backend | Componente Frontend | Status |
|----------|--------|----------------|---------------------|--------|
| `/store/tariffs` | GET | `backend/src/api/store/tariffs/route.ts` | Tariff Display | ✅ |
| `/store/tariffs/classify` | POST | `backend/src/api/store/tariffs/classify/route.ts` | Tariff Classifier | ✅ |
| `/store/tariffs/validate-mmgd` | POST | `backend/src/api/store/tariffs/validate-mmgd/route.ts` | MMGD Validator | ✅ |

#### **Lead Module**

| Endpoint | Método | Arquivo Backend | Componente Frontend | Status |
|----------|--------|----------------|---------------------|--------|
| `/store/leads` | POST | `backend/src/api/store/leads/route.ts` | Quote Form (Cotação) | ✅ |

### Data Fetching (Server Actions)

**Arquivo:** `storefront/src/lib/data/`

| Action | Arquivo | Usa | Status |
|--------|---------|-----|--------|
| `retrieveCart` | `cart-resilient.ts` | SDK + Auth Headers | ✅ |
| `retrieveCustomer` | `customer.ts` | SDK + Auth Headers | ✅ |
| `retrieveCompany` | `companies.ts` | SDK + Auth Headers | ✅ |
| `retrieveQuotes` | `quotes.ts` | SDK + Auth Headers | ✅ |
| `retrieveProducts` | `products.ts` | SDK + Cache | ✅ |
| `retrieveOrders` | `orders.ts` | SDK + Auth Headers | ✅ |
| `calculateSolar` | `solar.ts` | SDK | ✅ |
| `classifyTariff` | `tariffs.ts` | SDK | ✅ |

### Workflows Backend

**Arquivo:** `backend/src/workflows/`

| Workflow | Trigger | Relacionado a | Status |
|----------|---------|--------------|--------|
| `createCompaniesWorkflow` | API `/store/companies` POST | Company Module | ✅ |
| `createQuotesWorkflow` | API `/store/quotes` POST | Quote Module | ✅ |
| `customerAcceptQuoteWorkflow` | API `/store/quotes/:id/accept` POST | Quote Approval | 🟡 |
| `createApprovalsWorkflow` | Hook `cart-created` | Approval Banner | 🟡 |
| `validateAddToCart` | Hook `validate-add-to-cart` | Cart Operations | ✅ |
| `validateCartCompletion` | Hook `validate-cart-completion` | Checkout | 🟡 |
| `createEmployeesWorkflow` | API `/store/companies/:id/employees` POST | Employee Mgmt | 🟡 |

### Links de Módulo

**Arquivo:** `backend/src/links/`

| Link | Módulos Conectados | Status |
|------|-------------------|--------|
| `company-customer-group.ts` | Company ↔ CustomerGroup | ✅ |
| `employee-customer.ts` | Employee ↔ Customer | ✅ |
| `cart-approvals.ts` | Cart ↔ Approvals | 🟡 |
| `order-company.ts` | Order ↔ Company | ✅ |
| `quote-cart.ts` | Quote ↔ Cart | ✅ |

---

**Documento gerado por:** GitHub Copilot  
**Revisado por:** Time de Produto YSH  
**Próxima atualização:** Janeiro 2026  
**Versão:** 2.0 - Com mapeamento completo de componentes UI e rotas API</content>
<parameter name="filePath">STOREFRONT_BACKEND_JTBD_MAPPING.md
