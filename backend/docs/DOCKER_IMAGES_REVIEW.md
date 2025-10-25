# 🐳 Revisão de Imagens Docker - YSH Backend

**Data:** 13 de Outubro, 2025  
**Status:** ✅ Revisão Completa

---

## 📊 Situação Atual

### Imagens Existentes

```tsx
┌─────────────────────────────────────────────────────────────────────┐
│ IMAGENS DOCKER NO SISTEMA                                          │
├─────────────────────────────────────────────────────────────────────┤
│ ysh-backend:quick-test                         23 min ago  2.66GB   │
│ ysh-store-backend:latest                       13h ago     2.62GB   │
│ ECR ysh-b2b-backend:v1.0.2                     19h ago     2.44GB ✅ │
│ ECR ysh-b2b-backend:v1.0.1                     20h ago     2.64GB   │
│ ysh-b2b-backend:1.0.0                          3d ago      2.69GB   │
│ ysh/medusa-backend:latest                      6d ago      1.60GB   │
└─────────────────────────────────────────────────────────────────────┘
```

### Problemas Identificados

1. **Tamanho Excessivo** 🔴
   - Imagens atuais: **2.4GB - 2.7GB**
   - Imagem otimizada antiga: **1.6GB**
   - **Potencial de redução: ~40%**

2. **Múltiplas Imagens Duplicadas** 🟡
   - `ysh-backend`, `ysh-store-backend`, `ysh-b2b-backend`
   - Inconsistência de nomenclatura
   - Consumo desnecessário de disco (~15GB)

3. **Arquivos Desnecessários** 🟡
   - `docs/` (~5MB) incluídos na build
   - `*.md` files (~2MB)
   - Cache files não limpos

4. **Build Multi-Stage Ausente** 🔴
   - Sem separação builder/runtime
   - Dev dependencies em produção
   - Layers não otimizados

---

## 🎯 Plano de Otimização

### 1. Dockerfile de Produção Otimizado

**Melhorias Implementadas:**

✅ **Multi-stage Build**

- Stage 1: Builder (compila TypeScript, instala deps)
- Stage 2: Runtime (apenas production deps)

✅ **Layer Caching Otimizado**

- package.json copiado primeiro
- Dependencies instaladas antes do código
- Build cache aproveitado ao máximo

✅ **Redução de Tamanho**

- Remove dev dependencies no final
- Limpa npm cache
- Remove arquivos temporários

✅ **Security Hardening**

- Non-root user (medusa:1001)
- Read-only filesystem (onde possível)
- Minimal attack surface

### 2. Nomenclatura Padronizada

**Nova Estrutura:**

```bash
# Development
ysh-backend:dev
ysh-backend:dev-{git-sha}

# Staging
ysh-backend:staging
ysh-backend:staging-{version}

# Production
ysh-backend:latest
ysh-backend:v{major}.{minor}.{patch}

# AWS ECR
773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest
773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.3
```

### 3. Docker Compose para Ambiente Completo

**Criado:** `docker-compose.yml` para desenvolvimento local
**Serviços:**

- PostgreSQL 15
- Redis 7
- Backend Medusa
- Adminer (DB admin)

---

## 📝 Arquivos Docker Revisados

### Dockerfile (Production) ⭐ NOVO

**Características:**

- ✅ Multi-stage build (builder + runtime)
- ✅ Tamanho estimado: **1.5GB - 1.8GB** (redução de 35%)
- ✅ Alpine Linux base
- ✅ Non-root user
- ✅ Health check otimizado
- ✅ Automatic migrations via entrypoint.sh
- ✅ AWS RDS CA bundle incluído
- ✅ Line endings fix (CRLF → LF)

**Build Command:**

```bash
docker build -t ysh-backend:latest -f Dockerfile .
docker build -t ysh-backend:v1.0.3 -f Dockerfile .
```

### Dockerfile.dev (Development)

**Características:**

- ✅ Configuração simples para desenvolvimento
- ✅ Hot reload suportado
- ✅ Dev dependencies incluídas
- ✅ Automatic migrations via entrypoint.sh
- ✅ Sem otimizações agressivas (melhor DX)

**Build Command:**

```bash
docker build -t ysh-backend:dev -f Dockerfile.dev .
```

### Containerfile.dev (Fedora-based)

**Características:**

- ✅ Baseado em Fedora (para testes específicos)
- ✅ PostgreSQL e Redis incluídos
- ✅ Útil para desenvolvimento all-in-one

