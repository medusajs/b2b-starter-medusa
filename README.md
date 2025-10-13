<h1 align="center">
  <a href="https://yellosolarhub.com"><img src="https://github.com/user-attachments/assets/38ba3a7b-e07b-4117-8187-7b171eae3769" alt="YSH B2B Solar Commerce" width="80" height="80"></a>
  <br>
  <br>
  Yello Solar Hub - B2B Commerce
  <br>
</h1>

<p align="center">🌞 Solar B2B ecommerce platform built with <a href="https://medusajs.com/" target="_blank">Medusa 2.4</a> & Next.js 15</p>

<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>

  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>

  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

<p align="center">
  <video src="https://github.com/user-attachments/assets/833b26a5-4b52-447f-ac30-6ae02cbe8f05" controls="controls" muted="muted" playsinline="playsinline">
</video>
</p>

<br>

## 📋 Índice

- [Pré-requisitos](#prerequisites)
- [Início Rápido](#quickstart)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Funcionalidades](#features)
- [🆕 FOSS Testing Stack](#-foss-testing-stack)
- [Documentação](#-documentação)
- [Comandos Úteis](#%EF%B8%8F-comandos-úteis)
- [Recursos](#-recursos)

&nbsp;

## Prerequisites

⚠️ We have tested this repo with the below versions:

- ✅ Node 20
- ✅ Postgres 15
- ✅ Medusa 2.4
- ✅ Next.js 15

### Windows development checklist

- ✅ Instale o Node via `nvm-windows` e habilite o Corepack apos selecionar a versao desejada (`nvm install 20 && nvm use 20 && corepack enable`).
- ✅ Execute `pwsh -File infra/scripts/windows/assert-non-admin.ps1` antes de rodar `yarn install` para garantir que o terminal nao esta elevado.
- ✅ Configure exclusoes do Windows Defender e desative a indexacao com `pwsh -ExecutionPolicy Bypass -File infra/scripts/windows/setup-dev-environment.ps1`.
- ✅ Garanta que o banco local usa `DATABASE_SSL=false` (valor padrao em `backend/.env.template`). Para ambientes com SSL, configure as variaveis `DATABASE_SSL`, `DATABASE_SSL_REJECT_UNAUTHORIZED` e `DATABASE_SSL_CA_FILE`.
- ✅ Para reset deterministico de dependencias, utilize `pwsh -File infra/scripts/windows/reset-node-modules.ps1 -WorkspacePath ../backend` (ajuste o caminho para cada workspace).
- ➕ Consulte `infra/docs/windows-dev-checklist.md` para instrucoes completas.

&nbsp;

## Overview

For a full feature overview, please visit [the project wiki](https://github.com/medusajs/b2b-starter-medusa/wiki).

#### Core features

- **Company Management**. Customers can manage their company and invite employees.
- **Spending Limits**. Company admins can assign spending limits to its employees.
- **Bulk add-to-cart**. Customers can add multiple variants of a product to their cart at once.
- **Quote Management**. Customers & Merchants can communicate, accept or reject quotes.
- **Order Edit**. Merchants can edit orders or quotes - add/remove item, update quantity & price management and more.
- **Company Approvals**. Companies can mandate approvals from company admins before employees can finalize a cart.
- **Merchant Approvals**. Merchants can set up approval processes for orders, ensuring compliance with business rules before fulfillment.
- **Promotions**. Customers can apply manual and automatic promotions to their cart.
- **Free Shipping Nudge**. Displays a component showing progress toward free shipping.
- **Full ecommerce support**
  - Product Pages
  - Product Collections & Categories
  - Cart & Checkout
  - User Accounts
  - Order Details
- **Full Next.js 15 support**
  - App Router
  - Caching
  - Server components/actions
  - Streaming
  - Static Pre-Rendering

&nbsp;

#### Demo

#### Quote Management

<img align="right" src="https://github.com/user-attachments/assets/110c99e8-18ba-49e5-8955-84a058b597c7" alt="image" style=: />
&nbsp;

#### Company Management

<img align="right" src="https://github.com/user-attachments/assets/361702ce-d491-4509-a930-4361ab3b4126" alt="image" style=: />
&nbsp;

#### Approval Management

<img align="right" src="https://github.com/user-attachments/assets/b93b7b94-41a9-4c5f-bd6b-abf87492ed46" alt="image" style=: />
&nbsp;

#### Product Page

<img align="right" src="https://github.com/user-attachments/assets/2cd8a3ff-5999-49af-890a-4bac7b6f2f15" alt="image" style=: />
&nbsp;

#### Cart Summary

<img align="right" src="https://github.com/user-attachments/assets/095f5565-992e-4c74-acdc-a44bd905e59b" alt="image" style=: />
&nbsp;

&nbsp;

## 🆕 FOSS Testing Stack

**100% Free and Open Source Software** - Zero vendor lock-in, $20k/year savings

### What's Included

- **✅ Visual Regression** - BackstopJS (replaces Chromatic SaaS)
- **✅ Contract Testing** - Pact Framework + Pact Broker Docker (replaces Pact SaaS)
- **✅ Automation** - Node-RED + Mosquitto MQTT
- **✅ E2E Testing** - 71 Playwright tests (3 shards, 95% coverage)
- **✅ Observability** - Prometheus + Grafana + Jaeger + Loki

### Quick Start

```powershell
# Start FOSS stack (15+ services)
docker-compose -f docker-compose.foss.yml up -d

# Start Node-RED automation
docker-compose -f docker-compose.node-red.yml up -d

# Run visual regression tests
cd storefront
npx backstop test --config=backstop/backstop.json

# Run contract tests
npm run test:pact:consumer
```

### Service Endpoints

| Service | URL | Credentials |
|---------|-----|-------------|
| **Pact Broker** | <http://localhost:9292> | pact/pact |
| **Node-RED** | <http://localhost:1880> | admin/admin |
| **Grafana** | <http://localhost:3001> | admin/admin |
| **Prometheus** | <http://localhost:9090> | - |
| **Jaeger** | <http://localhost:16686> | - |
| **Mailhog** | <http://localhost:8025> | - |

### Documentation

📚 **[Complete FOSS Testing Documentation Index](./FOSS_TESTING_DOCUMENTATION_INDEX.md)**

Key guides:

- [FOSS Stack Migration Summary](./FOSS_STACK_MIGRATION_SUMMARY.md) - Executive overview
- [Visual Regression Guide](./VISUAL_REGRESSION_FOSS_GUIDE.md) - BackstopJS complete guide
- [Contract Testing Guide](./CONTRACT_TESTING_FOSS_GUIDE.md) - Pact Framework guide
- [Pact Provider Guide](./backend/docs/api/PACT_PROVIDER_GUIDE.md) - Backend contract verification
- [Node-RED Automation Guide](./NODE_RED_AUTOMATION_GUIDE.md) - Automation flows
- [E2E Coverage Expansion](./E2E_COVERAGE_EXPANSION_SUMMARY.md) - 71 tests (18→71, +295%)

&nbsp;

## 📁 Estrutura do Projeto

```
ysh-store/
├── backend/                    # Servidor Medusa 2.4
│   ├── src/
│   │   ├── api/               # Rotas API (store/ e admin/)
│   │   ├── modules/           # Módulos B2B customizados
│   │   │   ├── company/      # Gerenciamento de empresas
│   │   │   ├── quote/        # Sistema de cotações
│   │   │   └── approval/     # Workflows de aprovação
│   │   ├── workflows/         # Orquestração de lógica de negócio
│   │   ├── links/            # Links entre módulos
│   │   └── types/            # DTOs e tipos compartilhados
│   ├── scripts/
│   │   ├── seed/             # Scripts de seed de dados
│   │   └── database/         # Scripts de banco de dados
│   ├── docs/
│   │   ├── api/              # Documentação de API
│   │   ├── database/         # Guias de migração DB
│   │   ├── security/         # Auditorias de segurança
│   │   └── testing/          # Relatórios de testes
│   └── integration-tests/     # Testes de integração
│
├── storefront/                 # Next.js 15 App Router
│   ├── src/
│   │   ├── app/[countryCode]/ # Rotas multi-região
│   │   │   ├── (main)/       # Páginas principais
│   │   │   └── (checkout)/   # Fluxo de checkout
│   │   ├── modules/           # Módulos por funcionalidade
│   │   │   ├── account/      # Gerenciamento de conta
│   │   │   ├── cart/         # Carrinho de compras
│   │   │   ├── products/     # Catálogo de produtos
│   │   │   └── quotes/       # Interface de cotações
│   │   └── lib/
│   │       ├── data/         # Server actions (busca de dados)
│   │       ├── config/       # Configuração do SDK
│   │       └── hooks/        # Hooks customizados
│   ├── docs/
│   │   ├── testing/          # Relatórios de testes E2E
│   │   └── implementation/   # Documentação de features
│   └── e2e/                   # Testes Playwright (71 tests)
│
├── docs/                       # 📚 Documentação central
│   ├── deployment/            # Guias de deployment
│   │   ├── AWS_DEPLOYMENT_STATUS.md
│   │   ├── AWS_FREE_TIER_DEPLOYMENT_GUIDE.md
│   │   ├── LOCAL_DEPLOYMENT_SUCCESS.md
│   │   └── QUICK_START.md
│   ├── testing/               # Stack de testes FOSS
│   │   ├── BACKEND_360_COVERAGE_REPORT.md
│   │   ├── CONTRACT_TESTING_FOSS_GUIDE.md
│   │   ├── VISUAL_REGRESSION_FOSS_GUIDE.md
│   │   └── PACT_SETUP_GUIDE.md
│   └── infrastructure/        # Infraestrutura FOSS
│       ├── FOSS_IMPLEMENTATION_COMPLETE.md
│       ├── FOSS_STACK_MIGRATION_SUMMARY.md
│       └── NODE_RED_AUTOMATION_GUIDE.md
│
├── docker/                     # 🐳 Configurações Docker
│   ├── docker-compose.yml     # Produção
│   ├── docker-compose.dev.yml # Desenvolvimento
│   ├── docker-compose.foss.yml # Stack FOSS (15+ services)
│   └── nginx.conf             # Configuração Nginx
│
├── aws/                        # ☁️ Infraestrutura AWS
│   ├── cloudformation-infrastructure.yml
│   ├── backend-task-definition.json
│   └── aws-outputs.json
│
├── infra/                      # Scripts de infraestrutura
│   ├── scripts/
│   │   └── windows/          # Setup para Windows
│   └── docs/
│       └── windows-dev-checklist.md
│
├── scripts/                    # Scripts utilitários
│   └── seed.ts               # Seed inicial do banco
│
└── .github/                    # GitHub configs
    └── copilot-instructions.md # Instruções para Copilot
```

## Quickstart

### Opção 1: Docker (Recomendado)

```bash
# Iniciar todos os serviços
docker-compose up -d

# Executar migrations
docker-compose exec backend yarn medusa db:migrate

# Seed inicial
docker-compose exec backend yarn run seed

# Criar usuário admin
docker-compose exec backend yarn medusa user -e admin@test.com -p supersecret -i admin
```

Acesse:

- Backend: <http://localhost:9000>
- Admin: <http://localhost:9000/app>
- Storefront: <http://localhost:8000>

### Opção 2: Setup Manual

#### Setup Medusa project

```bash
# Clone the repository
git clone https://github.com/medusajs/b2b-starter-medusa.git

## Setup Backend

# Go to the folder
cd ./backend

# Clone .env.template
cp .env.template .env

# ⚠️ IMPORTANTE: Configure as chaves de API para RAG (Hélio Copiloto)
# Edite o arquivo .env e adicione:
#   OPENAI_API_KEY=sk-your-key-here
#   QDRANT_API_KEY=your-qdrant-key-here
#   QDRANT_URL=http://localhost:6333 (ou sua URL do Qdrant Cloud)
# 
# 📚 Consulte: backend/API_KEYS_GUIDE.md para instruções detalhadas
# ✅ Valide com: yarn validate:api-keys

# Install dependencies
yarn install

# Install dependencies, setup database & seed data
yarn install && yarn medusa db:create && yarn medusa db:migrate && yarn run seed && yarn medusa user -e admin@test.com -p supersecret -i admin

# Start Medusa project - backend & admin
yarn dev

## Setup Storefront

# Go to folder
cd ../storefront

# Clone .env.template
cp .env.template .env

# Install dependencies
yarn install
```

#### Setup publishable key

- ✅ Visit [Admin: Publishable Key](http://localhost:9000/app/settings/publishable-api-keys)
  - <b>Credentials</b>:
    - <b>email</b>: `admin@test.com`
    - <b>password</b>: `supersecret`
- ✅ Copy token key of "Webshop"
- ✅ Open file - `storefront/.env`
- ✅ Add token to this var - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`

```
# Start Medusa storefront
yarn dev
```

Visit the following links to see the Medusa storefront & admin

- [Medusa Admin](http://localhost:9000/app)
- [Medusa Storefront](http://localhost:8000)

&nbsp;

## 📚 Documentação

Toda documentação foi reorganizada para facilitar navegação:

### 📂 Estrutura de Documentação

#### Root (`docs/`)

- **`deployment/`** - Guias de deployment (AWS, Docker, Local)
- **`testing/`** - Stack de testes FOSS (Visual, Contract, E2E)
- **`infrastructure/`** - Implementação FOSS e automação

#### Backend (`backend/docs/`)

- **`api/`** - Documentação de rotas API
  - [API Response Quick Reference](./backend/docs/api/API_RESPONSE_QUICK_REFERENCE.md) - Guia rápido de envelopes
  - [Pact Provider Guide](./backend/docs/api/PACT_PROVIDER_GUIDE.md) - Verificação de contratos
  - [Backend APIs v2 Complete](./backend/docs/api/BACKEND_APIS_MEGA_PROMPT_V2_COMPLETE.md) - Implementação completa
- **`database/`** - Guias de migração e schemas
- **`security/`** - Auditorias de segurança
- **`testing/`** - Relatórios de cobertura 360°

#### Storefront (`storefront/docs/`)

- **`testing/`** - Relatórios de testes E2E (71 tests)
- **`implementation/`** - Documentação de features implementadas

### 📖 Documentos Principais

| Documento | Localização | Descrição |
|-----------|-------------|-----------|
| [Quick Start](./docs/deployment/QUICK_START.md) | `docs/deployment/` | Guia de início rápido |
| [FOSS Stack Guide](./docs/infrastructure/FOSS_IMPLEMENTATION_COMPLETE.md) | `docs/infrastructure/` | Stack FOSS completo |
| [Testing Guide](./docs/testing/FOSS_TESTING_DOCUMENTATION_INDEX.md) | `docs/testing/` | Índice de testes FOSS |
| [API Documentation](./backend/docs/api/API_DOCUMENTATION_GUIDE.md) | `backend/docs/api/` | Guia de APIs |
| [API Response Reference](./backend/docs/api/API_RESPONSE_QUICK_REFERENCE.md) | `backend/docs/api/` | Envelopes padronizados |
| [Pact Provider Guide](./backend/docs/api/PACT_PROVIDER_GUIDE.md) | `backend/docs/api/` | Contract testing |
| [Database Migration](./backend/docs/database/DATABASE_MIGRATION_GUIDE.md) | `backend/docs/database/` | Guia de migrações |

## 🛠️ Comandos Úteis

### Desenvolvimento Local

```powershell
# Backend
cd backend
yarn dev              # Inicia backend + admin

# Storefront
cd storefront
yarn dev              # Inicia storefront

# Banco de dados
cd backend
yarn medusa db:create   # Criar banco
yarn medusa db:migrate  # Executar migrations
yarn run seed          # Seed de dados inicial
```

### Docker

```powershell
# Desenvolvimento
docker-compose -f docker/docker-compose.dev.yml up -d

# Stack FOSS (Testing)
docker-compose -f docker/docker-compose.foss.yml up -d

# Produção
docker-compose -f docker/docker-compose.yml up -d

# Automation
docker-compose -f docker/docker-compose.node-red.yml up -d
```

### Testes

```powershell
# Backend
cd backend
yarn test:unit                    # Testes unitários (329 passing)
yarn test:integration:modules     # Testes de módulos
yarn test:integration:http        # Testes de API
yarn test:pact:provider           # Contract tests (Provider)

# Storefront
cd storefront
npx playwright test               # E2E tests (71 tests)
npx backstop test                 # Visual regression
npm run test:pact:consumer        # Contract tests (Consumer)
```

## 🔄 Update

### Atualizar Pacotes

```bash
# Backend
cd backend && yarn install

# Storefront
cd storefront && yarn install
```

### Executar Migrations

```bash
cd backend
npx medusa db:migrate
```

> **Nota**: Se estiver atualizando de uma versão sem o módulo Approval, execute:
>
> ```bash
> npx medusa exec src/scripts/create-approval-settings.ts
> ```

## 📖 Recursos

### Aprenda mais sobre Medusa

- [Website](https://www.medusajs.com/)
- [GitHub](https://github.com/medusajs)
- [Documentação 2.0](https://docs.medusajs.com/v2)

### Aprenda mais sobre Next.js

- [Website](https://nextjs.org/)
- [GitHub](https://github.com/vercel/next.js)
- [Documentação](https://nextjs.org/docs)

### Documentação Interna

- [📚 Índice Completo de Documentação](./DOCUMENTATION_INDEX.md)
- [🔧 Backend Architecture](./.github/copilot-instructions.md)
- [🛍️ Storefront Guide](./storefront/AGENTS.md)

&nbsp;

## 🤝 Contribuidores

Baseado no [B2B Starter Medusa](https://github.com/medusajs/b2b-starter-medusa) com customizações para Yello Solar Hub.
