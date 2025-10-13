# 📚 Índice de Documentação Docker - YSH Backend

**Data:** 13 de Outubro, 2025  
**Versão:** 1.0

---

## 🎯 Início Rápido

### Para Desenvolvedores

1. **Ambiente Local Completo** (5 minutos)

   ```powershell
   # Start PostgreSQL + Redis + Backend
   docker-compose up -d
   
   # Ver logs
   docker-compose logs -f backend
   
   # Acessar
   # API: http://localhost:9000
   # Admin: http://localhost:9000/admin
   # Adminer: http://localhost:8080
   ```

2. **Build & Test Local** (10 minutos)

   ```powershell
   # Build otimizado
   docker build -t ysh-backend:test -f Dockerfile.optimized .
   
   # Testar
   .\scripts\test-docker-builds.ps1 -Target optimized -RunTests
   ```

### Para DevOps/Deploy

1. **Deploy para AWS ECR** (15 minutos)

   ```powershell
   # Build, tag e push
   .\scripts\deploy-ecr.ps1 -Version v1.0.4
   
   # Deploy no EC2 (ver guia AWS)
   ```

2. **Limpeza de Imagens** (2 minutos)

   ```powershell
   # Ver o que seria removido
   .\scripts\docker-cleanup.ps1 -DryRun
   
   # Remover imagens antigas
   .\scripts\docker-cleanup.ps1 -Force
   ```

---

## 📖 Documentação Completa

### 1. Revisão e Otimização Docker

**📄 DOCKER_REVIEW_SUMMARY.md** (Este Arquivo)

- ✅ Resumo executivo da revisão
- ✅ Situação antes vs. depois
- ✅ Checklist de adoção
- ✅ Próximos passos recomendados

**📄 DOCKER_IMAGES_REVIEW.md** (Guia Técnico Completo)

- 🔧 Análise técnica detalhada
- 🔧 Estratégias de otimização
- 🔧 Build best practices
- 🔧 Security hardening
- 🔧 Troubleshooting avançado

### 2. Deployment AWS

**📄 AWS_DEPLOYMENT_COMPLETE_GUIDE.md**

- ☁️ Arquitetura AWS completa
- ☁️ Setup EC2, RDS, S3
- ☁️ Security groups e IAM
- ☁️ Monitoring com CloudWatch
- ☁️ Deployment checklist

**📄 AWS_SECRETS_GUIDE.md**

- 🔐 AWS Secrets Manager
- 🔐 Rotação de secrets
- 🔐 IAM policies
- 🔐 Security audit

**📄 AWS_DEPLOYMENT_SUMMARY.md**

- 📋 Sumário executivo AWS
- 📋 Comandos úteis
- 📋 Referências rápidas

### 3. Database Migrations

**📄 DEPLOYMENT_MIGRATIONS_GUIDE.md**

- 🗄️ Migrations automáticas
- 🗄️ Entrypoint.sh documentation
- 🗄️ Docker configuration
- 🗄️ Troubleshooting migrations

**📄 MIGRATIONS_QUICKSTART.md**

- ⚡ Quick start (5 minutos)
- ⚡ Comandos comuns
- ⚡ Referência rápida

---

## 🐳 Dockerfiles Disponíveis

### Dockerfile (Produção Atual)

```powershell
docker build -t ysh-backend:latest -f Dockerfile .
```

- ✅ Produção testada
- ⚠️ Tamanho: ~2.4GB
- ⚠️ Será substituído por Dockerfile.optimized

### Dockerfile.optimized (⭐ RECOMENDADO)

```powershell
docker build -t ysh-backend:latest -f Dockerfile.optimized .
```

- ✅ Multi-stage build
- ✅ 40% menor (~1.5GB)
- ✅ Production-only deps
- ✅ Otimizado para deploy

### Dockerfile.dev (Desenvolvimento)

```powershell
docker build -t ysh-backend:dev -f Dockerfile.dev .
```

- ✅ Hot reload
- ✅ Dev dependencies
- ✅ Debug-friendly

### Containerfile.dev (Opcional)

```powershell
docker build -t ysh-backend:fedora -f Containerfile.dev .
```

- ℹ️ Baseado em Fedora
- ℹ️ PostgreSQL + Redis incluídos
- ℹ️ Uso específico

---

## 🛠️ Scripts de Automação

### deploy-ecr.ps1 (Deploy AWS)

```powershell
# Uso básico
.\scripts\deploy-ecr.ps1 -Version v1.0.4

# Com BuildKit (mais rápido)
.\scripts\deploy-ecr.ps1 -Version v1.0.4 -UseBuildKit

# Sem cache (clean build)
.\scripts\deploy-ecr.ps1 -Version v1.0.4 -NoCache

# Dry run (apenas build local)
.\scripts\deploy-ecr.ps1 -Version v1.0.4 -SkipPush
```

**Features:**

- ✅ Build automatizado
- ✅ Login ECR automático
- ✅ Tags múltiplas (version, latest, previous)
- ✅ Rollback support
- ✅ Validação de prerequisites
- ✅ Logging colorido

