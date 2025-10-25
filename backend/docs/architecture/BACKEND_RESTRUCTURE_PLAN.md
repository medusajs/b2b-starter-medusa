# 🏗️ Plano de Reestruturação Backend End-to-End

**Data:** 20 de Outubro de 2025  
**Versão:** 1.0  
**Status:** Em Planejamento

---

## 📋 Executive Summary

Reestruturação completa do backend YSH B2B seguindo princípios de **Domain-Driven Design (DDD)**, **CQRS leve** e **Event-Driven Architecture**, focada em:

- ✅ **Performance**: <150ms listagem catálogo, <50ms cálculo preço, <1s simulação solar (cache hit)
- ✅ **Clareza**: JTBD explícitos, contratos versionados, separação de concerns
- ✅ **Escalabilidade**: Workflows persistentes, cache distribuído, projeções materializadas
- ✅ **Observabilidade**: SLIs/SLOs por domínio, auditoria completa, MTTR <30min

---

## 🗺️ Mapa de Domínios (12 Core Domains)

### 1. **Catálogo Unificado** 📦

**Responsabilidade:** Ingestão, normalização, enriquecimento, disponibilidade e imagens de produtos.

**JTBD:** _"Unificar e normalizar SKUs de múltiplos distribuidores, garantindo disponibilidade e imagens otimizadas."_

**Inputs:**

- Arquivos JSON/CSV de distribuidores (Fortlev, Solfacil, Odex)
- Comandos admin (import manual, re-sync)
- Webhooks de parceiros

**Outputs:**

- SKUs normalizados (schema unificado)
- Imagens otimizadas (WebP, CDN)
- Projeções de busca (Elasticsearch/materialized views)
- Eventos: `catalog.product.created`, `catalog.product.updated`, `catalog.sync.completed`

**Outcomes:**

- Latência listagem: **<150ms** (P95)
- Sync completo: **<15min**
- Taxa de erro mapeamento: **0%** (crítico)

**KPIs:**

- TTFB listagem
- Latência de sync
- Erros de normalização

**Módulos Atuais:**

- `src/modules/unified-catalog/`
- `src/modules/ysh-catalog/`

**APIs:**

- `GET /admin/import-catalog`
- `GET /store/catalog/:category`
- `GET /store/catalog/skus`

---

### 2. **Preço & Comercial** 💰

**Responsabilidade:** Cálculo consistente de preços por canal/grupo, promoções e regras comerciais.

**JTBD:** _"Calcular preço final considerando canal de venda, grupo de cliente, promoções ativas e políticas comerciais."_

**Inputs:**

- Regras comerciais (margins, markups)
- Grupos de clientes (B2B, governo, varejo)
- Promoções ativas
- Eventos de catálogo (`catalog.product.updated`)

**Outputs:**

- Preços resolvidos (por SKU + contexto)
- Regras ativas aplicadas
- Eventos: `pricing.price.calculated`, `pricing.promotion.applied`

**Outcomes:**

- Consistência de preço: **100%**
- Latência cálculo: **<50ms**
- Cobertura de regras: **100%** SKUs

**KPIs:**

- Latência cálculo
- Divergências de preço
- Taxa de aplicação de promoções

**Módulos Atuais:**

- `src/modules/ysh-pricing/`
- `src/workflows/calculate-dynamic-pricing.ts`
- `src/workflows/promotion/`

**APIs:**

- `GET /store/produtos_melhorados`
- `POST /admin/solar/promotions`

---

### 3. **RFQ/Quotes** 📝

**Responsabilidade:** Criação, negociação e conversão de cotações com snapshot de itens.

**JTBD:** _"Criar e negociar cotações B2B com histórico de mensagens, anexos e snapshot imutável de SKUs/preços."_

**Inputs:**

- Itens/quantidades
- Mensagens e anexos
- Políticas de cliente
- Eventos de aprovação (`approval.approved`)

**Outputs:**

- Cotações com snapshot
- Mensagens/chat
- Eventos: `quote.sent`, `quote.accepted`, `quote.rejected`, `quote.expired`

**Outcomes:**

