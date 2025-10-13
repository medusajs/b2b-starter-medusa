# Guia de Normalização e Padronização - Yello Solar Hub

## Visão Geral

Este guia fornece instruções completas para normalizar e padronizar o repositório **Yello Solar Hub B2B Marketplace** seguindo as melhores práticas do **Medusa.js v2.10.3** e **Next.js 15+**.

## Ferramentas de Normalização

### 1. Script Python - Backend Medusa.js

**Localização**: `tools/normalize-medusa.py`

**Funcionalidades**:

- ✅ Verifica estrutura de diretórios Medusa v2
- ✅ Valida módulos customizados (Company, Quote, Approval)
- ✅ Verifica workflows e seus exports
- ✅ Valida rotas API (Store/Admin)
- ✅ Verifica module links
- ✅ Analisa configuração medusa-config.ts
- ✅ Detecta imports deprecados
- ✅ Valida convenções de nomenclatura

**Uso**:

```bash
# Análise (dry-run)
python tools/normalize-medusa.py --workspace backend --dry-run

# Aplicar correções automáticas
python tools/normalize-medusa.py --workspace backend --fix

# Com relatório customizado
python tools/normalize-medusa.py --workspace backend --fix --output report-backend.json
```

### 2. Script PowerShell - Storefront Next.js 15+

**Localização**: `tools/Normalize-NextJS.ps1`

**Funcionalidades**:

- ✅ Verifica estrutura App Router Next.js 15
- ✅ Valida Server Components vs Client Components
- ✅ Verifica Server Actions e 'use server'
- ✅ Analisa estrutura de módulos (account, cart, quotes)
- ✅ Valida next.config.js
- ✅ Verifica convenções de nomenclatura (PascalCase/kebab-case)
- ✅ Detecta uso incorreto de React hooks

**Uso**:

```powershell
# Análise (dry-run)
.\tools\Normalize-NextJS.ps1 -WorkspacePath ".\storefront" -DryRun

# Aplicar correções automáticas
.\tools\Normalize-NextJS.ps1 -WorkspacePath ".\storefront" -Fix

# Com relatório customizado
.\tools\Normalize-NextJS.ps1 -WorkspacePath ".\storefront" -Fix -OutputFile "report-storefront.json"
```

## Convenções do Repositório

### Backend Medusa.js v2.10.3

#### Estrutura de Diretórios

```tsx
backend/
├── src/
│   ├── api/
│   │   ├── store/          # Store API (publishable key)
│   │   └── admin/          # Admin API (JWT)
│   ├── modules/            # Módulos customizados B2B
│   │   ├── company/
│   │   ├── quote/
│   │   └── approval/
│   ├── workflows/          # Workflows de negócio
│   │   ├── company/
│   │   ├── quote/
│   │   ├── approval/
│   │   ├── order/
│   │   └── hooks/          # Workflow hooks
│   ├── links/              # Module links (defineLink)
│   ├── types/              # Tipos compartilhados
│   └── utils/              # Utilitários
├── medusa-config.ts        # Configuração principal
└── package.json
```

#### Convenções de Nomenclatura

**Módulos**:

- Diretório: `src/modules/[module-name]/`
- Estrutura mínima: `index.ts`, `service.ts`, `models/`
- Nome em **kebab-case**: `company`, `quote`, `approval`

**Workflows**:

- Arquivo: `[action]-[entity].ts`
- Exemplo: `create-companies.ts`, `accept-quote.ts`
- Export: `export const [name]Workflow = createWorkflow(...)`

**API Routes**:

- Arquivo obrigatório: `route.ts`
- Exports: `export const GET`, `export const POST`, etc.
- Caminho: `src/api/[store|admin]/[resource]/route.ts`

**Module Links**:

- Arquivo: `[module1]-[module2].ts`
- Exemplo: `company-customer-group.ts`, `employee-customer.ts`
- Export: `export default defineLink(...)`

#### Imports Preferidos v2.10.3

```typescript
// ✅ Correto
import { MedusaService, model, defineConfig } from "@medusajs/framework"
import { createWorkflow, createStep, StepResponse } from "@medusajs/workflows-sdk"
import { defineLink, Modules } from "@medusajs/framework/utils"

// ❌ Deprecado
import { ... } from "@medusajs/medusa"
import { ... } from "@medusajs/medusa/dist/..."
```

#### Configuração Feature Flags

```typescript
// medusa-config.ts
export default defineConfig({
  featureFlags: {
    view_configurations: true,  // v2.10.3
  },
  modules: {
    [Modules.CACHE]: {
      resolve: "@medusajs/cache-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    // Custom modules
    company: { resolve: "./modules/company" },
    quote: { resolve: "./modules/quote" },
    approval: { resolve: "./modules/approval" },
  },
})
```

### Storefront Next.js 15+

