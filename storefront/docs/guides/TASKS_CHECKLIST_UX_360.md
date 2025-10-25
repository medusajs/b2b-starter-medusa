# ✅ Checklist de Tasks - Cobertura UX/UI 360º

## Yello Solar Hub Storefront

> **Documento executável:** Marcar tasks conforme implementação  
> **Ver análise completa:** `ANALISE_GAPS_UX_360.md`

---

## 🔴 FASE 1: Módulos Críticos (Sprint 1-2) - 10 dias

### Task 1.1: Módulo Compliance `/compliance` [5 dias]

#### Setup Inicial

- [ ] Criar estrutura de pastas

  ```tsx
  src/modules/compliance/
    ├── index.tsx
    ├── components/
    │   ├── PRODISTValidator.tsx
    │   ├── DossieGenerator.tsx
    │   ├── DistributorForms.tsx
    │   ├── HomologationChecklist.tsx
    │   └── DocumentUploader.tsx
    ├── types.ts
    ├── utils/
    │   ├── prodist-rules.ts
    │   └── distributor-schemas.ts
    └── integrations.tsx
  ```

- [ ] Criar rota `src/app/[countryCode]/(main)/compliance/page.tsx`
- [ ] Criar types em `src/types/compliance/`

#### Componente: PRODISTValidator

- [ ] Implementar validação de Classe/Subgrupo/Modalidade
- [ ] Adicionar validação de limites de potência por classe
  - [ ] B1: até 75 kWp
  - [ ] B2: até 75 kWp
  - [ ] B3: até 5 MW
  - [ ] A4: até 5 MW
- [ ] Validar distância mínima de linhas de transmissão
- [ ] Validar requisitos de proteção (relé, fusível, etc.)
- [ ] Adicionar validação de normas PRODIST 3.A, 3.B, 3.C
- [ ] Criar UI com feedbacks visuais (✅ / ❌)

#### Componente: DossieGenerator

- [ ] Criar templates por distribuidora
  - [ ] Enel
  - [ ] CPFL
  - [ ] Light
  - [ ] Cemig
  - [ ] Outros (genérico)
- [ ] Implementar auto-fill com dados do projeto
  - [ ] Dados do consumidor (nome, CPF/CNPJ, endereço)
  - [ ] Dados técnicos (kWp, módulos, inversores)
  - [ ] Dados da UC (número, classe, tarifa)
- [ ] Adicionar preview do dossiê
- [ ] Implementar download em PDF
- [ ] Adicionar assinatura digital (opcional)

#### Componente: DocumentUploader

- [ ] Upload de ART/TRT
- [ ] Upload de CNH/RG
- [ ] Upload de conta de energia
- [ ] Upload de escritura/IPTU
- [ ] Validação de tamanho/formato
- [ ] Preview de documentos

#### Componente: HomologationChecklist

- [ ] Checklist dinâmico por distribuidora
- [ ] Status de cada documento (pendente/enviado/aprovado)
- [ ] Prazo estimado de aprovação
- [ ] Histórico de comunicações
- [ ] Alertas de prazo

#### Integração com Jornada Solar

- [ ] Adicionar compliance ao `SolarJourneyContext`
- [ ] Criar navegação de `tarifas` → `compliance`
- [ ] Persistir dados no localStorage
- [ ] Sincronizar com backend

#### Página `/compliance`

- [ ] Hero section com explicação
- [ ] Form de entrada de dados do projeto
- [ ] Validação em tempo real
- [ ] Seção de preview do dossiê
- [ ] Seção de upload de documentos
- [ ] Seção de checklist de homologação
- [ ] Botão "Avançar para Cotação"

---

### Task 1.2: Módulo Seguros `/seguros` [3 dias]

#### Setup Inicial

- [ ] Criar estrutura de pastas

  ```tsx
  src/modules/insurance/
    ├── index.tsx
    ├── components/
    │   ├── InsuranceComparator.tsx
    │   ├── PremiumCalculator.tsx
    │   ├── CoverageDetail.tsx
    │   └── QuoteForm.tsx
    ├── types.ts
    ├── utils/
    │   └── premium-calculator.ts
    └── integrations.tsx
  ```

