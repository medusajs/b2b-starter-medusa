# 🗺️ Mapa Visual da Documentação - YSH B2B

> **Referência Visual Rápida com Hierarquia e Relacionamentos**

---

## 🎯 Estrutura em Árvore

```tsx
ysh-store/
│
├─ 📚 DOCUMENTAÇÃO MASTER
│  ├─ README.md ⭐⭐⭐ [Entrada principal]
│  ├─ DOCUMENTATION_INDEX.md ⭐⭐⭐ [Índice completo]
│  ├─ NAVIGATION_GUIDE.md ⭐⭐⭐ [Guia navegação]
│  ├─ BOOKMARKS.md ⭐⭐⭐ [Este arquivo - Bookmarks master]
│  └─ TAGS_GUIDE.md ⭐⭐⭐ [Guia de tags e busca]
│
├─ 📂 docs/ [ROOT DOCUMENTATION]
│  │
│  ├─ INDEX.md ⭐⭐⭐ [Índice docs root]
│  │
│  ├─ 🚀 deployment/
│  │  ├─ QUICK_START.md ⭐⭐⭐
│  │  ├─ AWS_DEPLOYMENT_STATUS.md ⭐⭐⭐
│  │  ├─ AWS_FREE_TIER_DEPLOYMENT_GUIDE.md ⭐⭐
│  │  ├─ LOCAL_DEPLOYMENT_SUCCESS.md ⭐⭐
│  │  └─ PUBLISHABLE_KEY_QUICKSTART.md ⭐⭐⭐
│  │
│  ├─ 🧪 testing/
│  │  ├─ FOSS_TESTING_DOCUMENTATION_INDEX.md ⭐⭐⭐
│  │  ├─ BACKEND_360_COVERAGE_REPORT.md ⭐⭐⭐
│  │  ├─ CONTRACT_TESTING_FOSS_GUIDE.md ⭐⭐
│  │  ├─ VISUAL_REGRESSION_FOSS_GUIDE.md ⭐⭐
│  │  ├─ PACT_SETUP_GUIDE.md ⭐⭐
│  │  └─ [9 arquivos total]
│  │
│  ├─ 🏗️ infrastructure/
│  │  ├─ FOSS_IMPLEMENTATION_COMPLETE.md ⭐⭐⭐
│  │  ├─ FOSS_STACK_MIGRATION_SUMMARY.md ⭐⭐
│  │  ├─ INSTALL_FOSS_DEPENDENCIES.md ⭐⭐
│  │  └─ NODE_RED_AUTOMATION_GUIDE.md ⭐⭐
│  │
│  ├─ 📊 Arquitetura & Análise
│  │  ├─ API_ARCHITECTURE_REVIEW.md ⭐⭐⭐
│  │  ├─ DESIGN_SYSTEM_IMPLEMENTATION.md ⭐⭐
│  │  └─ [Propostas e docs técnicos]
│  │
│  ├─ 📦 Catálogo
│  │  ├─ CATALOG_SUMMARY.md ⭐⭐⭐
│  │  ├─ CATALOG_MIGRATION_SUMMARY.md ⭐⭐⭐
│  │  ├─ NORMALIZACAO_SCHEMAS_CATALOGO.md ⭐⭐
│  │  └─ [Docs de schema e validação]
│  │
│  ├─ 🌞 Solar Domain
│  │  ├─ SOLAR_INTEGRATION_360.md ⭐⭐⭐
│  │  ├─ SOLAR_INTEGRATION_IMPLEMENTATION.md ⭐⭐
│  │  └─ YELLO_SOLAR_ADMIN_IMPLEMENTATION.md ⭐⭐
│  │
│  ├─ 💰 Pricing
│  │  ├─ YSH_PRICING_IMPLEMENTATION.md ⭐⭐⭐
│  │  ├─ PRICING_INTEGRATION_ANALYSIS.md ⭐⭐
│  │  └─ PRICING_MIGRATION_PLAN.md ⭐⭐
│  │
│  ├─ 🤖 AI & Data
│  │  ├─ OLLAMA_LOCAL_LLM_INTEGRATION.md ⭐⭐
│  │  ├─ QDRANT_MIGRATION_FOSS.md ⭐⭐
│  │  ├─ DATA_PLATFORM_EXECUTIVE_SUMMARY.md ⭐⭐⭐
│  │  └─ PATHWAY_DAGSTER_*.md
│  │
│  ├─ 🐳 Docker
│  │  ├─ DOCKER_README.md ⭐⭐⭐
│  │  └─ DOCKER_FOSS_STACK_OPTIMIZED.md ⭐⭐⭐
│  │
│  ├─ 📊 status/
│  │  ├─ CURRENT_STATUS.md ⭐⭐⭐
│  │  ├─ HEALTH_CHECK_REPORT.md ⭐⭐
│  │  └─ [Status reports]
│  │
│  ├─ 📖 guides/
│  │  └─ [Tutoriais e guias práticos]
│  │
│  └─ 🔧 implementation/
│     └─ [Relatórios de implementação]
│
├─ 🔧 backend/
│  │
│  ├─ docs/
│  │  │
│  │  ├─ INDEX.md ⭐⭐⭐ [Índice docs backend]
│  │  │
│  │  ├─ 🔌 api/
│  │  │  └─ API_DOCUMENTATION_GUIDE.md ⭐⭐⭐
│  │  │
│  │  ├─ 🗄️ database/
│  │  │  └─ DATABASE_MIGRATION_GUIDE.md ⭐⭐⭐
│  │  │
│  │  ├─ 🔐 security/
│  │  │  └─ SECURITY_AUDIT_REPORT.md ⭐⭐⭐
│  │  │
│  │  ├─ 🧪 testing/
│  │  │  ├─ BACKEND_360_E2E_REPORT.md ⭐⭐⭐
│  │  │  └─ BACKEND_360_REVIEW_REPORT.md ⭐⭐⭐
│  │  │
│  │  ├─ ⚙️ Workflows
│  │  │  ├─ WORKFLOWS_QUICKSTART.md ⭐⭐⭐
│  │  │  ├─ WORKFLOWS_P1_REPORT.md ⭐⭐⭐
│  │  │  └─ MODULE_WORKFLOW_ARCHITECTURE_360.md ⭐⭐⭐
│  │  │
│  │  ├─ 📦 Catálogo
│  │  │  ├─ CATALOG_SYNC_OPTIMIZED.md ⭐⭐⭐
│  │  │  ├─ IMPORT_CATALOG_GUIDE.md ⭐⭐⭐
│  │  │  └─ SYNC_OPTIMIZED_EXECUTIVE_SUMMARY.md ⭐⭐⭐
│  │  │
│  │  ├─ 📊 Quality
│  │  │  ├─ QUALITY_EXECUTIVE_SUMMARY.md ⭐⭐⭐
│  │  │  └─ QUALITY_ANALYSIS_REPORT.md ⭐⭐⭐
│  │  │
│  │  └─ 🎨 Features
│  │     ├─ PLG_STRATEGY_360_IMPLEMENTATION.md ⭐⭐
│  │     ├─ QUICK_SUMMARY_WIDGET_ENHANCEMENTS.md ⭐⭐
│  │     └─ [Widgets e features]
│  │
│  └─ scripts/
│     ├─ seed/ [Scripts de seed]
│     └─ database/ [Scripts de database]
│
├─ 🛍️ storefront/
│  │
│  ├─ docs/
│  │  │
│  │  ├─ INDEX.md ⭐⭐⭐ [Índice docs storefront]
│  │  │
│  │  ├─ 🧪 testing/
│  │  │  ├─ E2E_COVERAGE_EXPANSION_SUMMARY.md ⭐⭐⭐
│  │  │  │  (71 tests, 3 shards, 95% coverage)
│  │  │  └─ STOREFRONT_360_REVIEW_REPORT.md ⭐⭐⭐
│  │  │
│  │  ├─ 🎯 implementation/
│  │  │  ├─ IMPLEMENTATION_SUMMARY.md ⭐⭐⭐
│  │  │  ├─ FINAL_IMPLEMENTATION_REPORT.md ⭐⭐⭐
│  │  │  └─ FOLLOW_UP_IMPLEMENTATION.md ⭐⭐
│  │  │
│  │  ├─ 🏗️ Arquitetura
│  │  │  ├─ ARCHITECTURE.md ⭐⭐⭐
│  │  │  └─ INTEGRATION_GUIDE.md ⭐⭐⭐
│  │  │
│  │  ├─ 📊 analytics/
│  │  │  └─ [PostHog integration]
│  │  │
│  │  ├─ 🔄 flows/
│  │  │  └─ [User journeys]
│  │  │
│  │  ├─ 📝 copy/
│  │  │  └─ [Content & i18n]
│  │  │
│  │  ├─ 📖 guides/
│  │  │  └─ [User guides]
│  │  │
│  │  └─ 📋 backlog/
│  │     └─ [Feature backlog]
│  │
│  ├─ AGENTS.md ⭐⭐⭐ [Guia AI Agents]
│  └─ README.md ⭐⭐⭐
│
├─ 🐳 docker/
│  ├─ docker-compose.yml ⭐⭐⭐ [Produção]
│  ├─ docker-compose.dev.yml ⭐⭐⭐ [Desenvolvimento]
│  ├─ docker-compose.foss.yml ⭐⭐⭐ [Stack FOSS - 15+ services]
│  ├─ docker-compose.node-red.yml ⭐⭐ [Automação]
│  ├─ docker-compose.optimized.yml ⭐⭐ [Otimizado]
│  ├─ docker-compose.localstack.yml ⭐⭐ [LocalStack]
│  └─ nginx.conf
│
└─ ☁️ aws/
   ├─ cloudformation-infrastructure.yml ⭐⭐⭐
   ├─ cloudformation-free-tier.yml ⭐⭐
   ├─ backend-task-definition.json ⭐⭐⭐
   ├─ storefront-task-definition.json ⭐⭐⭐
   └─ aws-outputs.json
```

