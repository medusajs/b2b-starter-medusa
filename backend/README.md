# ⚡ YSH Solar Hub - Backend

> **Servidor Medusa 2.4** com módulos B2B customizados para e-commerce de energia solar

---

## 🚀 Quick Start

### Com Docker (Recomendado)

```bash
# Na raiz do projeto
docker-compose up --build

# Em terminal separado - Migrações e seed
docker-compose exec backend yarn medusa db:migrate
docker-compose exec backend yarn run seed
docker-compose exec backend yarn medusa user -e admin@test.com -p supersecret -i admin

# Acesse: http://localhost:9000
```

### Desenvolvimento Local

```bash
# Instalar dependências
yarn install

# Configurar variáveis de ambiente
cp .env.template .env
# Edite .env com suas configurações (PostgreSQL, Redis, etc.)

# Criar banco de dados
yarn medusa db:create

# Executar migrações
yarn medusa db:migrate

# Seed de dados
yarn run seed

# Criar usuário admin
yarn medusa user -e admin@test.com -p supersecret -i admin

# Iniciar servidor de desenvolvimento
yarn dev

# Acesse: http://localhost:9000
```

---

## 📚 Documentação

### 📖 Navegação Principal

- **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Índice completo de toda documentação
- **[docs/ESTRUTURA_ORGANIZADA.md](docs/ESTRUTURA_ORGANIZADA.md)** - Guia da estrutura de diretórios
- **[docs/api/QUICK_REFERENCE.md](docs/api/QUICK_REFERENCE.md)** - Referência rápida de APIs normalizadas
- **[docs/api/API_NORMALIZATION_COMPLETE.md](docs/api/API_NORMALIZATION_COMPLETE.md)** - Relatório de normalização

### 🗂️ Categorias de Documentação

```tsx
docs/
├── implementation/  # 3 implementações de features
├── database/        # 4 documentos de banco de dados
└── integration/     # 1 guia de testes de integração
```

### 🔗 Links Rápidos por Categoria

| Categoria | Descrição | Acesso Rápido |
|-----------|-----------|---------------|
| **Implementações** | Integrações BACEN, calculadora solar, viabilidade | [`docs/implementation/`](docs/implementation/) |
| **Database** | Migrações, estrutura, verificações | [`docs/database/`](docs/database/) |
| **Integração** | Testes HTTP de integração | [`docs/integration/`](docs/integration/) |
| **Código** | READMEs técnicos nos módulos | `src/*/README.md` |

---

## 🏗️ Arquitetura

### Stack Tecnológico

- **Framework**: Medusa 2.4 (Node 20)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: Mikro-ORM
- **Language**: TypeScript 5
- **Testes**: Jest + SWC
- **API**: RESTful + Medusa Admin API

### Estrutura do Projeto

```tsx
backend/
├── src/
│   ├── api/                    # Rotas de API
│   │   ├── admin/              # Rotas administrativas
│   │   ├── store/              # Rotas da loja
│   │   ├── solar/              # Endpoints solar
│   │   ├── aneel/              # Endpoints ANEEL
│   │   ├── credit-analysis/    # Análise de crédito
│   │   ├── financing/          # Financiamento
│   │   └── pvlib/              # Integração PVLib
│   ├── modules/                # Módulos Medusa customizados
│   │   ├── company/            # Gestão de empresas
│   │   ├── employee/           # Gestão de colaboradores
│   │   ├── quote/              # Sistema de cotações (RFQ)
│   │   ├── approval/           # Workflows de aprovação
│   │   ├── solar/              # Funcionalidades solar
│   │   └── aneel/              # Dados ANEEL
│   ├── workflows/              # Workflows e orchestration
│   │   ├── company/            # Workflows de empresa
│   │   ├── employee/           # Workflows de colaborador
│   │   ├── quote/              # Workflows de cotação
│   │   ├── approval/           # Workflows de aprovação
│   │   ├── order/              # Workflows customizados de pedido
│   │   └── hooks/              # Hooks em workflows core
│   ├── links/                  # Links entre módulos
│   ├── jobs/                   # Jobs agendados
│   ├── subscribers/            # Event subscribers
│   ├── admin/                  # Customizações Admin UI
│   └── scripts/                # Scripts utilitários
├── database/
│   └── migrations/             # Migrações SQL
├── integration-tests/
│   ├── http/                   # Testes HTTP por módulo
│   └── modules/                # Testes de módulos
├── data/
│   └── catalog/                # Dados e schemas de catálogo
└── docs/                       # Documentação organizada
```

---

## 🌟 Funcionalidades Principais

### B2B Core

- ✅ **Gestão de Empresas** - CRUD completo via módulo `company`
- ✅ **Gestão de Colaboradores** - Hierarquia e limites de gastos
- ✅ **Sistema de Aprovações** - Workflow configurable por empresa
- ✅ **Cotações (RFQ)** - Request for Quote com mensagens
- ✅ **Limites de Gastos** - Por colaborador com reset configurável

### E-commerce

