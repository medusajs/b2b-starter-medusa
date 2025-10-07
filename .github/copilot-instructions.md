# Instruções do GitHub Copilot - Medusa B2B Starter

## Visão Geral do Repositório

**Arquitetura**: E-commerce B2B Medusa 2.4 com dois workspaces Yarn 4:
- **`backend/`**: Servidor Medusa (Node 20, PostgreSQL 15, Redis)
- **`storefront/`**: Loja Next.js 15 com App Router & Server Components

**Sem package.json na raiz** - trabalhe em cada workspace independentemente.

## Início Rápido (Docker - Recomendado)

```powershell
# Iniciar todos os serviços
docker-compose up --build

# Em terminal separado:
docker-compose exec backend yarn medusa db:migrate
docker-compose exec backend yarn run seed
docker-compose exec backend yarn medusa user -e admin@test.com -p supersecret -i admin
```

**Acesso**: Backend em `localhost:9000`, Loja em `localhost:8000`

**Configuração Crítica**: Obtenha a chave publicável do Admin → Configurações → Chaves de API Publicáveis, defina em `storefront/.env`:
```
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxx
```

## Essenciais da Arquitetura do Backend

### Módulos B2B Personalizados (`backend/src/modules/`)

Três módulos principais definem a funcionalidade B2B:
- **`company/`**: Gerenciamento de Empresa & Funcionário
- **`quote/`**: Ciclo de vida de cotações & mensagens  
- **`approval/`**: Workflows de aprovação para carrinhos/pedidos

**Padrão de Módulo** (veja `company/index.ts` como exemplo):
```typescript
// 1. Definir modelos usando model.define() em models/*.ts
export const Company = model.define("company", {
  id: model.id({ prefix: "comp" }).primaryKey(),
  name: model.text(),
  spending_limit_reset_frequency: model.enum(["never", "daily", "weekly", "monthly", "yearly"]).default("monthly"),
  employees: model.hasMany(() => Employee),
});

// 2. Criar serviço estendendo MedusaService em service.ts
class CompanyModuleService extends MedusaService({ Company, Employee }) {}

// 3. Exportar módulo em index.ts
export const COMPANY_MODULE = "company";
export default Module(COMPANY_MODULE, { service: CompanyModuleService });

// 4. Registrar em medusa-config.ts
modules: {
  [COMPANY_MODULE]: { resolve: "./modules/company" },
}
```

**Após criar modelos**: Execute `yarn medusa db:generate <ModuleName>` então `yarn medusa db:migrate`

### Links de Módulo (`backend/src/links/`)

**Regra Crítica**: Nunca crie chaves estrangeiras diretas entre módulos. Use `defineLink()` para relacionamentos entre módulos:

```typescript
// Exemplo: company-customer-group.ts
import { defineLink } from "@medusajs/framework/utils";
import CompanyModule from "../modules/company";
import CustomerModule from "@medusajs/medusa/customer";

export default defineLink(
  CompanyModule.linkable.company,
  CustomerModule.linkable.customerGroup
);
```

Links existentes:
- `company-customer-group.ts`: Company ↔ CustomerGroup
- `employee-customer.ts`: Employee ↔ Customer  
- `cart-approvals.ts`: Cart ↔ Approvals
- `order-company.ts`: Order ↔ Company

### Tipos Compartilhados & Utilitários

- **Tipos**: `backend/src/types/**` - DTOs, enums compartilhados entre workflows/API/utils
- **Utilitários**: `backend/src/utils/check-spending-limit.ts` - Auxiliares de lógica de negócio
- **Seeding**: `backend/src/scripts/seed.ts` - Dados iniciais via workflows Medusa

## Workflows - Orquestração da Lógica de Negócio

**Toda lógica de negócio vive em workflows** (`backend/src/workflows/**`), não em serviços.

### Estrutura de Workflow

```typescript
import { createWorkflow, createStep, WorkflowResponse } from "@medusajs/workflows-sdk";

// Definir passos
const createCompanyStep = createStep("create-company", async (input) => {
  // Lógica do passo
  return new StepResponse(result, compensationData);
});

// Compor workflow
export const createCompaniesWorkflow = createWorkflow(
  "create-companies",
  function (input: CreateCompanyInput) {
    const companies = createCompanyStep(input);
    addToCustomerGroupStep(companies);
    return new WorkflowResponse(companies);
  }
);
```

**Executar em rotas API**: `await workflow.run({ input, container: req.scope })`

### Organizado por Módulo

