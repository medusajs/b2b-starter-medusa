# ✅ Checklist de Validação - Migrações Automáticas

**Data:** 2025-10-13  
**Status:** Implementação Concluída - Aguardando Testes

---

## 📋 O Que Foi Implementado

### ✅ Arquivos Criados

- [x] `entrypoint.sh` - Script universal de inicialização
- [x] `start-prod.sh` - Script simplificado para produção
- [x] `docs/DEPLOYMENT_MIGRATIONS_GUIDE.md` - Documentação completa

### ✅ Arquivos Atualizados

- [x] `Dockerfile` - Configurado para usar entrypoint.sh
- [x] `Dockerfile.dev` - Configurado para usar entrypoint.sh
- [x] `package.json` - Adicionado script `start:migrate`

---

## 🔍 Validação dos Arquivos

### 1. Verificar entrypoint.sh

```powershell
# Verificar que arquivo existe e tem conteúdo correto
Get-Content entrypoint.sh -Head 10

# Verificar linha shebang
(Get-Content entrypoint.sh -First 1) -eq "#!/bin/bash"

# Verificar função wait_for_db existe
Select-String -Path entrypoint.sh -Pattern "wait_for_db\(\)"

# Verificar função run_migrations existe
Select-String -Path entrypoint.sh -Pattern "run_migrations\(\)"
```

**Resultado Esperado:**

```
✓ Arquivo existe
✓ Shebang correto: #!/bin/bash
✓ Função wait_for_db encontrada
✓ Função run_migrations encontrada
```

---

### 2. Verificar start-prod.sh

```powershell
# Verificar que arquivo existe
Test-Path start-prod.sh

# Verificar conteúdo principal
Select-String -Path start-prod.sh -Pattern "npm run migrate"
```

**Resultado Esperado:**

```
✓ Arquivo existe
✓ Comando de migração encontrado
```

---

### 3. Verificar Dockerfile

```powershell
# Verificar que entrypoint.sh é copiado
Select-String -Path Dockerfile -Pattern "COPY.*entrypoint.sh"

# Verificar que é tornado executável
Select-String -Path Dockerfile -Pattern "chmod \+x.*entrypoint.sh"

# Verificar ENTRYPOINT configurado
Select-String -Path Dockerfile -Pattern "ENTRYPOINT.*entrypoint.sh"
```

**Resultado Esperado:**

```
✓ Script é copiado para /app/entrypoint.sh
✓ Permissões de execução configuradas
✓ ENTRYPOINT aponta para entrypoint.sh
```

---

### 4. Verificar Dockerfile.dev

```powershell
# Mesmas verificações do Dockerfile
Select-String -Path Dockerfile.dev -Pattern "COPY.*entrypoint.sh"
Select-String -Path Dockerfile.dev -Pattern "chmod \+x.*entrypoint.sh"
Select-String -Path Dockerfile.dev -Pattern "ENTRYPOINT.*entrypoint.sh"
```

**Resultado Esperado:**

```
✓ Script é copiado
✓ Permissões configuradas
✓ ENTRYPOINT configurado
```

---

### 5. Verificar package.json

```powershell
# Verificar que script start:migrate foi adicionado
Select-String -Path package.json -Pattern "start:migrate"

# Ver o conteúdo completo do script
(Get-Content package.json | ConvertFrom-Json).scripts.'start:migrate'
```

**Resultado Esperado:**

```
✓ Script start:migrate encontrado
✓ Valor: "npm run migrate && npm start"
```

---

## 🐳 Testes Quando Docker Estiver Disponível

### Teste 1: Build da Imagem de Produção

```powershell
# Build
docker build -t ysh-backend:test -f Dockerfile .

# Verificar que imagem foi criada
docker images | Select-String "ysh-backend"
```

**Resultado Esperado:**

```
✓ Build completado sem erros
✓ Imagem ysh-backend:test listada
```

---

### Teste 2: Build da Imagem de Desenvolvimento

```powershell
# Build
docker build -t ysh-backend:dev-test -f Dockerfile.dev .

# Verificar que imagem foi criada
docker images | Select-String "ysh-backend"
```

**Resultado Esperado:**

