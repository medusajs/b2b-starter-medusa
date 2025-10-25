# AWS Deployment Status & Action Plan

**Data**: October 12, 2025  
**Status**: 🟡 Parcialmente Configurado - Requer Atualização

---

## 📊 Infraestrutura AWS Atual

### ✅ Recursos Ativos

| Recurso | ID/Endpoint | Status | Região |
|---------|-------------|--------|--------|
| **VPC** | `vpc-096abb11405bb44af` | ✅ Ativo | us-east-1 |
| **RDS PostgreSQL** | `production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com` | ✅ Ativo | us-east-1 |
| **ElastiCache Redis** | `production-ysh-b2b-redis.97x7fb.0001.use1.cache.amazonaws.com` | ✅ Ativo | us-east-1 |
| **Application Load Balancer** | `production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com` | ✅ Ativo | us-east-1 |
| **ECS Cluster** | `production-ysh-b2b-cluster` | ✅ Ativo | us-east-1 |
| **Subnets Privadas** | `subnet-0a7620fdf057a8824`, `subnet-09c23e75aed3a5d76` | ✅ Ativo | us-east-1 |
| **Subnets Públicas** | `subnet-0f561c79c40d11c6f`, `subnet-03634efd78a887b0b` | ✅ Ativo | us-east-1 |

### 🔐 Security Groups

| Nome | ID | Portas | Propósito |
|------|----|-|----------|
| **production-ysh-b2b-alb-sg** | `sg-04504f1416350279a` | 80, 443 | Load Balancer |
| **production-ysh-b2b-ecs-sg** | `sg-06563301eba0427b2` | 9000, 8000 | ECS Tasks |
| **production-ysh-b2b-db-sg** | `sg-0ed77cd5394f86cad` | 5432 | PostgreSQL |
| **production-ysh-b2b-redis-sg** | `sg-02bcea8a95dd593ff` | 6379 | Redis |

### 🎯 Target Groups

| Nome | ARN | Porta | Health Check |
|------|-----|-------|--------------|
| **ysh-backend-tg** | `...5d057ad67b1e08c0` | 9000 | `/health` |
| **ysh-storefront-tg** | `...de48968877cc252d` | 8000 | `/api/health` |

---

## 🔴 Problemas Identificados

### 1. **ECS Services Status**

```tsx
Service: ysh-b2b-backend
- Status: ACTIVE
- Running: 0/2 (❌ Nenhuma task rodando)
- Task Definition: ysh-b2b-backend:5 (desatualizada)
- Última atualização tentada: v6 (falhou)

Service: ysh-b2b-storefront
- Status: ACTIVE
- Running: 2/2 (✅ OK)
- Task Definition: ysh-b2b-storefront:7
- Última atualização: v8 (sucesso)
```

### 2. **Secrets Manager - Credenciais Desatualizadas**

```yaml
Secrets Existentes:
  - /ysh-b2b/database-url: 
      Valor: postgresql://medusa_user:MedusaSecurePassword2024!@...
      ⚠️ Problema: Usuário "medusa_user" não existe mais (agora é "postgres")
      
  - /ysh-b2b/redis-url: ✅ OK
      Valor: redis://production-ysh-b2b-redis.97x7fb...
      
  - /ysh-b2b/backend-url: ✅ OK
      Valor: http://production-ysh-b2b-alb-...
```

### 3. **Arquivos Locais Desatualizados**

- ❌ `backend/secrets/` contém chaves antigas (pk-APKA*, rsa-APKA*)
- ❌ `backend/.env` tem `DB_NAME=medusa-backend` (conflito)
- ❌ Task definitions desatualizadas (v5 vs v6 registrada)

### 4. **CloudFormation Stack**

```tsx
Error: Unresolved resource dependencies [BackendTargetGroup] 
in the Outputs block of the template
```

---

## ✅ Plano de Ação: Redeployment Completo

### Fase 1: Limpeza Local (10 min)

```powershell
# 1. Remover secrets obsoletos
Remove-Item backend/secrets/*.pem -Force
Remove-Item backend/secrets/txt-wip* -Force

# 2. Corrigir .env local
# Remover linha conflitante: DB_NAME=medusa-backend

# 3. Validar docker-compose.yml
# DATABASE_URL deve usar credenciais corretas: postgres/postgres
```

### Fase 2: Atualizar AWS Secrets Manager (5 min)

