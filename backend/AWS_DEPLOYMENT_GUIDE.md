# 🚀 AWS Deployment Guide - Catalog Integration

**Data:** 22 de outubro de 2025  
**Status:** ✅ Migração e Import Completos | ⏳ Deploy Docker Pendente

---

## ✅ Completed Steps

### 1. ✅ Database Migration (RDS Production)
- **Status**: Deployed successfully
- **Tables**: `catalog`, `catalog_categories` + 5 views
- **Indexes**: 14 indexes created (SKU, category, manufacturer, price, power, search)
- **Functions**: 3 SQL functions (find_similar, increment_views, increment_widgets)
- **Triggers**: Auto-update timestamps and search vectors

```bash
# Migration executed via:
node scripts/run-rds-migration.js database/migrations/003-create-catalog-table.sql
```

### 2. ✅ Catalog Import (RDS Production)
- **Status**: 574/1138 products imported (50.4%)
- **Total Value**: R$ 2.838.463,77
- **Categories**: 20 distinct
- **Manufacturers**: 14 distinct
- **Failed**: 564 products (missing required fields per constraints)

```bash
# Import executed via:
node scripts/import-catalog-to-rds.js
```

### 3. ✅ Code Committed to GitHub
- **Commit**: a2e539bc
- **Branch**: main
- **Files**: 5 new files (migration, validators, helpers, import scripts, docs)

---

## ⏳ Pending Steps - Manual Deployment

### Step 3/4: Build & Push Docker Images

#### 3.1. Commit Latest Changes

```bash
git add scripts/import-catalog-to-rds.js scripts/run-rds-migration.js scripts/check-rds-schema.js AWS_RDS_CONNECTION_SETUP.md
git commit -m "feat: Add RDS deployment scripts and update import for production schema"
git push origin main
```

#### 3.2. Build Backend Image

```powershell
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 773235999227.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t ysh-backend:latest -f Dockerfile .

# Tag for ECR
docker tag ysh-backend:latest 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest
docker tag ysh-backend:latest 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:catalog-integration-$(date +%Y%m%d)

# Push to ECR
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:catalog-integration-$(date +%Y%m%d)
```

#### 3.3. Verify Image in ECR

```powershell
aws ecr describe-images --repository-name ysh-backend --region us-east-1 --query "imageDetails[?imageTags[?contains(@, 'latest')]].{Tags:imageTags,Pushed:imagePushedAt,Size:imageSizeInBytes}" --output table
```

---

### Step 4/4: Update ECS Services

#### 4.1. Get Current Task Definition

```powershell
$STACK="ysh-b2b-production"
$REGION="us-east-1"

# List ECS services in CloudFormation stack
aws cloudformation describe-stack-resources --region $REGION --stack-name $STACK --query "StackResources[?ResourceType=='AWS::ECS::Service'].{LogicalId:LogicalResourceId,PhysicalId:PhysicalResourceId}" --output table
```

#### 4.2. Update Task Definition (via CloudFormation)

Se o stack foi criado via CloudFormation, a melhor opção é fazer update do stack:

```powershell
# Option A: Update via CloudFormation (recomendado)
aws cloudformation update-stack `
  --region $REGION `
  --stack-name $STACK `
  --use-previous-template `
  --parameters ParameterKey=BackendImageTag,ParameterValue=latest `
  --capabilities CAPABILITY_IAM

# Monitor update
aws cloudformation wait stack-update-complete --region $REGION --stack-name $STACK
aws cloudformation describe-stacks --region $REGION --stack-name $STACK --query "Stacks[0].StackStatus"
```

#### 4.3. Force New Deployment (Manual Option)

Se preferir fazer deploy manual sem atualizar o stack:

```powershell
# Get cluster and service names
$CLUSTER=$(aws ecs list-clusters --region $REGION --query "clusterArns[?contains(@,'ysh')]" --output text | Split-Path -Leaf)
$SERVICES=$(aws ecs list-services --region $REGION --cluster $CLUSTER --query "serviceArns" --output text)

# Force new deployment for each service
foreach ($SERVICE in $SERVICES) {
  $SVC_NAME = $SERVICE | Split-Path -Leaf
  Write-Host "Deploying service: $SVC_NAME"
  
  aws ecs update-service `
    --region $REGION `
    --cluster $CLUSTER `
    --service $SVC_NAME `
    --force-new-deployment
}
```

#### 4.4. Monitor Deployment

```powershell
# Watch service status
aws ecs describe-services --region $REGION --cluster $CLUSTER --services $SVC_NAME --query "services[0].{Status:status,Running:runningCount,Desired:desiredCount,Events:events[0:3]}" --output table

