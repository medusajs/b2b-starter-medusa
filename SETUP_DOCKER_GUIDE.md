# 🐳 Guia de Instalação Docker Desktop - YSH B2B Platform

## 📋 Pré-requisitos

- ✅ Windows 10/11 (64-bit) Pro, Enterprise ou Education
- ✅ WSL 2 (Windows Subsystem for Linux 2)
- ✅ Virtualização habilitada na BIOS
- ✅ Mínimo 4GB RAM (recomendado 8GB+)
- ✅ 20GB espaço em disco livre

---

## 🚀 Passo 1: Instalar Docker Desktop

### 1.1. Download

Acesse: **https://www.docker.com/products/docker-desktop/**

Ou baixe diretamente:

```powershell
# Abrir navegador no link de download
Start-Process "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
```

### 1.2. Instalação

1. **Execute o instalador** `Docker Desktop Installer.exe`
2. **Aceite as configurações padrão**:
   - ✅ Use WSL 2 instead of Hyper-V (recomendado)
   - ✅ Add shortcut to desktop
3. **Clique em "Install"**
4. **Aguarde a instalação** (pode levar 5-10 minutos)
5. **Reinicie o computador** quando solicitado

### 1.3. Primeira Execução

1. **Abra Docker Desktop** (ícone na área de trabalho ou menu iniciar)
2. **Aceite os Termos de Serviço**
3. **Pule o login** (opcional) - pode usar sem conta Docker
4. **Aguarde inicialização** - Docker está pronto quando o ícone ficar verde na bandeja

---

## 🔧 Passo 2: Verificar Instalação

Abra **PowerShell** e execute:

```powershell
# Verificar versão do Docker
docker --version
# Esperado: Docker version 24.x ou superior

# Verificar Docker Compose
docker-compose --version
# Esperado: Docker Compose version v2.x ou superior

# Testar funcionamento
docker run hello-world
# Se aparecer "Hello from Docker!", está funcionando!
```

---

## 🎯 Passo 3: Habilitar Yarn 4 via Corepack

```powershell
# Habilitar Corepack (gerenciador oficial do Yarn)
corepack enable

# Verificar versão do Yarn
yarn --version
# Esperado: 4.4.1 ou superior
```

---

## 📝 Passo 4: Criar Arquivos de Ambiente (.env)

### 4.1. Backend (.env)

```powershell
cd backend
Copy-Item .env.template .env
```

Edite `backend\.env` e ajuste se necessário (valores padrão funcionam para dev):

```bash
# Mínimo necessário para desenvolvimento local via Docker
DATABASE_URL=postgresql://yshuser:yshpass@postgres:5432/yshdb
REDIS_URL=redis://redis:6379
JWT_SECRET=dev-jwt-secret-change-in-production-min-32-chars
COOKIE_SECRET=dev-cookie-secret-change-in-production-min-32-chars
STORE_CORS=http://localhost:8000,http://localhost:80
ADMIN_CORS=http://localhost:9000,http://localhost:7001,http://localhost:80
```

### 4.2. Storefront (.env)

```powershell
cd ..\storefront
Copy-Item .env.template .env
```

Edite `storefront\.env`:

```bash
# Backend URL (via Docker network)
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Publishable Key (obter após primeiro start do backend)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_01JYKZBQN77AG2MRGBC4NPPQGR

# Storefront URL
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# Região padrão
NEXT_PUBLIC_DEFAULT_REGION=br
```

⚠️ **IMPORTANTE**: A `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` será gerada na primeira execução. Veja **Passo 6**.

### 4.3. Root (.env) - Opcional

```powershell
cd ..
Copy-Item .env.example .env
```

---

## 🐋 Passo 5: Subir a Stack Completa

### 5.1. Build e Start

```powershell
# Na raiz do projeto (ysh-b2b/)
docker-compose -f docker-compose.full-stack.yml up --build
```

**O que acontece**:

- 📦 Build das imagens (backend, storefront)
- 🚀 Inicia PostgreSQL, Redis, Backend, Storefront, Adminer, Redis Commander, Nginx
- ⏱️ Primeira execução: 10-15 minutos (downloads e builds)

### 5.2. Aguardar Inicialização

Aguarde até ver mensagens como:

```tsx
ysh-backend     | Server is ready on port: 9000
ysh-storefront  | Ready started server on 0.0.0.0:8000
ysh-postgres    | database system is ready to accept connections
```

### 5.3. Manter Rodando

**Deixe este terminal aberto** com os logs. Para parar: `Ctrl+C`

---

## 🗄️ Passo 6: Executar Migrações e Seed

**Abra um NOVO terminal PowerShell** (não feche o anterior):

```powershell
# Navegar para o projeto
cd C:\Users\fjuni\OneDrive\Documentos\GitHub\ysh-b2b

# Executar migrações do banco de dados
docker-compose -f docker-compose.full-stack.yml exec backend yarn medusa db:migrate

# Popular banco com dados de demonstração
docker-compose -f docker-compose.full-stack.yml exec backend yarn run seed

# Criar usuário admin
docker-compose -f docker-compose.full-stack.yml exec backend yarn medusa user -e admin@ysh.com -p Admin123! -i admin_ysh
```

---

## 🔑 Passo 7: Obter Publishable Key

### 7.1. Acessar Medusa Admin

Abra no navegador: **http://localhost:9000/app**

- **Email**: `admin@ysh.com`
- **Senha**: `Admin123!`

### 7.2. Copiar a Chave

1. No menu lateral: **Settings** → **Publishable API Keys**
2. Copie a chave que começa com `pk_`
3. Cole em `storefront\.env`:

```bash
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_01JYKZBQN77AG2MRGBC4NPPQGR
```

### 7.3. Reiniciar Storefront