- Time-to-Market quote: **<5min**
- Taxa de aceite: **>30%**
- SLA de resposta mensagens: **<2h** (business hours)

**KPIs:**

- TTM-quote
- Taxa de aceite
- Aging de cotações

**Módulos Atuais:**

- `src/modules/quote/`
- `src/workflows/quote/`

**APIs:**

- `GET /store/quotes`
- `POST /store/quotes`
- `POST /store/quotes/:id/messages`
- `GET /admin/quotes`

---

### 4. **Aprovações** ✅

**Responsabilidade:** Orquestração de aprovações condicionais multi-etapas com auditoria.

**JTBD:** _"Orquestrar aprovações baseadas em políticas de empresa, limites de gastos e regras condicionais, garantindo trilha de auditoria imutável."_

**Inputs:**

- Políticas por empresa (spending limits, approval rules)
- Eventos de quote/order (`quote.created`, `cart.checkout`)
- Exceções e escalações

**Outputs:**

- Decisões (approved/rejected)
- Pendências e notificações
- Escalonamentos automáticos
- Auditoria imutável (approval_history)

**Outcomes:**

- Lead time aprovação: **<24h**
- Taxa de bypass indevido: **0%**
- Rastreabilidade: **100%**

**KPIs:**

- Tempo de ciclo por etapa
- Taxa de escalonamento
- Aging por status

**Módulos Atuais:**

- `src/modules_disabled/approval/` ⚠️ (desabilitado, precisa reativação)
- `src/workflows/approval/`

**APIs:**

- `GET /store/approvals`
- `POST /store/approvals/:id/approve`
- `GET /admin/approvals/rules`

---

### 5. **Empresas & Colaboradores** 🏢
**Responsabilidade:** Estrutura organizacional B2B, papéis, limites e centros de custo.

**JTBD:** _"Estruturar contas B2B com hierarquia de colaboradores, papéis, limites de gastos e grupos de cliente."_

**Inputs:**
- Convites de colaboradores
- Alterações de papéis (admin, employee)
- Definição de limites (individual, company-wide)
- Grupos de cliente (Customer Groups)

**Outputs:**
- Perfis/limites consolidados
- Memberships ativas
- Eventos: `company.employee.added`, `company.limit.exceeded`, `company.compliance.updated`

**Outcomes:**
- Inconsistência de limite: **0%**
- Provisionamento de colaborador: **<1min**
- Cobertura de compliance: **100%**

**KPIs:**
- Taxa de aderência a limites
- Tempo de provisionamento
- Erros de hierarquia

**Módulos Atuais:**
- `src/modules/empresa/` (alias `company`)
- `src/workflows/company/`

**APIs:**
- `GET /store/companies`
- `POST /store/companies/:id/employees`
- `GET /admin/companies`

---

### 6. **Pedidos & Checkout** 🛒
**Responsabilidade:** Conversão de RFQ em pedido com integração de aprovações.

**JTBD:** _"Converter cotações/carrinhos em pedidos após aprovação, integrando com fulfillment e pagamentos."_

**Inputs:**
- Carrinho/quote aprovado
- Aprovação concedida (`approval.approved`)
- Dados de pagamento/fulfillment

**Outputs:**
- Orders (draft → pending → processing)
- Faturas
- Eventos: `order.placed`, `order.fulfillment.created`

**Outcomes:**
- Taxa de erro checkout: **<0.5%**
- Ciclo pedido previsível: **100%** tracking
- Conversão quote→order: **>25%**

**KPIs:**
- Taxa de sucesso checkout
- Tempo médio de conversão
- Erros de fulfillment

**Módulos Atuais:**
- Core Medusa `order` module
- `src/workflows/solar/draft-orders.ts`

**APIs:**
- `POST /store/carts/:id/complete`
- `GET /admin/orders`

---

### 7. **Financiamento & Crédito** 💳
**Responsabilidade:** Simulação e aprovação de financiamentos com conformidade BACEN.

**JTBD:** _"Simular e aprovar propostas de financiamento, checando BACEN, conformidades regulatórias e consent do cliente."_

