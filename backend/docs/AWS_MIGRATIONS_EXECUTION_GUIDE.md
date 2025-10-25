# 🚀 GUIA DE EXECUÇÃO DAS MIGRATIONS NO AWS RDS

**Status**: ✅ Pronto para execução  
**Database**: `production-ysh-b2b-postgres` (PostgreSQL 15.14)  
**Image**: `773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.4`  
**Migration**: `Migration20251013140000.ts` (5 tabelas)

---

## 📋 PRÉ-REQUISITOS

Antes de executar as migrations, certifique-se de que:

- [ ] AWS CLI configurado com perfil `ysh-production`
- [ ] Credenciais SSO válidas (`aws sso login --profile ysh-production`)
- [ ] Docker image `ysh-backend:v1.0.4` em ECR
- [ ] RDS `production-ysh-b2b-postgres` disponível
- [ ] Secret `/ysh-b2b/database-url` configurado no Secrets Manager

### Verificar Pré-requisitos

```powershell
# 1. Verificar credenciais AWS
aws sts get-caller-identity --profile ysh-production

# 2. Verificar RDS
aws rds describe-db-instances `
  --db-instance-identifier production-ysh-b2b-postgres `
  --profile ysh-production `
  --query 'DBInstances[0].[DBInstanceStatus,Engine,EngineVersion]' `
  --output table

# 3. Verificar image ECR
aws ecr describe-images `
  --repository-name ysh-backend `
  --profile ysh-production `
  --region us-east-1 `
  --query 'imageDetails[?imageTags!=`null`].[imageTags[0],imageSizeInBytes,imagePushedAt]' `
  --output table

# 4. Verificar secret
aws secretsmanager describe-secret `
  --secret-id /ysh-b2b/database-url `
  --profile ysh-production `
  --region us-east-1 `
  --query '[Name,LastChangedDate]' `
  --output table
```

---

## 🎯 MÉTODO 1: ECS FARGATE TASK (RECOMENDADO)

**Vantagens:**
- ✅ Seguro (executa dentro da VPC do RDS)
- ✅ Auditável (logs no CloudWatch)
- ✅ Não requer acesso público ao RDS
- ✅ Usa IAM Roles (sem credentials hardcoded)
- ✅ Automatizado

### Passo 1: Executar Script

```powershell
cd C:\Users\fjuni\ysh_medusa\ysh-store\backend

# DRY RUN (testar sem executar)
.\scripts\run-migrations-aws.ps1 -Method ecs -DryRun

# EXECUÇÃO REAL
.\scripts\run-migrations-aws.ps1 -Method ecs
```

### Passo 2: Monitorar Execução

O script vai:
1. Verificar credenciais AWS ✓
2. Criar/verificar cluster ECS `ysh-backend-cluster` ✓
3. Obter DATABASE_URL do Secrets Manager ✓
4. Obter configuração VPC do RDS ✓
5. Criar Task Definition `ysh-backend-migrations` ✓
6. Executar task no Fargate ✓
7. Aguardar conclusão (máx 5 minutos) ✓
8. Exibir logs do CloudWatch ✓
9. Validar tabelas criadas ✓

### Passo 3: Verificar Logs (se necessário)

```powershell
# Listar últimas execuções
aws logs tail /ecs/ysh-backend-migrations `
  --follow `
  --profile ysh-production `
  --region us-east-1

# Ver task no console
aws ecs list-tasks `
  --cluster ysh-backend-cluster `
  --profile ysh-production `
  --region us-east-1
```

---

## 🎯 MÉTODO 2: EXECUÇÃO LOCAL (ALTERNATIVA)

**Requisitos:**
- RDS deve ter `PubliclyAccessible: true` OU
- Seu IP deve estar no Security Group do RDS

### Passo 1: Adicionar IP ao Security Group

```powershell
# Obter seu IP público
$myIp = (Invoke-WebRequest -Uri "https://api.ipify.org").Content
Write-Host "Meu IP: $myIp"

# Adicionar regra ao Security Group
aws ec2 authorize-security-group-ingress `
  --group-id sg-0ed77cd5394f86cad `
  --protocol tcp `
  --port 5432 `
  --cidr "$myIp/32" `
  --profile ysh-production `
  --region us-east-1
```

