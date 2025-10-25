# 🗑️ Plano de Limpeza - Remoção de Módulos Obsoletos

> **Objetivo:** Remover/desabilitar componentes que não serão mais utilizados após a simplificação da arquitetura de preços  
> **Data:** Outubro 2025  
> **Status:** Em Execução

---

## 📋 Componentes a Remover/Desabilitar

### 1. Data Platform - Dagster (ERP Sync Assets)

#### Arquivos a Desabilitar

```yaml
data-platform/dagster/assets/erp_sync.py:
  assets_criticos:
    - erp_products_sync      # ❌ Será migrado para Medusa Backend
    - erp_orders_sync        # ❌ Baixo volume, não justifica complexidade
    - erp_homologacao_sync   # ⚠️ Migrar para módulo ysh-homologacao
    - erp_pricing_kb         # ❌ WIP, não ativo (Hélio AI)
  
  acao: Comentar @asset decorators + remover de definitions.py
```

#### Arquivos a Manter (Temporariamente)

```yaml
data-platform/dagster/assets/:
  - catalog_kb.py          # ✅ Manter (Hélio AI - catálogo)
  - posthog_events.py      # ✅ Manter (Analytics)
  - qdrant_*.py           # ✅ Manter (Hélio AI - RAG)
```

---

### 2. Data Platform - Pathway (CDC Pipelines)

#### Arquivos a Remover

```yaml
data-platform/pathway/pipelines/erp_sync.py:
  pipelines:
    - sync_erp_orders_to_medusa     # ❌ CDC não necessário (batch suficiente)
    - sync_erp_prices_to_medusa     # ❌ Preços mudam 4x/dia (scheduled)
    - sync_medusa_orders_to_erp     # ❌ ERP será deprecado
    - sync_homologacao_status       # ❌ Será handled no Medusa

  acao: Renomear para erp_sync.py.disabled
```

---

### 3. Docker Compose - Serviços Kafka (CDC)

#### Serviços a Remover

```yaml
docker-compose.yml:
  servicos_remover:
    - kafka                  # ❌ CDC não mais necessário
    - zookeeper             # ❌ Dependência do Kafka
    - debezium              # ❌ CDC connector

  servicos_manter:
    - postgres              # ✅ Banco principal
    - redis                 # ✅ Cache
    - backend               # ✅ Medusa Backend
    - storefront            # ✅ Next.js
```

---

### 4. YSH ERP - Deprecação Gradual

#### Fase 1: Desabilitar workflows não utilizados

```yaml
ysh-erp/medusa-app/src/workflows/ysh/:
  workflows_remover:
    - compare-distributor-offer.ts      # ❌ Não usado no frontend
    - get-best-distributor-offer.ts     # ❌ Não usado no frontend
    - sync-order-to-ysh.ts              # ❌ Baixo volume

  workflows_migrar:
    - sync-distributor-prices.ts        # ⚠️ Migrar para Medusa Backend
```

#### Fase 2: Desabilitar módulo YSH ERP (após migração completa)

```yaml
ysh-erp/medusa-app/src/modules/ysh_erp/:
  acao: Deprecar completamente após validação da migração
  prazo: Após 2 semanas de testes em produção
```

---

## 🚀 Execução - Passos Imediatos

### Passo 1: Desabilitar Dagster ERP Assets

```python
# data-platform/dagster/assets/erp_sync.py

# ==========================================
# DEPRECATED: Será migrado para Medusa Backend
# Data: Outubro 2025
# ==========================================

# @asset(
#     group_name="erp_sync",
#     description="Sincroniza catálogo de produtos do ERP com Medusa"
# )
# def erp_products_sync(...):
#     """DEPRECATED: Migrado para ysh-store/backend/src/modules/ysh-pricing"""
#     pass

# ... (comentar todos os assets de erp_sync)
```

### Passo 2: Remover Pathway ERP Pipelines

```bash
# Renomear pipeline para desabilitar
cd data-platform/pathway/pipelines
mv erp_sync.py erp_sync.py.disabled

# Criar arquivo de marcação
echo "# DEPRECATED: Pipelines CDC não mais necessários após simplificação de arquitetura (Out 2025)" > DEPRECATED.md
```

### Passo 3: Comentar Serviços Kafka no Docker Compose

```yaml
# docker-compose.dev.yml

  # ==========================================
  # DEPRECATED: Kafka CDC (Out 2025)
  # Motivo: Preços mudam 4x/dia (scheduled), CDC não necessário
  # ==========================================
  
  # kafka:
  #   image: confluentinc/cp-kafka:7.5.0
  #   ...

  # zookeeper:
  #   image: confluentinc/cp-zookeeper:7.5.0
  #   ...

  # debezium:
  #   image: debezium/connect:2.4
  #   ...
```

