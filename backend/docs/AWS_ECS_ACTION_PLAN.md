# 🚨 AWS ECS - Sumário Executivo e Plano de Ação

**Data:** 13 de Outubro de 2025  
**Status:** ❌ **AÇÃO CRÍTICA NECESSÁRIA**

---

## 🎯 Situação Atual

### ❌ PROBLEMA CRÍTICO IDENTIFICADO

**Causa Raiz:** Task Definitions apontam para repositórios ECR DELETADOS

**Impacto:**

- ✅ **Storefront:** Rodando mas usando repo legado `ysh-b2b/storefront` (ainda existe)
- ❌ **Backend:** FALHOU - usando repo `ysh-b2b-backend` (DELETADO hoje 13/10)

---

## 🔍 Diagnóstico Detalhado

### Backend - ysh-b2b-backend:12

**Imagem Configurada:**

```
773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend:v1.0.2
```

**Status:** ❌ REPOSITÓRIO DELETADO  
**Resultado:** Tasks não conseguem baixar a imagem e falham no start

**Evidência:**

- Repository `ysh-b2b-backend` foi deletado em 13/10/2025 13:42 UTC
- Deployment falhou: "tasks failed to start"
- 0 tasks rodando (esperado: 2)

---

### Storefront - ysh-b2b-storefront:8

**Imagem Configurada:**

```
773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/storefront:1.0.0
```

**Status:** ⚠️ REPOSITÓRIO AINDA EXISTE (mas marcado como legado)  
**Resultado:** Tasks rodando mas targets UNHEALTHY

**Observação:** Este repositório foi agendado para deleção mas ainda não foi removido

---

## 📊 Comparação: Repositórios Antigos vs Novos

| Componente | Repo ANTIGO (em uso) | Repo NOVO (disponível) | Status |
|------------|---------------------|------------------------|--------|
| Backend | `ysh-b2b-backend:v1.0.2` | `ysh-backend:latest` | ❌ DELETADO |
| Storefront | `ysh-b2b/storefront:1.0.0` | `ysh-storefront:latest` | ⚠️ MIGRADO |

---

## 🎯 Plano de Ação Imediato

### Ação 1: Atualizar Backend Task Definition ❌ URGENTE

**Objetivo:** Fazer backend voltar a funcionar

**Passos:**

1. **Criar nova task definition revision apontando para novo repositório**

```bash
# 1. Baixar task definition atual
aws ecs describe-task-definition \
  --task-definition ysh-b2b-backend:12 \
  --profile ysh-production --region us-east-1 \
  > backend-task-def-old.json

# 2. Editar JSON para apontar para nova imagem:
# TROCAR: "image": "773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend:v1.0.2"
# POR:    "image": "773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest"

# 3. Registrar nova task definition
aws ecs register-task-definition \
  --cli-input-json file://backend-task-def-new.json \
  --profile ysh-production --region us-east-1

# 4. Atualizar serviço para usar nova task definition
aws ecs update-service \
  --cluster production-ysh-b2b-cluster \
  --service ysh-b2b-backend \
  --task-definition ysh-b2b-backend:13 \
  --force-new-deployment \
  --profile ysh-production --region us-east-1
```

**Resultado Esperado:**

- ✅ Backend volta a rodar com 2 tasks
- ✅ Health checks passando
- ✅ Targets HEALTHY no ALB

---

### Ação 2: Atualizar Storefront Task Definition ⚠️ IMPORTANTE

**Objetivo:** Migrar para novo repositório antes que o legado seja deletado

**Passos:**

```bash
# 1. Baixar task definition atual
aws ecs describe-task-definition \
  --task-definition ysh-b2b-storefront:8 \
  --profile ysh-production --region us-east-1 \
  > storefront-task-def-old.json

# 2. Editar JSON para apontar para nova imagem:
# TROCAR: "image": "773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/storefront:1.0.0"
# POR:    "image": "773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-storefront:latest"

# 3. Registrar nova task definition
aws ecs register-task-definition \
  --cli-input-json file://storefront-task-def-new.json \
  --profile ysh-production --region us-east-1

# 4. Atualizar serviço
aws ecs update-service \
  --cluster production-ysh-b2b-cluster \
  --service ysh-b2b-storefront \
  --task-definition ysh-b2b-storefront:9 \
  --force-new-deployment \
  --profile ysh-production --region us-east-1
```

**Resultado Esperado:**

- ✅ Storefront usando novo repositório
- ✅ Health checks corrigidos
- ✅ Targets HEALTHY no ALB

---

### Ação 3: Corrigir Health Check do Storefront (se necessário)

**Problema Identificado:** Target Group health check pode estar incorreto

**Configuração Atual:**

- Port: 8000 ✅ (correto)
- Health Check Path: `/` ⚠️ (pode não existir)

**Investigação:**

```bash
# Verificar se storefront tem rota raiz
# Se não, ajustar health check para endpoint que existe
aws elbv2 modify-target-group \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:773235999227:targetgroup/ysh-storefront-tg/de48968877cc252d \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 10 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --profile ysh-production --region us-east-1
```

---

### Ação 4: Deletar Cluster Vazio

