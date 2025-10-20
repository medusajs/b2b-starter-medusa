# 🏗️ Reestruturação 360º — Backend YSH Solar Hub

**Versão:** 2.0  
**Data:** 20 de Outubro de 2025  
**Status:** Fase 0 Completa → Iniciando Fase 1

---

## 📋 Executive Summary

Plano completo de reestruturação end-to-end do backend seguindo **Domain-Driven Design (DDD)**, **CQRS leve** e **Event-Driven Architecture**, focado em:

- ✅ **Performance**: <150ms listagem catálogo, <50ms cálculo preço, <1s simulação solar
- ✅ **Clareza**: JTBD explícitos, contratos versionados, separação de concerns
- ✅ **Escalabilidade**: Workflows persistentes, cache distribuído, projeções materializadas
- ✅ **Observabilidade**: SLIs/SLOs por domínio, auditoria completa, MTTR <30min

**Documentação Detalhada:** [`BACKEND_RESTRUCTURE_PLAN.md`](./architecture/BACKEND_RESTRUCTURE_PLAN.md)

---

## 🗺️ Mapa de Domínios (12 Core Domains)

### 1. **Catálogo Unificado** 📦
- **Módulos:** `unified-catalog`, `ysh-catalog`
- **APIs:** `/admin/import-catalog`, `/store/catalog`, `/store/catalog/skus`
- **Prioridade:** P0 (Crítico)

### 2. **Preço & Comercial** 💰
- **Módulos:** `ysh-pricing`
- **Workflows:** `calculate-dynamic-pricing`, `promotion/*`
- **Prioridade:** P0 (Crítico)

### 3. **RFQ/Quotes** 📝
- **Módulos:** `quote`
- **Workflows:** `quote/create-request-for-quote`
- **APIs:** `/store/quotes`, `/admin/quotes`
- **Prioridade:** P1 (Alto)

### 4. **Aprovações** ✅
- **Módulos:** `approval` ⚠️ (desabilitado, precisa reativação)
- **Workflows:** `approval/update-approvals`
- **APIs:** `/store/approvals`, `/admin/approvals`
- **Prioridade:** P1 (Alto)

### 5. **Empresas & Colaboradores** 🏢
- **Módulos:** `empresa` (alias `company`)
- **Workflows:** `company/*`
- **APIs:** `/store/companies`, `/admin/companies`
- **Prioridade:** P1 (Alto)

### 6. **Pedidos & Checkout** 🛒
- **Módulos:** Core Medusa `order`
- **Workflows:** `solar/draft-orders`
- **Prioridade:** P1 (Alto)

### 7. **Financiamento & Crédito** 💳
- **Módulos:** `financing`, `credit-analysis`
- **Workflows:** `financing/*`, `credit-analysis/*`
- **Prioridade:** P2 (Médio)

### 8. **Energia & Tarifas ANEEL** ⚡
- **Módulos:** `tarifa-aneel`
- **Prioridade:** P2 (Médio)

### 9. **Simulações & Cálculo Solar** ☀️
- **Módulos:** `solar-calculator`, `pvlib-integration`
- **Workflows:** `solar/calculate-solar-system`
- **Prioridade:** P1 (Alto)

### 10. **Integrações de Distribuidores** 🔗
- **Componentes:** `src/scrapers`, `src/workers`
- **Prioridade:** P2 (Médio)

### 11. **Plataforma & Operação** ⚙️
- **Componentes:** Workflows, Jobs, Subscribers, Admin UI
- **Prioridade:** P0 (Infraestrutura)

### 12. **Observabilidade & Dados** 📊
- **Componentes:** Métricas, Logs, Auditoria, Data Products
- **Prioridade:** P0 (Infraestrutura)

## 🏛️ Arquitetura Alvo

### Princípios Fundamentais
- **DDD Modular**: Separação por domínios autônomos com bounded contexts
- **CQRS Leve**: Commands vs Queries sem event sourcing completo
- **Event-Driven**: Pub/sub entre módulos (quotes→approvals→orders)
- **Híbrido Medusa**: Compatibilidade com framework existente

### Camadas por Domínio
```
src/domains/<domínio>/
├── domain/           # Entidades, Value Objects, Domain Events
├── application/      # Use Cases, Workflows, Application Services
├── infrastructure/   # Repositories, Adapters, External APIs
└── interfaces/       # Controllers, Validators, DTOs
```

