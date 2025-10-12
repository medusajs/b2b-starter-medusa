# 🎯 Plano de Execução Final - Deployment 100% Funcional

**Status**: 95% Completo | **Tempo Restante**: ~19 minutos | **Última Atualização**: 2025-01-10

---

## 📊 Status Atual

### ✅ Infraestrutura Completa (100%)

- **CloudFormation**: Stack `ysh-b2b-infrastructure` em CREATE_COMPLETE
- **VPC**: vpc-096abb11405bb44af com subnets públicas e privadas
- **RDS**: PostgreSQL 15.14 disponível (production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com)
- **Redis**: ElastiCache 7.0 disponível (production-ysh-b2b-redis.97x7fb.0001.use1.cache.amazonaws.com)
- **ALB**: Load balancer ativo (production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com)
- **ECS Cluster**: production-ysh-b2b-cluster com 2 serviços
- **Security Groups**: Todos configurados corretamente (ECS pode acessar RDS e Redis)

### ✅ Configuração Completa (100%)

- **8 Secrets Manager**: DATABASE_URL com password corrigido e URL-encoded
- **Task Definitions**: backend:6 e storefront:8 registrados com ARNs corretos
- **Storefront**: ✅ **2/2 tasks RUNNING** e healthy
- **Backend**: ⏳ **0/2 tasks** (aguardando database medusa_db)

### ⏳ Database Pendente (5%)

**Problema**: Database `medusa_db` não existe em RDS (apenas `postgres` default existe)

**Solução**: Criação manual via bastion host (tentativas automatizadas via SSM falharam por encoding)

---

## 🚀 Plano de Execução Otimizado

### **TASK 1: Criar Database (MANUAL - 4 minutos)**

**Prioridade**: P0 BLOCKER - Todas as outras tasks dependem disto

**Passos**:

1. **AWS Console** → EC2 → Instances
2. Selecionar instância **i-0a8874f3890bb28c3** (bastion)
3. **Connect** → **Session Manager** → **Connect**
4. Executar comandos:

```bash
# Instalar cliente PostgreSQL
sudo dnf install -y postgresql15

# Criar database
PGPASSWORD='bJwPx-g-u9?lt!O[[EG2:Kzj[cs~' psql \
  -h production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com \
  -U medusa_user \
  -d postgres \
  -c 'CREATE DATABASE medusa_db;'
```

**Output esperado**: `CREATE DATABASE`

**Se falhar**: Verificar password, hostname, conectividade (security group já validado)

---

### **TASK 2-10: Script Automatizado (15 minutos)**

Após Task 1 completar, executar **script automatizado**:

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store
.\deploy-final.ps1 -SkipDatabaseCreation
```

**O script executa automaticamente**:

| Task | Ação | Tempo | Status Check |
|------|------|-------|--------------|
| **2** | Force redeploy backend | 1 min | Service updated |
| **3** | Aguardar backend 2/2 tasks | 2 min | `runningCount=2` |
| **4** | Database migrations | 3 min | Task STOPPED exitCode=0 |
| **5** | Seed data (511 SKUs + 101 Kits) | 5 min | Task STOPPED exitCode=0 |
| **6** | Health check /health | 30s | HTTP 200 OK |
| **7** | Health check storefront / | 30s | HTTP 200 OK |
| **8** | Catalog API smoke tests | 1 min | JSON com dados |
| **9** | Verificar target groups | 30s | 4/4 healthy |
| **10** | Cleanup bastion (opcional) | 1 min | Instance terminated |

**Total**: ~15 minutos após Task 1

---

## 🔍 Validação de Sucesso

Após executar o script, validar:

### 1. Backend Health

```powershell
curl http://production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com/health
```

**Esperado**: `{"status":"ok"}` (HTTP 200)

### 2. Storefront Acessível

```powershell
curl http://production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com/
```

**Esperado**: HTML da homepage (HTTP 200)

### 3. Catalog API

```powershell
curl http://production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com/store/catalog/manufacturers
```

**Esperado**: JSON com 37 manufacturers

### 4. ECS Tasks

```powershell
aws ecs describe-services --cluster production-ysh-b2b-cluster --services ysh-b2b-backend ysh-b2b-storefront --query "services[*].[serviceName,runningCount,desiredCount]" --output table --profile ysh-production --region us-east-1
```

**Esperado**:

```
ysh-b2b-backend      2  2
ysh-b2b-storefront   2  2
```

### 5. Target Groups Health

```powershell
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:us-east-1:773235999227:targetgroup/ysh-backend-tg/5d057ad67b1e08c0 --query "TargetHealthDescriptions[*].TargetHealth.State" --output table --profile ysh-production --region us-east-1
```

**Esperado**: Todos targets em `healthy`

---

## 🛡️ Plano de Rollback (Se Necessário)

### Se Migrations Falharem

```powershell
# Verificar logs
aws logs tail /ecs/ysh-b2b-backend --since 5m --follow --profile ysh-production --region us-east-1

