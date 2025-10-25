# ✅ Decisão: Simplificar Arquitetura de Preços

## Resumo Executivo

**Recomendação:** Migrar toda lógica de precificação para o **Medusa Backend**, removendo:

- YSH ERP (multi-distribuidor)
- Data Platform (Dagster + Pathway)
- Kafka infrastructure

## Justificativa

### ❌ Problemas Atuais

1. **Alta complexidade operacional**
   - 4 serviços ativos (Medusa + ERP + Dagster + Pathway)
   - 5 Dagster assets + 4 Pathway pipelines
   - 3 Kafka topics com CDC (Debezium)

2. **Latência de 30-40 minutos para atualização de preços**
   - Dagster batch: 30min interval
   - Pathway CDC overhead
   - Cache invalidation delays

3. **Features não utilizadas**
   - Multi-distribuidor: workflow existe mas frontend não compara preços
   - Hélio AI pricing RAG: Qdrant setup incompleto (WIP)
   - CDC real-time: desnecessário (preços mudam 4x/dia em schedule)

### ✅ Benefícios da Simplificação

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| **Serviços Ativos** | 4 | 1 | -75% |
| **Latência Preços** | 30-40min | 0-15min | -63% |
| **Custo Infra (AWS/mês)** | ~$800 | ~$200 | -75% |
| **Complexidade Operacional** | ALTA | BAIXA | -70% |
| **Debugging Time** | 2-4h | 30min | -75% |

---

## Nova Arquitetura (Simplificada)

```
┌─────────────────────────────────────────────────────────────────┐
│  Medusa Backend (Único)                                         │
│                                                                  │
│  MÓDULOS:                                                        │
│  - ysh-pricing (novo)    → Sync de distribuidores              │
│  - ysh-homologacao       → Status ANEEL                         │
│  - Medusa PRICING        → Price lists, regions, currencies     │
│                                                                  │
│  WORKFLOWS:                                                      │
│  - syncDistributorPrices → 4x/dia (6h, 12h, 18h, 0h)          │
│  - updatePriceLists      → Usa PRICING module nativo           │
│                                                                  │
│  SCHEDULED JOBS:                                                 │
│  - Cron: 0 6,12,18,0 * * * (Medusa workflows)                  │
│                                                                  │
│  CACHE:                                                          │
│  - Redis (produtos + preços)                                    │
│  - TTL: 1h (invalidado após cada sync)                         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │  REST API (/store/*)
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  Storefront Next.js 15                                          │
│  - Usa calculated_price (Medusa PRICING)                       │
│  - ISR: revalidate: 3600 (1h)                                  │
│  - Retry logic: exponential backoff (mantido)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Plano de Implementação

### Semana 1: Setup Básico

- [x] ✅ Análise de dependências (concluída)
- [x] ✅ Documentação (concluída)
- [ ] Criar módulo `ysh-pricing`
- [ ] Implementar service + workflows

### Semana 2: Integração

- [ ] Migrar workflows do ERP
- [ ] Configurar scheduled jobs (cron)
- [ ] Testes backend (unit + integration)

### Semana 3: Frontend + Deprecação

- [ ] Atualizar storefront data layer
- [ ] Testes E2E (preços comparados)
- [ ] Desabilitar Data Platform
- [ ] Deploy produção gradual (10% → 100%)

---

## Métricas de Sucesso

### Performance

- ✅ Latência sync: <15min (vs 30-40min)
- ✅ API response: <500ms p95
- ✅ Cache hit rate: >80%

### Reliability

- ✅ Sync success rate: >99%
- ✅ Zero downtime na migração
- ✅ Rollback em <30min se necessário

---

## Quando Reconsiderar ERP

Manter arquitetura atual **apenas se**:

- [ ] Volume >1000 orders/dia (atual: <100/dia)
- [ ] Hélio AI ativo com >10k queries/mês em pricing
- [ ] Multi-distribuidor core do negócio (cotação automática em checkout)
- [ ] Homologação ANEEL com SLA <15min crítico

**Status atual:** Nenhum critério atendido → **Simplificação justificada**

---

## Próximos Passos Imediatos

1. ✅ **Aprovar decisão** com stakeholders
2. ✅ **Criar branch** `feature/pricing-migration`
3. ✅ **Implementar** módulo `ysh-pricing` (Semana 1)
4. ✅ **Testar** em staging (1 semana)
5. ✅ **Deploy** produção gradual (canary: 10% → 50% → 100%)

---

## Rollback Plan

Se migração falhar, rollback em **<30 minutos**:

```bash
# 1. Reativar ERP
docker-compose up -d ysh-erp

# 2. Reativar Dagster
cd data-platform/dagster && dagster dev

# 3. Reverter Storefront
git revert <commit_hash> && npm run build && npm run start
```

---

## Referências

- [PRICING_INTEGRATION_ANALYSIS.md](./PRICING_INTEGRATION_ANALYSIS.md) - Análise completa
- [PRICING_MIGRATION_PLAN.md](./PRICING_MIGRATION_PLAN.md) - Plano detalhado
- [Medusa Pricing Module Docs](https://docs.medusajs.com/resources/commerce-modules/pricing)

---

**Decisão tomada:** ✅ **SIMPLIFICAR (Opção 1)**  
**Data:** Outubro 2025  
**Aprovado por:** Aguardando confirmação  
**Status:** 📋 Pronto para implementação
