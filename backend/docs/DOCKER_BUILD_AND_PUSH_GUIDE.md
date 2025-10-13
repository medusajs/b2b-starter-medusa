# 🐳 Guia de Build e Push das Imagens Docker

**Data:** 13 de Outubro de 2025  
**Status:** ✅ Dockerfiles Corrigidos - Pronto para Build

---

## 📋 Sumário Executivo

Este guia documenta as correções realizadas nos Dockerfiles e fornece comandos step-by-step para build, teste local e push para ECR.

### ✅ Correções Implementadas no Backend

**Problema Original:**

```
[dumb-init] /app/entrypoint.sh: No such file or directory
Exit Code: 2
```

**Correção Aplicada:**

1. ✅ Adicionado `dos2unix` aos pacotes Alpine Linux
2. ✅ Simplificado comando de conversão de line endings
3. ✅ Verificado que `COPY entrypoint.sh` e `ENTRYPOINT` estão corretos

**Arquivos Atualizados:**

- `Dockerfile` (linha 7 e 59)
- `Dockerfile.optimized` (stage builder e runtime)

---

## 🔧 Backend: Build e Teste Local

### 1. Build da Imagem

```powershell
# Navegar para o diretório backend
cd c:\Users\fjuni\ysh_medusa\ysh-store\backend

# Build com Dockerfile padrão
docker build -t ysh-backend:test -f Dockerfile .

# OU usar Dockerfile otimizado (multi-stage, -40% tamanho)
docker build -t ysh-backend:test -f Dockerfile.optimized .
```

**Tempo estimado:** 5-10 minutos

### 2. Testar Localmente (Simulação Básica)

```powershell
# Teste rápido: verificar se entrypoint inicia
docker run --rm ysh-backend:test echo "Entrypoint OK"

# Teste com variáveis de ambiente mínimas
docker run --rm `
  -e DATABASE_URL="postgresql://test:test@localhost:5432/test" `
  -e DATABASE_SSL="false" `
  -e SKIP_MIGRATIONS="true" `
  -p 9000:9000 `
  ysh-backend:test
```

**Resultado esperado:**

```
🚀 Medusa Backend Entrypoint
============================
Environment: production

⏭️  Skipping migrations (SKIP_MIGRATIONS=true)

🎯 Starting application: npm start
```

### 3. Tag para Produção

```powershell
# Tag com versão
docker tag ysh-backend:test ysh-backend:v1.0.6
docker tag ysh-backend:test ysh-backend:latest
```

---

## 🛒 Storefront: Correção de Rotas Next.js

### ⚠️ Problema Identificado

```
Error: You cannot use different slug names for the same dynamic path ('id' !== 'handle').
```

### 🔍 Como Localizar o Problema

```powershell
# Navegar para storefront
cd c:\Users\fjuni\ysh_medusa\ysh-store\storefront

# Buscar rotas com [id]
Get-ChildItem -Recurse -Filter "*.tsx" -Path "src/app" | Select-String "\[id\]" | Select-Object Path, LineNumber

# Buscar rotas com [handle]
Get-ChildItem -Recurse -Filter "*.tsx" -Path "src/app" | Select-String "\[handle\]" | Select-Object Path, LineNumber
```

### 📝 Padrão de Rotas Next.js

**ERRADO** (causa erro):

```
src/app/products/[id]/page.tsx
src/app/products/[handle]/reviews.tsx
```

**CORRETO** (padronizado):

```
src/app/products/[handle]/page.tsx
src/app/products/[handle]/reviews.tsx
```

### ✅ Correção Sugerida

**Opção 1:** Padronizar para `[handle]` (recomendado para e-commerce)

- Melhor SEO
- URLs amigáveis
- Padrão Medusa.js

**Opção 2:** Padronizar para `[id]`

- Mais simples
- Evita problemas com caracteres especiais

### 🔧 Build e Teste do Storefront

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\storefront

# Build
docker build -t ysh-storefront:test .

# Teste local
docker run --rm `
  -e NEXT_PUBLIC_MEDUSA_BACKEND_URL="http://host.docker.internal:9000" `
  -p 3000:3000 `
  ysh-storefront:test
```

**Acesse:** <http://localhost:3000>

**Resultado esperado:**

- ✅ Aplicação inicia sem erros
- ✅ Rotas funcionam corretamente
- ✅ Não há conflitos de slugs

---

## 🚀 Push para Amazon ECR

### 1. Autenticar no ECR

```powershell
# Login no ECR
aws ecr get-login-password --region us-east-1 --profile ysh-production | `
  docker login --username AWS --password-stdin 773235999227.dkr.ecr.us-east-1.amazonaws.com
```

### 2. Push Backend

```powershell
# Tag para ECR
docker tag ysh-backend:v1.0.6 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.6
docker tag ysh-backend:v1.0.6 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest

# Push
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.6
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest
```

### 3. Push Storefront

```powershell
# Tag para ECR
docker tag ysh-storefront:v1.0.2 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-storefront:v1.0.2
docker tag ysh-storefront:v1.0.2 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-storefront:latest

# Push
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-storefront:v1.0.2
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-storefront:latest
```

### 4. Verificar no ECR

