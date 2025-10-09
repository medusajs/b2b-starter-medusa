# 📚 YSH Backend - Índice de Documentação

> **Navegação centralizada** para toda a documentação do servidor Medusa

---

## 📋 Índice Rápido

- [⚡ Implementações](#-implementações)
- [🗄️ Database & Migrações](#️-database--migrações)
- [🧪 Testes de Integração](#-testes-de-integração)
- [📖 Módulos & Arquitetura](#-módulos--arquitetura)
- [📊 Dados & Catálogo](#-dados--catálogo)
- [📦 Arquivos Principais](#-arquivos-principais)

---

## ⚡ Implementações

### Integrações Externas

- [`BACEN_INTEGRATION_SUMMARY.md`](docs/implementation/BACEN_INTEGRATION_SUMMARY.md) - Integração com API do Banco Central para análise de crédito
- [`SOLAR_CALCULATOR_IMPLEMENTATION.md`](docs/implementation/SOLAR_CALCULATOR_IMPLEMENTATION.md) - Calculadora solar com PVLib
- [`SOLAR_VIABILITY_IMPLEMENTATION.md`](docs/implementation/SOLAR_VIABILITY_IMPLEMENTATION.md) - Análise de viabilidade técnica solar

### Catálogo & E-commerce

- **[UNIFIED_CATALOG_EXECUTIVE_SUMMARY.md](./docs/implementation/UNIFIED_CATALOG_EXECUTIVE_SUMMARY.md)**: Sumário executivo da estratégia de catálogo unificado com métricas, benefícios e quick start guide.
- **[UNIFIED_CATALOG_STRATEGY.md](./docs/implementation/UNIFIED_CATALOG_STRATEGY.md)**: Estratégia de unificação do catálogo com deduplicação de produtos, sistema de precificação multi-distribuidor e normalização de kits solares. Inclui algoritmos, schemas de dados, workflows e roadmap de implementação.

---

## 🗄️ Database & Migrações

### Relatórios & Análises

- [`MIGRATION_REPORT.md`](docs/database/MIGRATION_REPORT.md) - Relatório completo de migrações executadas
- [`MODULES_VS_TABLES.md`](docs/database/MODULES_VS_TABLES.md) - Mapeamento entre módulos Medusa e tabelas do banco
- [`SOLAR_CATALOG_360.md`](docs/database/SOLAR_CATALOG_360.md) - Estrutura completa do catálogo solar no banco
- [`VERIFICATION_SCRIPTS.md`](docs/database/VERIFICATION_SCRIPTS.md) - Scripts de verificação e validação do banco

### Migrações

- [`database/migrations/README.md`](database/migrations/README.md) - Documentação das migrações SQL
- [`database/migrations/000_status_report.sql`](database/migrations/000_status_report.sql) - Status inicial do banco
- [`database/migrations/001_personas_and_journeys.sql`](database/migrations/001_personas_and_journeys.sql) - Personas e jornadas
- [`database/migrations/002_tools_and_calculations.sql`](database/migrations/002_tools_and_calculations.sql) - Ferramentas de cálculo
- [`database/migrations/003_b2b_modules.sql`](database/migrations/003_b2b_modules.sql) - Módulos B2B
- [`database/migrations/004_seed_data.sql`](database/migrations/004_seed_data.sql) - Dados iniciais
- [`database/migrations/005_approval_module.sql`](database/migrations/005_approval_module.sql) - Módulo de aprovações
- [`database/migrations/006_aneel_tariff_module.sql`](database/migrations/006_aneel_tariff_module.sql) - Tarifas ANEEL
- [`database/migrations/007_aneel_seed_data.sql`](database/migrations/007_aneel_seed_data.sql) - Dados ANEEL
- [`database/migrations/015_solar_catalog_optimization.sql`](database/migrations/015_solar_catalog_optimization.sql) - Otimização do catálogo

---

## 🧪 Testes de Integração

### Testes HTTP

- [`HTTP_TESTS_README.md`](docs/integration/HTTP_TESTS_README.md) - Guia de testes de integração HTTP

### Suítes de Teste

```tsx
integration-tests/http/
├── admin/              # Testes de rotas admin
├── companies/          # Testes de gestão de empresas
├── credit-analysis/    # Testes de análise de crédito
├── financing/          # Testes de financiamento
├── quotes/             # Testes de cotações
└── solar/              # Testes de módulos solar
```

---

## 📖 Módulos & Arquitetura

### Módulos Customizados

- [`src/modules/README.md`](src/modules/README.md) - Visão geral dos módulos Medusa customizados

**Módulos B2B:**

- `src/modules/company/` - Gestão de empresas e colaboradores
- `src/modules/quote/` - Sistema de cotações (RFQ)
- `src/modules/approval/` - Workflows de aprovação
- `src/modules/employee/` - Gestão de colaboradores

**Módulos Solar:**

- `src/modules/solar/` - Funcionalidades específicas de energia solar
- `src/modules/aneel/` - Integração com dados ANEEL

### APIs

- [`src/api/README.md`](src/api/README.md) - Documentação das rotas de API
- [`src/api/store/README_SOLAR_CV.md`](src/api/store/README_SOLAR_CV.md) - API de viabilidade solar na loja

**Estrutura de APIs:**

```tsx
src/api/
├── admin/              # Rotas administrativas
├── store/              # Rotas da loja (públicas/autenticadas)
├── solar/              # Endpoints específicos solar
├── aneel/              # Endpoints ANEEL
├── credit-analysis/    # Análise de crédito
├── financing/          # Financiamento
└── pvlib/              # Integração PVLib
```

### Workflows

- [`src/workflows/README.md`](src/workflows/README.md) - Documentação dos workflows Medusa

**Workflows por Módulo:**

```tsx
src/workflows/
├── company/            # Workflows de empresa
├── employee/           # Workflows de colaborador
├── quote/              # Workflows de cotação
├── approval/           # Workflows de aprovação
├── order/              # Workflows de pedido customizados
└── hooks/              # Hooks em workflows core
```

### Links de Módulo

- [`src/links/README.md`](src/links/README.md) - Documentação dos links entre módulos

**Links Principais:**

- `company-customer-group.ts` - Company ↔ CustomerGroup
- `employee-customer.ts` - Employee ↔ Customer
- `cart-approvals.ts` - Cart ↔ Approvals
- `order-company.ts` - Order ↔ Company

### Jobs & Subscribers

- [`src/jobs/README.md`](src/jobs/README.md) - Jobs agendados e tarefas assíncronas
- [`src/subscribers/README.md`](src/subscribers/README.md) - Event subscribers do Medusa

### Scripts

- [`src/scripts/README.md`](src/scripts/README.md) - Scripts utilitários e de setup

### Admin UI

- [`src/admin/README.md`](src/admin/README.md) - Customizações da UI Admin do Medusa

---

## 📊 Dados & Catálogo

### Catálogo de Produtos

- [`data/catalog/README.md`](data/catalog/README.md) - Estrutura e schemas do catálogo
- [`docs/IMPORT_CATALOG_GUIDE.md`](docs/IMPORT_CATALOG_GUIDE.md) - Guia de importação de catálogo

**Estrutura de Dados:**

```tsx
data/catalog/
├── unified_schemas/    # Schemas JSON unificados
└── images/             # Imagens de produtos
```

### Sync de Produtos

- [`static/products/SYNC_REPORT.md`](static/products/SYNC_REPORT.md) - Relatório de sincronização de produtos

---

## 📦 Arquivos Principais

### Configuração & Setup

- [`README.md`](README.md) - Documentação principal do backend
- [`package.json`](package.json) - Dependências e scripts
- [`medusa-config.ts`](medusa-config.ts) - Configuração principal do Medusa
- [`tsconfig.json`](tsconfig.json) - Configuração do TypeScript
- [`jest.config.js`](jest.config.js) - Configuração de testes

### Docker & Deploy

- [`Dockerfile`](Dockerfile) - Container de produção
- [`Dockerfile.dev`](Dockerfile.dev) - Container de desenvolvimento
- [`.dockerignore`](.dockerignore) - Arquivos ignorados no build

### Variáveis de Ambiente

- [`.env.template`](.env.template) - Template de variáveis
- [`.env.build`](.env.build) - Variáveis de build
- [`.env.test`](.env.test) - Variáveis de teste

### Scripts Utilitários

- [`create-publishable-key.js`](create-publishable-key.js) - Criar chave publicável
- [`seed-direct.js`](seed-direct.js) - Seed direto do banco
- [`scripts/import-catalog-data.js`](scripts/import-catalog-data.js) - Importar catálogo

### Testes

- [`test-calculator.http`](test-calculator.http) - Testes HTTP da calculadora

---

## 🗂️ Estrutura de Diretórios

```tsx
backend/
├── docs/
│   ├── implementation/   # Implementações de features (3 documentos)
│   ├── database/         # Documentação de banco de dados (4 documentos)
│   └── integration/      # Testes de integração (1 documento)
├── src/
│   ├── api/              # Rotas de API (admin, store, custom)
│   ├── modules/          # Módulos Medusa customizados
│   ├── workflows/        # Workflows e orchestration
│   ├── links/            # Links entre módulos
│   ├── jobs/             # Jobs agendados
│   ├── subscribers/      # Event subscribers
│   ├── admin/            # Customizações Admin UI
│   └── scripts/
│       ├── normalize-catalog/  # Scripts de normalização de catálogo (SKUs únicos)
│       └── seed.ts             # Seeding de dados iniciais
├── database/
│   └── migrations/       # Migrações SQL
├── integration-tests/
│   ├── http/             # Testes HTTP por módulo
│   └── modules/          # Testes de módulos
├── data/
│   └── catalog/          # Dados e schemas de catálogo
├── static/               # Arquivos estáticos
└── .archive/             # Arquivos históricos
```

---

## 📊 Estatísticas

- **Total de documentação**: 9 documentos principais
- **Implementações**: 4 documentos (+ Catálogo Unificado)
- **Database**: 4 documentos
- **Integração**: 1 documento
- **READMEs de código**: 10 arquivos (módulos, APIs, workflows, normalize-catalog, etc.)

---

## 🔍 Como Usar Este Índice

### Por Objetivo

| Objetivo | Onde Procurar |
|----------|---------------|
| **Implementar nova feature** | `src/modules/`, `src/workflows/`, `src/api/` |
| **Entender banco de dados** | `docs/database/`, `database/migrations/` |
| **Adicionar testes** | `integration-tests/`, `docs/integration/` |
| **Importar catálogo** | `docs/IMPORT_CATALOG_GUIDE.md`, `data/catalog/` |
| **Configurar integração** | `docs/implementation/` |
| **Ver estrutura de módulos** | `src/modules/README.md` |

### Por Tipo de Atividade

| Atividade | Documentos Relevantes |
|-----------|----------------------|
| **Nova rota de API** | `src/api/README.md` → implementar em `src/api/` |
| **Novo módulo B2B** | `src/modules/README.md` → criar em `src/modules/` |
| **Workflow customizado** | `src/workflows/README.md` → implementar em `src/workflows/` |
| **Migração de banco** | `docs/database/` → criar em `database/migrations/` |
| **Seed de dados** | `database/migrations/004_seed_data.sql` |

---

## 🤝 Contribuindo

### Adicionando Nova Documentação

1. **Implementação de feature**: `docs/implementation/`
2. **Documentação de banco**: `docs/database/`
3. **Guia de integração**: `docs/integration/`
4. **README de código**: Na pasta do módulo/componente relevante

### Padrões de Nomenclatura

- **Implementações**: `[FEATURE]_IMPLEMENTATION.md`, `[INTEGRATION]_SUMMARY.md`
- **Database**: `[TOPIC]_REPORT.md`, `[ANALYSIS].md`
- **READMEs**: `README.md` na pasta do componente

### Atualização do Índice

Ao adicionar novos documentos:

1. Adicione o link neste índice na seção apropriada
2. Mantenha ordem alfabética ou lógica
3. Inclua descrição breve
4. Atualize as estatísticas

---

## 🔗 Links Relacionados

### Documentação Externa

- [Medusa Documentation](https://docs.medusajs.com/)
- [Medusa Modules](https://docs.medusajs.com/resources/modules)
- [Medusa Workflows](https://docs.medusajs.com/resources/workflows)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Repositório

- **Storefront**: `../storefront/` - Loja Next.js 15
- **Docs raiz**: `../docs/` - Documentação do projeto completo

---

## 📝 Notas de Arquitetura

### Princípios Chave

1. **Workflows para lógica de negócio** - Toda mutação passa por workflows
2. **Links de módulo** - Nunca FKs diretas entre módulos
3. **API Query Graph** - Para consultas entre módulos
4. **Server Actions** - Camada de dados no storefront

### Fluxos Principais

**Criação de Empresa:**

1. `src/api/admin/companies/route.ts` →
2. `src/workflows/company/workflows/create-companies.ts` →
3. `src/workflows/company/workflows/add-company-to-customer-group.ts`

**Pedido com Aprovação:**

1. `src/workflows/hooks/validate-cart-completion.ts` (verifica aprovações) →
2. `src/modules/approval/` (lógica de aprovação) →
3. Workflow de order core (se aprovado)

---

**Última atualização**: 09/10/2025  
**Mantido por**: Equipe YSH Solar Hub
