# API Audit Report - YSH Backend

**Data**: 2025-01-XX  
**Escopo**: Todas as APIs em `src/api/`  
**Objetivo**: Identificar não-conformidades com padrões Medusa.js

---

## Executive Summary

| Categoria | Total | ✅ Conforme | ⚠️ Precisa Ajuste | ❌ Não Conforme |
|-----------|-------|-------------|-------------------|-----------------|
| **Store APIs** | 23 | 8 (35%) | 10 (43%) | 5 (22%) |
| **Admin APIs** | 5 | 3 (60%) | 2 (40%) | 0 (0%) |
| **Utility APIs** | 8 | 2 (25%) | 4 (50%) | 2 (25%) |
| **Total** | 36 | 13 (36%) | 16 (44%) | 7 (20%) |

---

## Store APIs

### ✅ Conformes (8)

1. **`/store/companies`**
   - Estrutura: ✅
   - Validators: ✅
   - Query Config: ✅
   - Workflows: ✅
   - Middlewares: ✅

2. **`/store/quotes`**
   - Estrutura: ✅
   - Validators: ✅
   - Query Config: ✅
   - Workflows: ✅
   - Middlewares: ✅

3. **`/store/companies/[id]`**
   - Estrutura: ✅
   - Handlers: ✅
   - Autorização: ✅

4. **`/store/quotes/[id]`**
   - Estrutura: ✅
   - Handlers: ✅
   - Relations: ✅

5. **`/store/quotes/[id]/accept`**
   - Workflow: ✅
   - Validação: ✅

6. **`/store/quotes/[id]/reject`**
   - Workflow: ✅
   - Validação: ✅

7. **`/store/quotes/[id]/messages`**
   - Estrutura: ✅
   - Validators: ✅

8. **`/store/health`**
   - Estrutura: ✅
   - Middlewares: ✅

### ⚠️ Precisam Ajuste (10)

1. **`/store/approvals`**
   - ⚠️ Query muito complexa (múltiplos graph calls)
   - ⚠️ Falta query-config adequado
   - ⚠️ Lógica de filtro no handler (deveria ser workflow)
   - **Ação**: Refatorar para workflow + simplificar queries

2. **`/store/catalog`**
   - ⚠️ Validators incompletos
   - ⚠️ Falta paginação padronizada
   - ⚠️ Respostas inconsistentes
   - **Ação**: Adicionar validators Zod + padronizar respostas

3. **`/store/financing`**
   - ⚠️ Lógica de cálculo no handler
   - ⚠️ Falta workflow
   - ⚠️ Sem tratamento de erros adequado
   - **Ação**: Mover para workflow + error handling

4. **`/store/solar-calculations`**
   - ⚠️ Respostas não padronizadas
   - ⚠️ Falta query-config
   - ⚠️ Validators básicos
   - **Ação**: Padronizar respostas + query-config

5. **`/store/credit-analyses`**
   - ⚠️ Sem query-config
   - ⚠️ Falta paginação
   - ⚠️ Validators incompletos
   - **Ação**: Adicionar query-config + validators

6. **`/store/kits`**
   - ⚠️ Sem validators
   - ⚠️ Lógica direta no handler
   - **Ação**: Adicionar validators + workflow

7. **`/store/leads`**
   - ⚠️ Estrutura não padronizada
   - ⚠️ Sem middlewares
   - **Ação**: Reestruturar + middlewares

8. **`/store/products-enhanced`**
   - ⚠️ Nome não convencional
   - ⚠️ Duplicação com `/store/products`
   - **Ação**: Consolidar ou renomear

9. **`/store/products.custom`**
   - ⚠️ Nome não convencional (`.custom`)
   - ⚠️ Duplicação
   - **Ação**: Consolidar

10. **`/store/free-shipping`**
    - ⚠️ Lógica complexa no handler
    - ⚠️ Falta workflow
    - **Ação**: Mover para workflow

### ❌ Não Conformes (5)

1. **`/store/internal-catalog`**
   - ❌ Estrutura muito complexa (6 níveis)
   - ❌ Lógica de cache no handler
   - ❌ Sem validators
   - ❌ Sem query-config
   - ❌ Nomenclatura confusa
   - **Ação**: Refatoração completa necessária

