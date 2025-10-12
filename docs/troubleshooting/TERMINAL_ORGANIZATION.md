# 🖥️ Organização de Terminais - YSH B2B Deployment

**Data**: 09/10/2025  
**Objetivo**: Evitar interferência entre processos e facilitar monitoramento

---

## 📋 Terminais Dedicados

### Terminal 1️⃣: AWS CloudFormation Monitor

**Script**: `.\scripts\aws-deploy-monitor.ps1`  
**Função**: Monitora criação/atualização de stack CloudFormation  
**Status**: 🟡 Aguardando deleção completar

**Quando usar**:

- Durante criação de stack (12-15 min)
- Durante updates de stack
- Para verificar progresso de recursos

**Comandos**:

```powershell
# Iniciar monitor
.\scripts\aws-deploy-monitor.ps1

# Com intervalo customizado
.\scripts\aws-deploy-monitor.ps1 -CheckInterval 30
```

---

### Terminal 2️⃣: AWS Stack Creation

**Script**: `.\scripts\aws-deploy-create.ps1`  
**Função**: Cria stack CloudFormation com validação  
**Status**: ⏸️ Aguardando deleção completar

**Quando usar**:

- Para criar novo stack
- Após deleção de stack anterior
- Quando stack não existe

**Comandos**:

```powershell
# Criar stack
.\scripts\aws-deploy-create.ps1

# Com parâmetros customizados
.\scripts\aws-deploy-create.ps1 -Environment staging
```

---

### Terminal 3️⃣: Post-Stack Configuration

**Script**: `.\scripts\aws-deploy-post-stack.ps1`  
**Função**: Configura secrets, task definitions após stack criado  
**Status**: 🔜 Executar após stack completo

**Quando usar**:

- IMEDIATAMENTE após stack CREATE_COMPLETE
- Para reconfigurar secrets
- Para atualizar task definitions

**Comandos**:

```powershell
# Configuração automática
.\scripts\aws-deploy-post-stack.ps1
```

**O que faz**:

1. ✅ Obtém outputs do CloudFormation
2. ✅ Cria secrets de conexão (DB, Redis, URLs)
3. ✅ Atualiza task definitions com ARNs reais
4. ✅ Registra task definitions no ECS

---

### Terminal 4️⃣: Docker Images Monitor

**Script**: `.\scripts\docker-monitor.ps1`  
**Função**: Monitora imagens locais e ECR em tempo real  
**Status**: ✅ Disponível

**Quando usar**:

- Durante builds de imagens
- Durante push para ECR
- Para verificar status de scans

**Comandos**:

```powershell
# Iniciar monitor
.\scripts\docker-monitor.ps1

# Com refresh customizado
.\scripts\docker-monitor.ps1 -RefreshInterval 60
```

**Monitora**:

- 📦 Imagens locais (ysh-b2b-backend, ysh-b2b-storefront)
- ☁️ Imagens ECR (tags, tamanhos, timestamps)
- 🐳 Containers rodando
- 🛡️ Security scans (se disponível)

---

### Terminal 5️⃣: Backend Development

**Uso**: Backend local development e debugging  
**Status**: 🔄 Multi-propósito

**Comandos úteis**:

```powershell
cd backend

# Development
yarn dev

# Build
yarn build

# Migrations
yarn medusa db:migrate

# Seed
yarn run seed

# Tests
yarn test:unit
yarn test:integration
```

---

### Terminal 6️⃣: Storefront Development

**Uso**: Storefront local development  
**Status**: 🔄 Multi-propósito

**Comandos úteis**:

```powershell
cd storefront

# Development
yarn dev

# Build
yarn build

# Start production
yarn start

# Lint
yarn lint
```

---

### Terminal 7️⃣: General AWS Commands

**Uso**: Comandos AWS ad-hoc e verificações  
**Status**: 🔄 Multi-propósito

**Comandos úteis**:

