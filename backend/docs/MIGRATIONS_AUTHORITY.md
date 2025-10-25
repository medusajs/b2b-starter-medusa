# 📚 Guia de Autoridade de Migrações - Backend YSH

**Data:** 2025-10-12  
**Versão:** 1.0  
**Stack:** Medusa 2.10.3 + MikroORM 6.4.3 + PostgreSQL 16

---

## 🎯 Objetivo

Definir claramente qual sistema de migração usar em cada cenário para evitar conflitos, duplicação e inconsistências no schema do banco de dados.

---

## 🏛️ Autoridade de Migrações

### MikroORM (Autoridade Principal)

**Caminho:** `backend/src/migrations/*.ts`  
**Comando de geração:** `npm run migrate:create <NomeDaMigracao>`  
**Comando de execução:** `npm run migrate`  
**Tracking:** Tabela `mikro_orm_migrations`

**USO OBRIGATÓRIO para:**

- ✅ Entidades custom em `src/entities/*.ts`
- ✅ Módulos custom em `src/modules/*/models/*.ts` (company, employee, quote, approval, etc.)
- ✅ Alterações em tabelas core do Medusa (extends, customizações)
- ✅ Índices de performance
- ✅ Constraints (FK, UNIQUE, CHECK)

**Vantagens:**

- Integrado ao fluxo Medusa
- Rollback automático
- Type-safe (TypeScript)
- Detecta mudanças automaticamente via `db:generate`

**Exemplo de uso:**

```bash
# 1. Modificar entidade em src/modules/company/models/company.ts
# 2. Gerar migração
npm run migrate:create AddSpendingLimitToCompany

# 3. Revisar arquivo gerado em src/migrations/
# 4. Executar
npm run migrate
```

---

### SQL Manual (Autoridade Legada)

**Caminho:** `backend/database/migrations/*.sql`  
**Execução:** Manual via `psql` ou scripts Node.js  
**Tracking:** Sem tracking automático (requer controle manual)

**USO PERMITIDO para:**

- ⚠️ Dados seed iniciais (manufacturers, regions base)
- ⚠️ Correções emergenciais em produção (com documentação)
- ⚠️ Migrações de dados legacy (one-time)
- ⚠️ Schemas não-Medusa (analytics, logs, audit)

**Restrições:**

- ❌ Não usar para criar tabelas de entidades Medusa
- ❌ Não usar para modificar tabelas gerenciadas por MikroORM
- ❌ Não usar como solução padrão
- ⚠️ Sempre documentar em `CHANGELOG.md` quando usado

**Exemplo válido:**

```sql
-- database/migrations/001-seed-brazilian-regions.sql
-- Seed inicial de regiões brasileiras (one-time)
INSERT INTO region (id, name, currency_code, created_at, updated_at)
VALUES
  ('br', 'Brasil', 'BRL', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
```

**Exemplo inválido (usar MikroORM):**

```sql
-- ❌ NÃO FAZER ISSO
CREATE TABLE company (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);
```

---

## 🔄 Ordem de Execução na CI/CD

### Development

```bash
# 1. Instalar dependências
npm install

# 2. Build do projeto
npm run build

# 3. Executar migrações MikroORM
npm run migrate

# 4. (Opcional) Seeds SQL legados
npm run db:seed:legacy

# 5. Seeds Medusa
npm run seed
```

### Production

```bash
# 1. Build da imagem Docker
docker build -t ysh-backend:latest .

# 2. Executar migrações (dentro do container)
docker exec ysh-backend npm run migrate

# 3. Health check
docker exec ysh-backend curl http://localhost:9000/health

# 4. (Opcional) Seeds iniciais apenas em first deploy
docker exec ysh-backend npm run seed
```

---

## 📋 Checklist de Criação de Migração

### Antes de criar uma migração