### Stack Tecnológico
- **Persistence**: PostgreSQL com índices otimizados + materialized views
- **Cache**: Redis com TTLs por domínio e versionamento de chaves
- **Queue**: Bull/Redis para jobs assíncronos particionados
- **Workflows**: Medusa workflows com backend persistente (Redis/DB)
- **Events**: Medusa event bus com contratos versionados
- **Observability**: Prometheus + Grafana + OpenTelemetry

### Integração com Medusa
- `src/modules/<domínio>`: Medusa module wrappers (mantém DI container)
- `src/api/<admin|store>/<domínio>`: Rotas finas chamando use cases
- Compatibilidade 100% com APIs existentes durante migração

## 📊 JTBD, Inputs/Outputs, Outcomes

### 1. Catálogo Unificado 📦
**JTBD:** _"Unificar e normalizar SKUs de múltiplos distribuidores, garantindo disponibilidade e imagens otimizadas."_

| Aspecto | Detalhe |
|---------|---------|
| **Inputs** | Arquivos JSON/CSV distribuidores, comandos admin, webhooks parceiros |
| **Outputs** | SKUs normalizados, imagens WebP/CDN, projeções de busca, eventos `catalog.*` |
| **Outcomes** | Latência <150ms (P95), Sync <15min, Taxa erro mapeamento: 0% |
| **KPIs** | TTFB listagem, Latência sync, Erros de normalização |

### 2. Preço & Comercial 💰
**JTBD:** _"Calcular preço final considerando canal, grupo, promoções e políticas comerciais."_

| Aspecto | Detalhe |
|---------|---------|
| **Inputs** | Regras comerciais, grupos de clientes, promoções, eventos `catalog.product.updated` |
| **Outputs** | Preços resolvidos por contexto, regras ativas, eventos `pricing.*` |
| **Outcomes** | Consistência: 100%, Latência cálculo: <50ms, Cobertura: 100% SKUs |
| **KPIs** | Latência cálculo, Divergências, Taxa aplicação promoções |

### 3. RFQ/Quotes 📝
**JTBD:** _"Criar e negociar cotações B2B com histórico de mensagens e snapshot imutável."_

| Aspecto | Detalhe |
|---------|---------|
| **Inputs** | Itens/quantidades, mensagens, anexos, políticas cliente, eventos `approval.approved` |
| **Outputs** | Cotações com snapshot, chat, eventos `quote.sent/accepted/rejected/expired` |
| **Outcomes** | TTM-quote: <5min, Taxa aceite: >30%, SLA resposta: <2h |
| **KPIs** | TTM-quote, Taxa de aceite, Aging de cotações |

### 4. Aprovações ✅
**JTBD:** _"Orquestrar aprovações baseadas em políticas com trilha de auditoria imutável."_

| Aspecto | Detalhe |
|---------|---------|
| **Inputs** | Políticas por empresa, eventos `quote.created/cart.checkout`, exceções |
| **Outputs** | Decisões, pendências, escalonamentos, auditoria (approval_history) |
| **Outcomes** | Lead time: <24h, Taxa bypass indevido: 0%, Rastreabilidade: 100% |
| **KPIs** | Tempo de ciclo, Taxa escalonamento, Aging por status |

### 5. Empresas & Colaboradores 🏢
**JTBD:** _"Estruturar contas B2B com hierarquia, papéis, limites e grupos."_

| Aspecto | Detalhe |
|---------|---------|
| **Inputs** | Convites, alterações de papéis/limites, Customer Groups |
| **Outputs** | Perfis/limites, memberships, eventos `company.employee.added/limit.exceeded` |
| **Outcomes** | Inconsistência: 0%, Provisionamento: <1min, Compliance: 100% |
| **KPIs** | Aderência a limites, Tempo provisionamento, Erros hierarquia |

### 6. Pedidos & Checkout 🛒
**JTBD:** _"Converter cotações/carrinhos em pedidos após aprovação."_

| Aspecto | Detalhe |
|---------|---------|
| **Inputs** | Carrinho/quote aprovado, aprovação, dados pagamento/fulfillment |
| **Outputs** | Orders, faturas, eventos `order.placed/fulfillment.created` |
| **Outcomes** | Taxa erro checkout: <0.5%, Conversão quote→order: >25% |
| **KPIs** | Taxa sucesso checkout, Tempo conversão, Erros fulfillment |

### 7. Financiamento & Crédito 💳
**JTBD:** _"Simular e aprovar propostas com conformidade BACEN."_