- [ ] Criar rota `src/app/[countryCode]/(main)/seguros/page.tsx`
- [ ] Criar types em `src/types/insurance/`

#### Componente: InsuranceComparator

- [ ] Listar tipos de seguro
  - [ ] Roubo e furto
  - [ ] Incêndio
  - [ ] Responsabilidade civil
  - [ ] Lucros cessantes (comercial/industrial)
  - [ ] Garantia estendida
- [ ] Comparação lado a lado (máx 3 seguradoras)
- [ ] Filtros por cobertura
- [ ] Ordenação por prêmio (menor → maior)
- [ ] Destacar recomendado

#### Componente: PremiumCalculator

- [ ] Form de input
  - [ ] kWp do sistema
  - [ ] Localização (CEP)
  - [ ] Tipo de instalação (telhado/solo)
  - [ ] Tipo de imóvel (residencial/comercial/industrial)
- [ ] Cálculo de prêmio
  - [ ] Fórmula: `prêmio = (kWp * taxa_base * fator_regional * fator_tipo)`
  - [ ] Taxa base por seguradora
- [ ] Output: prêmio mensal e anual
- [ ] Exibir coberturas inclusas

#### Integração com Seguradoras (Mock)

- [ ] Criar mock de API Porto Seguro
- [ ] Criar mock de API Mapfre
- [ ] Fallback com dados estáticos
- [ ] Estrutura para integração futura real

#### Componente: CoverageDetail

- [ ] Expandir cada tipo de cobertura
- [ ] Explicação didática
- [ ] Casos de uso
- [ ] Exclusões
- [ ] Carências

#### Página `/seguros`

- [ ] Hero section
- [ ] Form de cotação
- [ ] Seção de comparação
- [ ] Detalhe de coberturas
- [ ] FAQ de seguros
- [ ] CTA "Adicionar ao Carrinho" (seguro como produto)

#### Integração com Checkout

- [ ] Adicionar seguro como produto no carrinho
- [ ] Persistir escolha de seguro
- [ ] Exibir seguro no resumo do checkout

---

## 🟡 FASE 2: Jornadas & Integrações (Sprint 3-4) - 8 dias

### Task 2.1: Módulo Logística `/logistica` [4 dias]

#### Setup Inicial

- [ ] Criar estrutura de pastas

  ```tsx
  src/modules/logistics/
    ├── index.tsx
    ├── components/
    │   ├── FreightCalculator.tsx
    │   ├── OrderTracking.tsx
    │   ├── DeliveryScheduler.tsx
    │   └── CoverageMap.tsx
    ├── types.ts
    ├── utils/
    │   └── freight-calculator.ts
    └── integrations/
        ├── correios.ts
        ├── jadlog.ts
        └── tracking.ts
  ```

- [ ] Criar rota `src/app/[countryCode]/(main)/logistica/page.tsx`
- [ ] Criar types em `src/types/logistics/`

#### Componente: FreightCalculator

- [ ] Integração com Correios API
  - [ ] PAC
  - [ ] SEDEX
- [ ] Integração com JadLog API (mock)
- [ ] Fallback com tabela estática por região
- [ ] Cálculo de prazo
- [ ] Cálculo de custo
- [ ] Exibir opções lado a lado

#### Componente: OrderTracking

- [ ] Consulta de pedido por número
- [ ] Timeline de eventos
  - [ ] Pedido confirmado
  - [ ] Em separação
  - [ ] Enviado
  - [ ] Em trânsito
  - [ ] Entregue
- [ ] Mapa de localização atual (opcional)
- [ ] Notificações por email/SMS
- [ ] Webhook para atualização automática

#### Componente: DeliveryScheduler

- [ ] Calendário de disponibilidade
- [ ] Seleção de data/período
- [ ] Confirmação de instalador
- [ ] Integração com agenda do instalador
- [ ] Email de confirmação