#### Estrutura de Diretórios

```tsx
storefront/
├── src/
│   ├── app/
│   │   ├── [countryCode]/  # Multi-região
│   │   │   ├── (main)/     # Páginas públicas
│   │   │   └── (checkout)/ # Fluxo de checkout
│   │   └── api/            # API routes (se necessário)
│   ├── modules/            # Módulos por recurso
│   │   ├── account/
│   │   ├── cart/
│   │   ├── products/
│   │   ├── quotes/
│   │   └── companies/
│   ├── components/         # Componentes compartilhados
│   ├── lib/
│   │   ├── data/          # Server Actions
│   │   ├── config/        # Configurações
│   │   └── hooks/         # React hooks
│   └── types/             # Tipos TypeScript
├── middleware.ts           # Middleware Next.js
├── next.config.js
└── package.json
```

#### Convenções de Nomenclatura

**Componentes**:

- Nome: **PascalCase** - `ProductCard.tsx`, `QuoteDetails.tsx`
- Client Components: Adicionar `'use client'` no topo
- Server Components: Sem diretiva (padrão Next.js 15)

**Server Actions**:

- Arquivo: **kebab-case** - `get-products.ts`, `update-cart.ts`
- Localização: `src/lib/data/[resource]/`
- Diretivas obrigatórias:

  ```typescript
  "use server"
  import "server-only"
  ```

**Módulos**:

- Estrutura:

  ```tsx
  src/modules/[module]/
  ├── components/       # Componentes do módulo
  ├── actions.ts        # Server Actions (opcional)
  └── types.ts          # Tipos (opcional)
  ```

#### Server Components vs Client Components

**Server Components** (padrão):

- ✅ Busca de dados direta
- ✅ Acesso a backend APIs
- ✅ SEO otimizado
- ❌ Sem hooks do React
- ❌ Sem event handlers

```typescript
// app/products/page.tsx
// Sem 'use client' - é Server Component por padrão

export default async function ProductsPage() {
  const products = await getProducts() // Server Action
  return <ProductList products={products} />
}
```

**Client Components** (quando necessário):

- ✅ React hooks (useState, useEffect, etc.)
- ✅ Event handlers (onClick, onChange, etc.)
- ✅ Browser APIs
- ✅ Interatividade

```typescript
"use client"
// modules/cart/components/AddToCartButton.tsx

import { useState } from "react"

export function AddToCartButton() {
  const [loading, setLoading] = useState(false)
  // Usa hooks, event handlers, etc.
}
```

#### Server Actions Pattern

```typescript
"use server"
import "server-only"

import { sdk } from "@/lib/config"
import { getAuthHeaders, getCacheOptions, getCacheTag } from "@/lib/data/cookies"

export async function getProducts() {
  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions("products")) }
  
  const { products } = await sdk.client.fetch("/store/products", {
    method: "GET",
    headers,
    next,
  })
  
  return products
}

// Mutation com revalidação
export async function addToCart(variantId: string, quantity: number) {
  const headers = { ...(await getAuthHeaders()) }
  
  const result = await sdk.client.fetch("/store/carts/line-items", {
    method: "POST",
    headers,
    body: JSON.stringify({ variant_id: variantId, quantity }),
  })
  
  // Revalidar cache
  const cacheTag = await getCacheTag("carts")
  revalidateTag(cacheTag)
  
  return result
}
```

#### Next.js 15 Config Essenciais

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    ppr: true, // Partial Prerendering
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.medusajs.com',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}
```

## Processo de Normalização

### Passo 1: Análise Inicial

```bash
# Backend
cd ysh-store
python tools/normalize-medusa.py --workspace backend --dry-run --output analysis-backend.json

# Storefront
pwsh -File tools/Normalize-NextJS.ps1 -WorkspacePath ".\storefront" -DryRun -OutputFile "analysis-storefront.json"
```

### Passo 2: Revisar Relatórios

Ambos os scripts geram relatórios JSON e console com:

- **Issues por severidade**: Error, Warning, Info
- **Issues por tipo**: structure, module, workflow, naming, etc.
- **Sugestões de correção**: Ações específicas para cada issue

### Passo 3: Aplicar Correções Manuais

Priorize issues de severidade **Error** e **Warning**:

**Backend - Issues Comuns**:

- Módulos sem `index.ts` ou `service.ts`
- Workflows sem export
- API routes sem métodos HTTP
- Links sem `defineLink`
- Imports deprecados de `@medusajs/medusa`

**Storefront - Issues Comuns**:

- Server Components usando React hooks
- Server Actions sem `'use server'`
- Client Components sem `'use client'`
- Nomenclatura incorreta (PascalCase/kebab-case)
- Fetch sem `getAuthHeaders()`

### Passo 4: Aplicar Correções Automáticas

```bash
# Backend (cuidado - sempre revise antes)
python tools/normalize-medusa.py --workspace backend --fix