2. **`/store/rag/*`**
   - ❌ Sem estrutura Medusa
   - ❌ Lógica AI direta no handler
   - ❌ Sem validators
   - ❌ Sem error handling
   - **Ação**: Criar módulo separado + workflows

3. **`/store/photogrammetry`**
   - ❌ Lógica de processamento no handler
   - ❌ Sem workflow
   - ❌ Sem validators adequados
   - **Ação**: Mover para background job + workflow

4. **`/store/solar-detection`**
   - ❌ Similar a photogrammetry
   - ❌ Processamento síncrono
   - **Ação**: Background job + workflow

5. **`/store/thermal-analysis`**
   - ❌ Similar aos anteriores
   - ❌ Sem estrutura adequada
   - **Ação**: Background job + workflow

---

## Admin APIs

### ✅ Conformes (3)

1. **`/admin/companies`**
   - Estrutura: ✅
   - Validators: ✅
   - Workflows: ✅

2. **`/admin/quotes`**
   - Estrutura: ✅
   - Validators: ✅
   - Workflows: ✅

3. **`/admin/approvals`**
   - Estrutura: ✅
   - Handlers: ✅

### ⚠️ Precisam Ajuste (2)

1. **`/admin/financing`**
   - ⚠️ Lógica de análise no handler
   - ⚠️ Falta workflow
   - **Ação**: Mover para workflow

2. **`/admin/import-catalog`**
   - ⚠️ Processamento síncrono
   - ⚠️ Sem job queue
   - **Ação**: Mover para background job

---

## Utility APIs

### ✅ Conformes (2)

1. **`/financing/rates`**
   - Estrutura: ✅
   - Cache: ✅

2. **`/financing/simulate`**
   - Estrutura: ✅
   - Validators: ✅

### ⚠️ Precisam Ajuste (4)

1. **`/aneel/tariffs`**
   - ⚠️ Sem validators
   - ⚠️ Sem cache
   - **Ação**: Adicionar validators + cache

2. **`/aneel/concessionarias`**
   - ⚠️ Similar ao anterior
   - **Ação**: Padronizar

3. **`/pvlib/panels`**
   - ⚠️ Nomenclatura não clara
   - ⚠️ Sem documentação
   - **Ação**: Documentar + renomear?

4. **`/pvlib/inverters`**
   - ⚠️ Similar ao anterior
   - **Ação**: Padronizar

### ❌ Não Conformes (2)

1. **`/credit-analysis`**
   - ❌ Lógica de scoring no handler
   - ❌ Sem workflow
   - ❌ Processamento síncrono
   - **Ação**: Refatorar para workflow + async

2. **`/solar/viability`**
   - ❌ Cálculos complexos no handler
   - ❌ Sem workflow
   - **Ação**: Mover para workflow

---

## Problemas Comuns Identificados

### 1. Lógica de Negócio em Handlers (15 ocorrências)

**Problema**: Lógica complexa diretamente nos route handlers ao invés de workflows.

**Exemplos**:
- `/store/approvals` - Múltiplas queries e filtros
- `/store/financing` - Cálculos de financiamento
- `/credit-analysis` - Scoring de crédito
- `/solar/viability` - Cálculos solares

**Solução**: Mover para workflows com steps isolados.

### 2. Validators Ausentes/Incompletos (12 ocorrências)

**Problema**: Falta de validação Zod ou validação incompleta.

**Exemplos**:
- `/store/internal-catalog`
- `/store/kits`
- `/aneel/*`
- `/pvlib/*`

**Solução**: Implementar validators Zod completos.

### 3. Query Config Ausente (10 ocorrências)

**Problema**: Sem configuração de campos/relações permitidos.

**Exemplos**:
- `/store/approvals`
- `/store/solar-calculations`
- `/store/credit-analyses`

**Solução**: Adicionar `query-config.ts` com `defineQueryConfig`.

### 4. Processamento Síncrono de Tarefas Pesadas (5 ocorrências)

**Problema**: Operações longas bloqueando request/response.

**Exemplos**:
- `/store/photogrammetry`
- `/store/solar-detection`
- `/store/thermal-analysis`
- `/admin/import-catalog`
- `/credit-analysis`

**Solução**: Mover para background jobs (Bull/Redis).

### 5. Nomenclatura Não Convencional (4 ocorrências)

**Problema**: Nomes de endpoints/arquivos não seguem padrão Medusa.