### Passo 4: Atualizar Documentação

```bash
# Criar arquivo de status da migração
cat > data-platform/MIGRATION_STATUS.md << 'EOF'
# Status da Migração - Data Platform

## Componentes Deprecados (Outubro 2025)

### ❌ Removidos
- Dagster Assets: erp_products_sync, erp_orders_sync, erp_pricing_kb
- Pathway Pipelines: erp_sync.py (todos os 4 pipelines CDC)
- Kafka Infrastructure: kafka, zookeeper, debezium

### ⚠️ Em Migração
- erp_homologacao_sync → ysh-store/backend/src/modules/ysh-homologacao

### ✅ Mantidos
- Dagster Assets: catalog_kb, posthog_events, qdrant_*
- Pathway Pipelines: (nenhum ativo atualmente)

## Motivo
Simplificação da arquitetura de preços conforme análise em:
- docs/PRICING_INTEGRATION_ANALYSIS.md
- docs/PRICING_DECISION.md

## Próximos Passos
1. Implementar ysh-pricing module no Medusa Backend
2. Testar sync de preços em staging (2 semanas)
3. Deprecar YSH ERP completamente
EOF
```

---

## 📊 Impacto da Limpeza

### Antes (Arquitetura Atual)

```
Serviços Ativos: 9
- postgres (Medusa)
- postgres (ERP)
- redis
- backend (Medusa)
- storefront
- dagster
- kafka
- zookeeper
- debezium

Linhas de Código (Data Platform): ~2500
Assets/Pipelines: 9
```

### Depois (Arquitetura Simplificada)

```
Serviços Ativos: 4 (-56%)
- postgres (Medusa)
- redis
- backend (Medusa)
- storefront

Linhas de Código (Data Platform): ~800 (-68%)
Assets/Pipelines: 3 (apenas Hélio AI)
```

---

## ⚠️ Backup Antes da Remoção

```bash
# Backup completo do Data Platform
cd ysh-store
tar -czf backup_data_platform_$(date +%Y%m%d).tar.gz data-platform/

# Backup do YSH ERP
cd ysh-erp
tar -czf backup_ysh_erp_$(date +%Y%m%d).tar.gz .

# Backup dos docker-compose files
cp docker-compose.yml docker-compose.yml.backup
cp docker-compose.dev.yml docker-compose.dev.yml.backup
```

---

## ✅ Checklist de Execução

### Fase 1: Desabilitar (Hoje)

- [x] ✅ Backup de dados críticos
- [ ] ⬜ Comentar Dagster erp_sync assets
- [ ] ⬜ Desabilitar Pathway erp_sync pipelines
- [ ] ⬜ Comentar serviços Kafka no docker-compose
- [ ] ⬜ Criar MIGRATION_STATUS.md

### Fase 2: Validar (Esta Semana)

- [ ] ⬜ Verificar que storefront continua funcionando
- [ ] ⬜ Confirmar que preços ainda são exibidos (cache Redis)
- [ ] ⬜ Monitorar logs para erros relacionados

### Fase 3: Remover Permanentemente (Após Migração)

- [ ] ⬜ Deletar arquivos .disabled
- [ ] ⬜ Remover blocos comentados do docker-compose
- [ ] ⬜ Deprecar YSH ERP completamente
- [ ] ⬜ Atualizar README.md com nova arquitetura

---

## 🔄 Rollback Plan

Se algo quebrar:

```bash
# 1. Restaurar docker-compose
cp docker-compose.yml.backup docker-compose.yml
docker-compose up -d kafka zookeeper

# 2. Restaurar Dagster assets
cd data-platform/dagster
git checkout HEAD -- assets/erp_sync.py

# 3. Restaurar Pathway pipelines
cd pathway/pipelines
mv erp_sync.py.disabled erp_sync.py

# 4. Reiniciar serviços
docker-compose restart dagster
```

---

## 📚 Referências

- [PRICING_INTEGRATION_ANALYSIS.md](../docs/PRICING_INTEGRATION_ANALYSIS.md)
- [PRICING_DECISION.md](../docs/PRICING_DECISION.md)
- [PRICING_MIGRATION_PLAN.md](../docs/PRICING_MIGRATION_PLAN.md)

---

**Criado por:** GitHub Copilot  
**Data:** Outubro 2025  
**Status:** 🚀 Pronto para execução