| Aspecto | Detalhe |
|---------|---------|
| **Inputs** | Dados cliente, consentimentos (LGPD), tabelas parceiros |
| **Outputs** | Simulações, limites aprovados/negados, trilhas consent |
| **Outcomes** | Latência: <2s, Conformidade: 100%, Taxa aprovação: >40% |
| **KPIs** | Latência simulação, Taxa aprovação, Conformidade BACEN |

### 8. Energia & Tarifas ANEEL ⚡
**JTBD:** _"Manter tarifas ANEEL atualizadas e aplicar corretamente."_

| Aspecto | Detalhe |
|---------|---------|
| **Inputs** | Tabelas ANEEL, regiões, classes tarifárias |
| **Outputs** | Tarifas resolvidas, índices de reajuste, eventos `tariff.updated` |
| **Outcomes** | Acerto: 100%, Atualização: <48h, Cobertura: 100% Brasil |
| **KPIs** | Acurácia tarifa, Latência atualização, Cobertura geográfica |

### 9. Simulações & Cálculo Solar ☀️
**JTBD:** _"Estimar geração e viabilidade com PVLib e caching distribuído."_

| Aspecto | Detalhe |
|---------|---------|
| **Inputs** | Coordenadas, equipamentos, irradiância (NASA/INPE), parâmetros |
| **Outputs** | Métricas geração, cenários (payback/ROI), PDFs, eventos `solar.simulation.completed` |
| **Outcomes** | Cache hit: <1s, Cache miss: <5s, Acurácia: >95% vs real |
| **KPIs** | Cache hit rate, Latência miss/hit, Acurácia (amostral) |

### 10. Integrações de Distribuidores 🔗
**JTBD:** _"Ingestão automatizada e reconciliada com detecção de divergências."_

| Aspecto | Detalhe |
|---------|---------|
| **Inputs** | Cron/import manual, webhooks, scraping fallback |
| **Outputs** | Normalizações, diffs, alertas, eventos `distributor.sync.*` |
| **Outcomes** | Taxa erro: <1%, Latência: <15min, Cobertura: 5+ distribuidores |
| **KPIs** | Taxa erro por distribuidor, Latência sync, Taxa divergência |

### 11. Plataforma & Operação ⚙️
**JTBD:** _"Orquestrar operações assíncronas e gerenciar auth/ACL."_

| Aspecto | Detalhe |
|---------|---------|
| **Inputs** | Comandos admin, jobs agendados, eventos de domínio |
| **Outputs** | Execuções workflows, jobs completados, notificações |
| **Outcomes** | Uptime: >99.9%, Taxa falha jobs: <1%, Latência notificações: <5s |
| **KPIs** | Uptime, Taxa sucesso jobs, Latência eventos |

### 12. Observabilidade & Dados 📊
**JTBD:** _"Medir, auditar e explicar o sistema com dashboards e SLIs/SLOs."_

| Aspecto | Detalhe |
|---------|---------|
| **Inputs** | Eventos, logs estruturados, métricas, queries de análise |
| **Outputs** | Dashboards, trilhas auditoria, data products (views), alertas |
| **Outcomes** | MTTR: <30min, SLO: 99.9% APIs críticas, Cobertura auditoria: 100% |
| **KPIs** | MTTR, SLO adherence, Cobertura de logs |

## ⚡ Performance & Eficácia

### Database Optimization
- **Índices**: Por filtros frequentes (catálogo: category, price_range; quotes: status, customer_id)
- **Materialized Views**: Para catálogos e listas pesadas (refresh on-demand/scheduled)
- **Paginação**: Cursor-based (não offset) para grandes datasets
- **Maintenance**: VACUUM/ANALYZE automatizado via cron
- **Connection Pooling**: Máx 20 conexões por worker

### Cache Strategy (Redis)
- **TTLs por Domínio**: Catálogo 1h, Preços 5min, Simulações 24h
- **Versionamento**: Chaves com hash de filtros (`catalog:v1:filter:abc123`)
- **Cache Warming**: Em sync de catálogo/preços
- **Invalidação**: Precisa via eventos de domínio

### API Performance
- **Idempotência**: POST com `Idempotency-Key` header
- **Rate Limiting**: 100 req/min por tenant, burst de 20
- **Compaction**: Gzip/Brotli em payloads >1KB
- **Query Optimization**: EXPLAIN ANALYZE em queries críticas