```bash
# 1. Atualizar DATABASE_URL com credenciais corretas
aws secretsmanager update-secret \
  --secret-id /ysh-b2b/database-url \
  --secret-string "postgresql://postgres:postgres@production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com:5432/medusa_db" \
  --profile ysh-production \
  --region us-east-1

# 2. Adicionar JWT_SECRET
aws secretsmanager create-secret \
  --name /ysh-b2b/jwt-secret \
  --secret-string "supersecret_ysh_2025_production" \
  --profile ysh-production \
  --region us-east-1

# 3. Adicionar COOKIE_SECRET
aws secretsmanager create-secret \
  --name /ysh-b2b/cookie-secret \
  --secret-string "supersecret_ysh_2025_production" \
  --profile ysh-production \
  --region us-east-1
```

### Fase 3: Atualizar Task Definitions (10 min)

```bash
cd aws

# 1. Atualizar backend-task-definition.json
#    - Adicionar secrets do Secrets Manager
#    - Atualizar variáveis de ambiente
#    - Bumpar versão para 1.0.1

# 2. Registrar nova task definition
aws ecs register-task-definition \
  --cli-input-json file://backend-task-definition.json \
  --profile ysh-production \
  --region us-east-1

# 3. Atualizar storefront-task-definition.json
#    - Adicionar NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
#    - Bumpar versão para 1.0.1

# 4. Registrar nova task definition
aws ecs register-task-definition \
  --cli-input-json file://storefront-task-definition.json \
  --profile ysh-production \
  --region us-east-1
```

### Fase 4: Deploy Backend (15 min)

```bash
# 1. Build e push nova imagem
cd backend
docker build -t 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/backend:1.0.1 .
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/backend:1.0.1

# 2. Atualizar serviço ECS
aws ecs update-service \
  --cluster production-ysh-b2b-cluster \
  --service ysh-b2b-backend \
  --task-definition ysh-b2b-backend:7 \
  --desired-count 2 \
  --force-new-deployment \
  --profile ysh-production \
  --region us-east-1

# 3. Monitorar deployment
aws ecs describe-services \
  --cluster production-ysh-b2b-cluster \
  --services ysh-b2b-backend \
  --query "services[0].events[0:5]" \
  --output table \
  --profile ysh-production \
  --region us-east-1
```

### Fase 5: Logs & Monitoramento (5 min)

```bash
# 1. Verificar logs do backend
aws logs tail /ecs/ysh-b2b-backend \
  --follow \
  --profile ysh-production \
  --region us-east-1

# 2. Verificar health checks
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:773235999227:targetgroup/ysh-backend-tg/5d057ad67b1e08c0 \
  --profile ysh-production \
  --region us-east-1
```

---

## 🔒 Segurança: SSO & Autenticação

### Status Atual

- ❌ Sem SSO configurado
- ❌ Sem Cognito
- ✅ JWT básico implementado
- ✅ Cookie-based session management

### Recomendações Futuras

1. **AWS Cognito** (não urgente)
   - User pools para B2B
   - Identity pools para acesso AWS
   - MFA obrigatório para admins

2. **OAuth 2.0 / OIDC** (backlog)
   - Integração com provedores externos
   - Google Workspace
   - Microsoft Azure AD

3. **API Keys** (já implementado)
   - Publishable keys para storefront
   - Secret keys para integrações

---

## 📝 Checklist de Execução

### Desenvolvimento Local

- [x] PostgreSQL rodando (medusa_db)
- [x] Redis rodando
- [ ] Backend rodando (aguardando correção de workflows)
- [ ] Storefront rodando
- [ ] Migrations aplicadas

### AWS Production

- [x] Infraestrutura provisionada
- [ ] Secrets Manager atualizado
- [ ] Task definitions atualizadas (v7+)
- [ ] Backend deployment (0/2 → 2/2)
- [x] Storefront deployment (2/2)
- [ ] CloudWatch logs configurados
- [ ] Health checks passando

---

## 🎯 Próximos Passos Imediatos

1. **Limpar arquivos locais** (secrets obsoletos)
2. **Atualizar Secrets Manager** (DATABASE_URL com postgres/postgres)
3. **Corrigir workflows customizados** (conflitos com Medusa core)
4. **Executar migrações locais**
5. **Build e deploy backend atualizado**
6. **Validar health checks**
7. **Monitorar CloudWatch logs**

---

**Tempo Estimado Total**: 45-60 minutos  
**Risco**: 🟡 Médio (requer acesso AWS, downtime backend ~5min)  
**Prioridade**: 🔴 Alta (backend em produção não está rodando)