### Passo 2: Executar Migrations Localmente

```powershell
# Executar script
.\scripts\run-migrations-aws.ps1 -Method local

# OU manualmente
$env:DATABASE_URL = (aws secretsmanager get-secret-value `
  --secret-id /ysh-b2b/database-url `
  --profile ysh-production `
  --region us-east-1 `
  --query 'SecretString' `
  --output text)

npm run migrate
```

### Passo 3: Remover IP do Security Group

```powershell
# Após execução, remover regra
aws ec2 revoke-security-group-ingress `
  --group-id sg-0ed77cd5394f86cad `
  --protocol tcp `
  --port 5432 `
  --cidr "$myIp/32" `
  --profile ysh-production `
  --region us-east-1
```

---

## ✅ VALIDAÇÃO DAS MIGRATIONS

### Opção 1: Script SQL (completo)

```powershell
# Obter DATABASE_URL
$dbUrl = aws secretsmanager get-secret-value `
  --secret-id /ysh-b2b/database-url `
  --profile ysh-production `
  --region us-east-1 `
  --query 'SecretString' `
  --output text

# Parse connection details
$dbUrl -match 'postgres://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)'
$user = $matches[1]
$password = $matches[2]
$host = $matches[3]
$port = $matches[4]
$dbname = $matches[5]

# Executar validação (requer psql instalado)
$env:PGPASSWORD = $password
psql -h $host -p $port -U $user -d $dbname -f scripts\validate-migrations.sql
Remove-Item Env:\PGPASSWORD
```

### Opção 2: Queries SQL Manuais

```sql
-- 1. Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('lead', 'event', 'rag_query', 'helio_conversation', 'photogrammetry_analysis');

-- 2. Verificar contagem de colunas
SELECT table_name, COUNT(*) as columns
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('lead', 'event', 'rag_query', 'helio_conversation', 'photogrammetry_analysis')
GROUP BY table_name;

-- 3. Verificar indexes
SELECT tablename, COUNT(*) as indexes
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('lead', 'event', 'rag_query', 'helio_conversation', 'photogrammetry_analysis')
GROUP BY tablename;

-- 4. Testar INSERT em lead
INSERT INTO lead (email, status, source, created_at, updated_at)
VALUES ('test@example.com', 'new', 'website', NOW(), NOW())
RETURNING id;

-- 5. Testar SELECT
SELECT COUNT(*) FROM lead;
```

### Opção 3: Via ECS Task (mesmo método da migration)

```powershell
# Criar task definition para validação
# (similar ao script de migrations, mas com comando diferente)
```

---

## 📊 RESULTADOS ESPERADOS

Após execução bem-sucedida, você deve ver:

### ✅ Tabelas Criadas (5)
- `lead` (27 campos, 7 indexes)
- `event` (49 campos, 8 indexes)
- `rag_query` (35 campos, 7 indexes)
- `helio_conversation` (49 campos, 7 indexes)
- `photogrammetry_analysis` (64 campos, 8 indexes)

### ✅ Total de Recursos
- **264+ colunas** distribuídas nas 5 tabelas
- **37+ indexes** para otimização de queries
- **5 primary keys** (id em cada tabela)
- **Foreign keys** configuradas (customer_id, order_id, etc)

### ✅ Logs de Sucesso

```
[Nest] INFO [MikroORM] - ORM entity discovery successful
[Nest] INFO [MikroORM] - Starting schema migration...
[Nest] INFO [MikroORM] - Creating table 'lead'
[Nest] INFO [MikroORM] - Creating table 'event'
[Nest] INFO [MikroORM] - Creating table 'rag_query'
[Nest] INFO [MikroORM] - Creating table 'helio_conversation'
[Nest] INFO [MikroORM] - Creating table 'photogrammetry_analysis'
[Nest] INFO [MikroORM] - Creating indexes...
[Nest] INFO [MikroORM] - Migration completed successfully
```

