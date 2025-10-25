# 🔧 Docker Build Troubleshooting Log

**Data:** 13 de Outubro de 2025  
**Problema:** Imagem Docker crashando com "entrypoint.sh: No such file or directory"

---

## 🐛 Problema Inicial

### Sintoma
```
[dumb-init] /app/entrypoint.sh: No such file or directory
Exit Code: 2
```

### Diagnóstico Inicial (INCORRETO)

**Hipótese 1:** Windows line endings (CRLF)
- ❌ Conclusão: Não era esse o problema principal
- Ação: Adicionado `dos2unix` aos Dockerfiles
- Resultado: Problema persistiu

**Verificação realizada:**
```powershell
docker run --rm --entrypoint /bin/sh ysh-backend:v1.0.6 -c "head -n 3 /app/entrypoint.sh | od -c"
```

**Resultado:**
```
0000000   #   !   /   b   i   n   /   b   a   s   h  \n   s   e   t
# Sem \r (carriage return) - arquivo está correto!
```

---

## 🎯 Root Cause Analysis

### Problema Real Identificado

**Alpine Linux não inclui bash por padrão!**

**Verificação:**
```powershell
docker run --rm --entrypoint /bin/sh ysh-backend:v1.0.6 -c "which bash || echo 'BASH NOT FOUND'"
```

**Resultado:**
```
BASH NOT FOUND
lrwxrwxrwx    1 root     root            12 Oct  8 09:28 /bin/sh -> /bin/busybox
```

### Por que o erro era enganoso?

O erro "[dumb-init] /app/entrypoint.sh: No such file or directory" não significa que o arquivo `entrypoint.sh` não existe.

**Significa:** O interpretador especificado no shebang (`#!/bin/bash`) não foi encontrado!

**Analogia:**
```bash
#!/usr/bin/nonexistent/interpreter
echo "Hello"
```
Gera o mesmo erro, mesmo que o script exista.

---

## ✅ Solução Implementada

### Correção Aplicada

Adicionado `bash` aos pacotes Alpine Linux em ambos os Dockerfiles.

#### Dockerfile
```dockerfile
# Linha 7
RUN apk add --no-cache libc6-compat dumb-init python3 make g++ ca-certificates curl dos2unix bash
```

#### Dockerfile.optimized

**Stage 1 (builder):**
```dockerfile
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl \
    ca-certificates \
    dos2unix \
    bash
```

**Stage 2 (runtime):**
```dockerfile
RUN apk add --no-cache \
    libc6-compat \
    dumb-init \
    ca-certificates \
    curl \
    dos2unix \
    bash
```

### Alternativa Não Utilizada

Poderia ter alterado o shebang do `entrypoint.sh`:

```bash
#!/bin/sh  # em vez de #!/bin/bash
```

**Por que não fizemos isso?**
- O script usa features específicas do bash (`set -e`, etc.)
- Bash é mais robusto para scripts complexos
- Impacto mínimo no tamanho da imagem (~5MB)
- Evita problemas futuros com compatibilidade

---

## 📊 Histórico de Tentativas

### Build 1 - Falha
```
Problema: entrypoint.sh: No such file or directory
Hipótese: Line endings CRLF
Ação: Adicionado dos2unix
Status: ❌ Falhou
```

### Build 2 - Falha (v1.0.6 primeira versão)
```
Problema: Mesmo erro persistiu
Diagnóstico: Arquivo existia e estava correto
Descoberta: bash não instalado
Status: ❌ Falhou
```

### Build 3 - Sucesso (esperado)
```
Ação: Adicionado bash aos Dockerfiles
Status: 🔄 Em andamento
```

---

## 🧪 Comandos de Teste

### Verificar arquivo dentro da imagem
```powershell
docker run --rm --entrypoint /bin/sh ysh-backend:v1.0.6 -c "ls -la /app/entrypoint.sh"
```

### Verificar conteúdo e line endings
```powershell
docker run --rm --entrypoint /bin/sh ysh-backend:v1.0.6 -c "head -n 3 /app/entrypoint.sh | od -c"
```

### Verificar se bash está instalado
```powershell
docker run --rm --entrypoint /bin/sh ysh-backend:v1.0.6 -c "which bash"
```

### Testar entrypoint diretamente
```powershell
docker run --rm --entrypoint /bin/bash ysh-backend:v1.0.6 -c "echo 'Bash OK'"
```

### Teste completo da aplicação
```powershell
docker run --rm -e SKIP_MIGRATIONS=true ysh-backend:v1.0.6
```

**Resultado esperado:**
```
🚀 Medusa Backend Entrypoint
============================
Environment: production

⏭️  Skipping migrations (SKIP_MIGRATIONS=true)

🎯 Starting application: npm start
```

---

## 📚 Lições Aprendidas

### 1. Erro Enganoso
Mensagem "No such file or directory" pode se referir:
- ❌ Arquivo não existe
- ✅ **Interpretador do shebang não existe** ← Nossa situação

### 2. Alpine Linux é Minimalista
- Não inclui bash por padrão
- Usa busybox como shell
- Sempre verificar dependências de runtime

### 3. Debugging Sistemático
**Passos corretos:**
1. ✅ Verificar se arquivo existe
2. ✅ Verificar permissões
3. ✅ Verificar conteúdo (line endings)
4. ✅ **Verificar interpretador do shebang**
5. ✅ Testar dentro do container

### 4. Alternativa POSIX
Se quiser evitar bash:
```bash
#!/bin/sh
set -e  # Funciona em sh também
```

Mas cuidado com:
- Arrays (`array=(1 2 3)`) - não funciona em sh
- `[[  ]]` - não funciona em sh (usar `[ ]`)
- Substituições avançadas

---

## 🎯 Próximos Passos

### Após Build Bem-Sucedido

1. **Teste Local:**
   ```powershell
   docker run --rm -e SKIP_MIGRATIONS=true ysh-backend:v1.0.6
   ```

2. **Tag para ECR:**
   ```powershell
   docker tag ysh-backend:v1.0.6 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.6
   docker tag ysh-backend:v1.0.6 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest
   ```

3. **Push para ECR:**
   ```powershell
   aws ecr get-login-password --region us-east-1 --profile ysh-production | docker login --username AWS --password-stdin 773235999227.dkr.ecr.us-east-1.amazonaws.com
   
   docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.6
   docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest
   ```

4. **Deploy no ECS:**
   - Criar task definition revision 14
   - Update service ysh-b2b-backend
   - Monitorar logs: `aws logs tail /ecs/ysh-b2b-backend --follow`

---

## 🔗 Referências

- **Dockerfile corrigido:** `Dockerfile` (linha 7)
- **Dockerfile multi-stage:** `Dockerfile.optimized` (stage 1 e 2)
- **Entrypoint script:** `entrypoint.sh` (shebang: `#!/bin/bash`)
- **Guia de build:** `docs/DOCKER_BUILD_AND_PUSH_GUIDE.md`
- **Status ECS:** `docs/AWS_ECS_UPDATE_ATTEMPT_REPORT.md`

---

## 📊 Timeline

| Horário | Ação | Status |
|---------|------|--------|
| 16:00 | Build inicial com dos2unix | ❌ Falha |
| 16:15 | Diagnóstico: verificado line endings | ✅ OK |
| 16:20 | Descoberta: bash missing | 🎯 Root cause |
| 16:25 | Correção: adicionado bash | 🔄 Build 3 |
| 16:35 | Teste esperado | ⏳ Pendente |

---

**Autor:** GitHub Copilot  
**Status:** Build em andamento  
**Próxima ação:** Testar v1.0.6 após build completo
