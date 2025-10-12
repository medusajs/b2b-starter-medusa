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
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#features)
- [🆕 FOSS Testing Stack](#foss-testing-stack)
- [Documentação](#documentação)
- [Scripts Úteis](#scripts-úteis)
- [Recursos](#resources)

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
- [Node-RED Automation Guide](./NODE_RED_AUTOMATION_GUIDE.md) - Automation flows
- [E2E Coverage Expansion](./E2E_COVERAGE_EXPANSION_SUMMARY.md) - 71 tests (18→71, +295%)

&nbsp;

## 📁 Estrutura do Projeto

```
ysh-store/
├── backend/              # Servidor Medusa 2.4
│   ├── src/             # Código fonte
│   │   ├── api/         # Rotas API
│   │   ├── modules/     # Módulos B2B (company, quote, approval)
│   │   ├── workflows/   # Workflows Medusa
│   │   ├── links/       # Links entre módulos
│   │   └── scripts/     # Scripts utilitários
│   └── database/        # Migrations e schemas
│
├── storefront/          # Next.js 15 App Router
│   ├── src/
│   │   ├── app/         # Páginas Next.js
│   │   ├── modules/     # Módulos de funcionalidade
│   │   ├── lib/         # Utilitários e data fetching
│   │   └── components/  # Componentes compartilhados
│   └── public/          # Assets estáticos
│
├── docs/                # Documentação organizada
│   ├── status/          # Relatórios de status
│   ├── guides/          # Guias e tutoriais
│   ├── deployment/      # Documentos de deployment
│   ├── docker/          # Documentação Docker
│   └── implementation/  # Relatórios de implementação
│
├── scripts/             # Scripts organizados
│   ├── dev/            # Scripts de desenvolvimento
│   ├── docker/         # Scripts Docker
│   └── deployment/     # Scripts de deployment
│
├── aws/                # Configurações AWS
├── infra/              # Infraestrutura e configs
└── .archive/           # Arquivos históricos
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

Toda documentação foi reorganizada em `docs/`:

- **`docs/status/`** - Relatórios de status do sistema
- **`docs/guides/`** - Guias rápidos e tutoriais
- **`docs/deployment/`** - Documentação de deployment (AWS, Docker, etc)
- **`docs/docker/`** - Configurações e otimizações Docker
- **`docs/implementation/`** - Relatórios de implementação de features

## 🛠️ Scripts Úteis

### Desenvolvimento

```bash
# Iniciar ambiente de desenvolvimento
.\scripts\dev\dev.ps1

# Verificar status dos serviços
.\scripts\dev\status.ps1

# Verificar apenas o backend
.\scripts\dev\check-backend.ps1

# Iniciar apenas o backend
.\scripts\dev\start-backend.ps1
```

### Docker

```bash
# Setup inicial Docker
.\scripts\docker\setup-docker.ps1

# Dev com docker-compose
docker-compose -f docker-compose.dev.yml up -d

# Dev otimizado
docker-compose -f docker-compose.optimized.yml up -d
```

### Deployment

```bash
# Build imagens de produção
.\scripts\deployment\build-production.ps1

# Push para AWS ECR
.\scripts\deployment\push-to-ecr.ps1
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

# Resources

#### Learn more about Medusa

- [Website](https://www.medusajs.com/)
- [GitHub](https://github.com/medusajs)
- [2.0 Documentation](https://docs.medusajs.com/v2)

#### Learn more about Next.js

- [Website](https://nextjs.org/)
- [GitHub](https://github.com/vercel/next.js)
- [Documentation](https://nextjs.org/docs)

&nbsp;

## Contributors

<a href = "https://github.com/medusajs/b2b-starter-medusa/graphs/contributors">
  <img src = "https://contrib.rocks/image?repo=medusajs/b2b-starter-medusa"/>
</a>
