# Fix DATABASE_URL para Usar SSL - EXECUTAR NO CLOUDSHELL

## 🚨 Problema Identificado

**Migrations task v2 e v3 mostram MESMO erro**: `"no encryption"`

**Causa**: O `DATABASE_URL` no Secrets Manager NÃO especifica SSL na connection string.

As variáveis `DATABASE_SSL*` que adicionamos são **ignoradas** porque o PostgreSQL driver usa apenas a connection string.

---

## ✅ Solução: Atualizar DATABASE_URL Secret

### Passo 1: Verificar DATABASE_URL Atual

```bash
aws secretsmanager get-secret-value \
  --secret-id /ysh-b2b/database-url \
  --region us-east-1 \
  --query 'SecretString' \
  --output text
```

**Formato esperado ERRADO** (sem SSL):

```
postgresql://medusa_user:PASSWORD@ysh-b2b-db.xxxxx.us-east-1.rds.amazonaws.com:5432/medusa_db
```

**Formato CORRETO** (com SSL):

```
postgresql://medusa_user:PASSWORD@ysh-b2b-db.xxxxx.us-east-1.rds.amazonaws.com:5432/medusa_db?sslmode=require
```

---

### Passo 2: Atualizar DATABASE_URL com SSL

**IMPORTANTE**: Substitua `CURRENT_DATABASE_URL` pela URL completa do Passo 1!

```bash
# Formato: Adicionar ?sslmode=require no final
aws secretsmanager update-secret \
  --secret-id /ysh-b2b/database-url \
  --secret-string "postgresql://medusa_user:PASSWORD@ysh-b2b-db.xxxxx.us-east-1.rds.amazonaws.com:5432/medusa_db?sslmode=require" \
  --region us-east-1
```

**Alternativas de SSL Mode**:

- `?sslmode=require` - Requer SSL mas não valida certificado
- `?sslmode=verify-ca` - Requer SSL e valida CA (recomendado com RDS)
- `?sslmode=verify-full` - Requer SSL e valida hostname

**Para RDS, use `verify-ca`**:

```bash
# Exemplo com verify-ca (MAIS SEGURO)
aws secretsmanager update-secret \
  --secret-id /ysh-b2b/database-url \
  --secret-string "postgresql://medusa_user:PASSWORD@ysh-b2b-db.xxxxx.us-east-1.rds.amazonaws.com:5432/medusa_db?sslmode=verify-ca" \
  --region us-east-1
```

---

### Passo 3: Re-executar Migrations Task v3

**Migrations task v3 JÁ EXISTE** - basta re-executar com DATABASE_URL atualizado:

```bash
aws ecs run-task \
  --cluster production-ysh-b2b-cluster \
  --task-definition ysh-b2b-backend-migrations:3 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-0f561c79c40d11c6f,subnet-03634efd78a887b0b],securityGroups=[sg-06563301eba0427b2],assignPublicIp=ENABLED}" \
  --region us-east-1 \
  --query 'tasks[0].taskArn' \
  --output text
```

**Extrair Task ID** da resposta:

```
arn:aws:ecs:us-east-1:773235999227:task/production-ysh-b2b-cluster/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                                                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                                                    Este é o Task ID
```

---

### Passo 4: Monitorar e Obter Logs

**Aguardar 60 segundos** e verificar status:

```bash
# Substituir TASK_ID pelo ID extraído acima
aws ecs describe-tasks \
  --cluster production-ysh-b2b-cluster \
  --tasks TASK_ID \
  --region us-east-1 \
  --query 'tasks[0].[lastStatus,containers[0].exitCode]' \
  --output json
```

**Obter logs**:

```bash
# Substituir TASK_ID pelo ID extraído acima
aws logs get-log-events \
  --log-group-name "/ecs/ysh-b2b-backend-migrations" \
  --log-stream-name "ecs/migrations/TASK_ID" \
  --limit 100 \
  --region us-east-1 \
  --query 'events[*].message' \
  --output text
```

---

## ✅ Critério de Sucesso

**Logs devem mostrar**:

```json
{"level":"info","message":"Migrations completed"}
{"level":"info","message":"Syncing links..."}
{"level":"info","message":"Links synced successfully"}  // ← NOVO!
```

**SEM erros**:

- ❌ "no encryption" deve DESAPARECER
- ⚠️ EACCES warnings podem permanecer (não-críticos)

**Exit code**: Deve ser `0` (ou `1` se apenas EACCES)

---

## 🔄 Se Ainda Falhar

### Verificar RDS Security Group

```bash
aws ec2 describe-security-groups \
  --group-ids sg-06563301eba0427b2 \
  --region us-east-1 \
  --query 'SecurityGroups[0].IpPermissions[?FromPort==`5432`]' \
  --output json
```

**Deve permitir**:

- **Port**: 5432
- **Source**: sg-06563301eba0427b2 (mesmo security group) ou 0.0.0.0/0

### Verificar RDS Require SSL

```bash
# Verificar se RDS force SSL
aws rds describe-db-instances \
  --db-instance-identifier ysh-b2b-db \
  --region us-east-1 \
  --query 'DBInstances[0].[DBParameterGroups[0].DBParameterGroupName,PubliclyAccessible]' \
  --output json
```

Se RDS tem `rds.force_ssl=1`, conexões não-SSL são **sempre rejeitadas**.

---

## 📝 Resumo dos Comandos

```bash
# 1. Ver DATABASE_URL atual
aws secretsmanager get-secret-value --secret-id /ysh-b2b/database-url --region us-east-1 --query 'SecretString' --output text

# 2. Atualizar com ?sslmode=verify-ca (SUBSTITUIR URL COMPLETA)
aws secretsmanager update-secret --secret-id /ysh-b2b/database-url --secret-string "postgresql://user:pass@host:5432/db?sslmode=verify-ca" --region us-east-1

# 3. Re-executar migrations task v3
aws ecs run-task --cluster production-ysh-b2b-cluster --task-definition ysh-b2b-backend-migrations:3 --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[subnet-0f561c79c40d11c6f,subnet-03634efd78a887b0b],securityGroups=[sg-06563301eba0427b2],assignPublicIp=ENABLED}" --region us-east-1 --query 'tasks[0].taskArn' --output text

# 4. Obter logs (substituir TASK_ID)
aws logs get-log-events --log-group-name "/ecs/ysh-b2b-backend-migrations" --log-stream-name "ecs/migrations/TASK_ID" --limit 100 --region us-east-1 --query 'events[*].message' --output text
```

---

## 🎯 Próximo Passo

Execute **Passo 1** no CloudShell e cole a DATABASE_URL aqui para eu ajudar a construir o comando de update correto! 🔍