- ✅ **Catálogo de Produtos** - Produtos solares com SKUs avançados
- ✅ **Gestão de Pedidos** - Fluxo customizado com aprovações B2B
- ✅ **Multi-região** - Suporte a múltiplas moedas/regiões
- ✅ **Customer Groups** - Integração com empresas para pricing

### Solar-Specific

- ✅ **Calculadora Solar** - Integração com PVLib Python
- ✅ **Análise de Viabilidade** - Análise técnica de instalação
- ✅ **Tarifas ANEEL** - Dados de tarifas de energia por distribuidora
- ✅ **Catálogo Especializado** - Painéis, inversores, estruturas, etc.
- ✅ **Análise de Crédito** - Integração BACEN para financiamento

### Integrações

- ✅ **BACEN API** - Análise de crédito e dados financeiros
- ✅ **PVLib** - Cálculos de geração solar
- ✅ **ANEEL** - Tarifas e regulamentação
- ✅ **Stripe** - Processamento de pagamentos (via Medusa)

---

## 🔧 Desenvolvimento

### Comandos Disponíveis

```bash
# Desenvolvimento
yarn dev                        # Servidor dev (localhost:9000)
yarn build                      # Build de produção
yarn start                      # Servidor de produção

# API Normalization
yarn validate:apis              # Validar conformidade de APIs
yarn normalize:apis             # Normalizar APIs (auto-gerar validators/query-configs)

# Database
yarn medusa db:create           # Criar banco de dados
yarn medusa db:migrate          # Executar migrações
yarn medusa db:generate <Module>  # Gerar migração após mudanças no modelo
yarn run seed                   # Seed de dados de demonstração

# Usuários
yarn medusa user -e <email> -p <password> -i admin  # Criar usuário admin

# Testes
yarn test:unit                  # Testes unitários
yarn test:integration:modules   # Testes de integração de módulos
yarn test:integration:http      # Testes de rotas API

# Utilitários
yarn medusa --help              # Ver comandos CLI disponíveis
```

### Variáveis de Ambiente Essenciais

```bash
# Database
DATABASE_URL=postgres://user:password@localhost:5432/medusa

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=9000
ADMIN_CORS=http://localhost:7001,http://localhost:9000
STORE_CORS=http://localhost:8000

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Cookies
COOKIE_SECRET=your-super-secret-cookie-key

# Worker Mode (opcional)
MEDUSA_WORKER_MODE=shared  # ou 'server', 'worker'
```

Ver [`.env.template`](.env.template) para lista completa.

---

## 🎨 Padrões de Código

### Módulos Medusa

**Todo módulo segue o padrão**:

```typescript
// 1. Definir modelos em models/*.ts
export const Company = model.define("company", {
  id: model.id({ prefix: "comp" }).primaryKey(),
  name: model.text(),
  employees: model.hasMany(() => Employee),
});

// 2. Criar serviço em service.ts
class CompanyModuleService extends MedusaService({ Company, Employee }) {}

// 3. Exportar módulo em index.ts
export const COMPANY_MODULE = "company";
export default Module(COMPANY_MODULE, { service: CompanyModuleService });

// 4. Registrar em medusa-config.ts
modules: {
  [COMPANY_MODULE]: { resolve: "./modules/company" },
}
```

### Workflows

**Toda lógica de negócio em workflows**:

```typescript
import { createWorkflow, createStep, WorkflowResponse } from "@medusajs/workflows-sdk";

const createCompanyStep = createStep("create-company", async (input) => {
  // Lógica do passo
  return new StepResponse(result, compensationData);
});

export const createCompaniesWorkflow = createWorkflow(
  "create-companies",
  function (input: CreateCompanyInput) {
    const companies = createCompanyStep(input);
    return new WorkflowResponse(companies);
  }
);
```

### Links de Módulo

**Nunca FKs diretas entre módulos - use links**:

```typescript
import { defineLink } from "@medusajs/framework/utils";
import CompanyModule from "../modules/company";
import CustomerModule from "@medusajs/medusa/customer";

export default defineLink(
  CompanyModule.linkable.company,
  CustomerModule.linkable.customerGroup
);
```

### Rotas de API

**Padrão de rota**:

```typescript
export const POST = async (
  req: AuthenticatedMedusaRequest<CreateType>,
  res: MedusaResponse
) => {
  // 1. Resolver serviços
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  
  // 2. Executar workflow para mutações
  const { result } = await createWorkflow.run({
    input: req.validatedBody,
    container: req.scope,
  });
  
  // 3. Consultar com Query Graph
  const { data } = await query.graph({
    entity: "companies",
    fields: req.queryConfig.fields,
    filters: { id: result.map(c => c.id) },
  });
  
  res.json({ companies: data });
};
```

---

## 🧪 Testes

### Executar Testes

```bash
# Unit tests
yarn test:unit

# Integration tests - Módulos
yarn test:integration:modules

# Integration tests - HTTP
yarn test:integration:http

# Todos os testes
yarn test
```

### Estrutura de Testes

```tsx
backend/
├── src/**/__tests__/*.unit.spec.ts     # Testes unitários
└── integration-tests/
    ├── modules/                         # Testes de módulos
    └── http/                            # Testes de rotas API
        ├── admin/
        ├── companies/
        ├── quotes/
        └── solar/
```

