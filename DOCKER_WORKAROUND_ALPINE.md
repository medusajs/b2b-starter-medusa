# Workaround Docker Dev Environment - Alpine Linux

## Solucao para problemas de dependencias nativas no Alpine

**Data:** 08/10/2025  
**Status:** ✅ Resolvido e Operacional  
**Ambiente:** Windows + PowerShell + Docker Desktop

---

## 🔍 Problema Identificado

### Sintomas

```
Error: Cannot find module @rollup/rollup-linux-x64-musl
Error: @swc/core threw an error - Bindings not found
Error: Cannot find module '/app/medusa-config'
```

### Causa Raiz

- **Alpine Linux** usa `musl libc` ao invés de `glibc`
- Pacotes nativos Node.js (Rollup, SWC) precisam de bindings específicos
- `npm install` no Dockerfile não instalou as dependências opcionais para musl

---

## ✅ Solução Implementada

### 1. Atualização do Dockerfile.dev (Backend)

**Arquivo:** `backend/Dockerfile.dev`

**Alterações:**

```dockerfile
# Adicionar ferramentas de build
RUN apk add --no-cache libc6-compat dumb-init curl python3 make g++

# Workaround para Rollup e SWC
RUN npm install --force @rollup/rollup-linux-x64-musl || true
```

### 2. Scripts PowerShell para Correção

#### quick-fix-backend.ps1

**Uso:** Correção rápida sem rebuild

```powershell
.\quick-fix-backend.ps1
```

**O que faz:**

1. Verifica se o backend está rodando
2. Instala dependências faltantes no container:
   - `@rollup/rollup-linux-x64-musl`
   - `@swc/core-linux-x64-musl`
   - `@swc/core`
3. Reinicia o backend
4. Verifica logs e confirma operação

#### fix-backend-dev.ps1

**Uso:** Rebuild completo com WSL (quando necessário)

```powershell
# Rebuild normal
.\fix-backend-dev.ps1

# Rebuild via WSL (melhor compatibilidade)
.\fix-backend-dev.ps1 -UseWSL

# Rebuild forçado (sem cache)
.\fix-backend-dev.ps1 -ForceRebuild
```

---

## 📋 Comandos Executados (Resolução)

### Passo 1: Parar container problemático

```powershell
docker-compose -f docker-compose.dev.yml stop backend
```

### Passo 2: Instalar dependências faltantes

```powershell
# Rollup binding
docker exec ysh-b2b-backend-dev npm install --force @rollup/rollup-linux-x64-musl

# SWC bindings
docker exec ysh-b2b-backend-dev npm install --force @swc/core-linux-x64-musl @swc/core
```

### Passo 3: Reiniciar backend

```powershell
docker-compose -f docker-compose.dev.yml restart backend
```

### Passo 4: Verificar operação

```powershell
# Checar logs
docker logs ysh-b2b-backend-dev --tail 30

# Testar health endpoint
curl http://localhost:9000/health
```

---

## ✅ Status Final dos Serviços

### Containers Operacionais

| Serviço | Status | Porta | Health |
|---------|--------|-------|--------|
| **PostgreSQL** | ✅ Up | 15432 | healthy |
| **Redis** | ✅ Up | 16379 | healthy |
| **Backend (Medusa)** | ✅ Up | 9000-9002 | operational |
| **Storefront (Next.js)** | ✅ Up | 8000 | operational |

### URLs Disponíveis

- **Storefront:** <http://localhost:8000>
- **Backend API:** <http://localhost:9000>
- **Admin Panel:** <http://localhost:9000/app>
- **Health Check:** <http://localhost:9000/health> (200 OK ✅)

---

## 🔧 Configurações de Memória

### Problema OOM durante Build

Durante `npm run build`, o backend pode exceder memória.

**Solução Temporária:**

```powershell
# Aumentar limite de memória do Node
docker exec ysh-b2b-backend-dev sh -c "export NODE_OPTIONS='--max-old-space-size=4096'"
```

**Solução Permanente:**
Adicionar no `docker-compose.dev.yml`:

```yaml
backend:
  environment:
    NODE_OPTIONS: "--max-old-space-size=4096"
  deploy:
    resources:
      limits:
        memory: 2G
```

---

## 📝 Warnings Conhecidos (Não Críticos)

### 1. Versão do Docker Compose

```
the attribute `version` is obsolete
```

**Impacto:** Nenhum - warning informativo  
**Ação:** Pode remover `version: "3.8"` do docker-compose.yml

### 2. Peer Dependencies

```
npm warn ERESOLVE overriding peer dependency
npm warn Conflicting peer dependency: zod@3.22.4
```

**Impacto:** Baixo - funciona com `--legacy-peer-deps`  
**Ação:** Já tratado no package.json

### 3. Vulnerabilidades npm