**Inputs:**
- Dados do cliente
- Consentimentos (LGPD)
- Tabelas de parceiros (Asaas, bancos)
- Propostas de financiamento

**Outputs:**

- Simulações de parcelamento
- Limites aprovados/negados
- Trilhas de consent
- Eventos: `financing.proposal.created`, `financing.approved`, `financing.rejected`

**Outcomes:**

- Latência simulação: **<2s**
- Conformidade regulatória: **100%**
- Taxa de aprovação: **>40%**

**KPIs:**
- Latência simulação
- Taxa de aprovação
- Conformidade BACEN

**Módulos Atuais:**
- `src/modules/financing/`
- `src/modules/credit-analysis/`
- `src/workflows/financing/`
- `src/workflows/credit-analysis/`

**APIs:**
- `GET /store/financing`
- `POST /store/financing/proposals`
- `GET /admin/financing`

---

### 8. **Energia & Tarifas (ANEEL)** ⚡
**Responsabilidade:** Manutenção e aplicação de tarifas elétricas por região.

**JTBD:** _"Manter tabelas tarifárias ANEEL atualizadas e aplicar corretamente aos cenários de simulação solar."_

**Inputs:**
- Tabelas ANEEL (importação periódica)
- Regiões/distribuidoras
- Classes tarifárias (residencial, comercial, industrial)

**Outputs:**
- Tarifas resolvidas (por região + classe)
- Índices de reajuste
- Eventos: `tariff.updated`, `tariff.region.changed`

**Outcomes:**
- Acerto de tarifa: **100%**
- Atualização pós-mudança: **<48h**
- Cobertura de regiões: **100%** Brasil

**KPIs:**
- Acurácia de tarifa
- Latência de atualização
- Cobertura geográfica

**Módulos Atuais:**
- `src/modules/tarifa-aneel/`

**APIs:**
- `GET /store/aneel/tarifas`
- `POST /admin/aneel/import`

---

### 9. **Simulações & Cálculo Solar** ☀️
**Responsabilidade:** Estimativa de geração e viabilidade com PVLib e caching.

**JTBD:** _"Estimar geração solar e viabilidade econômica com cálculos precisos, cenários múltiplos e caching distribuído."_

**Inputs:**
- Coordenadas geográficas
- Equipamentos selecionados (painéis, inversores)
- Irradiância (NASA/INPE)
- Parâmetros de cálculo

**Outputs:**
- Métricas de geração (kWh/mês, anual)
- Cenários (payback, ROI, VPL)
- PDFs/relatórios
- Eventos: `solar.simulation.completed`, `solar.report.generated`

**Outcomes:**
- Cálculo cache hit: **<1s**
- Cálculo cache miss: **<5s**
- Acurácia validada: **>95%** vs real

**KPIs:**

- Cache hit rate
- Latência miss/hit
- Acurácia (amostral)

**Módulos Atuais:**

- `src/modules/solar-calculator/`
- `src/modules/pvlib-integration/`
- `src/workflows/solar/calculate-solar-system.ts`

**APIs:**

- `POST /store/solar/validate-feasibility`
- `GET /store/solar-quotes`

---

### 10. **Integrações de Distribuidores** 🔗

**Responsabilidade:** Ingestão confiável e reconciliada (estoque/preço/imagem).

**JTBD:** _"Ingestão automatizada e confiável de dados de distribuidores com reconciliação de divergências."_

**Inputs:**

- Cron/import manual
- Webhooks de parceiros
- Scraping fallback (quando API indisponível)

**Outputs:**

- Normalizações aplicadas
- Diffs detectados
- Alertas de divergência
- Eventos: `distributor.sync.started`, `distributor.sync.completed`, `distributor.error`

**Outcomes:**

- Taxa de erro: **<1%**
- Latência de atualização: **<15min**
- Cobertura de distribuidores: **5+** ativos

**KPIs:**

- Taxa de erro por distribuidor
- Latência de sync
- Taxa de divergência

**Módulos Atuais:**

- `src/scrapers/`
- `src/workers/`

**APIs:**

- `POST /admin/import-catalog`