### Async Processing
- **Imagens**: Pipeline assíncrono (upload → resize → WebP → CDN)
- **PVLib**: Memoization distribuída (cache por coordenadas + equipamentos)
- **Imports**: Streaming de arquivos grandes
- **Workflows**: Steps idempotentes com compensations, retry exponencial

### Concurrency Management
- **Connection Pooling**: 20 max por worker
- **Worker Limits**: 4 workers por processo
- **Filas**: Separadas por domínio (catalog, pricing, solar)
- **Backpressure**: Aplicado em imports de alto volume

### Build Optimization
- **Tree-shaking**: Remover código não usado
- **TS Target**: ES2022 para melhor performance
- **Lazy Imports**: Code splitting em admin UI

## 🚀 Plano de Migração (6 Fases)

### **Fase 0 — Inventário** ✅ COMPLETO
**Duração:** 1 semana | **Status:** ✅ Concluído

**Atividades:**
- ✅ Mapear rotas (69 admin, 209 store), módulos (12), workflows (21), jobs, subscribers
- ✅ Identificar dependências entre módulos
- ✅ Documentar contratos de API atuais
- ✅ Mapear volumes de dados vivos

**Entregáveis:**
- ✅ `BACKEND_RESTRUCTURE_PLAN.md` (30KB+)
- ✅ Matriz de dependências
- ✅ Inventário completo

---

### **Fase 1 — Domínios Base** 🔄 PRÓXIMA
**Duração:** 2 semanas | **Status:** Planejada

**Objetivo:** Criar estrutura DDD sem quebrar APIs existentes.

**Atividades:**
- [ ] Criar `src/domains/` com estrutura de camadas (domain/application/infrastructure/interfaces)
- [ ] Criar `src/shared/` (errors, validation, cache, events, auth)
- [ ] Documentar contratos de eventos versionados (v1)
- [ ] Setup de padrões de código (ESLint rules, ADRs)
- [ ] Criar guia de contribuição

**Entregáveis:**
- Skeleton de 12 domínios
- Contratos de eventos (v1)
- Coding standards guide

**Critérios de Sucesso:**
- Build passa sem erros
- Nenhuma API quebrada
- Documentação completa
- Tests passando

---

### **Fase 2 — Catálogo & Quotes** 📦
**Duração:** 3 semanas | **Status:** Planejada

**Objetivo:** CQRS leve + caches; rotas finas chamando application layer.

**Atividades:**
- [ ] Migrar `unified-catalog` → `domains/catalog`
- [ ] Implementar `CatalogApplicationService` (use cases)
- [ ] Setup Redis cache (catálogo, preços)
- [ ] Criar materialized views (`catalog_search`, `pricing_matrix`)
- [ ] Migrar rotas para controllers finos
- [ ] Migrar `quote` → `domains/quotes`

**Entregáveis:**
- Domínio Catálogo completo
- Domínio Quotes completo
- Cache Redis funcional
- Materialized views criadas
- Documentação de APIs

**Critérios de Sucesso:**
- Latência listagem <150ms (P95)
- Cache hit rate >80%
- 100% backward compatibility
- Feature flags ativos

---

### **Fase 3 — Aprovações & Pedidos** ✅
**Duração:** 3 semanas | **Status:** Planejada

**Objetivo:** Eventos integrados; auditoria centralizada.

**Atividades:**
- [ ] Reativar `approval` module
- [ ] Migrar para `domains/approvals`
- [ ] Integrar eventos (quotes→approvals→orders)
- [ ] Implementar auditoria imutável (`approval_history`)
- [ ] Setup workflows persistentes (Redis-backed)
- [ ] Migrar `domains/orders`

**Entregáveis:**
- Domínio Aprovações funcional
- Auditoria completa implementada
- Workflows persistentes
- Event bus configurado

**Critérios de Sucesso:**
- Lead time aprovação <24h
- 0% bypass indevido
- 100% rastreabilidade
- Events versionados

---

### **Fase 4 — Financiamento & Energia** 💳
**Duração:** 2 semanas | **Status:** Planejada

**Objetivo:** Consolidar integrações; compliance/consent store.

**Atividades:**
- [ ] Migrar `financing` → `domains/financing`
- [ ] Migrar `tarifa-aneel` → `domains/energy-aneel`
- [ ] Implementar consent store (LGPD)
- [ ] Integrar BACEN (checagens de crédito)
- [ ] Otimizar simulações solares (cache + PVLib)
- [ ] Migrar `solar-calculator` → `domains/solar-simulations`

