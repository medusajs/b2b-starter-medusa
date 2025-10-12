# 🚀 Quick Start: Correção e Redeployment

> **Status Atual**: Backend AWS offline (0/2 tasks) | Storefront OK (2/2 tasks)  
> **Ação Requerida**: Atualizar secrets + Redeploy backend  
> **Tempo Estimado**: 45 minutos

---

## 📋 Checklist Rápido

### 1. Desenvolvimento Local

```powershell
cd backend

# Limpar cache
Remove-Item .medusa -Recurse -Force

# Executar migrações
npm run migrate

# Criar admin
npx medusa user -e admin@test.com -p supersecret -i admin

# Iniciar backend
docker-compose up -d backend

# Ver logs
docker-compose logs backend -f
```

**✅ Sucesso se**: Backend responde em `http://localhost:9000/health`

---

### 2. Atualizar AWS Secrets

```powershell
cd scripts
.\update-aws-secrets.ps1
```

**Atualiza**:
- `/ysh-b2b/database-url` → credenciais corretas (postgres/postgres)
- `/ysh-b2b/jwt-secret` → gerado automaticamente
- `/ysh-b2b/cookie-secret` → gerado automaticamente

---

### 3. Redeploy Backend AWS

```powershell
# Build
cd backend
docker build -t 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/backend:1.0.1 .

# Login ECR
aws ecr get-login-password --region us-east-1 --profile ysh-production | `
    docker login --username AWS --password-stdin 773235999227.dkr.ecr.us-east-1.amazonaws.com

# Push
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/backend:1.0.1

# Deploy
cd ../scripts
.\deploy-ecs.ps1 -Service backend -ImageTag 1.0.1
```

**✅ Sucesso se**: 2/2 tasks rodando + health check OK

---

## 📊 Validação

### Health Checks

```bash
# Local
curl http://localhost:9000/health

# AWS
curl http://production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com/health
```

### CloudWatch Logs

```powershell
aws logs tail /ecs/ysh-b2b-backend --follow --profile ysh-production --region us-east-1
```

---

## 📚 Documentação Completa

| Arquivo | Descrição |
|---------|-----------|
| `DEPLOYMENT_EXECUTIVE_SUMMARY.md` | Resumo executivo completo |
| `AWS_DEPLOYMENT_STATUS.md` | Status detalhado da AWS |
| `scripts/update-aws-secrets.ps1` | Script de atualização de secrets |
| `scripts/deploy-ecs.ps1` | Script de deployment ECS |

---

## ⚠️ Troubleshooting

### Erro: "database medusa_db does not exist"

```powershell
docker exec ysh-b2b-postgres psql -U postgres -c "CREATE DATABASE medusa_db;"
npm run migrate
```

### Erro: "Workflow cancel-order already exists"

**Corrigido**: Renomeado para `ysh-cancel-order` em `fulfill-order.ts`

### Erro: "Task definition not found"

```powershell
# Registrar manualmente
cd aws
aws ecs register-task-definition --cli-input-json file://backend-task-definition.json `
    --profile ysh-production --region us-east-1
```

---

**🎯 Objetivo**: Backend AWS rodando com 2/2 tasks + health checks passando  
**⏱️ ETA**: 45 minutos  
**👤 Owner**: Você (executar scripts acima)
