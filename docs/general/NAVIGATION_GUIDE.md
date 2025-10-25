# 🗺️ Guia Rápido de Navegação - Estrutura Reorganizada

**Data**: 12/10/2025  
**Versão**: 1.0

---

## 🎯 Acesso Rápido

### 📖 Documentação Principal

| O que você precisa | Onde encontrar |
|-------------------|----------------|
| Visão geral do projeto | `README.md` |
| Índice completo de docs | `DOCUMENTATION_INDEX.md` |
| Resumo da organização | `ORGANIZATION_SUMMARY.md` |
| Guia de navegação | `NAVIGATION_GUIDE.md` (este arquivo) |

### 🚀 Deployment

| Tipo de Deploy | Arquivo |
|---------------|---------|
| Quick Start | `docs/deployment/QUICK_START.md` |
| AWS Status | `docs/deployment/AWS_DEPLOYMENT_STATUS.md` |
| AWS Free Tier | `docs/deployment/AWS_FREE_TIER_DEPLOYMENT_GUIDE.md` |
| Local Success | `docs/deployment/LOCAL_DEPLOYMENT_SUCCESS.md` |
| Publishable Key | `docs/deployment/PUBLISHABLE_KEY_QUICKSTART.md` |

### 🧪 Testing

| Tipo de Teste | Arquivo |
|--------------|---------|
| Índice FOSS | `docs/testing/FOSS_TESTING_DOCUMENTATION_INDEX.md` |
| Contract Tests | `docs/testing/CONTRACT_TESTING_FOSS_GUIDE.md` |
| Visual Tests | `docs/testing/VISUAL_REGRESSION_FOSS_GUIDE.md` |
| Pact Setup | `docs/testing/PACT_SETUP_GUIDE.md` |
| Coverage 360 | `docs/testing/BACKEND_360_COVERAGE_REPORT.md` |

### 🐳 Docker

| Ambiente | Arquivo |
|----------|---------|
| Desenvolvimento | `docker/docker-compose.dev.yml` |
| Dev Resiliente | `docker/docker-compose.dev.resilient.yml` |
| Produção | `docker/docker-compose.yml` |
| Stack FOSS | `docker/docker-compose.foss.yml` |
| Node-RED | `docker/docker-compose.node-red.yml` |
| Otimizado | `docker/docker-compose.optimized.yml` |
| LocalStack | `docker/docker-compose.localstack.yml` |
| Free Tier Dev | `docker/docker-compose.free-tier-dev.yml` |

---

## 🔧 Backend

### Documentação Backend

| Categoria | Localização |
|-----------|-------------|
| API Docs | `backend/docs/api/API_DOCUMENTATION_GUIDE.md` |
| Database | `backend/docs/database/DATABASE_MIGRATION_GUIDE.md` |
| Security | `backend/docs/security/SECURITY_AUDIT_REPORT.md` |
| Testing | `backend/docs/testing/BACKEND_360_E2E_REPORT.md` |

### Scripts Backend

| Tipo | Localização |
|------|-------------|
| Seed Scripts | `backend/scripts/seed/` |
| - Catalog Seed | `backend/scripts/seed/seed-catalog.js` |
| - Direct Seed | `backend/scripts/seed/seed-direct.js` |
| Database Scripts | `backend/scripts/database/` |
| - Publishable Key | `backend/scripts/database/create-publishable-key.js` |
| - Catalog Tables | `backend/scripts/database/create-unified-catalog-tables.sql` |

### Comandos Backend

```powershell
# Desenvolvimento
cd backend
yarn dev

# Banco de dados
yarn medusa db:create
yarn medusa db:migrate
yarn run seed

# Testes
yarn test:unit
yarn test:integration:modules
yarn test:integration:http
```

---

## 🛍️ Storefront

### Documentação Storefront

| Categoria | Localização |
|-----------|-------------|
| E2E Tests | `storefront/docs/testing/E2E_COVERAGE_EXPANSION_SUMMARY.md` |
| 360 Review | `storefront/docs/testing/STOREFRONT_360_REVIEW_REPORT.md` |
| Implementation | `storefront/docs/implementation/IMPLEMENTATION_SUMMARY.md` |
| Agents Guide | `storefront/AGENTS.md` |

### Comandos Storefront

```powershell
# Desenvolvimento
cd storefront
yarn dev

# Testes
npx playwright test              # E2E (71 tests)
npx backstop test               # Visual regression
npm run test:pact:consumer      # Contract tests

# Build
yarn build
```

---

## ☁️ AWS

### Configurações AWS

