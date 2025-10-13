# Estrutura Definitiva Medusa.js v2 - YSH B2B

## Visão Geral da Arquitetura

Esta estrutura segue as melhores práticas do Medusa.js v2, consolidando os diretórios duplicados (`backend`/`server`, `client`/`storefront`) em uma organização clara e escalável.

```bash
ysh-store/
├── backend/                    # Servidor Medusa.js v2 (consolidado)
│   ├── src/
│   │   ├── admin/             # Rotas admin (JWT)
│   │   ├── api/               # Rotas da API
│   │   │   ├── store/         # Store API (publishable key)
│   │   │   ├── admin/         # Admin API (JWT)
│   │   │   └── health/        # Health checks
│   │   ├── modules/           # Módulos customizados B2B
│   │   │   ├── company/       # Empresa & funcionários
│   │   │   ├── quote/         # Sistema de cotações
│   │   │   └── approval/      # Workflows de aprovação
│   │   ├── workflows/         # Workflows de negócio
│   │   │   ├── company/       # Workflows empresa
│   │   │   ├── quote/         # Workflows cotação
│   │   │   ├── approval/      # Workflows aprovação
│   │   │   ├── order/         # Workflows pedido
│   │   │   └── hooks/         # Hooks de workflow
│   │   ├── links/             # Links entre módulos
│   │   ├── subscribers/       # Event subscribers
│   │   ├── jobs/              # Background jobs
│   │   ├── scripts/           # Scripts utilitários
│   │   ├── types/             # Tipos compartilhados
│   │   └── utils/             # Utilitários
│   ├── medusa-config.ts       # Configuração Medusa
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── storefront/                 # Loja Next.js 15 (consolidado)
│   ├── src/
│   │   ├── app/               # App Router (Next.js 15)
│   │   │   ├── [countryCode]/ # Rotas multi-região
│   │   │   │   ├── (main)/    # Páginas públicas
│   │   │   │   └── (checkout)/# Checkout
│   │   │   ├── admin/         # Admin dashboard
│   │   │   └── api/           # API routes
│   │   ├── modules/           # Módulos de recursos
│   │   │   ├── account/       # Conta do usuário
│   │   │   ├── cart/          # Carrinho
│   │   │   ├── products/      # Produtos
│   │   │   ├── quotes/        # Cotações
│   │   │   └── companies/     # Empresas
│   │   ├── components/        # Componentes compartilhados
│   │   ├── lib/               # Utilitários e config
│   │   │   ├── config/        # Configurações
│   │   │   ├── data/          # Server Actions
│   │   │   ├── hooks/         # React hooks
│   │   │   └── utils/         # Utilitários
│   │   ├── providers/         # Context providers
│   │   ├── styles/            # Estilos globais
│   │   └── types/             # Tipos TypeScript
│   ├── public/                # Assets estáticos
│   ├── middleware.ts          # Middleware Next.js
│   ├── next.config.js         # Config Next.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── shared/                     # Código compartilhado
│   ├── types/                 # Tipos compartilhados
│   ├── utils/                 # Utilitários comuns
│   └── constants/             # Constantes
├── packages/                   # Monorepo packages
│   ├── ui/                    # Componentes UI compartilhados
│   ├── config/                # Configurações compartilhadas
│   └── types/                 # Tipos compartilhados
├── docker/                     # Configurações Docker
│   ├── docker-compose.yml     # Ambiente completo
│   ├── Dockerfile.backend
│   └── Dockerfile.storefront
├── docs/                       # Documentação
│   ├── api/                   # Documentação APIs
│   ├── deployment/            # Guias de deploy
│   └── development/           # Guias desenvolvimento
├── tools/                      # Ferramentas desenvolvimento
│   ├── scripts/               # Scripts utilitários
│   └── ci/                    # CI/CD
├── .github/                    # GitHub Actions
│   ├── workflows/             # CI/CD pipelines
│   └── ISSUE_TEMPLATE/        # Templates issues
├── package.json               # Root package.json
├── yarn.lock                  # Lockfile Yarn
├── tsconfig.base.json         # Config TS base
└── README.md                  # Documentação principal
```

## Módulos B2B Customizados