# Check task logs (if CloudWatch enabled)
aws logs tail /ecs/ysh-b2b-backend --follow --region $REGION
```

---

## 🧪 Post-Deployment Validation

### 1. Health Check

```bash
# Check backend API
curl https://api.yshsolar.com/health
curl https://api.yshsolar.com/store/products

# Test catalog endpoint (if exposed)
curl https://api.yshsolar.com/catalog?category=inversores&limit=10
```

### 2. Database Validation

```bash
# Via SSH tunnel (for debugging)
node -e "import('pg').then(({default:pg})=>{const c=new pg.Client({host:'127.0.0.1',port:59588,user:'supabase_admin',password:'po5lwIAe_kKb5Ham0nPr2qeah2CGDNys',database:'postgres',ssl:{rejectUnauthorized:false}});c.connect().then(()=>c.query('SELECT COUNT(*), COUNT(DISTINCT category), ROUND(SUM(price_brl)::numeric,2) FROM catalog WHERE is_active=true')).then(r=>{console.log('Active Products:',r.rows[0]);c.end()}).catch(e=>{console.error(e.message);c.end()})})"
```

### 3. Monitor Logs

```powershell
# CloudWatch Logs
aws logs tail /ecs/ysh-b2b-backend --follow --region us-east-1 --filter-pattern "ERROR"

# Check for errors
aws logs filter-log-events --log-group-name /ecs/ysh-b2b-backend --region us-east-1 --start-time $(Get-Date).AddHours(-1).ToUniversalTime().ToString("o") --filter-pattern "catalog" --query "events[*].message" --output text
```

---

## 📊 Deployment Checklist

- [x] Migração SQL executada no RDS
- [x] Catálogo importado (574 produtos)
- [x] Código commitado no GitHub
- [ ] Imagem Docker built localmente
- [ ] Imagem pushed para ECR
- [ ] ECS task definitions atualizadas
- [ ] ECS services deployed
- [ ] Health checks passing
- [ ] Logs validados (sem erros críticos)
- [ ] Endpoints de catálogo testados
- [ ] Performance baseline capturado

---

## 🆘 Troubleshooting

### Image Build Fails

```bash
# Check Dockerfile syntax
docker build --no-cache -t ysh-backend:test -f Dockerfile . 2>&1 | tee build.log

# Check dependencies
npm ci
npm run build
```

### ECR Push Fails

```powershell
# Re-authenticate
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 773235999227.dkr.ecr.us-east-1.amazonaws.com

# Check repository exists
aws ecr describe-repositories --repository-names ysh-backend --region us-east-1
```

### ECS Service Won't Start

```powershell
# Check task definition
aws ecs describe-task-definition --task-definition ysh-b2b-backend --region us-east-1

# Check stopped tasks
aws ecs list-tasks --cluster $CLUSTER --region us-east-1 --desired-status STOPPED --query "taskArns[0]" --output text | ForEach-Object {
  aws ecs describe-tasks --cluster $CLUSTER --tasks $_ --region us-east-1 --query "tasks[0].{StoppedReason:stoppedReason,Containers:containers[*].{Name:name,Reason:reason,ExitCode:exitCode}}"
}
```

### Database Connection Issues

```bash
# Verify RDS security group allows ECS tasks
aws ec2 describe-security-groups --region us-east-1 --filters "Name=tag:Name,Values=*rds*" --query "SecurityGroups[*].{ID:GroupId,Name:GroupName,Ingress:IpPermissions[*].{Port:FromPort,Sources:UserIdGroupPairs[*].GroupId}}"

# Test connection from ECS task
aws ecs execute-command --cluster $CLUSTER --task $TASK_ARN --container backend --region us-east-1 --interactive --command "/bin/bash"
# Inside container:
psql $DATABASE_URL -c "SELECT version();"
```

---

## 📞 Support

- **AWS Account**: 773235999227
- **Region**: us-east-1
- **Stack**: ysh-b2b-production
- **ECR Repo**: ysh-backend
- **RDS Endpoint**: ysh-b2b-production-supabase-db.cmxiy0wqok6l.us-east-1.rds.amazonaws.com

---

## 🎯 Next Features

After successful deployment, consider:

1. **API Endpoints**: Criar endpoints REST para consultar catálogo
2. **Search API**: Implementar busca full-text usando `search_vector`
3. **Cache Layer**: Adicionar Redis para cache de queries frequentes
4. **Analytics**: Implementar tracking de views e renders via `increment_view_count()`
5. **CDN Integration**: Configurar CloudFront para servir imagens do catálogo
6. **Admin Panel**: Interface para gerenciar produtos, preços e estoque

---

**Generated:** 22/10/2025 01:30 BRT  
**By:** GitHub Copilot (Claude Sonnet 4.5)