#### Componente: CoverageMap

- [ ] Mapa interativo do Brasil
- [ ] Regiões atendidas destacadas
- [ ] Filtro por tipo de serviço
  - [ ] Entrega
  - [ ] Instalação
  - [ ] Manutenção
- [ ] Prazo por região

#### Página `/logistica`

- [ ] Hero section
- [ ] Calculadora de frete
- [ ] Mapa de cobertura
- [ ] Seção de rastreamento
- [ ] FAQ de entrega

#### Integração com Orders

- [ ] Adicionar tracking em `account/orders`
- [ ] Link direto para rastreamento
- [ ] Status em tempo real
- [ ] Histórico de movimentações

---

### Task 2.2: Solar Journey Context [2 dias]

#### Setup Inicial

- [ ] Criar `src/lib/context/solar-journey-context.tsx`
- [ ] Criar types `src/types/solar-journey.ts`
- [ ] Criar hook `src/hooks/useSolarJourney.ts`

#### Context: SolarJourneyContext

- [ ] State para cada etapa

  ```typescript
  interface SolarJourneyState {
    viability?: ViabilityResult
    tariff?: TariffClassification
    financing?: FinancingPlan
    insurance?: InsuranceQuote
    compliance?: CompliancePacket
    quote?: QuoteData
    currentStep: JourneyStep
    completedSteps: JourneyStep[]
  }
  ```

- [ ] Actions
  - [ ] updateViability
  - [ ] updateTariff
  - [ ] updateFinancing
  - [ ] updateInsurance
  - [ ] updateCompliance
  - [ ] nextStep
  - [ ] prevStep
  - [ ] resetJourney
- [ ] Persistência em localStorage
- [ ] Sincronização com backend (API)

#### Componente: SolarJourneyStepper

- [ ] Stepper visual no topo

  ```tsx
  Dimensionamento → Viabilidade → Tarifas → Financiamento 
    → Seguros → Compliance → Cotação
  ```

- [ ] Indicador de progresso
- [ ] Auto-save a cada mudança
- [ ] Botão "Retomar jornada"

#### Deeplinks

- [ ] Gerar URL compartilhável
  - [ ] Exemplo: `/viabilidade?journey=abc123`
  - [ ] Pre-fill de formulários com dados da URL
- [ ] Decode de journey ID
- [ ] Carregamento de dados do backend

#### Integração com Módulos

- [ ] Viabilidade: salvar resultado no context
- [ ] Tarifas: salvar classificação no context
- [ ] Financiamento: salvar plano no context
- [ ] Seguros: salvar cotação no context
- [ ] Compliance: salvar pacote no context

---

### Task 2.3: Completar Checkout [2 dias]

#### Resolver TODOs

- [ ] `checkout/components/payment-button/index.tsx:52`
  - [ ] Decidir: implementar gift cards ou remover
  - [ ] Se remover: limpar código relacionado
- [ ] `checkout/components/payment-button/index.tsx:92`
  - [ ] Melhorar mensagem de erro
  - [ ] Adicionar link para voltar ao pagamento

#### Validações

- [ ] Address validation
  - [ ] CEP válido
  - [ ] Campos obrigatórios
  - [ ] Formato de endereço BR
- [ ] Payment method required
  - [ ] Não permitir avançar sem método
  - [ ] Destacar campo obrigatório
- [ ] Terms acceptance
  - [ ] Checkbox obrigatório
  - [ ] Link para termos

#### UX de Erro

- [ ] Mensagens claras e acionáveis
  - [ ] "Selecione um método de pagamento"
  - [ ] "Preencha seu endereço completo"
  - [ ] "Aceite os termos para continuar"
- [ ] Retry automático (em caso de falha de rede)
- [ ] Fallback para métodos alternativos
  - [ ] Se cartão falhar, sugerir boleto/PIX

#### Testes

- [ ] Fluxo completo B2C
- [ ] Fluxo completo B2B
- [ ] Erro de pagamento
- [ ] Timeout de sessão

