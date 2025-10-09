# 🚀 Guia Rápido: Inicialização do YSH Store

## 📋 Status Atual

### Problemas Identificados

- ✅ Containers Docker em loop de restart (RESOLVIDO)
- ⏳ Backend: Instalando dependências com `yarn install`
- ⏳ Storefront: Aguardando backend ficar disponível

### Serviços Necessários

| Serviço | Porta | Status | Comando |
|---------|-------|--------|---------|
| PostgreSQL | 15432 | ✅ Running | `docker ps` (ysh-b2b-postgres-dev) |
| Redis | 16379 | ✅ Running | `docker ps` (ysh-b2b-redis-dev) |
| Backend | 9000 | ⏳ Instalando | `yarn dev` |
| Storefront | 3000 | ❌ Stopped | Aguardando backend |

---

## 🔧 Comandos para Inicialização

### 1. Backend (Porta 9000)

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\backend

# Instalar dependências (se necessário)
yarn install

# Iniciar em modo desenvolvimento
yarn dev

# Ou via Docker Compose
docker-compose -f docker-compose.dev.yml up backend
```

### 2. Storefront (Porta 3000)

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\storefront

# Instalar dependências (se necessário)
yarn install

# Iniciar em modo desenvolvimento
yarn dev

# Ou via Docker Compose
docker-compose -f docker-compose.dev.yml up storefront
```

### 3. Verificar Serviços

```powershell
# Verificar portas em uso
netstat -ano | findstr :9000  # Backend
netstat -ano | findstr :3000  # Storefront
netstat -ano | findstr :15432 # PostgreSQL
netstat -ano | findstr :16379 # Redis

# Verificar containers Docker
docker ps

# Testar API Backend
curl http://localhost:9000/health

# Testar Storefront
curl http://localhost:3000
```

---

## 🗄️ Seed do Banco de Dados

### Catálogo Otimizado Disponível

**Localização**: `c:\Users\fjuni\ysh_medusa\ysh-store\backend\src\data\catalog\unified_schemas\`

**Estatísticas**:

- ✅ **1.123 produtos** normalizados
- ✅ **3.944 especificações técnicas**
- ✅ **94.1% com preços**
- ✅ **85.6% com imagens**
- ✅ **100% consistência estrutural**

### Executar Seed

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\backend

# Opção 1: Script customizado (quando disponível)
yarn seed

# Opção 2: Via CLI do Medusa
npx medusa seed --seed-file=./data/seed.ts

# Opção 3: Script TypeScript direto
npx tsx src/scripts/seed-catalog.ts
```

---

## 🐛 Troubleshooting

### Backend não inicia

**Problema**: `Restarting (254) 45 seconds ago`

**Solução**:

```powershell
# Parar containers problemáticos
docker stop ysh-b2b-backend-dev ysh-b2b-storefront-dev
docker rm ysh-b2b-backend-dev ysh-b2b-storefront-dev

# Iniciar localmente (fora do Docker)
cd c:\Users\fjuni\ysh_medusa\ysh-store\backend
yarn install
yarn dev
```

### Storefront não conecta

**Problema**: `Unable to connect to localhost:3000`

**Verificações**:

1. Backend está rodando? → `curl http://localhost:9000/health`
2. Variáveis de ambiente corretas? → Verificar `.env` no storefront
3. Porta 3000 disponível? → `netstat -ano | findstr :3000`

**Solução**:

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\storefront

# Verificar .env
cat .env

# Deve conter:
# NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Instalar e iniciar
yarn install
yarn dev
```

### Erro de dependências

**Problema**: `has unmet peer dependency` ou `has incorrect peer dependency`

**Solução**:

```powershell
# Limpar cache e reinstalar
yarn cache clean
rm -rf node_modules
rm yarn.lock
yarn install

# Ou usar legacy peer deps
yarn install --legacy-peer-deps
```

### Banco de dados vazio

**Problema**: API retorna produtos vazios

**Solução**:

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\backend

# Executar migrations
yarn medusa migrations run

# Executar seed
yarn seed
# ou
npx tsx src/scripts/seed-catalog.ts
```

---

## 📊 Verificação de Saúde

### Checklist Pós-Inicialização

- [ ] PostgreSQL respondendo na porta 15432
- [ ] Redis respondendo na porta 16379
- [ ] Backend API respondendo em `http://localhost:9000/health`
- [ ] Admin Dashboard acessível em `http://localhost:9000/app`
- [ ] Storefront acessível em `http://localhost:3000`
- [ ] Produtos visíveis no storefront
- [ ] Imagens carregando corretamente

### Comandos de Verificação

```powershell
# Health check completo
curl http://localhost:9000/health

# Verificar produtos na API
curl http://localhost:9000/store/products | jq '.products | length'

# Verificar categorias
curl http://localhost:9000/store/product-categories | jq '.product_categories | length'

# Verificar publishable key
curl http://localhost:9000/admin/publishable-api-keys -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🔄 Workflow de Desenvolvimento

### 1. Iniciar Ambiente

```powershell
# Terminal 1: Backend
cd c:\Users\fjuni\ysh_medusa\ysh-store\backend
yarn dev

# Terminal 2: Storefront
cd c:\Users\fjuni\ysh_medusa\ysh-store\storefront
yarn dev
```

### 2. Acessar Interfaces

- 🛒 **Storefront**: <http://localhost:3000>
- 🔧 **Admin Dashboard**: <http://localhost:9000/app>
- 📡 **API Docs**: <http://localhost:9000/docs> (se configurado)

### 3. Desenvolvimento

- Backend: Modificar arquivos em `backend/src/`
- Storefront: Modificar arquivos em `storefront/src/`
- Auto-reload habilitado em modo desenvolvimento

### 4. Testes

```powershell
# Backend tests
cd backend
yarn test

# Storefront tests (se configurado)
cd storefront
yarn test
```

---

## 📦 Estrutura do Projeto

```
ysh-store/
├── backend/                 # Medusa backend
│   ├── src/
│   │   ├── data/
│   │   │   └── catalog/
│   │   │       └── unified_schemas/  # 1.123 produtos otimizados
│   │   ├── scripts/
│   │   │   ├── seed-catalog.ts
│   │   │   ├── semantic-analysis.ts
│   │   │   └── optimize-technical-specs.ts
│   │   ├── admin/           # Admin customizations
│   │   ├── api/             # Custom API routes
│   │   └── models/          # Data models
│   ├── .env                 # Environment variables
│   └── package.json
│
└── storefront/              # Next.js storefront
    ├── src/
    │   ├── app/             # App router
    │   ├── modules/         # Feature modules
    │   └── lib/             # Utilities
    ├── .env.local           # Storefront environment
    └── package.json
```

---

## 🎯 Próximos Passos

1. ⏳ **Aguardar** `yarn install` do backend terminar
2. ✅ **Verificar** backend iniciado com sucesso (porta 9000)
3. 🚀 **Iniciar** storefront (porta 3000)
4. 🗄️ **Executar** seed do catálogo (1.123 produtos)
5. ✅ **Testar** acesso ao storefront em <http://localhost:3000>
6. 📊 **Validar** produtos exibidos corretamente

---

**Status Atual**: Backend instalando dependências (yarn install em progresso)  
**Última Atualização**: 07/10/2025 - 23:45  
**Responsável**: GitHub Copilot + YSH Team