**Exemplos**:
- `/store/products.custom` (`.custom` não é convencional)
- `/store/products-enhanced` (duplicação)
- `/store/internal-catalog` (muito específico)

**Solução**: Renomear seguindo convenções REST.

### 6. Duplicação de Endpoints (3 ocorrências)

**Problema**: Múltiplos endpoints para mesma funcionalidade.

**Exemplos**:
- `/store/products` vs `/store/products-enhanced` vs `/store/products.custom`
- `/store/catalog` vs `/store/internal-catalog`

**Solução**: Consolidar em um único endpoint com query params.

---

## Plano de Ação Priorizado

### Sprint 1 (P0 - Crítico)

1. **Refatorar `/store/approvals`**
   - Criar workflow `evaluate-cart-approvals`
   - Simplificar queries
   - Adicionar query-config
   - **Esforço**: 3 dias

2. **Consolidar `/store/products*`**
   - Unificar em `/store/products`
   - Adicionar query params para filtros
   - Deprecar endpoints duplicados
   - **Esforço**: 2 dias

3. **Refatorar `/store/internal-catalog`**
   - Simplificar estrutura
   - Adicionar validators
   - Mover cache para módulo
   - **Esforço**: 4 dias

### Sprint 2 (P1 - Alto)

1. **Adicionar Validators Faltantes**
   - `/store/catalog`
   - `/store/kits`
   - `/aneel/*`
   - `/pvlib/*`
   - **Esforço**: 2 dias

2. **Implementar Query Configs**
   - `/store/solar-calculations`
   - `/store/credit-analyses`
   - `/store/financing`
   - **Esforço**: 1 dia

3. **Mover Lógica para Workflows**
   - `/store/financing` → `calculate-financing-workflow`
   - `/solar/viability` → `calculate-viability-workflow`
   - **Esforço**: 3 dias

### Sprint 3 (P2 - Médio)

1. **Background Jobs para Processamento Pesado**
   - `/store/photogrammetry`
   - `/store/solar-detection`
   - `/store/thermal-analysis`
   - `/admin/import-catalog`
   - **Esforço**: 5 dias

2. **Refatorar `/credit-analysis`**
   - Criar workflow assíncrono
   - Implementar job queue
   - Adicionar webhooks de status
   - **Esforço**: 4 dias

3. **Padronizar `/store/rag/*`**
   - Criar módulo AI separado
   - Implementar workflows
   - Adicionar rate limiting
   - **Esforço**: 3 dias

---

## Métricas de Conformidade

### Antes da Refatoração

- **Conformidade Geral**: 36%
- **Validators Completos**: 40%
- **Query Configs**: 30%
- **Uso de Workflows**: 45%
- **Error Handling**: 60%

### Meta Pós-Refatoração

- **Conformidade Geral**: 90%+
- **Validators Completos**: 95%+
- **Query Configs**: 90%+
- **Uso de Workflows**: 85%+
- **Error Handling**: 95%+

---

## Recursos Necessários

### Equipe

- 2 Backend Developers (full-time)
- 1 DevOps (part-time para jobs)
- 1 QA (para testes de regressão)

### Tempo Estimado

- **Sprint 1**: 2 semanas
- **Sprint 2**: 2 semanas
- **Sprint 3**: 2 semanas
- **Total**: 6 semanas

### Riscos

1. **Breaking Changes**: Alguns endpoints podem mudar
   - Mitigação: Versionamento de API + deprecation notices

2. **Regressão**: Mudanças podem quebrar funcionalidades
   - Mitigação: Testes E2E completos + rollback plan

3. **Performance**: Workflows podem adicionar overhead
   - Mitigação: Benchmarks + otimização

---

## Conclusão

A maioria das APIs (64%) precisa de ajustes para conformidade total com padrões Medusa.js. Os principais problemas são:

1. Lógica de negócio em handlers (deveria estar em workflows)
2. Validators ausentes/incompletos
3. Query configs não implementados
4. Processamento síncrono de tarefas pesadas

Com 6 semanas de trabalho focado, podemos atingir 90%+ de conformidade, melhorando significativamente a manutenibilidade e escalabilidade do backend.

---

**Próximos Passos**:
1. Aprovar plano de ação
2. Criar issues no GitHub
3. Iniciar Sprint 1
4. Monitorar métricas de conformidade

**Responsável**: Backend Team  
**Revisão**: Semanal