# Drop database e recriar (via Session Manager no bastion)
PGPASSWORD='...' psql -h ... -U medusa_user -d postgres -c 'DROP DATABASE medusa_db;'
PGPASSWORD='...' psql -h ... -U medusa_user -d postgres -c 'CREATE DATABASE medusa_db;'

# Re-executar script
.\deploy-final.ps1 -SkipDatabaseCreation
```

### Se Seed Falhar

```powershell
# Verificar se migrations completaram
aws logs tail /ecs/ysh-b2b-backend --since 5m --profile ysh-production --region us-east-1

# Re-executar apenas seed task
aws ecs run-task --cluster production-ysh-b2b-cluster --task-definition ysh-b2b-backend:6 --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[subnet-0a7620fdf057a8824,subnet-09c23e75aed3a5d76],securityGroups=[sg-06563301eba0427b2],assignPublicIp=DISABLED}" --overrides '{\"containerOverrides\":[{\"name\":\"ysh-b2b-backend\",\"command\":[\"yarn\",\"run\",\"seed\"]}]}' --profile ysh-production --region us-east-1
```

### Se Backend Não Subir

```powershell
# 1. Verificar DATABASE_URL secret
aws secretsmanager get-secret-value --secret-id /ysh-b2b/database-url --query SecretString --output text --profile ysh-production --region us-east-1

# 2. Verificar conectividade RDS
aws rds describe-db-instances --db-instance-identifier production-ysh-b2b-postgres --query "DBInstances[0].Endpoint" --profile ysh-production --region us-east-1

# 3. Verificar Security Groups
aws ec2 describe-security-groups --group-ids sg-06563301eba0427b2 sg-0ed77cd5394f86cad --query "SecurityGroups[*].[GroupId,IpPermissions]" --profile ysh-production --region us-east-1