---

### 11. **Plataforma & Operação** ⚙️

**Responsabilidade:** Workflows, jobs, subscribers, admin UI, auth/ACL.

**JTBD:** _"Orquestrar operações assíncronas, gerenciar autenticação, autorização e interfaces administrativas."_

**Inputs:**

- Comandos admin
- Jobs agendados (cron)
- Eventos de domínio

**Outputs:**
- Execuções de workflows
- Jobs completados
- Notificações
- Eventos: `workflow.completed`, `job.failed`

**Outcomes:**
- Uptime workflows: **>99.9%**
- Taxa de falha de jobs: **<1%**
- Latência de notificações: **<5s**

**KPIs:**
- Uptime
- Taxa de sucesso de jobs
- Latência de eventos

**Módulos Atuais:**
- `src/workflows/`
- `src/jobs/`
- `src/subscribers/`
- `src/api/admin/`

---

### 12. **Observabilidade & Dados** 📊
**Responsabilidade:** Métricas, logs, auditoria e data products (views).

**JTBD:** _"Medir, auditar e explicar o sistema com dashboards, SLIs/SLOs e trilhas de auditoria."_

**Inputs:**
- Eventos de domínio
- Logs estruturados
- Métricas de aplicação
- Queries de análise

**Outputs:**
- Dashboards (latência, erros, SLIs/SLOs)
- Trilhas de auditoria
- Data products (materialized views)
- Alertas

**Outcomes:**
- MTTR: **<30min**
- SLO APIs críticas: **99.9%**
- Cobertura de auditoria: **100%** operações sensíveis

**KPIs:**
- MTTR
- SLO adherence
- Cobertura de logs

**Módulos Atuais:**
- Integração com Grafana/Prometheus
- `database/views/` (a criar)

---

## 🏛️ Arquitetura Alvo

### Estilo Arquitetural
- **DDD Modular**: Separação por domínios autônomos
- **CQRS Leve**: Commands vs Queries sem event sourcing completo
- **Event-Driven**: Publish/subscribe entre módulos

### Camadas por Domínio
```
src/domains/<domínio>/
├── domain/           # Entidades, Value Objects, Domain Events
├── application/      # Use Cases, Workflows, Application Services
├── infrastructure/   # Repositories, Adapters, External APIs
└── interfaces/       # Controllers, Validators, DTOs
```

### Híbrido com Medusa
- Manter `src/modules/<domínio>` como Medusa module wrappers
- Rotas em `src/api/<admin|store>/<domínio>` chamando use cases
- DI container do Medusa gerenciando dependências

### Dados
- **Postgres**: Normalizado + índices otimizados
- **Materialized Views**: Projeções para consultas pesadas (catálogo, preços)
- **Redis**: Cache por domínio com TTLs e versionamento

### Eventos
- **Interno**: Pub/sub via Medusa event bus
- **Contratos**: Versionados (v1, v2) para backward compatibility
- **Idempotência**: Deduplicação por event_id

### Assíncrono
- **Workflows**: Orquestrações multi-step (Medusa workflows)
- **Jobs**: Imports, imagens, PVLib (Bull/Redis)
- **Engine Persistente**: Redis/DB para workflows em prod (não in-memory)

### Segurança
- **Policies**: Por domínio (RBAC/ABAC)
- **Idempotência**: Em comandos via idempotency keys
- **Rate Limiting**: Por endpoint e tenant
- **Auditoria**: Completa em operações sensíveis

---

## 📁 Estrutura de Pastas (Proposta)