**Entregáveis:**
- Domínio Financiamento completo
- Domínio Energia/Tarifas completo
- Domínio Simulações Solar completo
- Consent store funcional

**Critérios de Sucesso:**
- Latência simulação <2s
- 100% conformidade regulatória
- Cache hit rate >70% (simulações)
- LGPD compliance

---

### **Fase 5 — Observabilidade** 📊
**Duração:** 2 semanas | **Status:** Planejada

**Objetivo:** SLIs/SLOs, tracing, alertas por domínio.

**Atividades:**
- [ ] Setup Prometheus + Grafana
- [ ] Definir SLIs/SLOs por domínio
- [ ] Implementar tracing distribuído (OpenTelemetry)
- [ ] Criar dashboards (latência, erros, cache hit rate)
- [ ] Setup alertas (PagerDuty/Slack)
- [ ] Implementar log aggregation

**Entregáveis:**
- Dashboards Grafana (5+)
- SLIs/SLOs documentados
- Alertas configurados
- Tracing distribuído ativo

**Critérios de Sucesso:**
- MTTR <30min
- SLO 99.9% APIs críticas
- Cobertura de logs 100%
- Alertas funcionais

---

### **Fase 6 — Hardening Prod** 🔒
**Duração:** 2 semanas | **Status:** Planejada

**Objetivo:** Workflow engine persistente; hardening de segurança.

**Atividades:**
- [ ] Migrar workflows para backend persistente (Redis/DB)
- [ ] Implementar rate limiting por tenant
- [ ] Setup idempotency keys
- [ ] Auditoria de segurança (OWASP)
- [ ] Load testing (K6)
- [ ] Disaster recovery plan

**Entregáveis:**
- Workflows persistentes
- Rate limiting ativo
- Auditoria de segurança completa
- Load test reports

**Critérios de Sucesso:**
- 0 downtime em deploy
- Throughput >500 req/s
- Segurança hardened
- DR plan validado

---

### **Rollout Strategy**

**Feature Flags:**
- Por domínio (enable/disable new architecture)
- Gradual rollout (1% → 10% → 50% → 100%)

**Backward Compatibility:**
- Manter APIs legadas durante migração
- Deprecation warnings com 2 sprints de antecedência

**Canary Deployments:**
- Deploy em ambiente de staging primeiro
- Monitoria de métricas por 24h
- Rollback automático em degradação

## 📈 KPIs e Observabilidade

### SLIs/SLOs por Domínio

| Domínio | SLI | Target | Métrica | Dashboard |
|---------|-----|--------|---------|-----------|
| **Catálogo** | TTFB listagem | <150ms | P95 | API Performance |
| | Latência sync | <15min | Max | Sync Status |
| | Erros normalização | 0% | Count | Data Quality |
| **Pricing** | Latência cálculo | <50ms | P95 | API Performance |
| | Consistência | 100% | % | Data Quality |
| **Quotes** | TTM-quote | <5min | Avg | Business Metrics |
| | Taxa aceite | >30% | % | Business Metrics |
| | SLA mensagens | <2h | P95 | Customer Service |
| **Approvals** | Lead time | <24h | Avg | Business Metrics |
| | Bypass indevido | 0% | Count | Security |
| | Rastreabilidade | 100% | % | Audit Trail |
| **Financing** | Latência simulação | <2s | P95 | API Performance |
| | Conformidade | 100% | % | Compliance |
| | Taxa aprovação | >40% | % | Business Metrics |
| **Solar** | Cache hit rate | >70% | % | Cache Efficiency |
| | Latência hit/miss | <1s/<5s | P95 | API Performance |
| | Acurácia | >95% | % | Data Quality |
| **Geral** | SLO APIs críticas | 99.9% | Uptime | System Health |
| | MTTR | <30min | Avg | Incident Management |
| | Taxa erro 5xx | <0.1% | % | System Health |

### Dashboards Grafana

1. **API Performance**
   - Latência por endpoint (P50, P95, P99)
   - Throughput (req/s)
   - Taxa de erro (4xx, 5xx)
   - Response time distribution

2. **Cache Efficiency**
   - Hit rate por domínio
   - Evictions e memory usage
   - Cache warming status
   - TTL effectiveness

3. **Workflows & Jobs**
   - Workflows completados vs falhados
   - Tempo de execução por workflow
   - Job queue length e aging
   - Retry statistics

