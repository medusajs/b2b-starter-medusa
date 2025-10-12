# 🚀 Quick Start - Publishable Key Setup

## ⚡ Execução Rápida (15 minutos)

### Passo 1: Registrar Task Definition Combinada

```powershell
cd C:\Users\fjuni\ysh_medusa\ysh-store

aws ecs register-task-definition `
  --cli-input-json file://aws/backend-migrations-seed-task-definition.json `
  --region us-east-1 `
  --profile ysh-production `
  --query 'taskDefinition.[family,revision,status]' `
  --output json
```

**Saída esperada**:

```json
[
  "ysh-b2b-backend-migrations-with-seed",
  1,
  "ACTIVE"
]
```

---

### Passo 2: Executar Migrations + Seed + Create Key

```powershell
$TaskArn = aws ecs run-task `
  --cluster production-ysh-b2b-cluster `
  --task-definition ysh-b2b-backend-migrations-with-seed:1 `
  --launch-type FARGATE `
  --network-configuration "awsvpcConfiguration={subnets=[subnet-0f561c79c40d11c6f,subnet-03634efd78a887b0b],securityGroups=[sg-06563301eba0427b2],assignPublicIp=ENABLED}" `
  --region us-east-1 `
  --profile ysh-production `
  --query 'tasks[0].taskArn' `
  --output text

# Extrair Task ID
$TaskId = $TaskArn.Split('/')[-1]
Write-Host "Task ID: $TaskId"
```

---

### Passo 3: Monitorar Execução

```powershell
# Aguardar 60s para task iniciar
Start-Sleep -Seconds 60

# Verificar status
aws ecs describe-tasks `
  --cluster production-ysh-b2b-cluster `
  --tasks $TaskId `
  --region us-east-1 `
  --profile ysh-production `
  --query 'tasks[0].[lastStatus,containers[0].exitCode]' `
  --output json
```

**Status esperado**:

- `RUNNING` → Task executando (aguardar mais)
- `STOPPED` + `exitCode=0` → **Sucesso!** Prosseguir para Passo 4
- `STOPPED` + `exitCode=1` → **Falha!** Ver logs para diagnóstico

**Se RUNNING**, aguardar mais 60s e verificar novamente:

```powershell
Start-Sleep -Seconds 60

aws ecs describe-tasks `
  --cluster production-ysh-b2b-cluster `
  --tasks $TaskId `
  --region us-east-1 `
  --profile ysh-production `
  --query 'tasks[0].[lastStatus,containers[0].exitCode]' `
  --output json
```

---

### Passo 4: Extrair Publishable Key (CloudShell)

**⚠️ Este passo DEVE ser executado no AWS CloudShell** (problema de encoding no PowerShell)

```bash
# No CloudShell AWS
TASK_ID="66935a4c2b7742cbb5dd332fab40b85e"  # Substituir pelo Task ID do Passo 2

# Download do script
curl -O https://raw.githubusercontent.com/own-boldsbrain/ysh-b2b/main/scripts/extract-publishable-key.sh
chmod +x extract-publishable-key.sh

# Executar
./extract-publishable-key.sh $TASK_ID
```

**Saída esperada**:

```
📋 Obtendo logs do task 66935a4c2b7742cbb5dd332fab40b85e...
✅ Publishable Key encontrada: pk_a1b2c3d4e5f6...
📝 Atualizando Secrets Manager...
✅ Secret atualizado com sucesso!

🎯 Próximos passos:
1. Redeploy backend service...
```

---

### Passo 5: Redeploy Backend (PowerShell ou CloudShell)

```powershell
# PowerShell
aws ecs update-service `
  --cluster production-ysh-b2b-cluster `
  --service ysh-b2b-backend `
  --force-new-deployment `
  --region us-east-1 `
  --profile ysh-production `
  --query 'service.[serviceName,desiredCount,runningCount]' `
  --output json
```

Ou:

```bash
# CloudShell
aws ecs update-service \
  --cluster production-ysh-b2b-cluster \
  --service ysh-b2b-backend \
  --force-new-deployment \
  --region us-east-1 \
  --query 'service.[serviceName,desiredCount,runningCount]' \
  --output json