```powershell
# Listar imagens backend
aws ecr describe-images `
  --repository-name ysh-backend `
  --region us-east-1 `
  --profile ysh-production `
  --query 'imageDetails[*].[imageTags[0],imagePushedAt]' `
  --output table

# Listar imagens storefront
aws ecr describe-images `
  --repository-name ysh-storefront `
  --region us-east-1 `
  --profile ysh-production `
  --query 'imageDetails[*].[imageTags[0],imagePushedAt]' `
  --output table
```

---

## ⚡ Workflow Completo Resumido

### Backend

```powershell
# 1. Build
cd c:\Users\fjuni\ysh_medusa\ysh-store\backend
docker build -t ysh-backend:v1.0.6 -f Dockerfile .

# 2. Teste local (opcional mas recomendado)
docker run --rm -e SKIP_MIGRATIONS=true ysh-backend:v1.0.6

# 3. Login ECR
aws ecr get-login-password --region us-east-1 --profile ysh-production | docker login --username AWS --password-stdin 773235999227.dkr.ecr.us-east-1.amazonaws.com

# 4. Tag e Push
docker tag ysh-backend:v1.0.6 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.6
docker tag ysh-backend:v1.0.6 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.6
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest
```

### Storefront

```powershell
# 1. Corrigir rotas ANTES de build (ver seção acima)

# 2. Build
cd c:\Users\fjuni\ysh_medusa\ysh-store\storefront
docker build -t ysh-storefront:v1.0.2 .

# 3. Teste local (IMPORTANTE!)
docker run --rm -p 3000:3000 -e NEXT_PUBLIC_MEDUSA_BACKEND_URL="http://localhost:9000" ysh-storefront:v1.0.2

# 4. Tag e Push
docker tag ysh-storefront:v1.0.2 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-storefront:v1.0.2
docker tag ysh-storefront:v1.0.2 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-storefront:latest
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-storefront:v1.0.2
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-storefront:latest
```

---

## 🎯 Próximos Passos Após Push

1. **Atualizar Task Definitions ECS:**

   ```powershell
   # Ver docs/AWS_ECS_ACTION_PLAN.md
   # Criar revisões 14 e 10 com novas imagens
   ```

2. **Deploy em ECS:**

   ```powershell
   aws ecs update-service \
     --cluster production-ysh-b2b-cluster \
     --service ysh-b2b-backend \
     --task-definition ysh-b2b-backend:14 \
     --force-new-deployment \
     --profile ysh-production
   ```

3. **Monitorar Health Checks:**

   ```powershell
   # Ver logs em tempo real
   aws logs tail /ecs/ysh-b2b-backend --follow --profile ysh-production
   ```

---

## 📊 Checklist de Validação

### ✅ Antes do Push para ECR

- [ ] Backend build local completo sem erros
- [ ] Backend teste rápido: `docker run --rm ysh-backend:test echo "OK"`
- [ ] Storefront rotas corrigidas (sem conflito id/handle)
- [ ] Storefront build local completo sem erros
- [ ] Storefront teste local: app inicia em localhost:3000
- [ ] Login no ECR bem-sucedido

### ✅ Após Push para ECR

- [ ] Imagens visíveis no console ECR
- [ ] Tags corretas (v1.0.6 e latest para backend)
- [ ] Tags corretas (v1.0.2 e latest para storefront)
- [ ] Size das imagens razoável (<1GB recomendado)

### ✅ Após Deploy no ECS

- [ ] Task definitions 14 e 10 criadas
- [ ] Services atualizados
- [ ] Tasks iniciando corretamente (não crashando)
- [ ] Health checks passando
- [ ] Target groups HEALTHY
- [ ] Aplicação acessível via ALB

---

## 🚨 Troubleshooting

### Build Falha: "dos2unix: not found"

**Causa:** Versão antiga do Alpine ou mirror indisponível

**Solução:**

```dockerfile
RUN apk add --no-cache dos2unix || sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh
```

### Storefront: "Module not found"

**Causa:** Dependencies não instaladas ou build incompleto

**Solução:**

```powershell
cd storefront
npm install
npm run build
docker build -t ysh-storefront:test .
```

### ECR Push: "denied: authentication required"

**Solução:**

```powershell
aws ecr get-login-password --region us-east-1 --profile ysh-production | docker login --username AWS --password-stdin 773235999227.dkr.ecr.us-east-1.amazonaws.com
```

### ECS Deploy: Tasks crasham imediatamente

**Diagnóstico:**

```powershell
# Ver últimos logs
aws logs tail /ecs/ysh-b2b-backend --since 5m --profile ysh-production
```

**Causas comuns:**

- Variáveis de ambiente faltando
- DATABASE_URL incorreta
- Secrets não configurados
- Health check muito agressivo

---

## 📚 Referências

- **Dockerfiles Corrigidos:** `Dockerfile`, `Dockerfile.optimized`
- **Entrypoint:** `entrypoint.sh`
- **Status Report:** `docs/AWS_ECS_UPDATE_ATTEMPT_REPORT.md`
- **Action Plan:** `docs/AWS_ECS_ACTION_PLAN.md`

---

**Autor:** GitHub Copilot  
**Última Atualização:** 13/10/2025