---

## 🟢 FASE 3: Pós-Venda (Sprint 5-6) - 8 dias

### Task 3.1: Módulo O&M `/operacao-manutencao` [5 dias]

#### Setup Inicial

- [ ] Criar estrutura de pastas

  ```tsx
  src/modules/operations-maintenance/
    ├── index.tsx
    ├── components/
    │   ├── PerformanceDashboard.tsx
    │   ├── AlertSystem.tsx
    │   ├── MaintenanceTickets.tsx
    │   └── SystemDetail.tsx
    ├── types.ts
    ├── utils/
    │   └── performance-calculator.ts
    └── integrations/
        ├── inverter-apis.ts
        └── solar-cv.ts
  ```

- [ ] Criar rota `src/app/[countryCode]/(main)/operacao-manutencao/page.tsx`
- [ ] Criar types em `src/types/om/`

#### Componente: PerformanceDashboard

- [ ] Gráfico de geração diária/mensal
  - [ ] Linha: geração real vs. esperada
  - [ ] Área: consumo vs. geração
- [ ] KPIs
  - [ ] Geração total (kWh)
  - [ ] Economia (BRL)
  - [ ] ROI real vs. projetado
  - [ ] Uptime (%)
- [ ] Status do inversor
  - [ ] Online/Offline
  - [ ] Potência atual
  - [ ] Eficiência
- [ ] Comparação mensal (mês atual vs. mês anterior)

#### Componente: AlertSystem

- [ ] Tipos de alerta
  - [ ] 🔴 Crítico: Sistema offline
  - [ ] 🟡 Atenção: Performance baixa (<80%)
  - [ ] 🟢 Info: Necessidade de limpeza
- [ ] Notificações
  - [ ] Email
  - [ ] SMS (opcional)
  - [ ] Push notification (PWA)
- [ ] Histórico de alertas
- [ ] Ações rápidas
  - [ ] "Abrir ticket"
  - [ ] "Agendar visita"
  - [ ] "Marcar como resolvido"

#### Componente: MaintenanceTickets

- [ ] Listagem de tickets
  - [ ] Abertos
  - [ ] Em andamento
  - [ ] Concluídos
- [ ] Criar novo ticket
  - [ ] Tipo (limpeza, reparo, inspeção)
  - [ ] Descrição
  - [ ] Urgência
  - [ ] Fotos
- [ ] Detalhe de ticket
  - [ ] Status
  - [ ] Histórico de atualizações
  - [ ] Técnico responsável
  - [ ] Data de agendamento
- [ ] Agendamento de visita
  - [ ] Calendário de disponibilidade
  - [ ] Confirmação

#### Componente: SystemDetail

- [ ] Informações do sistema
  - [ ] Potência (kWp)
  - [ ] Módulos (qtd, modelo)
  - [ ] Inversores (qtd, modelo)
  - [ ] Data de instalação
- [ ] Histórico de intervenções
- [ ] Documentação técnica
- [ ] Garantias

#### Integração com Solar CV

- [ ] Análise térmica automática
  - [ ] Botão "Solicitar análise térmica"
  - [ ] Upload de imagem térmica
  - [ ] Resultado: anomalias detectadas
- [ ] Inspeção via drone
  - [ ] Botão "Agendar inspeção via drone"
  - [ ] Resultado: modelo 3D + relatório
- [ ] Detecção de painéis
  - [ ] Validação de layout

#### Integração com Inversores

- [ ] API Growatt
  - [ ] Autenticação
  - [ ] Consulta de dados em tempo real
  - [ ] Histórico
- [ ] API Fronius (mock)
- [ ] API SolarEdge (mock)
- [ ] Fallback com dados mockados

#### Página `/operacao-manutencao`

- [ ] Dashboard principal
  - [ ] Lista de sistemas do usuário
  - [ ] KPIs agregados
- [ ] Detalhe de sistema
  - [ ] Performance
  - [ ] Alertas
  - [ ] Tickets
