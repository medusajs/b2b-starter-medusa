# 🚀 Plano de Implementação: Migração de Preços

> **Estratégia:** Simplificação (Opção 1)  
> **Duração:** 2-3 semanas  
> **Risco:** MÉDIO

## Resumo Executivo

Consolidar toda lógica de precificação no Medusa Backend, removendo:

- YSH ERP (multi-distribuidor)
- Data Platform (Dagster + Pathway)
- Kafka infrastructure

## Componentes a Migrar

### Críticos

- `syncDistributorPricesWorkflow` → Medusa workflows
- `erp_products_sync` (Dagster) → Scheduled jobs Medusa
- `erp_homologacao_sync` → Novo módulo `ysh-homologacao`

### Opcionais (Baixa Prioridade)

- `erp_pricing_kb` (RAG) → Implementar se Hélio AI for ativado
- `compareDistributorOfferWorkflow` → Não usado no frontend

## Plano de Execução

### Semana 1: Setup Básico

#### Dia 1-2: Análise

- [x] Mapear dependências ERP ↔ Frontend
- [x] Backup de dados (preços, metadata)
- [ ] Identificar APIs críticas

#### Dia 3-5: Módulo `ysh-pricing`

- [ ] Criar estrutura de módulo
- [ ] Implementar service de sync
- [ ] Criar workflows Medusa
- [ ] Migração de migrations

### Semana 2: Integração

#### Dia 6-8: Workflows

- [ ] Implementar `syncDistributorPrices`
- [ ] Criar steps para cada distribuidor
- [ ] Integrar com PRICING module
- [ ] Configurar scheduled jobs (cron: 0 6,12,18,0 ** *)

#### Dia 9-10: Testes Backend

- [ ] Unit tests (service, workflows)
- [ ] Integration tests (price updates)
- [ ] Load tests (sync 10k produtos)

### Semana 3: Frontend + Deprecação

#### Dia 11-12: Atualizar Storefront

- [ ] Ajustar `src/lib/data/products.ts`
- [ ] Usar `calculated_price` do Medusa
- [ ] Implementar ISR (revalidate: 3600)

#### Dia 13-14: Homologação

- [ ] Deploy staging
- [ ] Testes end-to-end
- [ ] Comparar preços (ERP vs Medusa)

#### Dia 15: Deprecação

- [ ] Desabilitar Dagster assets
- [ ] Parar Pathway pipelines
- [ ] Documentar rollback plan

## Estrutura do Módulo

```
backend/src/modules/ysh-pricing/
├── index.ts
├── service.ts
├── types.ts
├── workflows/
│   ├── sync-distributor-prices.ts
│   └── steps/
│       ├── fetch-neosolar.ts
│       ├── fetch-solfacil.ts
│       ├── calculate-markup.ts
│       └── update-price-lists.ts
└── migrations/
    └── 001_distributor-prices.ts
```

## Métricas de Sucesso

### Performance

- Latência sync: <15min (vs 30-40min atual)
- API response: <500ms p95
- Cache hit rate: >80%

### Reliability

- Sync success rate: >99%
- Zero downtime na migração
- Rollback em <30min se necessário

## Rollback Plan

### Se migração falhar

1. **Reativar ERP** (5min)

   ```bash
   docker-compose up -d ysh-erp
   ```

2. **Reativar Dagster** (10min)

   ```bash
   cd data-platform/dagster
   dagster dev
   ```

3. **Reverter Storefront** (15min)

   ```bash
   git revert <commit_hash>
   npm run build && npm run start
   ```

## Próximos Passos

1. ✅ **Aprovar plano** com stakeholders
2. ✅ **Criar branch** `feature/pricing-migration`
3. ✅ **Implementar** módulo `ysh-pricing`
4. ✅ **Testar** em staging 1 semana
5. ✅ **Deploy** produção gradual (10% → 50% → 100%)

## Referências

- [PRICING_INTEGRATION_ANALYSIS.md](./PRICING_INTEGRATION_ANALYSIS.md)
- [Medusa Pricing Module Docs](https://docs.medusajs.com/resources/commerce-modules/pricing)
- [TEST_COVERAGE_AUDIT.md](./TEST_COVERAGE_AUDIT.md)