```
backend/
├── src/
│   ├── domains/                    # 🆕 Domínios DDD
│   │   ├── catalog/
│   │   │   ├── domain/
│   │   │   │   ├── entities/       # Product, SKU
│   │   │   │   ├── value-objects/  # Price, Stock
│   │   │   │   └── events/         # ProductCreated, ProductUpdated
│   │   │   ├── application/
│   │   │   │   ├── use-cases/      # ImportCatalog, NormalizeSKU
│   │   │   │   ├── workflows/      # ImportCatalogWorkflow
│   │   │   │   └── services/       # CatalogApplicationService
│   │   │   ├── infrastructure/
│   │   │   │   ├── repositories/   # ProductRepository
│   │   │   │   └── adapters/       # DistributorAPIAdapter
│   │   │   └── interfaces/
│   │   │       ├── http/           # Controllers, Validators
│   │   │       └── dtos/           # Request/Response DTOs
│   │   ├── pricing/
│   │   ├── quotes/
│   │   ├── approvals/
│   │   ├── companies/
│   │   ├── orders/
│   │   ├── financing/
│   │   ├── energy-tariffs/
│   │   ├── solar-simulation/
│   │   ├── distributor-integration/
│   │   └── observability/
│   │
│   ├── modules/                    # ✅ Medusa modules (wrappers)
│   │   ├── unified-catalog/        # Mantém compatibilidade
│   │   ├── ysh-pricing/
│   │   ├── quote/
│   │   ├── approval/               # Reativar
│   │   ├── empresa/
│   │   └── ...
│   │
│   ├── shared/                     # 🆕 Código compartilhado
│   │   ├── errors/                 # DomainError, ValidationError
│   │   ├── auth/                   # AuthService, Policies
│   │   ├── validation/             # Zod schemas, validators
│   │   ├── events/                 # EventBus, EventStore
│   │   ├── cache/                  # CacheService (Redis)
│   │   └── utils/                  # Helpers, formatters
│   │
│   ├── workflows/                  # ✅ Workflows (já existem)
│   │   ├── catalog/
│   │   ├── pricing/
│   │   ├── quotes/
│   │   └── ...
│   │
│   ├── jobs/                       # ✅ Jobs assíncronos
│   │   ├── catalog/                # Import jobs
│   │   ├── images/                 # Otimização de imagens
│   │   └── solar/                  # PVLib calculations
│   │
│   ├── subscribers/                # ✅ Event subscribers
│   │   ├── catalog/
│   │   ├── pricing/
│   │   └── ...
│   │
│   └── api/                        # ✅ Rotas (já existem)
│       ├── admin/
│       │   ├── catalog/
│       │   ├── quotes/
│       │   └── ...
│       └── store/
│           ├── catalog/
│           ├── quotes/
│           └── ...
│
├── database/
│   ├── migrations/                 # Nomeadas por domínio
│   └── views/                      # 🆕 Materialized views
│       ├── catalog_search.sql
│       ├── pricing_matrix.sql
│       └── approval_dashboard.sql
│
└── docs/
    └── architecture/               # 🆕 Documentação por domínio
        ├── BACKEND_RESTRUCTURE_PLAN.md  # Este arquivo
        ├── domains/
        │   ├── catalog.md          # JTBD, contratos, fluxos
        │   ├── pricing.md
        │   ├── quotes.md
        │   └── ...
        └── slis-slos/              # 🆕 Service Level Indicators/Objectives
            ├── catalog.md
            ├── quotes.md
            └── ...
```

---

## 📊 Performance e Eficácia

### Database
- **Índices**: Por filtros frequentes (catálogo: category, price range; quotes: status, customer_id)
- **VACUUM/ANALYZE**: Automatizado via cron
- **Connection Pooling**: Limites por worker (max 20 conexões)

### Consultas
- **Materialized Views**: Para catálogos e listas (refresh on-demand ou scheduled)
- **Paginação**: Cursor-based (não offset) para grandes datasets
- **Query Optimization**: EXPLAIN ANALYZE em queries críticas

### Cache
- **Redis**: TTLs por domínio (catálogo: 1h, preços: 5min, simulações: 24h)
- **Versionamento**: Chaves com hash de filtros (`catalog:v1:filter:hash`)
- **Cache Warming**: Em sync de catálogo/preços

### I/O Pesado
- **Imagens**: Pipeline assíncrono (upload → resize → WebP → CDN)
- **PVLib**: Memoization distribuída (cache por coordenadas + equipamentos)
- **Imports**: Streaming de arquivos grandes

### API
- **Idempotência**: POST com `Idempotency-Key` header
- **Rate Limiting**: 100 req/min por tenant, burst de 20
- **Compaction**: Gzip/Brotli em payloads >1KB