---

## 🎨 Mapa de Cores por Tipo

```tsx
🚀 Setup & Deployment    - Verde
🏗️ Arquitetura          - Azul
📦 Catálogo             - Laranja
🐳 Docker               - Ciano
☁️ AWS/Cloud            - Roxo
🧪 Testing              - Amarelo
🔌 API                  - Rosa
🗄️ Database             - Marrom
🔐 Security             - Vermelho
⚙️ Workflows            - Cinza
🌞 Solar                - Dourado
💰 Pricing              - Verde escuro
🤖 AI                   - Magenta
📊 Data                 - Azul claro
🎨 UI/Frontend          - Rosa claro
```

---

## 🔗 Relacionamentos entre Documentos

### Fluxo: Setup Inicial

```tsx
README.md
    ↓
docs/deployment/QUICK_START.md
    ↓
docs/PUBLISHABLE_KEY_SETUP.md
    ↓
backend/docs/WORKFLOWS_QUICKSTART.md
    ↓
storefront/docs/INTEGRATION_GUIDE.md
```

### Fluxo: Desenvolvimento Backend

```tsx
backend/docs/INDEX.md
    ↓
backend/docs/MODULE_WORKFLOW_ARCHITECTURE_360.md
    ├─→ backend/docs/api/API_DOCUMENTATION_GUIDE.md
    ├─→ backend/docs/database/DATABASE_MIGRATION_GUIDE.md
    └─→ backend/docs/WORKFLOWS_QUICKSTART.md
```