- **`company/`**: `createCompaniesWorkflow`, `addCompanyToCustomerGroupWorkflow`
- **`quote/`**: `createQuotesWorkflow`, `customerAcceptQuoteWorkflow`, `createQuoteMessageWorkflow`
- **`approval/`**: `createApprovalsWorkflow`, `createApprovalSettingsWorkflow`
- **`order/`**: `updateOrderWorkflow` (edição personalizada de pedidos)
- **`employee/`**: `createEmployeesWorkflow`, `deleteEmployeesWorkflow`

### Hooks de Workflow (`backend/src/workflows/hooks/`)

Interceptar workflows core do Medusa para impor regras B2B:
- `validate-add-to-cart.ts`: Impõe limites de gastos antes de adicionar item ao carrinho
- `validate-cart-completion.ts`: Bloqueia checkout até aprovações serem concluídas
- `cart-created.ts`, `order-created.ts`: Criam metadados e links remotos

**Padrão**: Use composição de workflow do Medusa para envolver fluxos core com passos de validação.

## Camada de API (`backend/src/api/`)

### Roteamento Baseado em Arquivos

Rotas em `store/` e `admin/` seguem roteamento estilo Next.js:
- **Padrão**: `store/companies/[id]/route.ts` → `/store/companies/:id`
- **Métodos**: Exportar funções `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- **Parâmetros**: Acessar via `req.params.id`

Exemplo:
```typescript
// backend/src/api/store/companies/route.ts
export const POST = async (
  req: AuthenticatedMedusaRequest<StoreCreateCompanyType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  
  // Executar workflow para mutações
  const { result } = await createCompaniesWorkflow.run({
    input: req.validatedBody,
    container: req.scope,
  });
  
  // Consultar com API Graph para respostas
  const { data: companies } = await query.graph(
    {
      entity: "companies",
      fields: req.queryConfig.fields,
      filters: { id: result.map(c => c.id) },
    },
    { throwIfKeyNotFound: true }
  );
  
  res.json({ companies });
};
```

### Padrões Críticos

**1. Resolução de Container**: Acessar serviços via `req.scope.resolve()`
```typescript
const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
const orderService = req.scope.resolve(ModuleRegistrationName.ORDER);
```

**2. API Query Graph**: Use `query.graph()` para consultas entre módulos (respeita links de módulo)
```typescript
const { data } = await query.graph({
  entity: "companies",
  fields: "+employees,*approval_settings", // + = incluir, * = expandir relação
  filters: { id: companyId },
});
```

**3. Workflows para Mutações**: Nunca modificar dados diretamente - sempre use workflows
```typescript
await createCompaniesWorkflow.run({ input, container: req.scope });
```

### Validação & Middleware

- **Validadores**: Criar esquemas Zod em arquivos `validators.ts` por pasta de rota
- **Middleware**: Definir em `api/middlewares.ts` usando `defineMiddlewares()`
- **Auth**: Use tipo `AuthenticatedMedusaRequest` para rotas autenticadas
- **Middleware personalizado**: Veja `api/middlewares/ensure-role.ts` para acesso baseado em papel

## Arquitetura da Loja (Next.js 15)

### Estrutura do App Router

Rotas em `storefront/src/app/[countryCode]/` para suporte multi-região:
- `(main)/`: Páginas de marketing, produtos, coleções
- `(checkout)/`: Fluxo de carrinho, checkout

**Novas páginas devem respeitar o prefixo `[countryCode]`** para manter roteamento de região.

### Padrão de Busca de Dados

**Toda busca de dados usa Server Actions** (`"use server"` + `"server-only"`):

```typescript
// storefront/src/lib/data/companies.ts
"use server"
import "server-only"
import { sdk } from "@/lib/config"
import { getAuthHeaders, getCacheOptions, getCacheTag } from "@/lib/data/cookies"

export const retrieveCompany = async (companyId: string) => {
  const headers = { ...(await getAuthHeaders()) };
  const next = { ...(await getCacheOptions("companies")) };
  
  const { company } = await sdk.client.fetch<StoreCompanyResponse>(
    `/store/companies/${companyId}`,
    {
      query: { fields: "+employees,*approval_settings" },
      method: "GET",
      headers,
      next,
    }
  );
  
  return company;
};
```

### Padrões Críticos

**1. Autenticação**: Use `getAuthHeaders()` para injetar JWT de cookies
```typescript
const headers = { ...(await getAuthHeaders()) };
```

**2. Gerenciamento de Cache**: 
```typescript
// Para leituras
const next = { ...(await getCacheOptions("companies")) };