```powershell
# Verificar autenticação
aws sts get-caller-identity --profile ysh-production

# Listar stacks
aws cloudformation list-stacks --profile ysh-production

# Descrever stack
aws cloudformation describe-stacks --stack-name ysh-b2b-infrastructure --profile ysh-production

# Listar imagens ECR
aws ecr list-images --repository-name ysh-b2b/backend --profile ysh-production

# Verificar secrets
aws secretsmanager list-secrets --profile ysh-production

# ECS clusters
aws ecs list-clusters --profile ysh-production

# ECS services
aws ecs list-services --cluster production-ysh-b2b-cluster --profile ysh-production
```

---

## 🎯 Workflow Recomendado

### Fase 1: Docker Images (✅ COMPLETO)

```
Terminal 4 (Docker Monitor): .\scripts\docker-monitor.ps1
Terminal 5 (Backend):        cd backend && docker build...
Terminal 6 (Storefront):     cd storefront && docker build...
```

### Fase 2: AWS Infrastructure (⏳ EM PROGRESSO)

```
Terminal 1 (Monitor):  .\scripts\aws-deploy-monitor.ps1
Terminal 2 (Create):   .\scripts\aws-deploy-create.ps1  # Quando deleção completar
Terminal 7 (AWS):      Verificações ad-hoc
```

### Fase 3: Post-Stack Configuration (🔜 PRÓXIMO)

```
Terminal 3 (Post-Stack): .\scripts\aws-deploy-post-stack.ps1
Terminal 7 (AWS):        Verificar recursos criados
```

### Fase 4: ECS Deployment (🔜 FUTURO)

```
Terminal 5 (Backend):    Migrations, seed
Terminal 7 (AWS):        Criar services, target groups
```

---

## 🚨 Regras Importantes

### ❌ NÃO FAÇA

1. **NÃO** rode builds Docker no Terminal 1 (Monitor CloudFormation)
2. **NÃO** rode comandos AWS longos no Terminal 4 (Docker Monitor)
3. **NÃO** interrompa Terminal 1 durante CREATE_IN_PROGRESS
4. **NÃO** execute múltiplos aws-deploy-create.ps1 simultaneamente

### ✅ FAÇA

1. **USE** Terminal 1 APENAS para monitorar CloudFormation
2. **USE** Terminal 4 para acompanhar builds/pushes
3. **AGUARDE** cada terminal completar sua tarefa
4. **VERIFIQUE** status antes de prosseguir

---

## 📊 Status Atual (21:30)

| Terminal | Script | Status | Próxima Ação |
|----------|--------|--------|--------------|
| 1️⃣ Monitor | aws-deploy-monitor.ps1 | ⏸️ Pausado | Aguardar deleção |
| 2️⃣ Create | aws-deploy-create.ps1 | ⏸️ Pronto | Criar stack (~5 min) |
| 3️⃣ Post-Stack | aws-deploy-post-stack.ps1 | 🔜 Pronto | Após stack completo |
| 4️⃣ Docker | docker-monitor.ps1 | ✅ Disponível | Opcional |
| 5️⃣ Backend | - | 🔄 Disponível | Multi-uso |
| 6️⃣ Storefront | - | 🔄 Disponível | Multi-uso |
| 7️⃣ AWS | - | 🔄 Disponível | Multi-uso |

---

## 🎬 Ação Imediata

**Agora (21:30)**:

1. ⏳ Aguardar deleção completar (~5 min)
2. 🚀 Terminal 2: `.\scripts\aws-deploy-create.ps1`
3. 📊 Terminal 1: `.\scripts\aws-deploy-monitor.ps1`
4. ⏰ Aguardar 12-15 minutos
5. ⚙️ Terminal 3: `.\scripts\aws-deploy-post-stack.ps1`

**Tempo estimado**: ~20-25 minutos para infraestrutura completa

---

**Última Atualização**: 09/10/2025 21:30  
**Próximo Milestone**: Stack CloudFormation CREATE_COMPLETE