```
✓ Build completado sem erros
✓ Imagem ysh-backend:dev-test listada
```

---

### Teste 3: Executar Container com Database Fake (para testar script)

```powershell
# Criar container sem iniciar servidor (apenas testar entrypoint)
docker run --rm `
  -e DATABASE_URL="postgresql://fake:fake@fake:5432/fake" `
  -e SKIP_MIGRATIONS="false" `
  ysh-backend:test `
  echo "Entrypoint executed"
```

**Resultado Esperado (mesmo com falha de DB):**

```
🚀 Medusa Backend Entrypoint
============================
⏳ Waiting for database to be ready...
   Attempt 1/60 - waiting 2s...
   Attempt 2/60 - waiting 2s...
❌ Database connection timeout after 60 attempts
```

> Isso confirma que o entrypoint está sendo executado corretamente.

---

### Teste 4: Verificar Variável SKIP_MIGRATIONS

```powershell
# Testar com SKIP_MIGRATIONS=true
docker run --rm `
  -e SKIP_MIGRATIONS="true" `
  ysh-backend:test `
  echo "Migrations skipped"
```

**Resultado Esperado:**

```
🚀 Medusa Backend Entrypoint
============================
⏭️  Skipping migrations (SKIP_MIGRATIONS=true)
🎯 Starting application: echo Migrations skipped
Migrations skipped
```

---

### Teste 5: Container Completo com Database Real

> **Pré-requisito:** Ter PostgreSQL rodando (local ou RDS)

```powershell
# Definir DATABASE_URL real
$env:DATABASE_URL = "postgresql://user:pass@host:5432/dbname"

# Executar container
docker run -d `
  --name ysh-backend-test `
  -p 9000:9000 `
  -e DATABASE_URL="$env:DATABASE_URL" `
  -e NODE_ENV="production" `
  -e JWT_SECRET="test-secret" `
  -e COOKIE_SECRET="test-cookie" `
  ysh-backend:test

# Aguardar 30 segundos
Start-Sleep -Seconds 30

# Verificar logs
docker logs ysh-backend-test

# Verificar que servidor está rodando
docker ps | Select-String "ysh-backend-test"

# Testar health endpoint
curl http://localhost:9000/health

# Limpar
docker stop ysh-backend-test
docker rm ysh-backend-test
```

**Resultado Esperado:**

```
✓ Container iniciou
✓ Logs mostram: "✅ Database is ready!"
✓ Logs mostram: "✅ Migrations completed successfully"
✓ Logs mostram: "Server started on port 9000"
✓ Health endpoint retorna 200 OK
```

---

## 🧪 Testes Alternativos (Sem Docker)

### Teste A: Validar entrypoint.sh com Bash (se disponível)

```powershell
# Verificar sintaxe do bash script
bash -n entrypoint.sh

# Ou usar WSL
wsl bash -n entrypoint.sh
```

**Resultado Esperado:**

```
✓ Sem erros de sintaxe
```

---

### Teste B: Executar Localmente (Simulação)

```powershell
# Simular comportamento do entrypoint
$env:DATABASE_URL = "postgresql://localhost:5432/test"
$env:SKIP_MIGRATIONS = "false"

# Executar migração manualmente
npm run migrate

# Verificar saída
# Deve mostrar migrações sendo executadas
```

---

### Teste C: Verificar Script start:migrate

```powershell
# Testar novo script (apenas se tiver DB local)
npm run start:migrate
```

**Resultado Esperado:**

```
> medusa db:migrate
[Medusa] Running migrations...
[Medusa] ✔ Migrations completed

> medusa start -H 0.0.0.0 -p 9000
[Medusa] Server started on port 9000
```

---

## 📊 Checklist de Validação Completa

### Verificações de Arquivos (Pode fazer AGORA)

- [ ] `entrypoint.sh` existe e tem shebang correto
- [ ] `entrypoint.sh` contém função `wait_for_db()`
- [ ] `entrypoint.sh` contém função `run_migrations()`
- [ ] `start-prod.sh` existe e contém `npm run migrate`
- [ ] `Dockerfile` copia e configura `entrypoint.sh`
- [ ] `Dockerfile` define ENTRYPOINT correto
- [ ] `Dockerfile.dev` copia e configura `entrypoint.sh`
- [ ] `Dockerfile.dev` define ENTRYPOINT correto
- [ ] `package.json` contém script `start:migrate`
- [ ] `docs/DEPLOYMENT_MIGRATIONS_GUIDE.md` existe