### docker-cleanup.ps1 (Limpeza)

```powershell
# Dry run (ver o que seria deletado)
.\scripts\docker-cleanup.ps1 -DryRun

# Limpeza normal
.\scripts\docker-cleanup.ps1

# Limpeza completa
.\scripts\docker-cleanup.ps1 -CleanupVolumes -CleanupDangling -Force

# Custom keep tags
.\scripts\docker-cleanup.ps1 -KeepTags @("latest", "v1.0.4", "stable")
```

**Features:**

- ✅ Remove imagens antigas
- ✅ Mantém tags essenciais
- ✅ Cleanup dangling images
- ✅ Cleanup volumes
- ✅ Confirmação interativa
- ✅ Force mode

### test-docker-builds.ps1 (Testing)

```powershell
# Testar todas as variantes
.\scripts\test-docker-builds.ps1 -Target all -Compare

# Testar apenas otimizado
.\scripts\test-docker-builds.ps1 -Target optimized -RunTests

# Com BuildKit
.\scripts\test-docker-builds.ps1 -Target all -UseBuildKit
```

**Features:**

- ✅ Testa múltiplos Dockerfiles
- ✅ Compara tamanhos
- ✅ Valida containers
- ✅ Benchmarking
- ✅ Build time tracking

---

## 📦 Docker Compose

### docker-compose.yml

```powershell
# Start todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Stop
docker-compose down

# Rebuild e start
docker-compose up -d --build

# Reset completo (com volumes)
docker-compose down -v
```

**Serviços Incluídos:**

1. **PostgreSQL 15** - Banco de dados
   - Port: 5432
   - Volume persistente
   - Health check
   - Init scripts support

2. **Redis 7** - Cache
   - Port: 6379
   - Persistence configurada
   - Max memory: 512MB

3. **Backend Medusa** - API
   - Ports: 9000-9002
   - Hot reload
   - Auto migrations
   - Depends on: postgres, redis

4. **Adminer** - DB Management
   - Port: 8080
   - Web interface
   - Connect to PostgreSQL

---

## 🔐 Secrets Management

### Desenvolvimento Local

```powershell
# .env file
DATABASE_URL=postgresql://yshuser:yshpass@localhost:5432/yshdb
JWT_SECRET=dev-secret
COOKIE_SECRET=dev-cookie-secret
```

### AWS Production

```bash
# AWS Secrets Manager
./scripts/aws/create-secrets.sh production

# Load secrets at runtime
source ./scripts/aws/load-secrets.sh production
```

**Ver guia completo:** `docs/AWS_SECRETS_GUIDE.md`

---

## 📊 Comparação de Tamanhos

| Image | Tamanho | Uso | Status |
|-------|---------|-----|--------|
| **Dockerfile** | 2.4GB | Produção atual | ⚠️ Migrar |
| **Dockerfile.optimized** | 1.5GB | Produção nova | ✅ Usar |
| **Dockerfile.dev** | 1.8GB | Desenvolvimento | ✅ Usar |
| **docker-compose** | - | Dev completo | ✅ Usar |

**Redução:** 40% no tamanho final

---

## 🚀 Workflow Recomendado

### 1️⃣ Desenvolvimento Local

```powershell
# Start ambiente
docker-compose up -d

# Desenvolver (hot reload automático)
code .

# Ver logs
docker-compose logs -f backend

# Stop
docker-compose down
```

### 2️⃣ Build & Test

```powershell
# Build otimizado
docker build -t ysh-backend:test -f Dockerfile.optimized .

# Testar
.\scripts\test-docker-builds.ps1 -Target optimized -RunTests

# Se OK, commitar
git add .
git commit -m "feat: optimize docker image"
git push
```

### 3️⃣ Deploy Staging

```powershell
# Build e push
.\scripts\deploy-ecr.ps1 -Version v1.0.4-rc1

# Deploy no EC2 staging
ssh staging-server
docker pull 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.4-rc1
docker-compose up -d

# Verificar
curl http://localhost:9000/health
docker logs -f ysh-backend
```

### 4️⃣ Deploy Production

```powershell
# Build e push
.\scripts\deploy-ecr.ps1 -Version v1.0.4

# Deploy no EC2 production
ssh production-server
docker pull 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest
docker-compose up -d

# Monitorar
docker logs -f ysh-backend
# CloudWatch metrics
```

### 5️⃣ Rollback (se necessário)

```powershell
# Usar tag 'previous'
ssh production-server
docker pull 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:previous
docker-compose up -d
```

### 6️⃣ Limpeza Periódica

```powershell
# Semanal: limpar imagens antigas
.\scripts\docker-cleanup.ps1 -Force

# Mensal: limpar volumes
.\scripts\docker-cleanup.ps1 -CleanupVolumes -CleanupDangling -Force
```

---

## ✅ Checklists

### Deploy Checklist

#### Pré-Deploy

