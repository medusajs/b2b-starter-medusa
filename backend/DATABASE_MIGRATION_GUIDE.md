# Database Migration Strategy Guide

## Overview

Este guia define quando e como usar diferentes estratégias de migração de banco de dados no Medusa B2B Starter.

---

## Estratégias de Migração

### 1. MikroORM Migrations (Padrão)

**Usar para**: Mudanças de schema estrutural

#### Casos de Uso

- ✅ Adicionar/remover colunas
- ✅ Criar/deletar tabelas
- ✅ Modificar tipos de dados
- ✅ Adicionar/remover índices
- ✅ Mudanças em relacionamentos (foreign keys)
- ✅ Adicionar constraints (unique, not null, check)

#### Workflow

```bash
# 1. Modificar model em src/modules/*/models/*.ts
# Exemplo: Adicionar campo 'tax_id' ao Company

export const Company = model.define("company", {
  id: model.id({ prefix: "comp" }).primaryKey(),
  name: model.text(),
  tax_id: model.text().nullable(), // NOVO CAMPO
});

# 2. Gerar migração
yarn medusa db:generate CompanyModule

# 3. Revisar migração gerada em src/migrations/
# Arquivo: XXXXXX_CompanyModuleMigration.ts

# 4. Aplicar migração
yarn medusa db:migrate

# 5. Verificar em staging antes de produção
```

#### Vantagens

- ✅ Type-safe (TypeScript)
- ✅ Versionado com código
- ✅ Reversível via down()
- ✅ Histórico completo em migrations/

#### Desvantagens

- ⚠️ Pode gerar SQL ineficiente para bulk operations
- ⚠️ Limitado para transformações de dados complexas

---

### 2. SQL Manual Migrations

**Usar para**: Transformações de dados complexas ou operações de performance

#### Casos de Uso

- ✅ Bulk updates em milhões de registros
- ✅ Transformações de dados (ex: normalizar campos)
- ✅ Migrações que exigem SQL otimizado
- ✅ Operações de manutenção (VACUUM, REINDEX)
- ✅ Inicialização de dados (seed crítico)

#### Workflow

```bash
# 1. Criar arquivo SQL em src/migrations/manual/
# Arquivo: 2024-10-12_normalize_company_tax_ids.sql

-- Migration: Normalize company tax IDs
-- Author: DevOps Team
-- Date: 2024-10-12

BEGIN;

-- Remove formatting from tax_id (keep only numbers)
UPDATE company
SET tax_id = REGEXP_REPLACE(tax_id, '[^0-9]', '', 'g')
WHERE tax_id IS NOT NULL;

-- Add index for performance
CREATE INDEX CONCURRENTLY idx_company_tax_id ON company(tax_id)
WHERE tax_id IS NOT NULL;

COMMIT;

# 2. Testar em ambiente de staging
psql -U postgres -d medusa_staging -f src/migrations/manual/2024-10-12_normalize_company_tax_ids.sql

# 3. Executar em produção com backup prévio
pg_dump medusa_prod > backup_before_tax_migration.sql
psql -U postgres -d medusa_prod -f src/migrations/manual/2024-10-12_normalize_company_tax_ids.sql

# 4. Validar resultados
psql -U postgres -d medusa_prod -c "SELECT COUNT(*) FROM company WHERE tax_id ~ '[^0-9]';"
```

#### Vantagens

- ✅ Controle total sobre SQL gerado
- ✅ Otimizações de performance (CONCURRENTLY, batch updates)
- ✅ Operações de manutenção do PostgreSQL
- ✅ Ideal para migrações one-time

#### Desvantagens

- ⚠️ Não versionado automaticamente
- ⚠️ Sem rollback automático
- ⚠️ Requer conhecimento de SQL/PostgreSQL

---

## Fluxo de Decisão

```tsx
┌─────────────────────────────┐
│ Precisa migrar o banco?     │
└──────────┬──────────────────┘
           │
           v
    ┌─────────────┐
    │ Schema ou   │
    │ Dados?      │
    └──┬──────┬───┘
       │      │
  Schema  Dados
       │      │
       v      v
  ┌─────┐  ┌──────────────┐
  │ORM  │  │ Simples ou   │
  │Migr.│  │ Complexo?    │
  └─────┘  └──┬───────┬───┘
              │       │
         Simples  Complexo
              │       │
              v       v
         ┌─────┐  ┌──────┐
         │ORM  │  │ SQL  │
         │Migr.│  │Manual│
         └─────┘  └──────┘
```

---

## Exemplos Práticos

### Exemplo 1: Adicionar Campo (MikroORM) ✅

