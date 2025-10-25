# Post-Deployment Automation Scripts

Scripts PowerShell automatizados para executar todas as tarefas pós-deployment do YSH B2B Platform no AWS.

---

## 📋 Scripts Disponíveis

### **post-deployment.ps1** - Orquestrador Principal ⭐

Executa TODOS os passos pós-deployment automaticamente.

**Uso:**

```powershell
.\post-deployment.ps1 `
    -Environment production `
    -AdminEmail fernando@yellosolarhub.com `
    -AlertEmail suporte@yellosolarhub.com `
    -InteractiveMode
```

**Flags:**

- `-SkipECSDeploy`: Pula deploy do ECS
- `-SkipDatabase`: Pula setup do banco de dados
- `-SkipMonitoring`: Pula configuração de monitoramento
- `-SkipEnvConfig`: Pula configuração de environment
- `-InteractiveMode`: Pede confirmação em cada passo

---

### **1-deploy-ecs-tasks.ps1** - Deploy ECS

Registra task definitions e cria services ECS Fargate.

**O que faz:**

- ✅ Cria task definition do backend (Medusa.js)
- ✅ Cria task definition do storefront (Next.js)
- ✅ Configura networking (VPC, subnets, security groups)
- ✅ Associa com ALB target groups
- ✅ Aguarda services estabilizarem
- ✅ Salva task ARN para próximo script

**Uso:**

```powershell
.\1-deploy-ecs-tasks.ps1 `
    -Environment production `
    -SSOProfile ysh-production `
    -Region us-east-1
```

**Flags:**

- `-SkipBackend`: Pula deploy do backend
- `-SkipStorefront`: Pula deploy do storefront
- `-BackendImage`: Custom Docker image URI (padrão: node:20-alpine)
- `-StorefrontImage`: Custom Docker image URI

**Outputs:**

- Backend service: `production-ysh-backend`
- Storefront service: `production-ysh-storefront`
- Task ARN salvo em: `.backend-task-arn`

**Tempo:** ~5-10 minutos

---

### **2-setup-database.ps1** - Setup Banco de Dados

Executa migrations, seed e cria admin user via ECS Exec.

**O que faz:**

- ✅ Conecta ao container backend via ECS Exec
- ✅ Executa `yarn medusa db:migrate`
- ✅ Executa `yarn run seed` (dados demo)
- ✅ Cria admin user: `yarn medusa user -e ... -p ... -i admin_ysh`
- ✅ Verifica backend health endpoint

**Uso:**

```powershell
.\2-setup-database.ps1 `
    -Environment production `
    -AdminEmail fernando@yellosolarhub.com
```

**Flags:**

- `-SkipMigrations`: Pula migrations
- `-SkipSeed`: Pula seed de dados
- `-SkipAdminUser`: Pula criação de admin user
- `-AdminPassword`: Password do admin (será solicitado se omitido)

**Pré-requisitos:**

- ECS Exec deve estar habilitado no service
- Task backend deve estar rodando (RUNNING status)

**Troubleshooting:**
Se ECS Exec não funcionar, habilite com:

```powershell
aws ecs update-service `
    --cluster production-ysh-cluster `
    --service production-ysh-backend `
    --enable-execute-command `
    --force-new-deployment `
    --profile ysh-production
```

**Tempo:** ~2-5 minutos

---

### **3-setup-monitoring.ps1** - Configuração de Monitoramento

Cria CloudWatch alarms e billing alerts.

**O que faz:**

- ✅ Cria SNS topic para alerts
- ✅ Subscreve email para notificações
- ✅ Cria alarmes CloudWatch:
  - ALB 5xx errors (>10 errors/5min)
  - ALB unhealthy targets (>=1)
  - RDS CPU (>80%)
  - ECS Backend CPU (>80%)
  - ECS Backend Memory (>80%)
  - ECS Storefront CPU (>80%)
  - ECS Storefront Memory (>80%)
- ✅ Cria billing alerts ($10, $15, $20)
- ✅ Cria CloudWatch dashboard

**Uso:**

```powershell
.\3-setup-monitoring.ps1 `
    -Environment production `
    -AlertEmail suporte@yellosolarhub.com `
    -BillingThreshold 20
