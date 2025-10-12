# Automação Completa do Publishable Key

## 🎯 Visão Geral

Esta documentação detalha a **solução automatizada end-to-end** para criação, extração e configuração do Publishable Key do Medusa em ambientes local, Docker e AWS ECS.

---

## 📋 Índice

1. [Ambiente Local](#ambiente-local)
2. [Ambiente Docker](#ambiente-docker)
3. [Ambiente AWS ECS](#ambiente-aws-ecs)
4. [Troubleshooting](#troubleshooting)

---

## 🏠 Ambiente Local

### Opção 1: Script Automático (Recomendado)

```bash
cd backend

# Certifique-se de que o backend está rodando
npm run dev

# Em outro terminal, execute o setup
npm run setup:publishable-key

# Ou com upload para AWS
npm run setup:publishable-key:aws
```

**O que o script faz**:

1. ✅ Verifica se já existe publishable key ativa
2. ✅ Se não existe, cria nova key
3. ✅ Linka key com Sales Channel padrão
4. ✅ Salva automaticamente em `backend/.env` e `storefront/.env.local`
5. ✅ (Opcional) Faz upload para AWS Secrets Manager

### Opção 2: Via Medusa CLI

```bash
cd backend

# Após migrations e seed
npm run medusa exec ./src/scripts/create-publishable-key.ts
```

**Saída esperada**:

```
✅ Publishable API key created successfully!
Key ID: xxxxx
Token: pk_xxxxxxxxxx

📋 Add this to your storefront .env:
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxxxxxxx
```

### Opção 3: Via Admin Dashboard

1. Acesse `http://localhost:9000/app`
2. Login: `admin@test.com` / `supersecret`
3. Settings → API Key Management
4. Create Publishable API Key
5. Copie a key para `.env` files

---

## 🐳 Ambiente Docker

### Docker Compose Local

O `docker-compose.yml` já está configurado para criar publishable key automaticamente:

```yaml
services:
  backend:
    environment:
      - NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}
    
  storefront:
    environment:
      - NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}
```

**Fluxo automático**:

1. **Subir stack**:

   ```bash
   docker-compose up -d
   ```

2. **Aguardar migrations e seed** (2-3 minutos):

   ```bash
   docker-compose logs -f backend | grep "seed completed"
   ```

3. **Extrair publishable key**:

   ```bash
   docker-compose exec backend npm run medusa exec ./src/scripts/create-publishable-key.ts
   ```

4. **Copiar key para .env**:

   ```bash
   # A key será exibida no log
   # Copie e adicione manualmente em:
   # - backend/.env
   # - storefront/.env.local
   ```

5. **Reiniciar containers**:

   ```bash
   docker-compose restart backend storefront
   ```

### Script de Extração Docker

Crie `scripts/docker-extract-key.sh`:

```bash
#!/bin/bash

echo "🔑 Extraindo Publishable Key do container Docker..."

KEY=$(docker-compose exec -T backend npm run medusa exec ./src/scripts/create-publishable-key.ts 2>&1 | grep -oP 'pk_[a-f0-9]+')

if [ -z "$KEY" ]; then
  echo "❌ Nenhuma key encontrada"
  exit 1
fi

echo "✅ Key encontrada: $KEY"

# Salvar em .env files
echo "" >> backend/.env
echo "# Publishable Key (extraído em $(date))" >> backend/.env
echo "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$KEY" >> backend/.env

echo "" >> storefront/.env.local
echo "# Publishable Key (extraído em $(date))" >> storefront/.env.local
echo "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$KEY" >> storefront/.env.local

echo "💾 Key salva em .env files"
echo "🔄 Reinicie os containers: docker-compose restart"
```

**Uso**:

```bash
chmod +x scripts/docker-extract-key.sh
./scripts/docker-extract-key.sh
```

---

## ☁️ Ambiente AWS ECS

### Estratégia: Task Definition com Migrations + Seed + Key Extraction

#### Passo 1: Registrar Task Definition

```bash
cd aws

aws ecs register-task-definition \
  --cli-input-json file://backend-migrations-seed-task-definition.json \
  --region us-east-1 \
  --profile ysh-production
```

**O que esta task faz**:

```bash
npm run migrate && \
npm run seed && \
medusa exec ./src/scripts/create-publishable-key.ts
```

#### Passo 2: Executar Task de Setup

```bash
aws ecs run-task \
  --cluster production-ysh-b2b-cluster \
  --task-definition ysh-b2b-backend-migrations-with-seed:1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-0f561c79c40d11c6f,subnet-03634efd78a887b0b],securityGroups=[sg-06563301eba0427b2],assignPublicIp=ENABLED}" \
  --region us-east-1 \
  --profile ysh-production
```

#### Passo 3: Monitorar Logs

```bash
# Obter Task ID da saída anterior
TASK_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Aguardar conclusão (3-5 minutos)
aws ecs describe-tasks \
  --cluster production-ysh-b2b-cluster \
  --tasks $TASK_ID \
  --region us-east-1 \
  --profile ysh-production \
  --query 'tasks[0].[lastStatus,containers[0].exitCode]'

# Ver logs
aws logs get-log-events \
  --log-group-name "/ecs/ysh-b2b-backend-migrations-with-seed" \
  --log-stream-name "ecs/migrations-and-seed/$TASK_ID" \
  --limit 200 \
  --region us-east-1 \
  --profile ysh-production \
  --query 'events[*].message' \
  --output text | grep -A5 "Publishable"
```

#### Passo 4: Extrair Key dos Logs

**Procure no log por**:

```
✅ Publishable API key created successfully!
Key ID: xxxxx
Token: pk_xxxxxxxxxx
```

**Ou busque no AWS Secrets Manager** (se o script salvou automaticamente):

```bash
aws secretsmanager get-secret-value \
  --secret-id /ysh-b2b/publishable-key \
  --region us-east-1 \
  --profile ysh-production \
  --query 'SecretString' \
  --output text
```

#### Passo 5: Atualizar Backend Task Definition

Edite `aws/backend-task-definition.json` para usar o secret:

```json
{
  "secrets": [
    {
      "name": "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
      "valueFrom": "arn:aws:secretsmanager:us-east-1:773235999227:secret:/ysh-b2b/publishable-key-tvnMYo"
    }
  ]
}
```

Registre nova versão:

```bash
aws ecs register-task-definition \
  --cli-input-json file://aws/backend-task-definition.json \
  --region us-east-1 \
  --profile ysh-production
```

#### Passo 6: Deploy Backend Service

```bash
# Atualizar service com nova task definition
aws ecs update-service \
  --cluster production-ysh-b2b-cluster \
  --service ysh-b2b-backend \
  --task-definition ysh-b2b-backend:NOVA_REVISAO \
  --force-new-deployment \
  --region us-east-1 \
  --profile ysh-production

# Monitorar deployment
aws ecs describe-services \
  --cluster production-ysh-b2b-cluster \
  --services ysh-b2b-backend \
  --region us-east-1 \
  --profile ysh-production \
  --query 'services[0].deployments'
```

---

## 🔧 Troubleshooting

### Erro: "No publishable key found"

**Causa**: Seed não criou a key ou database não foi populado.

**Solução**:

```bash
# Local
npm run seed
npm run medusa exec ./src/scripts/create-publishable-key.ts

# Docker
docker-compose exec backend npm run seed
docker-compose exec backend npm run medusa exec ./src/scripts/create-publishable-key.ts

# AWS ECS
# Re-executar task de migrations + seed
```

### Erro: "publishable_api_key table does not exist"

**Causa**: Migrations não foram executadas.

**Solução**:

```bash
# Local
npm run migrate

# Docker
docker-compose exec backend npm run migrate

# AWS ECS
# Executar migrations task primeiro
```

### Key não funciona no Storefront

**Diagnóstico**:

```bash
# Testar key via curl
curl -H "x-publishable-api-key: pk_xxxxxxxxxx" \
     http://localhost:9000/store/products?limit=5

# Deve retornar produtos, não erro 401
```

**Solução**:

1. Verificar se key está no `.env`: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx`
2. Reiniciar storefront: `npm run dev`
3. Verificar browser console: deve aparecer `publishableApiKey` nos requests

### Key não está no AWS Secrets Manager

**Solução manual**:

```bash
# Obter key do banco de dados via ECS exec
aws ecs execute-command \
  --cluster production-ysh-b2b-cluster \
  --task BACKEND_TASK_ID \
  --container backend \
  --interactive \
  --command "/bin/sh"

# Dentro do container
psql $DATABASE_URL -c "SELECT id FROM publishable_api_key LIMIT 1;"

# Salvar no Secrets Manager
aws secretsmanager update-secret \
  --secret-id /ysh-b2b/publishable-key \
  --secret-string "pk_xxxxxxxxxx" \
  --region us-east-1
```

---

## 🎯 Checklist de Validação

### Local ✅

- [ ] `backend/.env` tem `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
- [ ] `storefront/.env.local` tem `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
- [ ] Curl test retorna produtos: `curl -H "x-publishable-api-key: pk_xxx" http://localhost:9000/store/products`
- [ ] Storefront carrega produtos sem erros 401

### Docker ✅

- [ ] Task migrations + seed completou com `exitCode=0`
- [ ] Logs mostram "Publishable API key created"
- [ ] Key copiada para `.env` files do host
- [ ] Containers reiniciados após adicionar key
- [ ] Storefront funcional

### AWS ECS ✅

- [ ] Task migrations + seed executada com sucesso
- [ ] Publishable key aparece nos logs
- [ ] Key salva no AWS Secrets Manager `/ysh-b2b/publishable-key`
- [ ] Backend task definition referencia o secret
- [ ] Backend service deployado com nova task definition
- [ ] Storefront pode acessar `/store` endpoints
- [ ] Health check passa: `curl https://api.ysh.com/health`

---

## 📚 Referências

- **Scripts**:
  - `backend/scripts/setup-publishable-key.js` - Automação local
  - `backend/src/scripts/create-publishable-key.ts` - Extração via Medusa CLI
  
- **Task Definitions**:
  - `aws/backend-migrations-seed-task-definition.json` - Setup completo ECS
  
- **Documentação**:
  - `docs/deployment/PUBLISHABLE_KEY_360.md` - Cobertura 360º
  - `docs/deployment/PUBLISHABLE_KEY_EXECUTIVE_SUMMARY.md` - Resumo executivo
