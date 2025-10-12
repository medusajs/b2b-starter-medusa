# 🔑 Publishable Key Medusa - Cobertura 360º para Migrações

## 📊 Status Atual - Análise Completa

### ✅ O Que Já Existe

1. **Script de Criação em TypeScript** (`backend/src/scripts/create-publishable-key.ts`)
   - ✅ Verifica se key já existe antes de criar
   - ✅ Gera UUID e token seguros (`pk_` + 64 caracteres hex)
   - ✅ Insere diretamente na tabela `publishable_api_key`
   - ✅ Exibe instruções de uso após criação

2. **Script Legacy JavaScript** (`backend/create-publishable-key.js`)
   - ⚠️ Usa módulos Medusa v2.8 (pode estar desatualizado)
   - ⚠️ Hardcoded token `pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d`
   - ⚠️ Não recomendado para produção

3. **Seed Script Principal** (`backend/src/scripts/seed.ts`)
   - ✅ Cria publishable key automaticamente via workflow
   - ✅ Associa ao Sales Channel padrão
   - ✅ Executado com `npm run seed`

4. **Secrets Manager AWS**
   - ✅ Secret `/ysh-b2b/publishable-key` existe
   - ⚠️ Valor atual: `pk_PLACEHOLDER_WILL_BE_UPDATED_AFTER_ADMIN_SETUP`
   - ❌ **NÃO é uma key válida!**

5. **Task Definitions ECS**
   - ✅ Backend v12: Referencia secret `/ysh-b2b/publishable-key`
   - ✅ Migrations v3: **NÃO** referencia (correto, não precisa)
   - ⚠️ Storefront: Presumivelmente também referencia

---

## 🚨 Problemas Identificados

### 1. Publishable Key no Secrets Manager é PLACEHOLDER

```bash
# Valor atual (INVÁLIDO):
pk_PLACEHOLDER_WILL_BE_UPDATED_AFTER_ADMIN_SETUP

# Precisa ser substituído por valor REAL após migrations
```

### 2. Ordem de Dependências Quebrada

**Ordem Correta**:

1. ✅ Migrations create tables → `publishable_api_key` table
2. ✅ Seed script creates key → INSERT na tabela
3. ❌ **Update Secrets Manager** → Atualizar com token real
4. ❌ **Redeploy Backend** → Usar token real em vez de placeholder
5. ❌ **Deploy Storefront** → Acessar backend com token válido

**Problema**: Passos 3-5 **NÃO estão automatizados**!

### 3. Migrations Task NÃO Cria Publishable Key

O migrations task v3 apenas roda `medusa db:migrate`, que:

- ✅ Cria tabela `publishable_api_key`
- ❌ **NÃO insere nenhuma key** (tabela fica vazia!)

**Resultado**: Backend v12 vai usar placeholder e falhar ao validar requests da storefront.

---

## ✅ Solução Completa - Cobertura 360º

### Fase 1: Fix Migrations (URGENTE)

#### Opção A: Task Definition Combinada (Migrations + Seed + Key)

**Arquivo**: `aws/backend-migrations-seed-task-definition.json`

```json
{
  "family": "ysh-b2b-backend-migrations-with-seed",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::773235999227:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::773235999227:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "migrations-and-seed",
      "image": "773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend:v1.0.2",
      "command": [
        "sh",
        "-c",
        "npm run migrate && npm run seed && medusa exec ./src/scripts/create-publishable-key.ts"
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "NODE_OPTIONS",
          "value": "--max-old-space-size=1536 --enable-source-maps"
        },
        {
          "name": "NODE_EXTRA_CA_CERTS",
          "value": "/tmp/rds-ca-bundle.pem"
        },
        {
          "name": "DATABASE_SSL",
          "value": "true"
        },
        {
          "name": "DATABASE_SSL_REJECT_UNAUTHORIZED",
          "value": "true"
        },
        {
          "name": "DATABASE_SSL_CA_FILE",
          "value": "/tmp/rds-ca-bundle.pem"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:773235999227:secret:/ysh-b2b/database-url-BGaeVF"
        },
        {
          "name": "REDIS_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:773235999227:secret:/ysh-b2b/redis-url-Q7ItGs"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:773235999227:secret:/ysh-b2b/jwt-secret-005Z9C"
        },
        {
          "name": "COOKIE_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:773235999227:secret:/ysh-b2b/cookie-secret-bsLKwN"
        },
        {
          "name": "BACKEND_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:773235999227:secret:/ysh-b2b/backend-url-vlAZeu"
        },
        {
          "name": "STOREFRONT_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:773235999227:secret:/ysh-b2b/storefront-url-IV3F65"
        },
        {
          "name": "MEDUSA_ADMIN_ONBOARDING_TYPE",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:773235999227:secret:/ysh-b2b/revalidate-secret-2NMJS9"
        },
        {
          "name": "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:773235999227:secret:/ysh-b2b/publishable-key-tvnMYo"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ysh-b2b-backend-migrations-with-seed",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs",
          "awslogs-create-group": "true"
        }
      },
      "essential": true
    }
  ]
}
```

**Comando Explanation**:

```bash
npm run migrate && npm run seed && medusa exec ./src/scripts/create-publishable-key.ts
```

1. `npm run migrate` → Cria todas as tabelas (incluindo `publishable_api_key`)
2. `npm run seed` → Insere dados demo + **cria publishable key automaticamente**
3. `medusa exec ./src/scripts/create-publishable-key.ts` → Verifica/exibe key criada

---

#### Opção B: Modificar Seed Script para Sempre Exibir Key

**Arquivo**: `backend/src/scripts/seed.ts` (linha 329)

```typescript
logger.info("Finished seeding publishable API key data.");

// ADICIONAR ESTAS LINHAS:
logger.info(`\n🔑 Publishable API Key Details:`);
logger.info(`   Key ID: ${publishableApiKey.id}`);
logger.info(`   Token: ${publishableApiKey.token}`);
logger.info(`\n📋 Update AWS Secrets Manager:`);
logger.info(`aws secretsmanager update-secret --secret-id /ysh-b2b/publishable-key --secret-string "${publishableApiKey.token}" --region us-east-1`);
```

**Vantagem**: Key é exibida nos logs do migrations task automaticamente!

---

### Fase 2: Capturar e Atualizar Secret (Automação)

#### Script CloudShell: Extrair Key dos Logs

```bash
#!/bin/bash
# extract-publishable-key.sh

TASK_ID=$1
LOG_GROUP="/ecs/ysh-b2b-backend-migrations-with-seed"
LOG_STREAM="ecs/migrations-and-seed/${TASK_ID}"

echo "📋 Obtendo logs do task ${TASK_ID}..."

# Obter logs e extrair token pk_*
LOGS=$(aws logs get-log-events \
  --log-group-name "${LOG_GROUP}" \
  --log-stream-name "${LOG_STREAM}" \
  --limit 500 \
  --region us-east-1 \
  --query 'events[*].message' \
  --output text)

# Extrair token (pk_ seguido de 64 caracteres hexadecimais)
TOKEN=$(echo "$LOGS" | grep -oP 'pk_[a-f0-9]{64}' | head -1)

if [ -z "$TOKEN" ]; then
  echo "❌ Publishable key não encontrada nos logs!"
  echo "📋 Logs completos:"
  echo "$LOGS"
  exit 1
fi

echo "✅ Publishable Key encontrada: $TOKEN"

# Atualizar Secrets Manager
echo "📝 Atualizando Secrets Manager..."
aws secretsmanager update-secret \
  --secret-id /ysh-b2b/publishable-key \
  --secret-string "$TOKEN" \
  --region us-east-1

if [ $? -eq 0 ]; then
  echo "✅ Secret atualizado com sucesso!"
  echo ""
  echo "🎯 Próximos passos:"
  echo "1. Redeploy backend service: aws ecs update-service --cluster production-ysh-b2b-cluster --service ysh-b2b-backend --force-new-deployment --region us-east-1"
  echo "2. Deploy storefront (se ainda não deployado)"
  echo "3. Testar: curl -H \"x-publishable-api-key: $TOKEN\" https://backend-url/store/products"
else
  echo "❌ Erro ao atualizar secret!"
  exit 1
fi
```

**Uso**:

```bash
# 1. Executar migrations + seed task
TASK_ARN=$(aws ecs run-task \
  --cluster production-ysh-b2b-cluster \
  --task-definition ysh-b2b-backend-migrations-with-seed:1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-0f561c79c40d11c6f,subnet-03634efd78a887b0b],securityGroups=[sg-06563301eba0427b2],assignPublicIp=ENABLED}" \
  --region us-east-1 \
  --query 'tasks[0].taskArn' \
  --output text)

# Extrair task ID
TASK_ID=$(echo $TASK_ARN | awk -F'/' '{print $NF}')

# 2. Aguardar conclusão (120s para migrations + seed completo)
sleep 120

# 3. Extrair key e atualizar secret
bash extract-publishable-key.sh $TASK_ID
```

---

### Fase 3: Validação End-to-End

#### Checklist Pós-Deploy

- [ ] **Migrations Completaram** (`exitCode=0`)
- [ ] **Seed Completou** (logs mostram "Finished seeding publishable API key data")
- [ ] **Key Criada** (logs mostram `Token: pk_...`)
- [ ] **Secret Atualizado** (não é mais placeholder)
- [ ] **Backend Redeployado** (pega novo valor do secret)
- [ ] **Storefront Deployed** (usa mesmo valor do secret)

#### Teste de Integração

```bash
# 1. Obter key do Secrets Manager
PK=$(aws secretsmanager get-secret-value \
  --secret-id /ysh-b2b/publishable-key \
  --region us-east-1 \
  --query 'SecretString' \
  --output text)

echo "Publishable Key: $PK"

# 2. Testar /store/products (deve retornar 200)
curl -H "x-publishable-api-key: $PK" \
  https://production-ysh-b2b-alb-XXXXXXXXX.us-east-1.elb.amazonaws.com/store/products?limit=5

# 3. Testar /store/regions (deve retornar 200)
curl -H "x-publishable-api-key: $PK" \
  https://production-ysh-b2b-alb-XXXXXXXXX.us-east-1.elb.amazonaws.com/store/regions

# 4. Testar sem key (deve retornar 401)
curl https://production-ysh-b2b-alb-XXXXXXXXX.us-east-1.elb.amazonaws.com/store/products
```