```

**Flags:**

- `-SkipBillingAlerts`: Pula billing alerts
- `-SkipCloudWatchAlarms`: Pula CloudWatch alarms
- `-BillingThreshold`: Threshold máximo em USD (padrão: 20)

**Importante:**

- ⚠️ **Confirme a subscription do email** (cheque inbox)
- Billing alerts são criados em `us-east-1` (required)
- Dashboard URL será exibido ao final

**Tempo:** ~3-5 minutos

---

### **4-configure-env.ps1** - Configuração de Environment

Atualiza storefront com publishable key e domain URLs.

**O que faz:**

- ✅ Obtém domínio e URLs do CloudFormation
- ✅ Solicita publishable key do Medusa admin
- ✅ Atualiza Secrets Manager com key
- ✅ Cria `.env.production` local
- ✅ Reinicia storefront service (opcional)
- ✅ Verifica acessibilidade do storefront

**Uso:**

```powershell
.\4-configure-env.ps1 `
    -Environment production `
    -PublishableKey pk_xxxxx `
    -UpdateSecretsManager `
    -RestartStorefront
```

**Flags:**

- `-UpdateSecretsManager`: Atualiza Secrets Manager
- `-RestartStorefront`: Reinicia service após update
- `-PublishableKey`: Key (será solicitado se omitido)

**Como obter publishable key:**

1. Acesse: `https://api.yellosolarhub.store/app`
2. Login com admin credentials
3. Settings → Publishable API Keys
4. Copie key que começa com `pk_`

**Outputs:**

- `.env.production` criado em `storefront/`
- Secrets Manager atualizado
- Storefront reiniciado (se flag usada)

**Tempo:** ~2-3 minutos + 3-5 min para reiniciar service

---

## 🚀 Quick Start

### **Opção 1: Tudo Automatizado (Recomendado)**

```powershell
cd C:\Users\fjuni\ysh_medusa\ysh-store\aws

.\post-deployment.ps1 `
    -Environment production `
    -AdminEmail fernando@yellosolarhub.com `
    -AlertEmail suporte@yellosolarhub.com `
    -InteractiveMode
```

**Tempo total:** ~15-25 minutos

**Interações necessárias:**

1. Confirmar início
2. Fornecer admin password
3. Fornecer publishable key (após criar no admin)

---

### **Opção 2: Passo a Passo**

#### **1. Deploy ECS Tasks**

```powershell
.\1-deploy-ecs-tasks.ps1 -Environment production
```

Aguarde services ficarem RUNNING (~5 min)

#### **2. Setup Database**

```powershell
#### **2. Setup Database**
```powershell
.\2-setup-database.ps1 -AdminEmail fernando@yellosolarhub.com
```

```

Forneça password quando solicitado

#### **3. Configure Monitoring**

```powershell
#### **3. Configure Monitoring**
```powershell
.\3-setup-monitoring.ps1 -AlertEmail suporte@yellosolarhub.com
```

```

Confirme email subscription

#### **4. Configure Environment**

```powershell
# Primeiro, obtenha publishable key do admin
.\4-configure-env.ps1 -PublishableKey pk_xxxxx -UpdateSecretsManager -RestartStorefront
```

---

## 📊 Pré-requisitos

### **Antes de executar os scripts:**

- ✅ CloudFormation stack deployado com sucesso
- ✅ AWS SSO configurado e autenticado
- ✅ Docker images disponíveis (ou usar padrão node:20-alpine)
- ✅ Email válido para alerts

### **Verificar pré-requisitos:**

```powershell
# Check stack
aws cloudformation describe-stacks --stack-name production-ysh-stack --profile ysh-production

# Check SSO
aws sts get-caller-identity --profile ysh-production

# Check ECS cluster
aws ecs describe-clusters --clusters production-ysh-cluster --profile ysh-production
```

---

## 🔍 Troubleshooting

### **Issue: "No running backend tasks found"**

**Causa:** ECS service não foi criado ou task não está rodando

**Fix:**

```powershell
# Check service status
aws ecs describe-services `
    --cluster production-ysh-cluster `
    --services production-ysh-backend `
    --profile ysh-production

# If not exists, run deploy script
.\1-deploy-ecs-tasks.ps1
```

---

### **Issue: "ECS Exec failed"**

**Causa:** Execute command não habilitado no service

**Fix:**

```powershell
aws ecs update-service `
    --cluster production-ysh-cluster `
    --service production-ysh-backend `
    --enable-execute-command `
    --force-new-deployment `
    --profile ysh-production

# Wait for new task to start, then retry
.\2-setup-database.ps1
```

---

### **Issue: "Invalid publishable key format"**

**Causa:** Key não começa com `pk_`

**Fix:**

1. Acesse admin dashboard: `https://api.yellosolarhub.store/app`
2. Login com admin credentials
3. Settings → Publishable API Keys
4. **Create new key** se não existir
5. Copy key completo (deve começar com `pk_`)

---

### **Issue: "Email subscription pending"**

**Causa:** Email não confirmado no SNS

**Fix:**

1. Cheque inbox do email fornecido
2. Clique no link de confirmação da AWS
3. Re-execute monitoring script se necessário