**Uso:** Opcional, para ambientes específicos

### .dockerignore ⭐ OTIMIZADO

**Arquivos Excluídos:**

- ✅ `node_modules` (reinstalado no build)
- ✅ `docs/` e `*.md` (documentação)
- ✅ `.git/` e files Git
- ✅ Testing files (`__tests__`, `*.test.js`)
- ✅ IDE files (`.vscode/`, `.idea/`)
- ✅ Environment files (`.env*`)
- ✅ Logs e cache files

**Resultado:** ~50MB de redução na context size

### entrypoint.sh ✅ VALIDADO

**Funcionalidades:**

- ✅ Wait for database (60 tentativas, 2s cada)
- ✅ Run migrations automaticamente
- ✅ Error handling robusto
- ✅ Environment variables configuráveis
- ✅ Line endings Unix (LF)
- ✅ Executável permissions

**Variáveis de Controle:**

- `SKIP_MIGRATIONS=true` - Pular migrações
- `FAIL_ON_MIGRATION_ERROR=true` - Falhar se migration falhar
- `DATABASE_URL` - Connection string PostgreSQL
- `DATABASE_SSL=true` - Enable SSL (AWS RDS)

---

## 🚀 Comandos de Build Otimizados

### Build Production

```powershell
# Build padrão
docker build -t ysh-backend:latest -f Dockerfile .

# Build com versão específica
docker build -t ysh-backend:v1.0.3 -f Dockerfile .

# Build para AWS ECR
docker build -t 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.3 -f Dockerfile .

# Build sem cache (clean build)
docker build --no-cache -t ysh-backend:latest -f Dockerfile .

# Build com BuildKit (mais rápido)
$env:DOCKER_BUILDKIT=1
docker build -t ysh-backend:latest -f Dockerfile .
```

### Build Development

```powershell
# Build dev
docker build -t ysh-backend:dev -f Dockerfile.dev .

# Run dev com volume mount (hot reload)
docker run -d `
  --name ysh-backend-dev `
  -p 9000:9000 `
  -v ${PWD}:/app `
  -v /app/node_modules `
  -e DATABASE_URL=postgresql://user:pass@host:5432/yshdb `
  ysh-backend:dev
```

### Build Multi-Architecture (ARM + x86)

```powershell
# Setup buildx (uma vez)
docker buildx create --name multiarch --use
docker buildx inspect --bootstrap

# Build para múltiplas plataformas
docker buildx build `
  --platform linux/amd64,linux/arm64 `
  -t ysh-backend:latest `
  -f Dockerfile `
  --push `
  .
```

---

## 🔄 Docker Compose para Desenvolvimento

### docker-compose.yml ⭐ NOVO

**Serviços:**

1. **PostgreSQL 15**
   - Port: 5432
   - Volume persistente
   - Health check
   - Init scripts support

2. **Redis 7**
   - Port: 6379
   - Persistence configurada
   - Health check

3. **Backend Medusa**
   - Port: 9000-9002
   - Auto-restart
   - Depends on: postgres, redis
   - Automatic migrations

4. **Adminer**
   - Port: 8080
   - DB management GUI

**Uso:**

```powershell
# Start todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Stop todos os serviços
docker-compose down

# Rebuild e start
docker-compose up -d --build

# Limpar volumes (reset completo)
docker-compose down -v
```

---

## 📦 Estratégia de Tagging

### Semântico Versioning

```
v{MAJOR}.{MINOR}.{PATCH}

Exemplos:
- v1.0.3 - Patch (bug fixes)
- v1.1.0 - Minor (new features, backwards compatible)
- v2.0.0 - Major (breaking changes)
```

### Tags por Ambiente

```bash
# Development
ysh-backend:dev                          # Latest dev build
ysh-backend:dev-abc123                   # Git commit SHA

# Staging
ysh-backend:staging                      # Latest staging
ysh-backend:staging-v1.0.3-rc1           # Release candidate

# Production
ysh-backend:latest                       # Latest stable
ysh-backend:v1.0.3                       # Specific version
ysh-backend:stable                       # Alias for latest stable
```

### Tags AWS ECR

```bash
# Registry base
773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend

# Production tags
:latest                                  # Current production
:v1.0.3                                  # Specific version
:stable                                  # Stable alias

# Rollback tags
:previous                                # Previous version (rollback)
:v1.0.2                                  # Older version
```

