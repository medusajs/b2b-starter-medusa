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