### Documentação de Testes

- [`docs/integration/HTTP_TESTS_README.md`](docs/integration/HTTP_TESTS_README.md) - Guia de testes HTTP

---

## 📊 Database

### Migrações

```bash
# Gerar migração após mudanças em modelos
yarn medusa db:generate <ModuleName>

# Executar migrações pendentes
yarn medusa db:migrate

# Ver status das migrações
psql -U user -d medusa -f database/migrations/000_status_report.sql
```

### Documentação de Database

- [`docs/database/MIGRATION_REPORT.md`](docs/database/MIGRATION_REPORT.md) - Relatório completo
- [`docs/database/MODULES_VS_TABLES.md`](docs/database/MODULES_VS_TABLES.md) - Mapeamento módulos ↔ tabelas
- [`docs/database/SOLAR_CATALOG_360.md`](docs/database/SOLAR_CATALOG_360.md) - Estrutura do catálogo
- [`docs/database/VERIFICATION_SCRIPTS.md`](docs/database/VERIFICATION_SCRIPTS.md) - Scripts de verificação

---

## 📦 Módulos B2B Customizados

### Company Module

#### **Gestão de empresas e configurações B2B**

- Localização: `src/modules/company/`
- Modelos: `Company`, `Employee`
- Workflows: `createCompaniesWorkflow`, `addCompanyToCustomerGroupWorkflow`
- APIs: `src/api/admin/companies/`, `src/api/store/companies/`

### Quote Module

#### **Sistema de cotações (Request for Quote)**

- Localização: `src/modules/quote/`
- Modelos: `Quote`, `QuoteMessage`
- Workflows: `createQuotesWorkflow`, `customerAcceptQuoteWorkflow`, `createQuoteMessageWorkflow`
- APIs: `src/api/admin/quotes/`, `src/api/store/quotes/`

### Approval Module

#### **Workflows de aprovação para carrinhos/pedidos**

- Localização: `src/modules/approval/`
- Modelos: `Approval`, `ApprovalSettings`
- Workflows: `createApprovalsWorkflow`, `createApprovalSettingsWorkflow`
- Hooks: `validate-cart-completion.ts` (bloqueia checkout)

### Solar Module

#### **Funcionalidades específicas de energia solar**

- Localização: `src/modules/solar/`, `src/modules/aneel/`
- APIs: `src/api/solar/`, `src/api/aneel/`, `src/api/pvlib/`
- Features: Calculadora, viabilidade, tarifas ANEEL

---

## 🔗 Integrações

### BACEN (Banco Central)

#### **Análise de crédito e dados financeiros**

- Documentação: [`docs/implementation/BACEN_INTEGRATION_SUMMARY.md`](docs/implementation/BACEN_INTEGRATION_SUMMARY.md)
- API: `src/api/credit-analysis/`
- Uso: Análise de crédito para financiamento solar

### PVLib

#### **Cálculos de geração e performance solar**

- Documentação: [`docs/implementation/SOLAR_CALCULATOR_IMPLEMENTATION.md`](docs/implementation/SOLAR_CALCULATOR_IMPLEMENTATION.md)
- API: `src/api/pvlib/`
- Script Python: `scripts/pvlib_modelchain.py`
- Uso: Estimativa de geração, análise de viabilidade

### ANEEL

#### **Tarifas e dados regulatórios**

- Módulo: `src/modules/aneel/`
- API: `src/api/aneel/`
- Migrações: `database/migrations/006_aneel_tariff_module.sql`, `007_aneel_seed_data.sql`
- Uso: Cálculo de economia de energia

---

## 🤝 Contribuindo

### Workflow de Desenvolvimento

1. **Antes de começar**: Leia [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
2. **Criar módulo**: Siga padrão em `src/modules/README.md`
3. **Adicionar API**: Consulte `src/api/README.md`
4. **Criar workflow**: Veja `src/workflows/README.md`
5. **Adicionar testes**: Estrutura em `integration-tests/`

### Adicionando Documentação

#### Documentação de Alto Nível

1. Coloque em `docs/[categoria]/` apropriada
2. Atualize `DOCUMENTATION_INDEX.md`

#### Documentação Técnica

1. Adicione `README.md` na pasta do código
2. Documente interfaces e APIs principais

---

## 🔗 Links Úteis

### Documentação Externa

- [Medusa Documentation](https://docs.medusajs.com/)
- [Medusa Modules](https://docs.medusajs.com/resources/modules)
- [Medusa Workflows](https://docs.medusajs.com/resources/workflows)
- [Mikro-ORM](https://mikro-orm.io/)
- [PostgreSQL](https://www.postgresql.org/docs/)

### Repositório

- **Storefront**: `../storefront/` - Loja Next.js 15
- **Docs raiz**: `../docs/` - Documentação do projeto completo

---

## 📝 Licença

Ver arquivo LICENSE para detalhes.

---

## 👥 Equipe

**YSH Solar Hub** - E-commerce B2B para energia solar

---

**Última atualização**: 09/10/2025  
**Versão**: 2.0 (Reorganização completa)