```powershell
# Parar a stack (Ctrl+C no primeiro terminal)
# Depois subir novamente
docker-compose -f docker-compose.full-stack.yml up
```

---

## 🌐 Passo 8: Acessar Aplicações

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **🛒 Storefront** | http://localhost:8000 | - |
| **⚙️ Backend API** | http://localhost:9000 | - |
| **👨‍💼 Medusa Admin** | http://localhost:9000/app | admin@ysh.com / Admin123! |
| **🗃️ Adminer (DB)** | http://localhost:8080 | Server: postgres<br>User: yshuser<br>Pass: yshpass<br>DB: yshdb |
| **📊 Redis Commander** | http://localhost:8081 | admin / admin |
| **🌐 Nginx Proxy** | http://localhost:80 | - |

---

## 🔄 Comandos Úteis

### Gerenciar Containers

```powershell
# Ver status dos containers
docker-compose -f docker-compose.full-stack.yml ps

# Ver logs de um serviço específico
docker-compose -f docker-compose.full-stack.yml logs backend -f
docker-compose -f docker-compose.full-stack.yml logs storefront -f

# Parar todos os serviços
docker-compose -f docker-compose.full-stack.yml down

# Parar e remover volumes (CUIDADO: apaga dados do banco!)
docker-compose -f docker-compose.full-stack.yml down -v

# Rebuild apenas um serviço
docker-compose -f docker-compose.full-stack.yml up --build backend

# Entrar no shell de um container
docker-compose -f docker-compose.full-stack.yml exec backend sh
docker-compose -f docker-compose.full-stack.yml exec postgres psql -U yshuser -d yshdb
```

### Desenvolvimento

```powershell
# Executar comandos Medusa CLI
docker-compose -f docker-compose.full-stack.yml exec backend yarn medusa --help

# Criar nova migração após mudanças nos modelos
docker-compose -f docker-compose.full-stack.yml exec backend yarn medusa db:generate CompanyModule

# Rodar testes
docker-compose -f docker-compose.full-stack.yml exec backend yarn test:unit
docker-compose -f docker-compose.full-stack.yml exec backend yarn test:integration:http
```

---

## 🐛 Troubleshooting

### Erro: "port is already allocated"

**Solução**: Algum serviço já está usando as portas 8000, 9000, 5432, etc.

```powershell
# Verificar processos usando portas
netstat -ano | findstr :9000
netstat -ano | findstr :8000
netstat -ano | findstr :5432

# Matar processo pelo PID
taskkill /PID <PID> /F

# Ou mudar portas no docker-compose.full-stack.yml
```

### Erro: "Docker daemon is not running"

**Solução**: Inicie Docker Desktop manualmente

```powershell
# Verificar se está rodando
Get-Process "Docker Desktop" -ErrorAction SilentlyContinue

# Se não estiver, abra Docker Desktop pelo menu iniciar
```

### Erro: Containers parando imediatamente

**Solução**: Verificar logs

```powershell
# Ver logs do container com problema
docker-compose -f docker-compose.full-stack.yml logs backend
docker-compose -f docker-compose.full-stack.yml logs postgres

# Verificar se .env existe e está configurado
Test-Path backend\.env
Test-Path storefront\.env
```

### Backend não conecta ao banco

**Solução**: Aguardar healthcheck do PostgreSQL

```powershell
# Verificar saúde do banco
docker-compose -f docker-compose.full-stack.yml ps postgres

# Estado deve ser "healthy"
# Se não estiver, aguarde mais 30 segundos
```

### Hot reload não funciona no Windows

**Solução**: Já configurado no Dockerfile.dev com polling:

```dockerfile
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
```

Se ainda não funcionar, edite arquivos dentro do container:

```powershell
docker-compose -f docker-compose.full-stack.yml exec backend sh
# Dentro do container: editar em /app/src/
```

---

## 📊 Monitoramento de Recursos

### Verificar uso de CPU/Memória

```powershell
# Estatísticas em tempo real
docker stats

# Listar containers com recursos
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Size}}"
```

### Limpar recursos do Docker

```powershell
# Remover imagens não utilizadas
docker image prune -a

# Remover volumes não utilizados
docker volume prune

# Limpeza completa (CUIDADO!)
docker system prune -a --volumes
```

---

## 🎓 Próximos Passos

1. ✅ Explorar a storefront em http://localhost:8000
2. ✅ Criar produtos e categorias no Admin
3. ✅ Testar fluxo B2B (criar empresa, funcionários, cotações)
4. ✅ Verificar documentação em `docs/` e `.github/copilot-instructions.md`
5. ✅ Rodar testes para validar ambiente

---

## 📚 Recursos Adicionais

- **Documentação Medusa**: https://docs.medusajs.com
- **Docker Docs**: https://docs.docker.com/desktop/windows/
- **WSL 2 Setup**: https://learn.microsoft.com/pt-br/windows/wsl/install
- **Troubleshooting Docker**: https://docs.docker.com/desktop/troubleshoot/overview/

---

## ✅ Checklist Final

- [ ] Docker Desktop instalado e rodando
- [ ] `docker --version` e `docker-compose --version` funcionam
- [ ] `yarn --version` retorna 4.4.1+
- [ ] Arquivos `.env` criados em `backend/` e `storefront/`
- [ ] Stack iniciada com `docker-compose up --build`
- [ ] Migrações executadas com sucesso
- [ ] Seed executado (dados de demo carregados)
- [ ] Usuário admin criado
- [ ] Publishable key copiada para storefront/.env
- [ ] Storefront acessível em http://localhost:8000
- [ ] Backend Admin acessível em http://localhost:9000/app

---

**🎉 Ambiente configurado com sucesso! Você está pronto para desenvolver!**
