# Status da Migração: Simplificação de Arquitetura de Pricing

## 📋 Resumo

Este documento rastreia o status da migração de uma arquitetura multi-serviço (Medusa + YSH ERP + Dagster + Pathway) para uma arquitetura simplificada com pricing consolidado no Medusa Backend.

**Decisão**: Opção 1 (Simplify) - Consolidar toda lógica de pricing no Medusa Backend  
**Justificativa**: Multi-distribuidor não utilizado no frontend, Hélio AI WIP, preços mudam apenas 4x/dia (scheduling suficiente)  
**Documentação**: Veja `docs/PRICING_DECISION.md`, `docs/PRICING_MIGRATION_PLAN.md`

---

## ✅ Fase 1: Cleanup de Módulos Obsoletos (COMPLETO)

**Data**: ${new Date().toISOString().split['T'](0)}

### 1.1 Backups Criados ✅

```powershell
# Backups criados em:
data-platform/dagster/assets/erp_sync.py.bak
data-platform/pathway/pipelines/erp_sync.py.bak
data-platform/dagster/definitions.py.bak
docker-compose.dev.yml.bak
```

### 1.2 Dagster Assets Desabilitados ✅

**Arquivo**: `data-platform/dagster/assets/erp_sync.py`

- `erp_products_sync` - Comentado `@asset` decorator
- `erp_orders_sync` - Comentado `@asset` decorator
- `erp_homologacao_sync` - Comentado `@asset` decorator
- `erp_pricing_kb` - Comentado `@asset` decorator

**Razão**: Funções mantidas para referência, mas não serão executadas pelo Dagster

### 1.3 Pathway Pipelines Desabilitados ✅

**Arquivo**: `data-platform/pathway/pipelines/erp_sync.py.disabled`

- Arquivo renomeado para `.disabled`
- Não será mais importado pelos serviços Pathway
- Backup disponível em `erp_sync.py.bak`

### 1.4 Docker Compose Atualizado ✅

**Arquivo**: `docker-compose.dev.yml`

- ✅ Kafka services não presentes (já removidos anteriormente)
- ✅ Zookeeper não presente
- ✅ Debezium não presente

**Serviços Ativos**:

- postgres (port 15432)
- redis (port 16379)
- backend (ports 9000, 9001, 9002)
- storefront (port 8000)

### 1.5 Dagster Definitions Atualizado ✅

**Arquivo**: `data-platform/dagster/definitions.py`

- `erp_sync_job` - Comentado (não aparecerá no Dagster UI)
- `erp_sync_schedule` - Comentado (não será agendado)

**Jobs Ativos**:

- catalog_job (2h diariamente)
- tarifas_job (6h diariamente)
- helio_kb_job (4h diariamente)

---

## 🚧 Fase 2: Implementação do ysh-pricing (PENDENTE)

### 2.1 Estrutura do Módulo

```
backend/src/modules/ysh-pricing/
├── service.ts              # Lógica de sincronização multi-distribuidor
├── models/
│   ├── distributor.ts
│   ├── price-list.ts
│   └── price-rule.ts
├── workflows/
│   ├── sync-distributor-prices.ts
│   ├── calculate-customer-price.ts
│   └── schedule-price-sync.ts
├── migrations/
│   ├── 001-create-distributors.ts
│   ├── 002-create-price-lists.ts
│   └── 003-create-price-rules.ts
└── index.ts
```

### 2.2 Tarefas Pendentes

- [ ] Criar estrutura de diretórios
- [ ] Implementar models (distributor, price-list, price-rule)
- [ ] Migrar lógica de `ysh-erp/src/workflows/ysh/sync-distributor-prices.ts`
- [ ] Implementar workflow de sincronização
- [ ] Criar migrations para tabelas de pricing
- [ ] Configurar scheduled jobs (cron: `0 6,12,18,0 * * *` - 4x/dia)
- [ ] Testes unitários do módulo

---

## 🚧 Fase 3: Integração Frontend (PENDENTE)

### 3.1 Storefront Updates

**Arquivo**: `storefront/src/lib/data/products.ts`

- [ ] Ajustar para usar `calculated_price` do Medusa PRICING
- [ ] Remover dependências de preços ERP
- [ ] Implementar ISR (Incremental Static Regeneration): `revalidate: 3600`

### 3.2 Testes End-to-End

- [ ] Validar display de preços no frontend
- [ ] Testar fluxo de checkout com novos preços
- [ ] Validar cache Redis funcionando corretamente

---

## 📊 Métricas de Impacto

### Antes da Migração

| Métrica | Valor |
|---------|-------|
| Serviços Ativos | 9 (Medusa, ERP, Dagster, Pathway, Kafka, Zookeeper, Debezium, Postgres, Redis) |
| Latência de Pricing | 30-40 minutos |
| Linhas de Código (Pricing) | ~2500 LOC |
| Custo AWS (estimado) | $800/mês |

### Após Cleanup (Atual)

| Métrica | Valor |
|---------|-------|
| Serviços Ativos | 4 (Medusa Backend, Postgres, Redis, Storefront) |
| Assets Desabilitados | 4 Dagster assets + 4 Pathway pipelines |
| Redução de Serviços | -56% (9 → 4) |
| Status | ✅ Cleanup completo, pronto para implementação |

### Target (Após Migração Completa)

| Métrica | Valor |
|---------|-------|
| Latência de Pricing | 0-15 minutos (cache + sync 4x/dia) |
| Linhas de Código (Pricing) | ~800 LOC (consolidado em ysh-pricing) |
| Custo AWS (estimado) | $200/mês (-75%) |
| Redução Total | -75% serviços, -63% latency, -68% LOC |

---

## 🔄 Próximos Passos

### Imediato (Esta Semana)

1. ✅ Desabilitar módulos ERP obsoletos (COMPLETO)
2. **Criar módulo ysh-pricing no Medusa Backend**
   - Implementar service.ts
   - Criar models e migrations
   - Configurar workflows

### Semana 2

3. Implementar sincronização com distribuidores
4. Configurar scheduled jobs (4x/dia)
5. Testes unitários do módulo

### Semana 3

6. Atualizar frontend (storefront)
7. Testes end-to-end
8. Deploy gradual (canary)

---

## 🔙 Rollback Plan

Caso necessário reverter a migração:

```powershell
# 1. Restaurar backups
Copy-Item "data-platform/dagster/assets/erp_sync.py.bak" "data-platform/dagster/assets/erp_sync.py" -Force
Copy-Item "data-platform/pathway/pipelines/erp_sync.py.bak" "data-platform/pathway/pipelines/erp_sync.py" -Force
Copy-Item "data-platform/dagster/definitions.py.bak" "data-platform/dagster/definitions.py" -Force

# 2. Reativar Pathway pipeline
Move-Item "data-platform/pathway/pipelines/erp_sync.py.disabled" "data-platform/pathway/pipelines/erp_sync.py"

# 3. Reiniciar serviços
docker-compose -f docker-compose.dev.yml restart dagster pathway
```

---

## 📞 Contatos

- **Arquitetura**: Veja `docs/PRICING_DECISION.md`
- **Plano de Migração**: Veja `docs/PRICING_MIGRATION_PLAN.md`
- **Cleanup Plan**: Veja `docs/CLEANUP_PLAN.md`

---

**Última Atualização**: ${new Date().toISOString()}  
**Status Geral**: ✅ Fase 1 (Cleanup) COMPLETO | 🚧 Fase 2 (Implementação) PENDENTE