// Após mutações
const cacheTag = await getCacheTag("companies");
revalidateTag(cacheTag);
```

**3. Cliente SDK**: Use `sdk.client.fetch<Type>()` de `@/lib/config` - NÃO fetch bruto()

**4. Componentes Server por Padrão**: Use `"use client"` apenas para formulários/interatividade

### Organização de Componentes

- **`src/modules/`**: Módulos baseados em recursos (account/, cart/, products/, quotes/)
- **Cada módulo**: Mistura de componentes server (busca de dados) e client (formulários)
- **`src/lib/`**: Camada de dados, hooks, utilitários, config

### Middleware

`src/middleware.ts` roda no runtime Edge:
- Define cookies de região/carrinho
- Trata redirecionamentos
- **Evite APIs específicas do Node** (sistema de arquivos, módulos crypto, etc.)

## Testes & Ferramentas

### Testes do Backend (Jest + SWC)

```powershell
cd backend
yarn test:unit                      # Testes unitários
yarn test:integration:modules       # Testes de integração de módulos  
yarn test:integration:http          # Testes de rotas API
```

**Estrutura de Testes**:
- Testes unitários: `backend/src/**/__tests__/*.unit.spec.ts`
- Testes HTTP: `backend/integration-tests/http/**/*.spec.ts`
- Configuração de teste: `integration-tests/setup.js` (limpa metadados Mikro-ORM entre suítes)

### Build & Lint

```powershell
# Backend
cd backend
yarn build           # Executa medusa build
yarn medusa --help   # Comandos CLI

# Storefront
cd storefront
yarn build           # Build de produção Next.js
yarn lint            # ESLint Next.js
```

### Operações de Banco de Dados

```powershell
cd backend
yarn medusa db:create              # Criar banco de dados
yarn medusa db:migrate             # Executar migrações
yarn medusa db:generate <Module>   # Gerar migração após mudanças de modelo
yarn run seed                      # Semear dados de demonstração
yarn medusa user -e <email> -p <password> -i admin  # Criar usuário admin
```

## Jornada do Comprador

- **Onboarding corporativo**: admins criam a companhia e colaboradores via `backend/src/api/admin/companies/**` que disparam `createCompaniesWorkflow`; configurações de aprovação são geradas automaticamente.
- **Montagem do time**: colaboradores convidados herdam limite de gasto (`backend/src/modules/company/models/employee.ts`) e preferências de aprovação (`backend/src/modules/approval`).
- **Exploração da vitrine**: usuários acessam `storefront/src/app/[countryCode]/**` onde páginas carregam dados pelo SDK em `storefront/src/lib/data/**`.
- **Construção do carrinho**: itens entram via fluxos core monitorados por `backend/src/workflows/hooks/validate-add-to-cart.ts`; a App Router oferece bulk add em módulos como `storefront/src/modules/cart`.
- **Solicitação de cotação**: quando um carrinho precisa de negociação, `create-request-for-quote.ts` gera ordem rascunho e `backend/src/workflows/quote/workflows/` mantém o ciclo de mensagens.
- **Aprovação e checkout**: `validate-cart-completion.ts` bloqueia finalização até que `ApprovalModule` atualize status; após aprovação o fluxo de pedido em `backend/src/workflows/order/workflows/update-order.ts` publica o pedido final.

## Funcionalidades por Perfil

- **Admin da empresa**: gerencia dados corporativos, colaboradores e limites em `backend/src/api/admin/companies/**`; configura aprovações via `create-approval-settings.ts` e remove/ajusta employees com validações zod em `validators.ts`.
- **Comprador/colaborador**: navega e adiciona produtos (incluindo add-to-cart em massa), acompanha limites por `check-spending-limit.ts`, solicita cotações e conclui pedidos após aprovação.
- **Merchant/operador**: responde a cotações, ajusta pedidos e promoções através dos workflows de quote e order; monitora links remotos e status usando `backend/src/workflows/hooks/order-created.ts` e APIs admin.

## Dicas para Desenvolvedores

- Links remotos costumam depender de metadados do carrinho ou pedido (veja `backend/src/workflows/hooks/cart-created.ts` e `order-created.ts`); garanta que novos fluxos preencham `metadata` de forma consistente para permitir o cleanup dos links.
- Prefira passos de workflows Medusa em vez de acessar repositórios diretamente—combinar consultas Mikro-ORM cruas com workflows pode contornar hooks e gerar estados de aprovação inconsistentes.