### Fluxo: Desenvolvimento Frontend

```tsx
storefront/docs/INDEX.md
    ↓
storefront/docs/ARCHITECTURE.md
    ├─→ storefront/docs/INTEGRATION_GUIDE.md
    ├─→ storefront/docs/testing/E2E_COVERAGE_EXPANSION_SUMMARY.md
    └─→ storefront/docs/implementation/IMPLEMENTATION_SUMMARY.md
```

### Fluxo: Testing & QA

```tsx
docs/testing/FOSS_TESTING_DOCUMENTATION_INDEX.md
    ├─→ storefront/docs/testing/E2E_COVERAGE_EXPANSION_SUMMARY.md (71 tests)
    ├─→ backend/docs/testing/BACKEND_360_E2E_REPORT.md
    ├─→ docs/testing/VISUAL_REGRESSION_FOSS_GUIDE.md (BackstopJS)
    └─→ docs/testing/CONTRACT_TESTING_FOSS_GUIDE.md (Pact)
```

### Fluxo: Catálogo

```tsx
docs/CATALOG_SUMMARY.md
    ↓
docs/CATALOG_MIGRATION_SUMMARY.md
    ↓
backend/docs/CATALOG_SYNC_OPTIMIZED.md
    ↓
backend/docs/IMPORT_CATALOG_GUIDE.md
    ↓
docs/NORMALIZACAO_SCHEMAS_CATALOGO.md
```

### Fluxo: Deploy

```tsx
docker/docker-compose.yml
    ↓
docs/DOCKER_README.md
    ↓
docs/deployment/AWS_DEPLOYMENT_STATUS.md
    ↓
aws/cloudformation-infrastructure.yml
    ↓
aws/backend-task-definition.json
```

---

## 📊 Matriz de Documentos por Workspace