---

## 🔄 ROLLBACK (SE NECESSÁRIO)

Caso precise reverter as migrations:

### Criar Migration de Rollback

```typescript
// src/migrations/Migration20251013140001.ts
import { Migration } from '@mikro-orm/migrations';

export class Migration20251013140001 extends Migration {
  async up(): Promise<void> {
    // Nada - esta migration apenas reverte a anterior
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS photogrammetry_analysis CASCADE;');
    this.addSql('DROP TABLE IF EXISTS helio_conversation CASCADE;');
    this.addSql('DROP TABLE IF EXISTS rag_query CASCADE;');
    this.addSql('DROP TABLE IF EXISTS event CASCADE;');
    this.addSql('DROP TABLE IF EXISTS lead CASCADE;');
  }
}
```

### Executar Rollback

```powershell
# Via ECS
.\scripts\run-migrations-aws.ps1 -Method ecs -Command "npm run migrate:down"

# Via Local
npm run migrate:down
```

---

## 🚨 TROUBLESHOOTING

### Erro: "Credenciais AWS expiradas"

```powershell
aws sso login --profile ysh-production
```

### Erro: "Task failed with exit code 1"

```powershell
# Ver logs detalhados
aws logs tail /ecs/ysh-backend-migrations --follow --profile ysh-production
```

### Erro: "Connection timeout to RDS"

**Causa**: Task ECS não consegue acessar RDS  
**Solução**: Verificar se task está na mesma VPC e Security Group permite acesso

```powershell
# Verificar subnets do RDS
aws rds describe-db-instances `
  --db-instance-identifier production-ysh-b2b-postgres `
  --profile ysh-production `
  --query 'DBInstances[0].DBSubnetGroup.Subnets[*].SubnetIdentifier'

# Verificar security group
aws ec2 describe-security-groups `
  --group-ids sg-0ed77cd5394f86cad `
  --profile ysh-production `
  --query 'SecurityGroups[0].IpPermissions'
```

### Erro: "Table already exists"

**Causa**: Migrations já foram executadas anteriormente  
**Solução**: Verificar tabela `mikro_orm_migrations`

```sql
SELECT * FROM mikro_orm_migrations ORDER BY executed_at DESC;
```

Se migration já foi executada, não é necessário rodar novamente.

---

## 📚 REFERÊNCIAS

- **Migration File**: `src/migrations/Migration20251013140000.ts`
- **Models**: `src/models/*.ts` (8 arquivos)
- **Documentation**: `docs/DATABASE_360_FINAL_SUMMARY.md`
- **ECR Image**: `773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.4`
- **RDS Endpoint**: `production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com:5432`

---

## ✅ PRÓXIMOS PASSOS

Após migrations concluídas com sucesso:

1. **Testar APIs Localmente**
   ```powershell
   npm run dev
   # POST http://localhost:9000/store/leads
   # POST http://localhost:9000/store/events
   ```

2. **Deploy ECS Service**
   - Criar task definition para aplicação
   - Criar ECS Service com Load Balancer
   - Configurar Auto Scaling

3. **Configurar Monitoramento**
   - CloudWatch Logs
   - CloudWatch Alarms (CPU, Memory, Errors)
   - RDS Performance Insights

4. **Criar Backup Strategy**
   - Automated Backups (7 dias)
   - Manual Snapshots antes de deploys
   - Point-in-Time Recovery habilitado

5. **Implementar CI/CD**
   - GitHub Actions para build + push ECR
   - Auto-deploy ECS após merge em `main`
   - Testes E2E em staging antes de produção

---

## 📞 SUPORTE

Em caso de problemas:
1. Verificar logs no CloudWatch: `/ecs/ysh-backend-migrations`
2. Consultar `TROUBLESHOOTING.md`
3. Revisar `DATABASE_360_FINAL_SUMMARY.md`
4. Verificar status RDS no AWS Console

---

**Data**: 2025-01-13  
**Versão**: 1.0  
**Autor**: Database 360° Implementation Team