### Workflows
- **Steps Idempotentes**: Retry-safe com compensations
- **Backoff**: Exponencial com jitter
- **Particionamento**: Jobs por domínio (filas separadas)

### Concurrency
- **Connection Pooling**: 20 max por worker
- **Worker Limits**: 4 workers por processo
- **Filas**: Separadas por domínio (catalog, pricing, solar)

### Build
- **Tree-shaking**: Remover código não usado
- **TS Target**: ES2022 para performance
- **Lazy Imports**: Em admin UI (code splitting)

---

## 🚀 Plano de Migração (6 Fases)

### **Fase 0 — Inventário** (1 semana)
**Objetivo:** Mapear estado atual completo.

**Atividades:**
- ✅ Mapear rotas, módulos, workflows, jobs, subscribers
- ✅ Mapear migrações e dados vivos (volumes)
- ✅ Identificar dependências entre módulos
- ✅ Documentar contratos de API atuais

**Entregáveis:**
- ✅ `CURRENT_STATE_INVENTORY.md`
- ✅ Matriz de dependências
- ✅ Documentação de APIs legadas

---

### **Fase 1 — Domínios Base** (2 semanas)
**Objetivo:** Criar estrutura DDD sem quebrar APIs existentes.

**Atividades:**
- Criar `src/domains/` com estrutura de camadas
- Criar `src/shared/` (errors, validation, cache)
- Documentar contratos de eventos (versionados)
- Setup de padrões de código (ESLint rules, ADRs)

**Entregáveis:**
- Skeleton de domínios
- Contratos de eventos (v1)
- Guia de contribuição (coding standards)

**Critérios de Sucesso:**
- Build passa sem erros
- Nenhuma API quebrada
- Documentação completa

---

### **Fase 2 — Catálogo & Quotes** (3 semanas)
**Objetivo:** CQRS leve + caches; rotas finas chamando application.

**Atividades:**
- Migrar `unified-catalog` para `domains/catalog`
- Implementar CatalogApplicationService (use cases)
- Setup Redis cache (catálogo, preços)
- Criar materialized views (catalog_search)
- Migrar rotas para controllers finos

**Entregáveis:**
- Domínio Catálogo completo
- Domínio Quotes completo
- Cache Redis funcional
- Materialized views criadas

**Critérios de Sucesso:**
- Latência listagem <150ms (P95)
- Cache hit rate >80%
- 100% backward compatibility

---

### **Fase 3 — Aprovações & Pedidos** (3 semanas)
**Objetivo:** Eventos integrados; auditoria centralizada.

**Atividades:**
- Reativar `approval` module
- Migrar para `domains/approvals`
- Integrar eventos (quotes→approvals→orders)
- Implementar auditoria imutável (approval_history)
- Setup de workflows persistentes (Redis-backed)

**Entregáveis:**
- Domínio Aprovações funcional
- Auditoria completa
- Workflows persistentes

**Critérios de Sucesso:**
- Lead time aprovação <24h
- 0% bypass indevido
- 100% rastreabilidade

---

### **Fase 4 — Financiamento & Energia** (2 semanas)
**Objetivo:** Consolidar integrações; compliance/consent store.

**Atividades:**
- Migrar `financing` e `tarifa-aneel` para domínios
- Implementar consent store (LGPD)
- Integrar BACEN (checagens de crédito)
- Otimizar simulações solares (cache + PVLib)

**Entregáveis:**
- Domínio Financiamento completo
- Domínio Energia/Tarifas completo
- Consent store funcional

**Critérios de Sucesso:**
- Latência simulação <2s
- 100% conformidade regulatória
- Cache hit rate >70% (simulações)

---

### **Fase 5 — Observabilidade** (2 semanas)
**Objetivo:** SLIs/SLOs, tracing, alertas por domínio.

**Atividades:**
- Setup Prometheus + Grafana
- Definir SLIs/SLOs por domínio
- Implementar tracing distribuído (OpenTelemetry)
- Criar dashboards (latência, erros, cache hit rate)
- Setup de alertas (PagerDuty/Slack)

