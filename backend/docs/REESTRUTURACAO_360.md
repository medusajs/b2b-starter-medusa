# Reestruturação 360º — Backend YSH Solar Hub

Este documento consolida o plano de reestruturação end to end com foco em domínios, máxima performance e eficácia operacional. Abrange arquitetura alvo, JTBD, inputs/outputs/outcomes, migração, KPIs e observabilidade.

## Mapa de Domínios
- Catálogo Unificado (catalog)
- Preço & Comercial (pricing)
- RFQ/Quotes (quotes)
- Aprovações (approvals)
- Empresas & Colaboradores (company)
- Pedidos & Checkout (orders)
- Financiamento & Crédito (financing)
- Energia & Tarifas ANEEL (energy-aneel)
- Simulações & Cálculo Solar (solar-simulations)
- Integrações de Distribuidores (integrations)
- Observabilidade & Dados (observability)

## Arquitetura Alvo
- DDD modular + CQRS leve + eventos (workflows/subscribers)
- Camadas por domínio: domain, application, infrastructure, interfaces
- Integração com Medusa via `src/modules/*` e rotas em `src/api/*` chamando casos de uso
- Postgres + projeções/materialized views; Redis para cache; jobs/workflows assíncronos

## JTBD, Inputs/Outputs, Outcomes (por domínio)

### Catalog
- JTBD: unificar e normalizar SKUs; garantir disponibilidade e imagens
- Inputs: feeds/APIs distribuidores, comandos admin, cron jobs
- Outputs: SKUs normalizados, imagens otimizadas, projeções de busca
- Outcomes: TTFB listagem <150ms, sync <15min, 0 erro crítico de mapeamento

### Pricing
- JTBD: calcular preço consistente por canal/grupo; aplicar promoções
- Inputs: regras comerciais, grupos, eventos de catálogo
- Outputs: preços resolvidos, regras ativas, eventos de alteração de preço
- Outcomes: consistência 100%, latência cálculo <50ms

### Quotes
- JTBD: criar e negociar cotações com snapshot dos itens
- Inputs: itens/quantidades, mensagens, anexos, políticas cliente
- Outputs: cotações, mensagens, eventos de status (sent/accepted/rejected)
- Outcomes: TTM-quote <5min, taxa de aceite >30%

### Approvals
- JTBD: orquestrar aprovações condicionais multi-etapas com auditoria
- Inputs: políticas por empresa, eventos de quote/order, exceções
- Outputs: decisões, pendências, escalonamentos, auditoria imutável
- Outcomes: lead time <24h, 0 bypass indevido

### Company
- JTBD: estruturar contas B2B, papéis, limites e centros de custo
- Inputs: convites, alterações de papéis/limites, grupos
- Outputs: perfis/limites, memberships, eventos de compliance
- Outcomes: 0 inconsistência de limite, provisionamento <1min

### Orders
- JTBD: converter RFQ em pedido com aprovação integrada
- Inputs: carrinho, aprovação concedida, pagamento/fulfillment
- Outputs: orders, faturas, eventos de fulfillment
- Outcomes: taxa de erro checkout <0.5%

### Financing
- JTBD: simular e aprovar financiamentos; checagens BACEN
- Inputs: dados cliente, consentimentos, tabelas parceiros
- Outputs: simulações, limites aprovados/negados
- Outcomes: latência simulação <2s; conformidade

### Energy-ANEEL
- JTBD: manter tarifas e aplicar corretamente aos cenários
- Inputs: tabelas ANEEL, regiões, classes tarifárias
- Outputs: tarifas resolvidas, índices por região
- Outcomes: 100% acerto de tarifa; atualização <48h

### Solar-Simulations
- JTBD: estimar geração e viabilidade; cenários; caching
- Inputs: coordenadas, equipamentos, irradiância, parâmetros
- Outputs: métricas de geração, cenários, relatórios
- Outcomes: cálculo <1s (cache hit) / <5s (miss)

### Integrations
- JTBD: ingestão confiável e reconciliada (estoque/preço/imagem)
- Inputs: cron/import manual, webhooks parceiros, scraping fallback
- Outputs: normalizações, diffs, alertas de divergência
- Outcomes: erro <1%; latência <15min

### Observability
- JTBD: medir, auditar e explicar o sistema
- Inputs: eventos, logs estruturados, métricas
- Outputs: dashboards (latência, erros, SLIs/SLOs), trilhas de auditoria
- Outcomes: MTTR <30min, SLO 99.9% APIs críticas

## Performance & Eficácia
- Índices por filtros críticos, projeções/materialized views, paginação cursor-based
- Redis com chaves versionadas; cache warming na sincronização
- Idempotência de comandos POST; rate limiting; payloads compactos
- Workflows idempotentes, retry/backoff; jobs particionados por domínio

## Plano de Migração (Fases)
0. Inventário: rotas, jobs, subscribers, migrações, dados vivos
1. Base DDD: mover casos de uso para `src/domains/*` sem quebrar APIs
2. Catálogo & Quotes: CQRS leve + caches; rotas finas chamando application
3. Aprovações & Pedidos: eventos integrados; auditoria centralizada
4. Financiamento & Energia: consolidar integrações; consent store
5. Observabilidade: SLIs/SLOs, tracing, alertas por domínio
6. Produção: workflow engine persistente; hardening de segurança

## KPIs e Observabilidade
- Catálogo: TTFB listagem, latência de sync, erros de normalização
- RFQ/Aprovações: tempo de ciclo, taxa de aceite, aging por etapa
- Checkout: sucesso por tentativa, latência por etapa, reprocessamentos
- Simulações: cache hit rate, latência miss/hit, acurácia amostral
- Confiabilidade: SLO rotas críticas, MTTR, taxa de erro 5xx
- Dados: divergências por distribuidor, tempo de reconciliação

## Próximos Passos
1) Criar skeleton `src/domains/*` (ver links abaixo)
2) Adaptar 1 rota por domínio para usar Application layer (piloto)
3) Ativar cache por domínio e índices críticos
4) Definir dashboards de KPIs e alarmes

## Skeletons Criados
- `src/domains/catalog/`
- `src/domains/pricing/`
- `src/domains/quotes/`
- `src/domains/approvals/`
- `src/domains/company/`
- `src/domains/orders/`
- `src/domains/financing/`
- `src/domains/energy-aneel/`
- `src/domains/solar-simulations/`
- `src/domains/integrations/`
- `src/domains/observability/`