4. **Database Health**
   - Connection pool usage
   - Query time (P95)
   - Deadlocks e locks
   - Table sizes e index usage

5. **Business Metrics**
   - Quotes criadas/aceitas
   - Aprovações pendentes/completadas
   - Conversão quote→order
   - Tempo de ciclo por processo

### Alertas Configurados

**Críticos (PagerDuty):**
- SLO violation >5min
- Error rate >1%
- MTTR >30min
- Database connection pool >90%

**Warnings (Slack):**
- Cache hit rate <60%
- Queue length >100
- Workflow failures >5/hour
- Slow queries >2s

## 🎯 Próximos Passos Imediatos

### Semana 1-2 (Fase 1 - Início)

**1. Setup Estrutura Base**
```bash
# Criar estrutura de domínios
mkdir -p src/domains/{catalog,pricing,quotes,approvals,company,orders,financing,energy-aneel,solar-simulations,integrations,observability}

# Criar shared
mkdir -p src/shared/{errors,auth,validation,events,cache,utils}

# Criar materialized views
mkdir -p database/views
```

**2. Definir Padrões de Código**
- [ ] ADR (Architecture Decision Records)
- [ ] ESLint rules específicas
- [ ] TypeScript strict mode
- [ ] Naming conventions
- [ ] Testing standards

**3. Implementar Piloto (Catálogo)**
- [ ] Migrar 1 rota: `GET /store/catalog/skus`
- [ ] Criar `CatalogApplicationService`
- [ ] Implementar use case `ListSKUs`
- [ ] Validar performance (target: <150ms)

**4. Setup Infraestrutura**
- [ ] Configurar Redis (TTLs, namespaces)
- [ ] Criar índices DB críticos
- [ ] Setup Prometheus/Grafana básico
- [ ] Implementar health checks

### Validações de Pronto

**Antes de iniciar Fase 2:**
- ✅ Skeleton de domínios criado
- ✅ 1 rota migrada com sucesso
- ✅ Cache Redis funcionando
- ✅ Índices DB otimizados
- ✅ Dashboards básicos ativos
- ✅ Feature flags implementados
- ✅ Tests passando (>80% coverage)

---

## 📚 Referências e Documentação

### Documentos de Arquitetura
- [`BACKEND_RESTRUCTURE_PLAN.md`](./architecture/BACKEND_RESTRUCTURE_PLAN.md) - Plano detalhado completo
- [`MODULE_WORKFLOW_ARCHITECTURE_360.md`](./architecture/MODULE_WORKFLOW_ARCHITECTURE_360.md) - Arquitetura de workflows

### Guias de Domínio (a criar)
- [ ] `domains/catalog.md` - JTBD, contratos, fluxos
- [ ] `domains/pricing.md`
- [ ] `domains/quotes.md`
- [ ] `domains/approvals.md`
- [ ] `domains/company.md`
- [ ] (... outros domínios)

### SLIs/SLOs (a criar)
- [ ] `slis-slos/catalog.md`
- [ ] `slis-slos/quotes.md`
- [ ] (... outros domínios)

---

## ⚠️ Riscos e Mitigações

### Risco 1: Acoplamento Legacy
**Descrição:** Lógica misturada nas rotas dificulta migração.

**Mitigação:**
- Introduzir camada `application` antes de mover
- Refatorar incrementalmente (1 rota por vez)
- Feature flags para rollback

### Risco 2: Tráfego Pico em Importações
**Descrição:** Imports bloqueiam workers e DB.

**Mitigação:**
- Particionar jobs por distribuidor
- Aplicar backpressure (rate limiting)
- Usar filas separadas

### Risco 3: Consistência Eventual
**Descrição:** Eventos podem chegar fora de ordem ou duplicados.

**Mitigação:**
- Contratos versionados
- Idempotência em subscribers
- Deduplicação por `event_id`
- Compensations em workflows

### Risco 4: Custos de Cache
**Descrição:** Redis pode crescer ilimitadamente.

**Mitigação:**
- TTLs agressivos por domínio
- Invalidação precisa via eventos
- Monitorar memory usage
- Eviction policies (LRU)

---

## 📊 Status Atual

**Fase Atual:** ✅ Fase 0 Completa → 🔄 Iniciando Fase 1

**Progresso Geral:** 15% (Fase 0: 100%, Fase 1: 0%)

**Última Atualização:** 20 de Outubro de 2025

**Próxima Revisão:** 27 de Outubro de 2025 (final Fase 1)