### Company Module

- **Models**: Company, Employee
- **Services**: CompanyModuleService, EmployeeModuleService
- **APIs**: CRUD empresas, funcionários, validação CNPJ
- **Workflows**: createCompaniesWorkflow, addCompanyToCustomerGroupWorkflow

### Quote Module

- **Models**: Quote, QuoteMessage, QuoteItem
- **Services**: QuoteModuleService, QuoteMessageService
- **APIs**: CRUD cotações, mensagens, negociação
- **Workflows**: createQuotesWorkflow, customerAcceptQuoteWorkflow

### Approval Module

- **Models**: Approval, ApprovalSettings
- **Services**: ApprovalModuleService
- **APIs**: CRUD aprovações, configurações
- **Workflows**: createApprovalsWorkflow, createApprovalSettingsWorkflow

## Workflows de Negócio

### Company Workflows

- `createCompaniesWorkflow`: Criação empresa + funcionário
- `addCompanyToCustomerGroupWorkflow`: Vinculação empresa-customer

### Quote Workflows

- `createQuotesWorkflow`: Criação cotação do carrinho
- `customerAcceptQuoteWorkflow`: Aceitação cliente
- `createQuoteMessageWorkflow`: Mensagens negociação

### Approval Workflows

- `createApprovalsWorkflow`: Criação aprovação
- `createApprovalSettingsWorkflow`: Configurações aprovação

### Order Workflows

- `updateOrderWorkflow`: Edição pedidos pós-criação

### Workflow Hooks

- `validate-add-to-cart.ts`: Limites gastos
- `validate-cart-completion.ts`: Bloqueio checkout
- `cart-created.ts`: Metadados carrinho
- `order-created.ts`: Links remotos

## Links entre Módulos

- `company-customer-group.ts`: Company ↔ CustomerGroup
- `employee-customer.ts`: Employee ↔ Customer
- `cart-approvals.ts`: Cart ↔ Approvals
- `order-company.ts`: Order ↔ Company

## Camada de API

### Store API (Publishable Key)

- `/store/companies`: CRUD empresas
- `/store/quotes`: Sistema cotações
- `/store/products`: Catálogo produtos

### Admin API (JWT)

- `/admin/companies`: Gestão empresas
- `/admin/quotes`: Gestão cotações
- `/admin/approvals`: Gestão aprovações

## Frontend - Next.js 15 App Router

### Estrutura de Rotas

- `/[countryCode]/(main)/`: Páginas públicas
- `/[countryCode]/(checkout)/`: Fluxo checkout
- `/[countryCode]/admin/`: Dashboard admin

### Server Actions

- `src/lib/data/`: Server Actions por módulo
- Autenticação via `getAuthHeaders()`
- Cache via `getCacheOptions()`

### Componentes

- `src/modules/`: Componentes por recurso
- `src/components/`: Componentes compartilhados
- Server Components por padrão

## Configurações

### Backend (medusa-config.ts)

```typescript
modules: {
  [COMPANY_MODULE]: { resolve: "./modules/company" },
  [QUOTE_MODULE]: { resolve: "./modules/quote" },
  [APPROVAL_MODULE]: { resolve: "./modules/approval" },
}
```

### Storefront (next.config.js)

```javascript
/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ['@ysh/ui'],
  experimental: {
    appDir: true,
  },
}
```

## Estratégia de Migração

1. **Consolidar diretórios**: Migrar `server/` → `backend/`, `storefront/` → `storefront/`
2. **Reorganizar estrutura**: Mover arquivos para locais corretos
3. **Atualizar imports**: Ajustar caminhos relativos
4. **Limpar duplicatas**: Remover diretórios antigos
5. **Atualizar configurações**: package.json, tsconfig, Docker

## Benefícios da Estrutura

- ✅ **Escalabilidade**: Estrutura modular por domínio
- ✅ **Manutenibilidade**: Separação clara responsabilidades
- ✅ **Performance**: Next.js 15 + App Router otimizado
- ✅ **Type Safety**: TypeScript end-to-end
- ✅ **Developer Experience**: Ferramentas consolidadas
- ✅ **Deploy**: Docker + CI/CD simplificado