- [ ] Seção de tickets
- [ ] FAQ de manutenção

---

### Task 3.2: PDF Export [1 dia]

#### Setup

- [ ] Instalar `jsPDF` e `html2canvas`

  ```bash
  npm install jspdf html2canvas
  ```

- [ ] Criar `src/lib/util/pdf-generator.ts`

#### Templates

- [ ] Proposta financeira
  - [ ] Header com logo YSH
  - [ ] Dados do cliente
  - [ ] Resumo do financiamento
  - [ ] Tabela de parcelas
  - [ ] Gráfico de ROI
  - [ ] Footer com contato
- [ ] Relatório de viabilidade
  - [ ] Dados técnicos
  - [ ] Geração esperada
  - [ ] Perdas
  - [ ] Layout do sistema
- [ ] Dossiê técnico
  - [ ] Ficha técnica do sistema
  - [ ] Diagrama elétrico
  - [ ] Documentação

#### Implementação

- [ ] `finance/context/FinanceContext.tsx:269`
  - [ ] Adicionar função `exportToPDF()`
  - [ ] Botão "Baixar Proposta (PDF)"
- [ ] `financing/components/FinancingSummary.tsx:35`
  - [ ] Adicionar função `exportToPDF()`
  - [ ] Botão "Baixar Simulação (PDF)"

#### Branding

- [ ] Logo YSH no header
- [ ] Cores institucionais
- [ ] Fontes consistentes
- [ ] Footer com contato e redes sociais

---

## 🔵 FASE 4: Polish & Otimizações (Sprint 7) - 5 dias

### Task 4.1: BizOps Dashboard [3 dias]

#### Setup Inicial

- [ ] Criar estrutura de pastas

  ```tsx
  src/modules/bizops/
    ├── index.tsx
    ├── components/
    │   ├── SalesKPIs.tsx
    │   ├── LeadPipeline.tsx
    │   ├── CohortAnalysis.tsx
    │   └── ProductMetrics.tsx
    ├── types.ts
    └── integrations/
        └── analytics.ts
  ```

- [ ] Criar rota `src/app/[countryCode]/(main)/dashboard/page.tsx` (admin)
- [ ] Adicionar ACL (apenas admin)

#### Componente: SalesKPIs

- [ ] LTV (Lifetime Value)
- [ ] CAC (Customer Acquisition Cost)
- [ ] Churn Rate
- [ ] Conversion Rate (lead → customer)
- [ ] Revenue (MRR, ARR)
- [ ] Comparação com período anterior

#### Componente: LeadPipeline

- [ ] Funil de conversão
  - [ ] Visitantes
  - [ ] Leads
  - [ ] Cotações
  - [ ] Propostas
  - [ ] Vendas
- [ ] Taxa de conversão por etapa
- [ ] Tempo médio por etapa

#### Componente: CohortAnalysis

- [ ] Análise de cohort por mês de aquisição
- [ ] Retenção por cohort
- [ ] LTV por cohort

#### Componente: ProductMetrics

- [ ] Top SKUs (vendas, margem)
- [ ] Estoque crítico
- [ ] ROI por categoria
- [ ] Margem por fabricante

#### Integrações

- [ ] PostHog para eventos
- [ ] Metabase para dashboards embarcados
- [ ] Backend para métricas de vendas

#### Página `/dashboard`

- [ ] Grid de KPIs
- [ ] Funil de conversão
- [ ] Cohort analysis
- [ ] Product metrics
- [ ] Filtros por período

---

### Task 4.2: Resolver TODOs [1 dia]

- [ ] `products/components/thumbnail/index.tsx:9`
  - [ ] Fix image typings
  - [ ] Adicionar tipos corretos para Next.js Image
- [ ] `products/components/product-preview/price.tsx:4`
  - [ ] Add price list access
  - [ ] Expor tipo de price list (B2B/B2C)
- [ ] `catalogo/client-page.tsx:69`
  - [ ] Implement cart integration
  - [ ] Add to cart bulk (múltiplos produtos)