---

### **Issue: "Storefront shows 500 errors"**

**Causa:** Publishable key incorreto ou CORS issues

**Fix:**

```powershell
# Check backend logs
aws logs tail /aws/ecs/production-ysh-backend --follow --profile ysh-production

# Check storefront logs
aws logs tail /aws/ecs/production-ysh-storefront --follow --profile ysh-production

# Verify publishable key in Secrets Manager
aws secretsmanager get-secret-value `
    --secret-id <secrets-arn> `
    --profile ysh-production

# Update and restart if needed
.\4-configure-env.ps1 -PublishableKey pk_xxxxx -UpdateSecretsManager -RestartStorefront
```

---

## 📈 Monitoramento Pós-Deploy

### **View CloudWatch Logs**

```powershell
# Backend logs (real-time)
aws logs tail /aws/ecs/production-ysh-backend --follow --profile ysh-production

# Storefront logs (real-time)
aws logs tail /aws/ecs/production-ysh-storefront --follow --profile ysh-production

# Last 1 hour
aws logs tail /aws/ecs/production-ysh-backend --since 1h --profile ysh-production
```

### **Check ECS Service Status**

```powershell
# List running tasks
aws ecs list-tasks --cluster production-ysh-cluster --profile ysh-production

# Describe specific service
aws ecs describe-services `
    --cluster production-ysh-cluster `
    --services production-ysh-backend `
    --profile ysh-production
```

### **Check CloudWatch Alarms**

```powershell
# List all alarms
aws cloudwatch describe-alarms --profile ysh-production

# Check specific alarm
aws cloudwatch describe-alarms `
    --alarm-names "production-ysh-alb-5xx-errors" `
    --profile ysh-production
```

### **Test Endpoints**

```powershell
# Backend health
curl https://api.yellosolarhub.store/health

# Storefront
curl -I https://yellosolarhub.store

# Products API (requires publishable key)
curl -H "x-publishable-api-key: pk_xxxxx" https://api.yellosolarhub.store/store/products
```

---

## 🔄 Updates & Maintenance

### **Restart Services**

```powershell
# Restart backend
aws ecs update-service `
    --cluster production-ysh-cluster `
    --service production-ysh-backend `
    --force-new-deployment `
    --profile ysh-production

# Restart storefront
aws ecs update-service `
    --cluster production-ysh-cluster `
    --service production-ysh-storefront `
    --force-new-deployment `
    --profile ysh-production
```

### **Update Environment Variables**

```powershell
# Update Secrets Manager
aws secretsmanager put-secret-value `
    --secret-id <arn> `
    --secret-string '{"KEY":"value"}' `
    --profile ysh-production

# Restart services to pick up changes
.\1-deploy-ecs-tasks.ps1
```

### **Scale Services**

```powershell
# Scale to 2 tasks
aws ecs update-service `
    --cluster production-ysh-cluster `
    --service production-ysh-backend `
    --desired-count 2 `
    --profile ysh-production
```

---

## ✅ Success Checklist

**After running all scripts:**

- [ ] ECS services running: `production-ysh-backend`, `production-ysh-storefront`
- [ ] Database migrations completed
- [ ] Database seeded with demo data
- [ ] Admin user created and can login
- [ ] CloudWatch alarms active (check SNS email confirmation)
- [ ] Billing alerts configured
- [ ] Publishable key configured in storefront
- [ ] Storefront loads: `https://yellosolarhub.store`
- [ ] Admin dashboard accessible: `https://api.yellosolarhub.store/app`
- [ ] Backend health check returns 200: `/health`
- [ ] No errors in CloudWatch logs

---

## 📞 Support

### **View Logs**

- Backend: `aws logs tail /aws/ecs/production-ysh-backend --follow`
- Storefront: `aws logs tail /aws/ecs/production-ysh-storefront --follow`

### **Check Status**

- ECS Console: <https://us-east-1.console.aws.amazon.com/ecs>
- CloudWatch Console: <https://us-east-1.console.aws.amazon.com/cloudwatch>
- Billing Console: <https://console.aws.amazon.com/billing>

### **Common Commands**

```powershell
# Re-run full setup
.\post-deployment.ps1 -InteractiveMode

# Re-run specific step
.\1-deploy-ecs-tasks.ps1
.\2-setup-database.ps1
.\3-setup-monitoring.ps1
.\4-configure-env.ps1

# View CloudFormation outputs
aws cloudformation describe-stacks `
    --stack-name production-ysh-stack `
    --query 'Stacks[0].Outputs' `
    --profile ysh-production
```

---

**🎉 Ready to automate YSH B2B post-deployment!**

**Start here:** `.\post-deployment.ps1 -InteractiveMode`