### Testes Docker (Quando Docker estiver funcionando)

- [ ] Build `Dockerfile` completa sem erros
- [ ] Build `Dockerfile.dev` completa sem erros
- [ ] Entrypoint executa e aguarda database
- [ ] Flag `SKIP_MIGRATIONS=true` funciona
- [ ] Container completo inicia e executa migrações
- [ ] Health endpoint responde após inicialização
- [ ] Logs mostram "✅ Migrations completed successfully"

### Testes Alternativos (Opcional)

- [ ] Sintaxe bash validada com `bash -n`
- [ ] Script `npm run start:migrate` executa localmente
- [ ] Migrações executam manualmente com sucesso

---

## 🚨 Problemas Conhecidos e Soluções

### Problema 1: Docker Desktop não inicia

**Sintomas:**

```
error during connect: Get "http://%2F%2F.%2Fpipe%2Fdocker_engine/_ping": 
open //./pipe/docker_engine: The system cannot find the file specified.
```

**Soluções:**

1. **Reiniciar Docker Desktop**

```powershell
# Parar serviço
Stop-Service -Name "com.docker.service" -Force

# Iniciar Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Aguardar 30 segundos
Start-Sleep -Seconds 30

# Verificar
docker version
```

2. **Verificar WSL 2**

```powershell
# Verificar distribuições WSL
wsl --list --verbose

# Atualizar WSL
wsl --update
```

3. **Verificar Hyper-V (se Windows Pro)**

```powershell
# Verificar status
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V

# Habilitar se necessário
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
```

4. **Usar Docker Toolbox ou Rancher Desktop** (alternativa)

---

### Problema 2: Build falha por falta de contexto

**Solução:**

```powershell
# Executar build da raiz do projeto
cd C:\Users\fjuni\ysh_medusa\ysh-store\backend

# Build com contexto correto
docker build -t ysh-backend:test -f Dockerfile .
```

---

### Problema 3: entrypoint.sh não encontrado no container

**Sintomas:**

```
Error: No such file or directory: /app/entrypoint.sh
```

**Solução:**
Verificar que no Dockerfile o arquivo é copiado antes de USER medusa:

```dockerfile
# Deve estar ANTES de USER medusa
COPY --chown=medusa:medusa entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

USER medusa
```

---

## 📝 Comandos Rápidos de Validação

```powershell
# Verificar todos os arquivos criados/modificados
Get-ChildItem -Path . -Include entrypoint.sh,start-prod.sh -Recurse
Select-String -Path Dockerfile,Dockerfile.dev -Pattern "entrypoint.sh"
Select-String -Path package.json -Pattern "start:migrate"

# Quando Docker funcionar - Build rápido
docker build -t ysh-backend:test -f Dockerfile . --progress=plain

# Quando Docker funcionar - Teste rápido
docker run --rm ysh-backend:test echo "OK"
```

---

## ✅ Status Atual

### Implementação

- ✅ Scripts criados e configurados
- ✅ Dockerfiles atualizados
- ✅ package.json atualizado
- ✅ Documentação completa criada

### Testes Pendentes (Aguardando Docker)

- ⏳ Build das imagens Docker
- ⏳ Teste de execução do entrypoint
- ⏳ Validação de migrações automáticas
- ⏳ Teste de health checks

---

## 🎯 Próximos Passos

1. **Resolver problema do Docker Desktop**
   - Reiniciar serviço
   - Verificar WSL 2
   - Ou usar alternativa (Rancher Desktop)

2. **Executar builds**

   ```powershell
   docker build -t ysh-backend:test -f Dockerfile .
   docker build -t ysh-backend:dev-test -f Dockerfile.dev .
   ```

3. **Testar com database local ou de staging**

4. **Deploy para AWS EC2 quando validado**

---

**Última atualização:** 2025-10-13  
**Status:** ✅ Implementação Completa | ⏳ Testes Pendentes