# Storefront (cuidado - sempre revise antes)
pwsh -File tools/Normalize-NextJS.ps1 -WorkspacePath ".\storefront" -Fix
```

### Passo 5: Validação

```bash
# Testes backend
cd backend
yarn test:unit
yarn test:integration:modules
yarn test:integration:http

# Testes storefront
cd storefront
yarn type-check
yarn lint
npx playwright test

# Build para validação final
cd backend && yarn build
cd storefront && yarn build
```

## Checklist de Normalização

### Backend ✅

- [ ] Estrutura de diretórios conforme convenção
- [ ] Todos os módulos têm `index.ts` e `service.ts`
- [ ] Workflows exportam corretamente
- [ ] API routes têm métodos HTTP exportados
- [ ] Module links usam `defineLink`
- [ ] Imports de `@medusajs/framework` (não `@medusajs/medusa`)
- [ ] `medusa-config.ts` com feature flags v2.10.3
- [ ] Nomenclatura kebab-case em arquivos
- [ ] Testes passando

### Storefront ✅

- [ ] Estrutura App Router Next.js 15
- [ ] Server Components sem hooks do React
- [ ] Client Components com `'use client'`
- [ ] Server Actions com `'use server'` e `'server-only'`
- [ ] Componentes em PascalCase
- [ ] Actions em kebab-case
- [ ] `getAuthHeaders()` em requests autenticados
- [ ] Cache e revalidação implementados
- [ ] `next.config.js` com configurações essenciais
- [ ] TypeScript sem erros
- [ ] Testes E2E passando

## Boas Práticas Adicionais

### Commits

Após normalização, commite mudanças de forma organizada:

```bash
# Backend
git add backend/src/modules backend/src/workflows backend/medusa-config.ts
git commit -m "chore(backend): normalize structure and conventions for Medusa v2.10.3"

git add backend/src/api backend/src/links
git commit -m "chore(backend): standardize API routes and module links"

# Storefront
git add storefront/src/app storefront/src/modules storefront/next.config.js
git commit -m "chore(storefront): normalize structure for Next.js 15 App Router"

git add storefront/src/lib/data storefront/src/components
git commit -m "chore(storefront): standardize Server Actions and components"
```

### Documentação

Mantenha a documentação sincronizada:

- [ ] Atualizar `README.md` com estrutura atual
- [ ] Atualizar `.github/copilot-instructions.md`
- [ ] Atualizar `agents_api.md`, `agents_commerce-modules.md`, `agents_infra_modules.md`
- [ ] Atualizar `MEDUSA_STRUCTURE_DEFINITIVA.md`

### Continuous Integration

Configure CI para validar normalização automaticamente:

```yaml
# .github/workflows/normalize-check.yml
name: Normalize Check

on: [pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.x'
      - name: Check Backend Normalization
        run: |
          python tools/normalize-medusa.py --workspace backend --dry-run
          exit $? # Falha se houver erros

  storefront:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check Storefront Normalization
        shell: pwsh
        run: |
          .\tools\Normalize-NextJS.ps1 -WorkspacePath ".\storefront" -DryRun
          exit $LASTEXITCODE
```

## Troubleshooting

### Backend

**Erro: "Módulo sem index.ts"**

- Crie `index.ts` com export do módulo:

  ```typescript
  import { Module } from "@medusajs/framework/utils"
  import MyModuleService from "./service"
  
  export const MY_MODULE = "myModule"
  export default Module(MY_MODULE, { service: MyModuleService })
  ```

**Erro: "Import deprecado"**

- Substitua:

  ```typescript
  // ❌ Antes
  import { MedusaService } from "@medusajs/medusa"
  
  // ✅ Depois
  import { MedusaService } from "@medusajs/framework"
  ```

### Storefront

**Erro: "Server Component usando useState"**

- Opção 1: Extrair para Client Component

  ```typescript
  // components/InteractiveButton.tsx
  "use client"
  export function InteractiveButton() {
    const [count, setCount] = useState(0)
    // ...
  }
  ```

- Opção 2: Adicionar `'use client'` ao componente

**Erro: "Server Action sem 'use server'"**

- Adicionar diretivas:

  ```typescript
  "use server"
  import "server-only"
  
  export async function myAction() {
    // ...
  }
  ```

## Recursos

- [Medusa v2.10.3 Release Notes](https://github.com/medusajs/medusa/releases/tag/v2.10.3)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Medusa Framework Documentation](https://docs.medusajs.com)
- [App Router Best Practices](https://nextjs.org/docs/app/building-your-application/routing)

---

**Última atualização**: Janeiro 2025 (Medusa v2.10.3, Next.js 15)  
**Autor**: Yello Solar Hub DevOps Team
