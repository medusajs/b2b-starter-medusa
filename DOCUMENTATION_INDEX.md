# 📚 Índice de Documentação - YSH B2B Solar Commerce

**Última atualização**: 12/10/2025

> 🎯 **Nova Estrutura Organizada**: Toda documentação foi reorganizada em categorias lógicas para facilitar navegação e manutenção.

---

## 🗂️ Estrutura de Documentação

```tsx
ysh-store/
├── docs/                          # 📚 Documentação Central
│   ├── deployment/               # Guias de deployment
│   ├── testing/                  # Stack de testes FOSS
│   └── infrastructure/           # Infraestrutura FOSS
│
├── backend/docs/                  # 🔧 Documentação Backend
│   ├── api/                      # Documentação de API
│   ├── database/                 # Guias de migração DB
│   ├── security/                 # Auditorias de segurança
│   └── testing/                  # Relatórios de testes
│
└── storefront/docs/               # 🛍️ Documentação Storefront
    ├── testing/                  # Relatórios de testes E2E
    └── implementation/           # Documentação de features
```

---

## 🎯 Início Rápido

### Documentos Essenciais

| Documento | Localização | Descrição |
|-----------|-------------|-----------|
| 📖 [README Principal](./README.md) | Root | Visão geral e setup |
| 🚀 [Quick Start](./docs/deployment/QUICK_START.md) | `docs/deployment/` | Guia de início rápido |
| 🔑 [Publishable Key Guide](./docs/deployment/PUBLISHABLE_KEY_QUICKSTART.md) | `docs/deployment/` | Configuração de chave |

---

## 📂 Documentação por Categoria

### 🚀 Deployment (`docs/deployment/`)

#### AWS

- [AWS Deployment Status](./docs/deployment/AWS_DEPLOYMENT_STATUS.md) - Status atual do deployment
- [AWS Free Tier Guide](./docs/deployment/AWS_FREE_TIER_DEPLOYMENT_GUIDE.md) - Deploy gratuito na AWS
- [Deployment Executive Summary](./docs/deployment/DEPLOYMENT_EXECUTIVE_SUMMARY.md) - Sumário executivo

#### Local

- [Local Deployment Success](./docs/deployment/LOCAL_DEPLOYMENT_SUCCESS.md) - Deploy local bem-sucedido
- [Quick Start Guide](./docs/deployment/QUICK_START.md) - Início rápido
- [Publishable Key Quickstart](./docs/deployment/PUBLISHABLE_KEY_QUICKSTART.md) - Setup de chave

### 🧪 Testing (`docs/testing/`)

#### Cobertura

- [Backend 360 Coverage Report](./docs/testing/BACKEND_360_COVERAGE_REPORT.md) - Cobertura completa backend
- [Cobertura 360 Local Docker](./docs/testing/COBERTURA_360_LOCAL_DOCKER.md) - Cobertura em Docker

#### Stack FOSS

- [FOSS Testing Documentation Index](./docs/testing/FOSS_TESTING_DOCUMENTATION_INDEX.md) - 📚 Índice completo
- [Contract Testing FOSS Guide](./docs/testing/CONTRACT_TESTING_FOSS_GUIDE.md) - Testes de contrato
- [Pact Setup Guide](./docs/testing/PACT_SETUP_GUIDE.md) - Setup Pact Framework
- [Visual Regression FOSS Guide](./docs/testing/VISUAL_REGRESSION_FOSS_GUIDE.md) - Testes visuais
- [Visual Tests Guide](./docs/testing/VISUAL_TESTS_GUIDE.md) - Guia de testes visuais
- [Visual Tests Final Report](./docs/testing/VISUAL_TESTS_FINAL_REPORT.md) - Relatório final
- [Visual Test Status](./docs/testing/VISUAL_TEST_STATUS.md) - Status atual

### 🏗️ Infrastructure (`docs/infrastructure/`)

- [FOSS Implementation Complete](./docs/infrastructure/FOSS_IMPLEMENTATION_COMPLETE.md) - Stack FOSS completo
- [FOSS Stack Migration Summary](./docs/infrastructure/FOSS_STACK_MIGRATION_SUMMARY.md) - Resumo da migração
- [Install FOSS Dependencies](./docs/infrastructure/INSTALL_FOSS_DEPENDENCIES.md) - Instalação de dependências
- [Node-RED Automation Guide](./docs/infrastructure/NODE_RED_AUTOMATION_GUIDE.md) - Automação com Node-RED

---

## 🔧 Backend (`backend/docs/`)

### API Documentation (`backend/docs/api/`)

- [API Documentation Guide](./backend/docs/api/API_DOCUMENTATION_GUIDE.md) - Guia completo de APIs

### Database (`backend/docs/database/`)

- [Database Migration Guide](./backend/docs/database/DATABASE_MIGRATION_GUIDE.md) - Guia de migrações

### Security (`backend/docs/security/`)

- [Security Audit Report](./backend/docs/security/SECURITY_AUDIT_REPORT.md) - Auditoria de segurança

### Testing (`backend/docs/testing/`)

- [Backend 360 E2E Report](./backend/docs/testing/BACKEND_360_E2E_REPORT.md) - Testes E2E completos
- [Backend 360 Review Report](./backend/docs/testing/BACKEND_360_REVIEW_REPORT.md) - Review 360°

### Documentação Adicional

- [Backend 100 Funcional](./BACKEND_100_FUNCIONAL.md) - Backend funcionando 100%
- [Commit Summary](./COMMIT_SUMMARY.md) - Resumo de commits importantes
- [Documentation Index](./backend/DOCUMENTATION_INDEX.md) - Índice backend