```

---

### Passo 6: Aguardar Backend Healthy (2/2 tasks)

```powershell
# PowerShell
while ($true) {
  $Status = aws ecs describe-services `
    --cluster production-ysh-b2b-cluster `
    --services ysh-b2b-backend `
    --region us-east-1 `
    --profile ysh-production `
    --query 'services[0].[runningCount,desiredCount]' `
    --output json | ConvertFrom-Json

  Write-Host "Backend: $($Status[0])/$($Status[1]) tasks running"
  
  if ($Status[0] -eq $Status[1]) {
    Write-Host "✅ Backend healthy!"
    break
  }
  
  Start-Sleep -Seconds 15
}
```

---

### Passo 7: Validar Publishable Key Funcionando

```powershell
# PowerShell
$PK = aws secretsmanager get-secret-value `
  --secret-id /ysh-b2b/publishable-key `
  --region us-east-1 `
  --profile ysh-production `
  --query 'SecretString' `
  --output text

Write-Host "Publishable Key: $PK"

# Obter ALB URL
$AlbDns = aws elbv2 describe-load-balancers `
  --names production-ysh-b2b-alb `
  --region us-east-1 `
  --profile ysh-production `
  --query 'LoadBalancers[0].DNSName' `
  --output text

Write-Host "ALB URL: http://$AlbDns"

# Testar endpoint /store/products
curl -H "x-publishable-api-key: $PK" "http://$AlbDns/store/products?limit=5"
```

**Resposta esperada** (HTTP 200):

```json
{
  "products": [
    {
      "id": "prod_01...",
      "title": "Kit Solar 5kW",
      "status": "published",
      ...
    }
  ],
  "count": 5
}
```

**Se erro 401**: Publishable key não está sendo reconhecida (backend ainda não pegou novo secret)

**Se erro 500**: Verificar logs do backend para diagnosticar

---

## 🔍 Troubleshooting

### Task Migrations Falhou (exitCode=1)

**Obter logs**:

```powershell
aws logs get-log-events `
  --log-group-name "/ecs/ysh-b2b-backend-migrations-with-seed" `
  --log-stream-name "ecs/migrations-and-seed/$TaskId" `
  --limit 100 `
  --region us-east-1 `
  --profile ysh-production `
  --query 'events[*].message' `
  --output text
```

**Erros comuns**:

1. **"no encryption"** → DATABASE_URL ainda sem SSL resolvido (ver DIAGNOSE_RDS_SSL.md)
2. **"table already exists"** → Database já tem dados, tudo OK (ignorar)
3. **"connection refused"** → Security group bloqueando PostgreSQL 5432

---

### Script extract-publishable-key.sh Não Encontrou Key

**Verificar manualmente nos logs**:

```bash
aws logs get-log-events \
  --log-group-name "/ecs/ysh-b2b-backend-migrations-with-seed" \
  --log-stream-name "ecs/migrations-and-seed/$TASK_ID" \
  --limit 500 \
  --region us-east-1 \
  --query 'events[*].message' \
  --output text | grep -i "publishable"
```

**Se não encontrar**: Seed script falhou antes de criar key. Ver logs completos para diagnóstico.

---

### Backend Ainda Usa Placeholder Após Redeploy

**Verificar valor do secret**:

```powershell
aws secretsmanager get-secret-value `
  --secret-id /ysh-b2b/publishable-key `
  --region us-east-1 `
  --profile ysh-production `
  --query 'SecretString' `
  --output text
```

**Se ainda for placeholder**: Script de extração não rodou corretamente.

**Se for key válida (`pk_...`)**: Backend precisa reiniciar tasks. Force new deployment novamente.

---

## ✅ Checklist Final

- [ ] Task migrations-with-seed completou (exitCode=0)
- [ ] Publishable key extraída dos logs (formato `pk_` + 64 hex)
- [ ] Secret `/ysh-b2b/publishable-key` atualizado (não é mais placeholder)
- [ ] Backend service redeployado (2/2 tasks healthy)
- [ ] Endpoint `/store/products` retorna 200 com key
- [ ] Endpoint `/store/products` retorna 401 sem key

**Se todos checkados**: ✅ **Publishable key configurada com sucesso!**

**Próximo passo**: Deploy da storefront (já usa mesmo secret automaticamente)