| Categoria | Root | Backend | Storefront |
|-----------|------|---------|------------|
| **Setup** | Quick Start ⭐⭐⭐ | Workflows ⭐⭐⭐ | Integration ⭐⭐⭐ |
| **Arquitetura** | API Review ⭐⭐⭐ | Module/Workflow ⭐⭐⭐ | Architecture ⭐⭐⭐ |
| **Testing** | FOSS Index ⭐⭐⭐ | E2E Report ⭐⭐⭐ | E2E Coverage ⭐⭐⭐ |
| **API** | - | API Docs ⭐⭐⭐ | Integration ⭐⭐⭐ |
| **Database** | - | Migration Guide ⭐⭐⭐ | - |
| **Security** | - | Security Audit ⭐⭐⭐ | - |
| **Catálogo** | Summary ⭐⭐⭐ | Sync Optimized ⭐⭐⭐ | - |
| **Deploy** | AWS Status ⭐⭐⭐ | - | - |
| **Quality** | - | Quality Summary ⭐⭐⭐ | 360 Review ⭐⭐⭐ |

---

## 🎯 Tags Visuais

### Por Prioridade

```tsx
⭐⭐⭐ = ESSENCIAL     (Leitura obrigatória)
⭐⭐  = IMPORTANTE    (Recomendado)
⭐   = REFERÊNCIA    (Consulta)
```

### Por Status

```tsx
✅ = Completo
🚧 = Em progresso
📝 = Planejado
⚠️ = Atenção necessária
🔄 = Atualização pendente
```

### Por Tipo

```tsx
📚 = Índice/Navegação
📖 = Guia/Tutorial
📊 = Relatório
🔧 = Técnico
💼 = Business
🎨 = Design/UI
```

---

## 🔍 Índice Alfabético Rápido

<details>
<summary><b>A-C</b></summary>

- API Architecture Review → `docs/`
- API Documentation Guide → `backend/docs/api/`
- Architecture (Storefront) → `storefront/docs/`
- AWS Deployment Status → `docs/deployment/`
- Backend 360 E2E Report → `backend/docs/testing/`
- Backend 360 Review → `backend/docs/testing/`
- BOOKMARKS.md → `root/` ⭐⭐⭐
- Catalog Migration Summary → `docs/`
- Catalog Summary → `docs/`
- Catalog Sync Optimized → `backend/docs/`
- Contract Testing Guide → `docs/testing/`

</details>

<details>
<summary><b>D-F</b></summary>

- Data Platform Summary → `docs/`
- Database Migration Guide → `backend/docs/database/`
- Design System Implementation → `docs/`
- Docker README → `docs/`
- E2E Coverage (71 tests) → `storefront/docs/testing/`
- FOSS Implementation Complete → `docs/infrastructure/`
- FOSS Testing Index → `docs/testing/`

</details>

<details>
<summary><b>G-M</b></summary>

- Import Catalog Guide → `backend/docs/`
- Implementation Summary (Backend) → `backend/docs/`
- Implementation Summary (Storefront) → `storefront/docs/implementation/`
- Integration Guide → `storefront/docs/`
- Module Workflow Architecture → `backend/docs/`

</details>

<details>
<summary><b>N-Q</b></summary>

- Navigation Guide → `root/` ⭐⭐⭐
- Ollama Integration → `docs/`
- Pricing Implementation → `docs/`
- Publishable Key Setup → `docs/`
- Quality Executive Summary → `backend/docs/`
- Quick Start → `docs/deployment/` ⭐⭐⭐

</details>

<details>
<summary><b>R-Z</b></summary>

- README (Main) → `root/` ⭐⭐⭐
- Security Audit → `backend/docs/security/`
- Solar Integration 360 → `docs/`
- Storefront 360 Review → `storefront/docs/testing/`
- Visual Regression Guide → `docs/testing/`
- Workflows Quickstart → `backend/docs/` ⭐⭐⭐

</details>

---

## 💡 Como Usar Este Mapa

1. **Navegação Visual**: Use a árvore para entender hierarquia
2. **Relacionamentos**: Siga os fluxos para jornadas completas
3. **Cores**: Identifique rapidamente o tipo de documento
4. **Prioridades**: ⭐ indica importância
5. **Índice Alfabético**: Busca rápida por nome
6. **Tags**: Use para filtrar por categoria

---

**Dica**: Mantenha este arquivo aberto em uma aba separada enquanto navega pela documentação!

---

**Última atualização**: 12/10/2025  
**Versão**: 1.0 - Mapa Visual  
**Mantido por**: Fernando Junio