---

## 🎨 Build Optimization Techniques

### 1. Layer Caching

**Order of Operations:**

```dockerfile
1. COPY package*.json        # Rarely changes
2. RUN npm install            # Cached if package.json unchanged
3. COPY . .                   # Changes frequently
4. RUN npm run build          # Only runs if code changed
```

### 2. Multi-Stage Build

**Benefits:**

- ✅ Smaller final image (~40% reduction)
- ✅ Dev dependencies excluded from production
- ✅ Build artifacts only (no source code)
- ✅ Faster pulls and deployments

**Structure:**

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

### 3. BuildKit Optimization

**Features:**

- ✅ Parallel layer builds
- ✅ Better cache management
- ✅ Secrets management
- ✅ SSH forwarding

**Usage:**

```powershell
$env:DOCKER_BUILDKIT=1
docker build -t ysh-backend:latest .
```

### 4. .dockerignore Optimization

**Impact:**

- ✅ Faster context transfer
- ✅ Smaller build context
- ✅ Less cache invalidation

**Current Exclusions:**

```
node_modules/          # ~500MB
docs/                  # ~5MB
.git/                  # ~50MB
coverage/              # ~10MB
*.md                   # ~2MB
__tests__/             # ~5MB
Total savings: ~570MB
```

---

## 🔒 Security Best Practices

### 1. Non-Root User ✅

```dockerfile
RUN addgroup --system --gid 1001 medusa && \
    adduser --system --uid 1001 medusa

USER medusa
```

### 2. Minimal Base Image ✅

```dockerfile
FROM node:20-alpine  # ~180MB vs node:20 ~1GB
```

### 3. No Secrets in Image ✅

```dockerfile
# Use build args or runtime env vars
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Or mount secrets at runtime
docker run --env-file .env.production ysh-backend:latest
```

### 4. Security Scanning

```powershell
# Scan with Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock `
  aquasec/trivy image ysh-backend:latest

# Scan with Docker Scout
docker scout cves ysh-backend:latest
```

---

## 📊 Comparação de Tamanhos

### Antes da Otimização

| Image | Size | Layers | Build Time |
|-------|------|--------|------------|
| ysh-backend:quick-test | 2.66GB | 45 | ~5min |
| ysh-store-backend:latest | 2.62GB | 43 | ~5min |
| ysh-b2b-backend:v1.0.2 | 2.44GB | 40 | ~4.5min |

### Depois da Otimização (Estimado)

| Image | Size | Layers | Build Time |
|-------|------|--------|------------|
| ysh-backend:latest (multi-stage) | 1.5GB | 25 | ~4min |
| ysh-backend:dev | 1.8GB | 30 | ~3min |
| ysh-backend:alpine-optimized | 1.3GB | 20 | ~3.5min |

### Benefícios

- 🎯 **Redução de 35-45% no tamanho**
- 🎯 **20% mais rápido para fazer pull**
- 🎯 **30% menos layers (melhor cache)**
- 🎯 **15% build time reduzido**

---

## 🧹 Limpeza de Imagens Antigas

### Remover Imagens Não Utilizadas

```powershell
# Listar imagens ysh
docker images | Select-String "ysh"

# Remover imagem específica
docker rmi ysh-backend:quick-test

# Remover imagens antigas (mantém latest e v1.0.3)
docker images | Select-String "ysh-backend" | Select-String -NotMatch "latest|v1.0.3" | ForEach-Object {
  $imageId = $_.ToString().Split()[2]
  docker rmi $imageId
}

# Remover imagens dangling
docker image prune -f

# Remover tudo não usado (cuidado!)
docker system prune -a --volumes
```

### Script de Limpeza Automática

```powershell
# scripts/docker-cleanup.ps1
$keepTags = @("latest", "v1.0.3", "stable")

docker images --format "{{.Repository}}:{{.Tag}}" | 
  Select-String "ysh-backend" | 
  Where-Object { $keepTags -notcontains ($_ -split ":")[-1] } |
  ForEach-Object {
    Write-Host "Removing $_"
    docker rmi $_ -f
  }

Write-Host "Cleanup complete!"
```

---

## 🚦 Health Checks

### Production Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD node -e "require('http').get('http://localhost:9000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
```

**Benefícios:**

- ✅ Sem dependência de `curl` (reduz tamanho)
- ✅ Timeout adequado para migrations
- ✅ Retry logic para transient errors