# 4. Verificar logs detalhados
aws logs tail /ecs/ysh-b2b-backend --since 10m --follow --profile ysh-production --region us-east-1
```

---

## 📝 Próximos Passos (Pós-Deployment)

### Imediato (P1)

1. ✅ Verificar todas as smoke tests passaram
2. ✅ Confirmar 4/4 targets healthy nos target groups
3. ✅ Atualizar PRE_FLIGHT_CHECKLIST.md com status final

### Curto Prazo (P1)

4. 🔧 Configurar domínio personalizado (Route 53)
5. 🔒 Adicionar certificado SSL (AWS ACM)
6. 📊 Configurar CloudWatch Alarms (CPU, Memory, Target Health)
7. 📋 Configurar CloudWatch Logs retention (7 dias recomendado)

### Médio Prazo (P2)

8. 🎨 Implementar Gap P0: Página de comparação de preços
9. 🔐 Configurar AWS WAF para ALB
10. 💾 Configurar RDS automated backups (retention 7 dias)
11. 🚀 Configurar ECS auto-scaling policies

---

## 🎯 Timeline de Execução

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Agora → Task 1 Manual (4 min) → Script Automatizado (15 min)  │
│                                                                 │
│  ├─ 0-4 min:    Criar database via Session Manager              │
│  ├─ 4-5 min:    Redeploy backend                                │
│  ├─ 5-7 min:    Aguardar backend 2/2 tasks                      │
│  ├─ 7-10 min:   Database migrations                             │
│  ├─ 10-15 min:  Seed data (511 SKUs + 101 Kits)                 │
│  ├─ 15-17 min:  Smoke tests (health + catalog APIs)             │
│  ├─ 17-18 min:  Verificar target groups                         │
│  ├─ 18-19 min:  Cleanup bastion (opcional)                      │
│  └─ 19 min:     🎉 DEPLOYMENT 100% FUNCIONAL!                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Referências Rápidas

### Endpoints

- **ALB**: <http://production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com>
- **Backend Health**: http://...-alb-....elb.amazonaws.com/health
- **Storefront**: http://...-alb-....elb.amazonaws.com/
- **Catalog API**: http://...-alb-....elb.amazonaws.com/store/catalog/manufacturers

### ARNs Críticos

- **Backend TG**: arn:aws:elasticloadbalancing:us-east-1:773235999227:targetgroup/ysh-backend-tg/5d057ad67b1e08c0
- **Storefront TG**: arn:aws:elasticloadbalancing:us-east-1:773235999227:targetgroup/ysh-storefront-tg/de48968877cc252d
- **ECS Cluster**: arn:aws:ecs:us-east-1:773235999227:cluster/production-ysh-b2b-cluster
- **Database URL Secret**: arn:aws:secretsmanager:us-east-1:773235999227:secret:/ysh-b2b/database-url-BGaeVF

### IDs de Recursos

- **VPC**: vpc-096abb11405bb44af
- **Private Subnets**: subnet-0a7620fdf057a8824, subnet-09c23e75aed3a5d76
- **ECS SG**: sg-06563301eba0427b2
- **RDS SG**: sg-0ed77cd5394f86cad
- **Bastion**: i-0a8874f3890bb28c3

### Credenciais

- **RDS Master User**: medusa_user
- **RDS Password**: bJwPx-g-u9?lt!O[[EG2:Kzj[cs~ (armazenado em Secrets Manager auto-managed)
- **DATABASE_URL**: postgresql://medusa_user:bJwPx-g-u9%3Flt%21O%5B%5BEG2%3AKzj%5Bcs~@production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com:5432/medusa_db

---

## ✅ Checklist de Execução

### Preparação

- [x] CloudFormation stack deployed
- [x] Secrets Manager configurado (8 secrets)
- [x] Task definitions registrados (backend:6, storefront:8)
- [x] Storefront running (2/2 tasks)
- [x] Bastion host criado (i-0a8874f3890bb28c3)
- [x] RDS password recuperado de auto-managed secret
- [x] DATABASE_URL corrigido com URL-encoding

### Execução

- [ ] **Task 1**: Criar database medusa_db via Session Manager → **VOCÊ ESTÁ AQUI** 🎯
- [ ] **Task 2-10**: Executar `.\deploy-final.ps1 -SkipDatabaseCreation`

### Validação

- [ ] Backend health check (HTTP 200)
- [ ] Storefront acessível (HTTP 200)
- [ ] Catalog API retorna dados (37 manufacturers)
- [ ] Backend 2/2 tasks RUNNING
- [ ] Target groups 4/4 healthy
- [ ] Bastion terminated (cleanup)

### Pós-Deployment

- [ ] PRE_FLIGHT_CHECKLIST.md atualizado
- [ ] Domínio configurado (P1)
- [ ] SSL configurado (P1)
- [ ] CloudWatch alarms (P1)
- [ ] Gap P0 implementado (P2)

---

## 🎉 Resultado Final Esperado

Após completar este plano:

✅ **Backend**: 2/2 tasks RUNNING e healthy  
✅ **Storefront**: 2/2 tasks RUNNING e healthy  
✅ **Database**: `medusa_db` criado com todas as tabelas e seed data  
✅ **Catalog**: 511 SKUs + 101 Kits + 37 Manufacturers carregados  
✅ **APIs**: Todas respondendo corretamente via ALB  
✅ **Health**: Todos os endpoints respondendo HTTP 200  

**Sistema 100% funcional pronto para produção!** 🚀

---

**Última Revisão**: 2025-01-10  
**Autor**: GitHub Copilot  
**Aprovação**: Pendente execução Task 1