- [ ] Código testado localmente
- [ ] Tests passando
- [ ] Build otimizado testado
- [ ] Version bumped
- [ ] CHANGELOG atualizado
- [ ] Secrets configurados (AWS)

#### Deploy

- [ ] Build executado com sucesso
- [ ] Image pushed para ECR
- [ ] Tag latest atualizada
- [ ] Previous tag preservada
- [ ] Container iniciado no EC2
- [ ] Migrations executadas
- [ ] Health check 200 OK

#### Pós-Deploy

- [ ] Logs sem erros críticos
- [ ] Monitoring funcionando
- [ ] Performance aceitável
- [ ] Alerts configurados
- [ ] Rollback plan pronto

### Security Checklist

- [ ] Non-root user configurado
- [ ] Secrets não commitados
- [ ] AWS Secrets Manager configurado
- [ ] Security groups configurados
- [ ] SSL/TLS habilitado
- [ ] IAM roles com least privilege
- [ ] Container scanning executado
- [ ] CVE vulnerabilities checadas
- [ ] Logs de auditoria habilitados

---

## 🔍 Troubleshooting Rápido

### Build Falha

```powershell
# Check Docker running
docker version

# Clean build
docker build --no-cache -t ysh-backend:test -f Dockerfile.optimized .

# Check logs
docker build -t ysh-backend:test -f Dockerfile.optimized . 2>&1 | Tee-Object build.log
```

### Container Não Inicia

```powershell
# Check logs
docker logs ysh-backend

# Check entrypoint
docker run -it --rm ysh-backend:latest /bin/sh
cat /app/entrypoint.sh

# Check permissions
ls -la /app
```

### Migrations Falham

```powershell
# Check DATABASE_URL
docker exec ysh-backend env | grep DATABASE

# Run migrations manually
docker exec ysh-backend npm run migrate

# Skip migrations
docker run -e SKIP_MIGRATIONS=true ysh-backend:latest
```

### Permission Denied

```powershell
# Check user
docker exec ysh-backend whoami

# Check ownership
docker exec ysh-backend ls -la /app

# Fix ownership (rebuild)
docker build --no-cache -t ysh-backend:latest -f Dockerfile.optimized .
```

---

## 📞 Suporte e Referências

### Documentação Externa

- **Docker Best Practices**
  <https://docs.docker.com/develop/dev-best-practices/>

- **Multi-stage Builds**
  <https://docs.docker.com/build/building/multi-stage/>

- **AWS ECR User Guide**
  <https://docs.aws.amazon.com/ecr/>

- **Node.js Docker Best Practices**
  <https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md>

### Documentação Interna

1. **docs/DOCKER_REVIEW_SUMMARY.md** - Resumo executivo
2. **docs/DOCKER_IMAGES_REVIEW.md** - Guia técnico completo
3. **docs/AWS_DEPLOYMENT_COMPLETE_GUIDE.md** - Deploy AWS
4. **docs/AWS_SECRETS_GUIDE.md** - Secrets management
5. **docs/DEPLOYMENT_MIGRATIONS_GUIDE.md** - Migrations
6. **MIGRATIONS_QUICKSTART.md** - Quick start migrations

### Scripts

1. **scripts/deploy-ecr.ps1** - Deploy para ECR
2. **scripts/docker-cleanup.ps1** - Limpeza de imagens
3. **scripts/test-docker-builds.ps1** - Testing builds
4. **scripts/aws/create-secrets.sh** - Criar secrets AWS
5. **scripts/aws/load-secrets.sh** - Carregar secrets

### Configurações

1. **docker-compose.yml** - Ambiente dev completo
2. **Dockerfile.optimized** - Build otimizado (recomendado)
3. **Dockerfile** - Build atual (compatibilidade)
4. **Dockerfile.dev** - Build desenvolvimento
5. **.dockerignore** - Exclusões otimizadas
6. **entrypoint.sh** - Entrypoint com migrations

---

## 🎯 Próximos Passos

### Agora (15 minutos)

1. Testar `Dockerfile.optimized` localmente
2. Comparar tamanho com build atual
3. Validar que aplicação funciona

### Esta Semana

1. Deploy em staging com imagem otimizada
2. Monitorar performance
3. Validar migrations automáticas

### Próximas 2 Semanas

1. Deploy em production
2. Configurar CI/CD
3. Limpar imagens antigas

### Próximo Mês

1. Migrar completamente para build otimizado
2. Implementar auto-scaling
3. Setup monitoring avançado

---

## 📈 Métricas de Sucesso

### Targets

- ✅ Redução de 40% no tamanho de imagem
- ✅ Deploy time < 5 minutos
- ✅ Pull time < 2 minutos
- ✅ Zero downtime deployments
- ✅ Rollback time < 1 minuto

### Monitoramento

- Memory usage < 2GB
- CPU usage < 70%
- Response time < 200ms (p95)
- Error rate < 0.1%
- Uptime > 99.9%

---

**Última atualização:** 13/10/2025  
**Versão:** 1.0  
**Status:** ✅ Completo e Pronto para Uso