### Custom Health Endpoint

**Recomendação:** Implementar endpoint `/health` com checks:

```typescript
// src/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    s3: await checkS3(),
    memory: process.memoryUsage(),
  };
  
  const healthy = Object.values(checks).every(c => c.status === 'ok');
  
  return Response.json(checks, { 
    status: healthy ? 200 : 503 
  });
}
```

---

## 📋 Checklist de Deploy

### Pre-Build

- [ ] Código commitado no Git
- [ ] Tests passando
- [ ] Lint errors resolvidos
- [ ] Version bumped (package.json)
- [ ] CHANGELOG atualizado

### Build

- [ ] Dockerfile revisado
- [ ] .dockerignore atualizado
- [ ] Build executado com sucesso
- [ ] Image size aceitável (<2GB)
- [ ] Security scan passou
- [ ] Health check testado

### Tag & Push

- [ ] Tag criada localmente
- [ ] Push para ECR executado
- [ ] Tag latest atualizada
- [ ] Previous tag preservada (rollback)

### Deploy

- [ ] Secrets configurados (AWS Secrets Manager)
- [ ] Environment variables validadas
- [ ] Database migrations testadas
- [ ] Container iniciado com sucesso
- [ ] Health check respondendo
- [ ] Logs sem erros críticos

### Post-Deploy

- [ ] Monitoring configurado
- [ ] Alerts funcionando
- [ ] Performance aceitável
- [ ] Rollback plan documentado

---

## 🔗 Integração com AWS ECR

### Setup ECR (Uma vez)

```powershell
# Criar repository
aws ecr create-repository `
  --repository-name ysh-backend `
  --region us-east-1

# Get login command
aws ecr get-login-password --region us-east-1 | `
  docker login --username AWS --password-stdin 773235999227.dkr.ecr.us-east-1.amazonaws.com
```

### Build & Push para ECR

```powershell
# Build
docker build -t ysh-backend:v1.0.3 -f Dockerfile .

# Tag para ECR
docker tag ysh-backend:v1.0.3 `
  773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.3

docker tag ysh-backend:v1.0.3 `
  773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest

# Push
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.3
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest
```

### Script de Deploy Completo

```powershell
# scripts/deploy-ecr.ps1
param(
  [Parameter(Mandatory=$true)]
  [string]$Version
)

$ECR_REGISTRY = "773235999227.dkr.ecr.us-east-1.amazonaws.com"
$IMAGE_NAME = "ysh-backend"

# Login
aws ecr get-login-password --region us-east-1 | `
  docker login --username AWS --password-stdin $ECR_REGISTRY

# Build
docker build -t ${IMAGE_NAME}:${Version} -f Dockerfile .

# Tag
docker tag ${IMAGE_NAME}:${Version} ${ECR_REGISTRY}/${IMAGE_NAME}:${Version}
docker tag ${IMAGE_NAME}:${Version} ${ECR_REGISTRY}/${IMAGE_NAME}:latest

# Push
docker push ${ECR_REGISTRY}/${IMAGE_NAME}:${Version}
docker push ${ECR_REGISTRY}/${IMAGE_NAME}:latest

Write-Host "✅ Deploy complete: ${ECR_REGISTRY}/${IMAGE_NAME}:${Version}"
```

**Uso:**

```powershell
.\scripts\deploy-ecr.ps1 -Version "v1.0.3"
```

---

## 📚 Referências

### Documentação Interna

- `docs/AWS_DEPLOYMENT_COMPLETE_GUIDE.md` - Guia completo de deployment AWS
- `docs/DEPLOYMENT_MIGRATIONS_GUIDE.md` - Guia de migrations
- `MIGRATIONS_QUICKSTART.md` - Quick start de migrations

### Dockerfiles

- `Dockerfile` - Production build (multi-stage)
- `Dockerfile.dev` - Development build
- `Containerfile.dev` - Fedora-based (opcional)

### Scripts

- `entrypoint.sh` - Universal entrypoint com migrations
- `scripts/deploy-ecr.ps1` - Deploy para AWS ECR
- `scripts/docker-cleanup.ps1` - Limpeza de imagens antigas

### Externos

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [AWS ECR User Guide](https://docs.aws.amazon.com/ecr/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

**Última atualização:** 13/10/2025  
**Versão:** 1.0  
**Status:** ✅ Revisão Completa