**Cluster:** ysh-b2b-cluster  
**Status:** Vazio, sem uso

```bash
aws ecs delete-cluster \
  --cluster ysh-b2b-cluster \
  --profile ysh-production \
  --region us-east-1
```

---

### Ação 5: Verificar Repositório Legado do Storefront

**Repositório:** `ysh-b2b/storefront`  
**Status:** Ainda existe mas foi migrado

**Decisão:**

- [ ] Manter por mais 30 dias (como planejado)
- [ ] Deletar imediatamente após migração da task definition

```bash
# Se decidir deletar imediatamente
aws ecr delete-repository \
  --repository-name "ysh-b2b/storefront" \
  --force \
  --profile ysh-production \
  --region us-east-1
```

---

## 📋 Checklist de Execução

### Preparação

- [ ] Backup das task definitions atuais
- [ ] Confirmar que imagens novas existem no ECR
- [ ] Notificar equipe sobre manutenção

### Execução - Backend

- [ ] Download task definition ysh-b2b-backend:12
- [ ] Editar JSON para nova imagem
- [ ] Registrar task definition ysh-b2b-backend:13
- [ ] Atualizar serviço com nova task definition
- [ ] Aguardar deployment (5-10 minutos)
- [ ] Verificar tasks rodando (2/2)
- [ ] Verificar health checks HEALTHY
- [ ] Testar endpoint backend via ALB

### Execução - Storefront

- [ ] Download task definition ysh-b2b-storefront:8
- [ ] Editar JSON para nova imagem
- [ ] Ajustar health check path se necessário
- [ ] Registrar task definition ysh-b2b-storefront:9
- [ ] Atualizar serviço com nova task definition
- [ ] Aguardar deployment (5-10 minutos)
- [ ] Verificar tasks rodando (2/2)
- [ ] Verificar health checks HEALTHY
- [ ] Testar endpoint storefront via ALB

### Validação Final

- [ ] Backend acessível via ALB
- [ ] Storefront acessível via ALB
- [ ] Ambos com targets HEALTHY
- [ ] Logs sem erros críticos
- [ ] CloudWatch metrics normais

### Limpeza

- [ ] Deletar cluster vazio (ysh-b2b-cluster)
- [ ] Considerar deleção do repo legado storefront
- [ ] Atualizar documentação

---

## 🚀 Comandos Rápidos (Copy-Paste)

### Verificar imagens no ECR (novo)

```bash
aws ecr describe-images --repository-name ysh-backend --profile ysh-production --region us-east-1
aws ecr describe-images --repository-name ysh-storefront --profile ysh-production --region us-east-1
```

### Monitorar deployment

```bash
# Assistir status do serviço
watch -n 5 'aws ecs describe-services --cluster production-ysh-b2b-cluster --services ysh-b2b-backend --profile ysh-production --region us-east-1 --query "services[0].{Running:runningCount,Desired:desiredCount,Status:deployments[0].status}"'
```

### Ver logs em tempo real

```bash
# Backend
aws logs tail /ecs/ysh-b2b-backend --follow --profile ysh-production --region us-east-1

# Storefront
aws logs tail /ecs/ysh-b2b-storefront --follow --profile ysh-production --region us-east-1
```

### Verificar health dos targets

```bash
# Backend
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:us-east-1:773235999227:targetgroup/ysh-backend-tg/5d057ad67b1e08c0 --profile ysh-production --region us-east-1

# Storefront
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:us-east-1:773235999227:targetgroup/ysh-storefront-tg/de48968877cc252d --profile ysh-production --region us-east-1
```

---

## ⏱️ Timeline Estimado

| Ação | Tempo | Acumulado |
|------|-------|-----------|
| Preparação (backup, verificação) | 5 min | 5 min |
| Criar e registrar task def backend | 5 min | 10 min |
| Deployment backend | 10 min | 20 min |
| Validação backend | 5 min | 25 min |
| Criar e registrar task def storefront | 5 min | 30 min |
| Deployment storefront | 10 min | 40 min |
| Validação storefront | 5 min | 45 min |
| Limpeza e documentação | 5 min | 50 min |

**Total Estimado:** ~50 minutos

---

## 🎯 Resultado Esperado

### Antes (Estado Atual)

- Backend: ❌ 0 tasks (FAILED)
- Storefront: ⚠️ 2 tasks (UNHEALTHY)
- Cluster vazio: 1 (ysh-b2b-cluster)
- Repositórios legados: em uso

### Depois (Estado Desejado)

- Backend: ✅ 2 tasks (HEALTHY)
- Storefront: ✅ 2 tasks (HEALTHY)
- Cluster vazio: 0 (deletado)
- Repositórios novos: em uso

---

## 📚 Documentos Relacionados

- `AWS_ECS_STATUS_REPORT.md` - Análise completa do ambiente ECS
- `AWS_ECR_PROJECT_FINAL_SUMMARY.md` - Consolidação ECR já concluída

---

**Status:** 🚨 **AGUARDANDO EXECUÇÃO IMEDIATA**

**Próximo Passo:** Executar Ação 1 (Atualizar Backend Task Definition)

---

*Documento gerado em: 13 de Outubro de 2025*