```
55 vulnerabilities (4 low, 4 moderate, 47 high)
```

**Impacto:** Ambiente dev apenas  
**Ação:** Executar `npm audit fix` periodicamente

### 4. Local Event Bus

```
Local Event Bus installed. Not recommended for production.
```

**Impacto:** Nenhum em dev  
**Ação:** Em produção usar Redis ou outro broker

---

## 🚀 Como Iniciar Ambiente (Completo)

### Primeira vez ou após mudanças no Dockerfile

```powershell
# 1. Navegar para o diretório
cd C:\Users\fjuni\ysh_medusa\ysh-store

# 2. Parar containers antigos
docker-compose -f docker-compose.dev.yml down

# 3. Limpar redes conflitantes (se necessário)
docker network prune -f

# 4. Build e start
docker-compose -f docker-compose.dev.yml up -d --build

# 5. Aguardar inicialização
Start-Sleep -Seconds 30

# 6. Aplicar workaround (se necessário)
.\quick-fix-backend.ps1

# 7. Verificar status
docker-compose -f docker-compose.dev.yml ps
```

### Próximas vezes (containers já construídos)

```powershell
cd C:\Users\fjuni\ysh_medusa\ysh-store
docker-compose -f docker-compose.dev.yml up -d
Start-Sleep -Seconds 30
docker-compose -f docker-compose.dev.yml ps
```

---

## 🐛 Troubleshooting

### Backend não inicia

```powershell
# Ver logs
docker logs ysh-b2b-backend-dev --tail 100

# Reinstalar dependências
docker exec ysh-b2b-backend-dev npm install

# Restart
docker-compose -f docker-compose.dev.yml restart backend
```

### Erro "port already in use"

```powershell
# Identificar processo
Get-NetTCPConnection -LocalPort 9000

# Parar processo
Stop-Process -Id <PID> -Force

# Ou parar todos containers
docker stop $(docker ps -aq)
```

### Erro de rede "pool overlaps"

```powershell
# Limpar todas redes
docker network prune -f

# Ou remover rede específica
docker network rm ysh-store_ysh-b2b-dev-network
```

### Build OOM (Out of Memory)

```powershell
# Aumentar limite Docker Desktop
# Settings > Resources > Memory > 4GB+

# Ou aumentar NODE_OPTIONS
docker exec ysh-b2b-backend-dev sh -c "export NODE_OPTIONS='--max-old-space-size=4096'"
```

---

## 📊 Melhorias Futuras

### 1. Migrar para node:20-slim (Debian)

**Vantagem:** Bindings nativos funcionam sem workarounds  
**Desvantagem:** Imagem ~3x maior

```dockerfile
FROM node:20-slim
RUN apt-get update && apt-get install -y curl dumb-init
```

### 2. Usar Multi-stage Build

```dockerfile
# Build stage com ferramentas completas
FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++
RUN npm install

# Runtime stage minimalista
FROM node:20-alpine
COPY --from=builder /app /app
```

### 3. Pré-compilar Dependências

```dockerfile
# Após npm install
RUN npm rebuild
```

---

## 📚 Referências

### Documentação Relevante

- [Alpine Linux Package Search](https://pkgs.alpinelinux.org/)
- [Node.js Alpine Issues](https://github.com/nodejs/docker-node/issues)
- [Rollup Native Dependencies](https://rollupjs.org/guide/en/)
- [SWC Platform Support](https://swc.rs/docs/installation)

### Issues Relacionados

- <https://github.com/npm/cli/issues/4828> (npm optional dependencies bug)
- <https://github.com/rollup/rollup/issues/3929> (Alpine musl support)
- <https://github.com/swc-project/swc/issues/3121> (SWC Alpine bindings)

---

## ✅ Checklist de Verificação

Após aplicar o workaround, verifique:

- [ ] Todos containers rodando (`docker-compose ps`)
- [ ] Backend healthy (`curl http://localhost:9000/health`)
- [ ] Storefront acessível (`curl http://localhost:8000`)
- [ ] Sem erros críticos nos logs
- [ ] PostgreSQL e Redis operacionais
- [ ] Admin acessível em <http://localhost:9000/app>

---

## 🎯 Resumo Executivo

**Problema:** Dependências nativas Node.js incompatíveis com Alpine Linux (musl)

**Solução:** Instalação manual dos bindings específicos para musl:

- `@rollup/rollup-linux-x64-musl`
- `@swc/core-linux-x64-musl`
- `@swc/core`

**Resultado:** ✅ Ambiente 100% operacional

**Tempo de Correção:** ~5 minutos com script `quick-fix-backend.ps1`

**Impacto:** Zero - workaround não afeta funcionalidade

---

**Última Atualização:** 08/10/2025 13:02  
**Próxima Revisão:** Considerar migração para node:20-slim em futuro refactor