- [ ] Limpar código deprecated
  - [ ] Remover comentários TODO resolvidos
  - [ ] Remover imports não usados

---

### Task 4.3: Testes E2E [1 dia]

#### Setup

- [ ] Instalar Playwright

  ```bash
  npm install -D @playwright/test
  ```

- [ ] Criar `playwright.config.ts`
- [ ] Criar pasta `tests/e2e/`

#### Testes: Jornada B2C

- [ ] `tests/e2e/b2c-purchase.spec.ts`
  - [ ] Navegar para `/produtos`
  - [ ] Adicionar produto ao carrinho
  - [ ] Ir para checkout
  - [ ] Preencher endereço
  - [ ] Selecionar pagamento
  - [ ] Confirmar pedido
  - [ ] Validar página de confirmação

#### Testes: Jornada B2B

- [ ] `tests/e2e/b2b-quote.spec.ts`
  - [ ] Login como usuário B2B
  - [ ] Navegar para `/catalogo`
  - [ ] Adicionar produtos ao carrinho (bulk)
  - [ ] Solicitar aprovação
  - [ ] Validar status de aprovação

#### Testes: Jornada Solar

- [ ] `tests/e2e/solar-journey.spec.ts`
  - [ ] Navegar para `/dimensionamento`
  - [ ] Preencher formulário
  - [ ] Ir para `/viabilidade`
  - [ ] Ir para `/financiamento`
  - [ ] Ir para `/seguros`
  - [ ] Ir para `/compliance`
  - [ ] Ir para `/cotacao`
  - [ ] Validar dados persistidos

#### CI/CD

- [ ] Criar `.github/workflows/e2e-tests.yml`
- [ ] Rodar testes em PRs
- [ ] Rodar testes em deploy

---

## 📊 Métricas de Progresso

### Rotas Implementadas

- [ ] 45/49 rotas (92%) → 49/49 rotas (100%)

### Jornadas Completas

- [ ] 3/7 jornadas (43%) → 7/7 jornadas (100%)

### TODOs Resolvidos

- [ ] 0/15 TODOs (0%) → 15/15 TODOs (100%)

### Módulos Implementados

- [ ] 22/27 módulos (81%) → 27/27 módulos (100%)

---

## 🚀 Quick Wins (Fazer primeiro!)

- [ ] **PDF Export** (1 dia) - Destravar finance e financing
- [ ] **Catalog Cart Integration** (0.5 dia) - Completar catálogo B2B
- [ ] **Fix Image Typings** (0.5 dia) - Resolver warnings
- [ ] **Remove Deprecated** (0.5 dia) - Limpar código

---

## 📈 Gantt Chart (Simplificado)

```tsx
Semana 1-2: ████████ FASE 1 (Compliance + Seguros)
Semana 3-4: ████████ FASE 2 (Logística + Journey + Checkout)
Semana 5-6: ████████ FASE 3 (O&M + PDF Export)
Semana 7:   ████     FASE 4 (BizOps + Polish + Testes)
```

---

## ✅ Critérios de Aceitação

### Módulo está "Completo" quando

- [ ] Todos os componentes principais implementados
- [ ] Integração com jornadas funcionando
- [ ] Testes unitários >80% cobertura
- [ ] Testes E2E da jornada passando
- [ ] Documentação básica (README do módulo)
- [ ] Design system consistente aplicado
- [ ] Acessibilidade (ARIA, keyboard nav)
- [ ] Analytics trackando eventos principais

### Jornada está "Completa" quando

- [ ] Todos os passos implementados
- [ ] Navegação entre passos funcionando
- [ ] Dados persistidos entre passos
- [ ] Teste E2E da jornada completa passando
- [ ] Analytics trackando funil

---

**Total de Tasks:** 150+  
**Estimativa Total:** ~31 dias úteis  
**Status:** ⏳ Aguardando início

**Preparado por:** GitHub Copilot (Hélio)  
**Data:** 08/10/2025