| Tipo | Arquivo |
|------|---------|
| Infrastructure | `aws/cloudformation-infrastructure.yml` |
| Free Tier | `aws/cloudformation-free-tier.yml` |
| Backend Task | `aws/backend-task-definition.json` |
| Storefront Task | `aws/storefront-task-definition.json` |
| Migrations | `aws/backend-migrations-task-definition.json` |
| ECS Services | `aws/ecs-services-config.json` |
| Target Groups | `aws/target-groups-config.json` |
| Outputs | `aws/aws-outputs.json` |

---

## 🔍 Busca Rápida

### Por Funcionalidade

**Setup Inicial**

1. `README.md` - Visão geral
2. `docs/deployment/QUICK_START.md` - Início rápido
3. `docs/deployment/PUBLISHABLE_KEY_QUICKSTART.md` - Configuração de chave

**Desenvolvimento Local**

1. `docker/docker-compose.dev.yml` - Docker para dev
2. `backend/README.md` - Setup backend
3. `storefront/AGENTS.md` - Guia storefront

**Testes**

1. `docs/testing/FOSS_TESTING_DOCUMENTATION_INDEX.md` - Índice completo
2. `backend/docs/testing/BACKEND_360_E2E_REPORT.md` - Testes backend
3. `storefront/docs/testing/E2E_COVERAGE_EXPANSION_SUMMARY.md` - Testes frontend

**Deployment**

1. `docs/deployment/AWS_DEPLOYMENT_STATUS.md` - Status AWS
2. `aws/cloudformation-infrastructure.yml` - CloudFormation
3. `docker/docker-compose.yml` - Produção

### Por Workspace

**Root**

- Documentação: `docs/`
- Docker: `docker/`
- AWS: `aws/`

**Backend**

- Código: `backend/src/`
- Docs: `backend/docs/`
- Scripts: `backend/scripts/`
- Testes: `backend/integration-tests/`

**Storefront**

- Código: `storefront/src/`
- Docs: `storefront/docs/`
- Testes: `storefront/e2e/`

---

## 📝 Padrões de Nomenclatura

### Arquivos de Documentação

- `*_GUIDE.md` - Guias tutoriais
- `*_STATUS.md` - Relatórios de status
- `*_REPORT.md` - Relatórios técnicos
- `*_SUMMARY.md` - Resumos executivos
- `README.md` - Visão geral de diretório

### Docker Compose

- `docker-compose.yml` - Produção base
- `docker-compose.*.yml` - Variantes específicas
  - `.dev` - Desenvolvimento
  - `.foss` - Stack FOSS
  - `.optimized` - Otimizado
  - `.localstack` - LocalStack

---

## 🚦 Fluxo de Trabalho Comum

### 1. Primeiro Setup

```powershell
# 1. Ler documentação
cat README.md
cat docs/deployment/QUICK_START.md

# 2. Setup com Docker
docker-compose -f docker/docker-compose.dev.yml up -d

# 3. Migrations e Seed
docker-compose exec backend yarn medusa db:migrate
docker-compose exec backend yarn run seed

# 4. Criar admin user
docker-compose exec backend yarn medusa user -e admin@test.com -p supersecret -i admin

# 5. Configurar publishable key
# Ver docs/deployment/PUBLISHABLE_KEY_QUICKSTART.md
```

### 2. Desenvolvimento Diário

```powershell
# Backend
cd backend
yarn dev

# Storefront (outro terminal)
cd storefront
yarn dev
```

### 3. Testes

```powershell
# Backend tests
cd backend
yarn test:unit
yarn test:integration:http

# Storefront tests
cd storefront
npx playwright test
```

### 4. Deploy

```powershell
# Build produção
docker-compose -f docker/docker-compose.yml up -d

# OU deploy AWS
# Ver docs/deployment/AWS_DEPLOYMENT_STATUS.md
```

---

## 🆘 Troubleshooting Rápido

| Problema | Onde Buscar Ajuda |
|----------|-------------------|
| Backend não inicia | `docs/deployment/QUICK_START.md` |
| Publishable key erro | `docs/deployment/PUBLISHABLE_KEY_QUICKSTART.md` |
| Docker issues | `docker/*.yml` + logs |
| Testes falhando | `docs/testing/FOSS_TESTING_DOCUMENTATION_INDEX.md` |
| AWS deployment | `docs/deployment/AWS_DEPLOYMENT_STATUS.md` |

---

## 📞 Suporte

- **Email**: <fernando@yellosolarhub.com>
- **GitHub**: <https://github.com/own-boldsbrain/ysh-b2b>
- **Discord Medusa**: <https://discord.gg/xpCwq3Kfn8>

---

## 🔄 Última Atualização

**Data**: 12/10/2025  
**Por**: Fernando Junio  
**Versão**: 1.0 - Estrutura reorganizada

---

**💡 Dica**: Adicione este arquivo aos seus bookmarks para acesso rápido à estrutura do projeto!