```typescript
// src/modules/employee/models/employee.ts
export const Employee = model.define("employee", {
  id: model.id({ prefix: "emp" }).primaryKey(),
  first_name: model.text(),
  last_name: model.text(),
  department: model.text().nullable(), // NOVO CAMPO
});
```

```bash
yarn medusa db:generate EmployeeModule
yarn medusa db:migrate
```

---

### Exemplo 2: Normalizar Dados (SQL Manual) ✅

**Cenário**: Normalizar telefones de +55 (11) 98765-4321 → 5511987654321

```sql
-- src/migrations/manual/2024-10-12_normalize_phones.sql
BEGIN;

-- Criar função de normalização
CREATE OR REPLACE FUNCTION normalize_phone(phone TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN REGEXP_REPLACE(phone, '[^0-9]', '', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Aplicar normalização em batches (evita lock longo)
DO $$
DECLARE
  batch_size INT := 10000;
  affected_rows INT;
BEGIN
  LOOP
    UPDATE employee
    SET phone = normalize_phone(phone)
    WHERE id IN (
      SELECT id FROM employee
      WHERE phone IS NOT NULL
        AND phone ~ '[^0-9]'
      LIMIT batch_size
    );
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    EXIT WHEN affected_rows = 0;
    
    RAISE NOTICE 'Normalized % rows', affected_rows;
    PERFORM pg_sleep(0.1); -- Evita sobrecarga
  END LOOP;
END $$;

DROP FUNCTION normalize_phone;

COMMIT;
```

---

### Exemplo 3: Migração de Schema + Dados (Híbrido) ✅

**Cenário**: Adicionar `status` enum + popular com valores default

**Passo 1**: MikroORM migration (schema)

```typescript
// src/modules/quote/models/quote.ts
export const Quote = model.define("quote", {
  id: model.id({ prefix: "quote" }).primaryKey(),
  status: model.enum(["pending", "accepted", "rejected", "expired"])
    .default("pending"),
});
```

```bash
yarn medusa db:generate QuoteModule
```

**Passo 2**: SQL manual (popular dados históricos)

```sql
-- src/migrations/manual/2024-10-12_populate_quote_status.sql
BEGIN;

-- Atualizar quotes criadas há mais de 30 dias sem resposta
UPDATE quote
SET status = 'expired'
WHERE created_at < NOW() - INTERVAL '30 days'
  AND status = 'pending';

-- Atualizar quotes com orders associados
UPDATE quote q
SET status = 'accepted'
FROM "order" o
WHERE q.draft_order_id = o.draft_order_id
  AND o.status = 'completed'
  AND q.status = 'pending';

COMMIT;
```

---

## Boas Práticas

### Checklist Pré-Migração

- [ ] Backup do banco de dados (produção)
- [ ] Testar em staging com dados realistas
- [ ] Estimar tempo de execução (EXPLAIN ANALYZE)
- [ ] Verificar impacto em queries ativas (pg_stat_activity)
- [ ] Documentar rollback plan
- [ ] Comunicar downtime (se aplicável)

### Durante Migração

- [ ] Monitorar logs (`docker logs medusa_db`)
- [ ] Acompanhar performance (`htop`, `pg_stat_statements`)
- [ ] Ter terminal de rollback pronto

### Pós-Migração

- [ ] Validar dados (`SELECT COUNT(*)`, queries de verificação)
- [ ] Rodar testes de integração
- [ ] Monitorar erros por 24-48h
- [ ] Atualizar documentação

---

## Ferramentas Úteis

### 1. Verificar Locks Ativos

```sql
SELECT * FROM pg_locks WHERE granted = false;
```

### 2. Estimar Tamanho de Tabela

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 3. Criar Índice Sem Bloquear

```sql
CREATE INDEX CONCURRENTLY idx_company_name ON company(name);
```

### 4. Vacuum After Bulk Update

```sql
VACUUM ANALYZE company;
```

---

## Troubleshooting

### Migração MikroORM Falha

```bash
# 1. Verificar estado do schema
yarn medusa db:migrate --check

# 2. Forçar sincronização (cuidado em produção!)
yarn medusa db:sync

# 3. Reverter última migração
# Editar migration file, executar down() manualmente
```

### SQL Manual Travado

```sql
-- Identificar locks
SELECT pid, usename, query, state, wait_event
FROM pg_stat_activity
WHERE state = 'active';

-- Cancelar query (soft)
SELECT pg_cancel_backend(pid);

-- Matar conexão (hard)
SELECT pg_terminate_backend(pid);
```

---

## Referências

- [MikroORM Migrations](https://mikro-orm.io/docs/migrations)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Medusa Module Development](https://docs.medusajs.com/learn/advanced-development/modules)

---

**Última Atualização**: 2024-10-12
**Maintainers**: DevOps Team