**Entregáveis:**
- Dashboards Grafana
- SLIs/SLOs documentados
- Alertas configurados

**Critérios de Sucesso:**
- MTTR <30min
- SLO 99.9% APIs críticas
- Cobertura de logs 100%

---

### **Fase 6 — Hardening Prod** (2 semanas)
**Objetivo:** Workflow engine persistente; hardening de segurança.

**Atividades:**
- Migrar workflows para backend persistente (Redis/DB)
- Implementar rate limiting por tenant
- Setup de idempotency keys
- Auditoria de segurança (OWASP)
- Load testing (K6)

**Entregáveis:**
- Workflows persistentes
- Rate limiting ativo
- Auditoria de segurança completa

**Critérios de Sucesso:**
- 0 downtime em deploy
- Throughput >500 req/s
- Segurança hardened

---

## 📈 KPIs & Métricas

### Por Domínio

| Domínio | SLI | Target | Métrica |
|---------|-----|--------|---------|
| **Catálogo** | TTFB listagem | <150ms | P95 |
| | Latência sync | <15min | Max |
| | Erros normalização | 0% | Count |
| **Pricing** | Latência cálculo | <50ms | P95 |
| | Consistência | 100% | % |
| **Quotes** | TTM-quote | <5min | Avg |
| | Taxa aceite | >30% | % |
| **Approvals** | Lead time | <24h | Avg |
| | Bypass indevido | 0% | Count |
| **Financing** | Latência simulação | <2s | P95 |
| | Conformidade | 100% | % |
| **Solar** | Cache hit rate | >70% | % |
| | Latência hit/miss | <1s/<5s | P95 |
| **Confiabilidade** | SLO APIs críticas | 99.9% | Uptime |
| | MTTR | <30min | Avg |

### Dashboards
1. **API Performance**: Latência, throughput, erro 5xx
2. **Cache Efficiency**: Hit rate, evictions, memory usage
3. **Workflows**: Completados, falhados, aging
4. **Database**: Connection pool, query time, deadlocks
5. **Business**: Quotes criadas, aprovações, conversões

---

## ⚠️ Riscos & Mitigações

### Risco 1: Acoplamento Legacy
**Descrição:** Lógica misturada nas rotas dificulta migração.

**Mitigação:**
- Introduzir camada `application` antes de mover
- Refatorar incrementalmente (1 rota por vez)
- Feature flags para rollback

---

### Risco 2: Tráfego Pico em Importações
**Descrição:** Imports bloqueiam workers e DB.

**Mitigação:**
- Particionar jobs por distribuidor
- Aplicar backpressure (rate limiting)
- Usar filas separadas

---

### Risco 3: Consistência Eventual
**Descrição:** Eventos podem chegar fora de ordem ou duplicados.

**Mitigação:**
- Contratos versionados
- Idempotência em subscribers
- Deduplicação por event_id
- Compensations em workflows

---

### Risco 4: Custos de Cache
**Descrição:** Redis pode crescer ilimitadamente.

**Mitigação:**
- TTLs agressivos por domínio
- Invalidação precisa via eventos
- Monitorar memory usage
- Eviction policies (LRU)

---

## 📦 Entregáveis

1. ✅ **Catálogo de Domínios e Fluxos 360º**
2. ⏳ **Mapa de módulos/rotas → domínios**
3. ⏳ **Especificação de eventos e contratos**
4. ⏳ **Padrões de projeto/código**
5. ⏳ **Dashboards e SLIs/SLOs**

---

## 🎯 Próximos Passos

1. **Validar mapa de domínios** com stakeholders
2. **Priorizar** domínios (Catálogo → Quotes → Aprovações primeiro)
3. **Gerar skeleton** `src/domains/*`
4. **Adaptar 1 rota** por domínio como piloto
5. **Configurar Redis** e índices críticos
6. **Definir KPIs base** (Grafana dashboards)

---

**Status Atual:** ✅ Fase 0 completa | 🔄 Fase 1 em planejamento

**Última Atualização:** 20/10/2025