- [ ] A mudança afeta uma entidade gerenciada por MikroORM? → Use MikroORM
- [ ] É uma migração de dados one-time? → Considere SQL manual com documentação
- [ ] É seed de dados de referência? → Use scripts em `src/scripts/seed-*.ts`
- [ ] Já existe migração MikroORM para essa entidade? → Sempre use MikroORM

### Após criar migração MikroORM

- [ ] Revisar SQL gerado no arquivo `.ts`
- [ ] Testar rollback (`down()` method)
- [ ] Executar em ambiente local
- [ ] Validar schema com `npm run doctor:db`
- [ ] Commitar migração junto com mudanças de código

### Após executar SQL manual

- [ ] Documentar no `CHANGELOG.md` com justificativa
- [ ] Adicionar comentários no arquivo SQL explicando propósito
- [ ] Criar issue para migrar para MikroORM se aplicável
- [ ] Notificar equipe via Slack/Discord

---

## 🚨 Resolução de Conflitos

### Cenário 1: Migração MikroORM falha

```bash
# 1. Ver status
npm run migrate -- --list

# 2. Rollback última migração
npm run migrate -- --down

# 3. Corrigir código da migração
# 4. Re-executar
npm run migrate
```

### Cenário 2: Tabelas criadas manualmente em produção

```bash
# 1. Gerar migração a partir do estado atual do DB
npm run migrate:create SyncManualChanges

# 2. Editar migração gerada para ser idempotente (IF NOT EXISTS)
# 3. Executar em staging
# 4. Validar em produção
```

### Cenário 3: Conflito entre MikroORM e SQL manual

**Resolução:**

1. Reverter SQL manual se possível
2. Gerar migração MikroORM equivalente
3. Executar em staging para validar
4. Documentar lição aprendida

---

## 📊 Estado Atual do Projeto

### Migrações Executadas (MikroORM)

```
Total: 110 migrações core Medusa
Status: ✅ Todas executadas com sucesso
```

### Migrações Pendentes

```
❌ backend/src/migrations/1728518400000-create-unified-catalog-tables.ts
   - Tabelas: manufacturer, sku, offer
   - Motivo pendente: Formato de nome não reconhecido
   - Ação: Renomear e re-executar

❌ backend/src/migrations/Migration20251012000000.ts
   - Tabelas: solar_calculation, credit_analysis, financing_offer
   - Motivo pendente: Naming convention incorreta
   - Ação: Renomear para formato YYYYMMDDHHMMSS-description.ts
```

### Tabelas Criadas Manualmente (SQL)

```
✅ company (6 colunas)
✅ employee (5 colunas, FK → company)
✅ quote (6 colunas)
✅ quote_message (6 colunas, FK → quote)
✅ approval (5 colunas)
✅ approval_settings (4 colunas, FK → company)

⚠️ AÇÃO FUTURA: Migrar para MikroORM quando refatorar módulos B2B
```

---

## 🎓 Boas Práticas

### ✅ DO

- Sempre usar MikroORM para entidades TypeScript
- Nomear migrações de forma descritiva: `AddIndexToProductSku.ts`
- Testar `up()` E `down()` antes de commitar
- Usar transações em operações de dados
- Adicionar comentários em SQL complexo

### ❌ DON'T

- Editar migrações já executadas em produção
- Deletar arquivos de migração
- Pular migrações manualmente no tracking
- Usar `CASCADE` sem documentação clara
- Criar tabelas via SQL que deveriam ser MikroORM

---

## 🔗 Recursos

- [MikroORM Migrations](https://mikro-orm.io/docs/migrations)
- [Medusa Database Migrations](https://docs.medusajs.com/resources/architectural-modules/module/overview#database-migrations)
- Suporte interno: `#backend-migrations` no Slack

---

## 📞 Contato

**Dúvidas sobre migrações?**

- DM: @platform-team
- Channel: #backend-migrations
- Docs: [Confluence/Migrações](https://wiki.ysh.com/migrations)

---

**Última atualização:** 2025-10-12 por GitHub Copilot AI Agent  
**Próxima revisão:** 2025-11-12 ou quando houver mudança arquitetural