---

## 🛍️ Storefront (`storefront/docs/`)

### Testing (`storefront/docs/testing/`)

- [E2E Coverage Expansion Summary](./storefront/docs/testing/E2E_COVERAGE_EXPANSION_SUMMARY.md) - 71 testes E2E
- [Storefront 360 Review Report](./storefront/docs/testing/STOREFRONT_360_REVIEW_REPORT.md) - Review completo

### Implementation (`storefront/docs/implementation/`)

- [Final Implementation Report](./storefront/docs/implementation/FINAL_IMPLEMENTATION_REPORT.md) - Relatório final
- [Follow-up Implementation](./storefront/docs/implementation/FOLLOW_UP_IMPLEMENTATION.md) - Acompanhamento
- [Implementation Summary](./storefront/docs/implementation/IMPLEMENTATION_SUMMARY.md) - Resumo geral

### Guias

- [Agents Guide](./storefront/AGENTS.md) - Guia para AI Agents

---

## � Docker (`docker/`)

### Arquivos Docker Compose

| Arquivo | Propósito | Uso |
|---------|-----------|-----|
| `docker-compose.yml` | Produção | Deploy produção |
| `docker-compose.dev.yml` | Desenvolvimento | Dev simplificado |
| `docker-compose.dev.resilient.yml` | Dev Resiliente | Dev com retry |
| `docker-compose.optimized.yml` | Otimizado | Performance |
| `docker-compose.foss.yml` | Stack FOSS | 15+ serviços FOSS |
| `docker-compose.node-red.yml` | Automação | Node-RED + MQTT |
| `docker-compose.localstack.yml` | LocalStack | AWS local |
| `docker-compose.free-tier-dev.yml` | Free Tier | AWS Free Tier |

### Configuração

- [nginx.conf](./docker/nginx.conf) - Configuração Nginx

---

## 🛠️ Scripts Backend (`backend/scripts/`)

### Seed (`backend/scripts/seed/`)

- `seed-catalog.js` - Seed do catálogo
- `seed-catalog-direct.js` - Seed direto
- `seed-catalog-container.js` - Seed em container
- `seed-direct.js` - Seed direto geral

### Database (`backend/scripts/database/`)

- `create-publishable-key.js` - Criar chave publicável
- `create-unified-catalog-tables.sql` - Criar tabelas de catálogo

---

## ☁️ AWS (`aws/`)

### Configurações CloudFormation

- [cloudformation-infrastructure.yml](./aws/cloudformation-infrastructure.yml) - Infraestrutura principal
- [cloudformation-free-tier.yml](./aws/cloudformation-free-tier.yml) - Free Tier

### Task Definitions

- [backend-task-definition.json](./aws/backend-task-definition.json) - Backend ECS
- [backend-migrations-task-definition.json](./aws/backend-migrations-task-definition.json) - Migrations
- [backend-migrations-seed-task-definition.json](./aws/backend-migrations-seed-task-definition.json) - Migrations + Seed
- [storefront-task-definition.json](./aws/storefront-task-definition.json) - Storefront ECS

### Configurações

- [ecs-services-config.json](./aws/ecs-services-config.json) - Configuração de serviços
- [target-groups-config.json](./aws/target-groups-config.json) - Target groups
- [aws-outputs.json](./aws/aws-outputs.json) - Outputs do deployment

---

## � Como Encontrar Documentação

### Por Categoria

1. **Deployment e Setup**
   - 📂 `docs/deployment/`
   - 📂 `aws/`

2. **Testes e QA**
   - 📂 `docs/testing/`
   - 📂 `backend/docs/testing/`
   - 📂 `storefront/docs/testing/`

3. **Desenvolvimento**
   - 📂 `backend/docs/api/`
   - 📂 `storefront/docs/implementation/`

4. **Infraestrutura**
   - 📂 `docs/infrastructure/`
   - 📂 `docker/`

### Por Workspace

- **Backend**: `backend/docs/` + `backend/README.md`
- **Storefront**: `storefront/docs/` + `storefront/AGENTS.md`
- **Root**: `docs/` + `README.md`

---

## 🆘 Troubleshooting

### Problemas Comuns

| Problema | Documento | Ação |
|----------|-----------|------|
| Backend não inicia | [Quick Start](./docs/deployment/QUICK_START.md) | Verificar configuração |
| Publishable Key | [Publishable Key Guide](./docs/deployment/PUBLISHABLE_KEY_QUICKSTART.md) | Configurar chave |
| Docker issues | [Docker Guide](./docker/) | Verificar compose files |
| AWS deployment | [AWS Deployment](./docs/deployment/AWS_DEPLOYMENT_STATUS.md) | Verificar task definitions |

---

## 📞 Suporte

- **Email**: <fernando@yellosolarhub.com>
- **GitHub**: <https://github.com/own-boldsbrain/ysh-b2b>
- **Discord Medusa**: <https://discord.gg/xpCwq3Kfn8>

---

## 📋 Checklist de Documentação

- ✅ Estrutura reorganizada em categorias lógicas
- ✅ Documentação separada por workspace (root, backend, storefront)
- ✅ Scripts organizados em subpastas
- ✅ Docker compose files consolidados
- ✅ AWS configs centralizados
- ✅ Índices atualizados
- ✅ Links funcionais

---

**Última revisão**: 12/10/2025 por Fernando Junio  
**Status**: ✅ Reorganização completa concluída