**Resposta Esperada**:

```json
{
  "products": [
    {
      "id": "prod_01...",
      "title": "...",
      "status": "published"
    }
  ],
  "count": 5,
  "offset": 0,
  "limit": 5
}
```

---

## 🔄 Workflow Recomendado (Ordem Correta)

### 1. Primeira Execução (Database Vazio)

```bash
# Passo 1: Migrations + Seed + Create Key
aws ecs run-task \
  --cluster production-ysh-b2b-cluster \
  --task-definition ysh-b2b-backend-migrations-with-seed:1 \
  --launch-type FARGATE \
  --network-configuration "..." \
  --region us-east-1

# Passo 2: Aguardar conclusão e extrair key
# (usar script extract-publishable-key.sh)

# Passo 3: Redeploy backend
aws ecs update-service \
  --cluster production-ysh-b2b-cluster \
  --service ysh-b2b-backend \
  --force-new-deployment \
  --region us-east-1

# Passo 4: Deploy storefront
# (task definition storefront já referencia mesmo secret)
```

### 2. Re-execuções (Database Já Existe)

**Migrations task v3 atual é SUFICIENTE** se:

- ✅ Database já tem dados seedados
- ✅ Publishable key já existe em `/ysh-b2b/publishable-key`
- ✅ Backend service já está usando key válida

**Apenas rode migrations normais**:

```bash
aws ecs run-task \
  --cluster production-ysh-b2b-cluster \
  --task-definition ysh-b2b-backend-migrations:3 \
  --launch-type FARGATE \
  --network-configuration "..." \
  --region us-east-1
```

---

## 📋 Arquivos para Criar/Modificar

### 1. Criar Task Definition Nova

```bash
# aws/backend-migrations-seed-task-definition.json
# (JSON acima com command combinado)
```

### 2. Criar Script de Extração

```bash
# scripts/extract-publishable-key.sh
# (Script bash acima)
```

### 3. Modificar Seed Script (Opcional mas Recomendado)

```typescript
// backend/src/scripts/seed.ts linha 329
// Adicionar logs com token e comando AWS CLI
```

### 4. Atualizar Documentação Deploy

```markdown
# docs/deployment/DEPLOYMENT_STEPS.md
# Adicionar seção "Publishable Key Setup" com workflow acima
```

---

## 🎯 Ação Imediata (Resolver Agora)

### Opção A: Quick Fix Manual (10 min)

1. **Obter key do database atual** (se existir):

```bash
# CloudShell
aws ecs execute-command \
  --cluster production-ysh-b2b-cluster \
  --task $(aws ecs list-tasks --cluster production-ysh-b2b-cluster --service-name ysh-b2b-backend --region us-east-1 --query 'taskArns[0]' --output text) \
  --container backend \
  --command "/bin/sh" \
  --interactive \
  --region us-east-1

# Dentro do container
apk add postgresql-client
psql $DATABASE_URL -c "SELECT token FROM publishable_api_key LIMIT 1;"
```

2. **Se não existir, criar via SQL direto**:

```bash
# CloudShell  
KEY="pk_$(openssl rand -hex 32)"
echo "Publishable Key: $KEY"

# Inserir no database via psql
# (precisa ter acesso ao RDS via bastion ou public IP temporário)
```

3. **Atualizar secret**:

```bash
aws secretsmanager update-secret \
  --secret-id /ysh-b2b/publishable-key \
  --secret-string "$KEY" \
  --region us-east-1
```

4. **Redeploy backend**:

```bash
aws ecs update-service \
  --cluster production-ysh-b2b-cluster \
  --service ysh-b2b-backend \
  --force-new-deployment \
  --region us-east-1
```

---

### Opção B: Solução Completa Automatizada (30 min)

1. Criar `aws/backend-migrations-seed-task-definition.json`
2. Criar `scripts/extract-publishable-key.sh`
3. Registrar e executar task combinada
4. Executar script de extração
5. Redeploy backend
6. Validar end-to-end

---

## 📊 Resumo Executivo

| Componente | Status Atual | Ação Requerida |
|------------|--------------|----------------|
| **Migrations Task** | ✅ Funciona | ⚠️ Não cria key |
| **Seed Script** | ✅ Cria key | ❌ Não usado em prod |
| **Secret Manager** | ⚠️ PLACEHOLDER | ❌ Precisa atualizar |
| **Backend Service** | ⚠️ Usa placeholder | ❌ Precisa redeploy |
| **Storefront** | ❓ Não deployed | ⏸️ Aguardando backend |

**Bloqueador Crítico**: Publishable key no Secrets Manager é PLACEHOLDER inválido.

**Solução**: Executar migrations + seed + create-key task, extrair token dos logs, atualizar secret, redeploy backend.

**ETA**: 30-60 minutos para solução completa automatizada.
