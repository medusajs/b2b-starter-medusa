# Estrutura de Diretórios - Backend

```bash
backend/
├── .archive/                          # Arquivos arquivados
├── .dockerignore                      # Configuração Docker ignore
├── .env                               # Variáveis de ambiente
├── .env.build                         # Variáveis build
├── .env.template                      # Template variáveis ambiente
├── .env.test                          # Variáveis teste
├── .eslintrc.js                       # Configuração ESLint
├── .gitignore                         # Arquivos ignorados pelo Git
├── .mypy_cache/                       # Cache do MyPy
├── .npmrc                             # Configuração NPM
├── .prettierrc.js                     # Configuração Prettier
├── .vscode/                           # Configurações VS Code
├── .yarnrc.yml                        # Configuração Yarn
├── API_KEYS_GUIDE.md                  # Guia chaves API
├── API_KEYS_LOCATION.md               # Localização chaves API
├── API_KEYS_SETUP_SUMMARY.md          # Resumo setup chaves API
├── API_KEYS_STATUS_REPORT.md          # Relatório status chaves API
├── APPROVAL_MIGRATION_CHECKLIST.md    # Checklist migração aprovações
├── APPROVAL_MODULE_IMPROVEMENTS.md    # Melhorias módulo aprovações
├── BACKEND_360_FINAL_SUMMARY.md       # Resumo final backend 360
├── BACKEND_360_REVIEW_V3.md           # Revisão backend 360 v3
├── BACKEND_MEGA_PROMPT_V6_COMPLETE.md # Mega prompt backend v6 completo
├── BACKEND_MEGA_PROMPT_V6_PATCHES.md  # Patches mega prompt v6
├── BACKEND_MEGA_PROMPT_V6_PLAN.md     # Plano mega prompt v6
├── BACKEND_MEGA_PROMPT_V6_SUMMARY.md  # Resumo mega prompt v6
├── BACKEND_MEGA_PROMPT_V6_VALIDATION.md # Validação mega prompt v6
├── BACKEND_MEGA_PROMPT_V7_SUMMARY.md  # Resumo mega prompt v7
├── BACKEND_SURGICAL_IMPROVEMENTS_REPORT.md # Relatório melhorias cirúrgicas
├── BACKEND_V6_README.md               # README backend v6
├── BACKEND_V7_COMPLETE_SUMMARY.md     # Resumo completo backend v7
├── BACKEND_V7_EXECUTION_PLAN.md       # Plano execução backend v7
├── Containerfile.dev                  # Containerfile desenvolvimento
├── coverage/                          # Relatórios cobertura testes
├── data/                              # Dados
├── database/                          # Configurações banco de dados
├── DEPLOYMENT_QUICKSTART.md           # Início rápido deployment
├── Dockerfile                         # Dockerfile produção
├── Dockerfile.dev                     # Dockerfile desenvolvimento
├── DOCKER_DB_RESOURCES.md             # Recursos Docker banco
├── docs/                              # Documentação backend
├── DOCUMENTATION_INDEX.md             # Índice documentação
├── E2E_360_FINAL_STATUS.md            # Status final E2E 360
├── E2E_360_STATUS.md                  # Status E2E 360
├── eslint.config.js                   # Configuração ESLint
├── export-openai-key.ps1              # Script export chave OpenAI
├── FINAL_DELIVERY_SUMMARY.md          # Resumo entrega final
├── init-scripts/                      # Scripts inicialização
├── integration-tests/                 # Testes integração
├── INTERNAL_CATALOG_360_COMPLETE.md   # Catálogo interno 360 completo
├── jest.config.js                     # Configuração Jest
├── medusa-config.js                   # Configuração Medusa JS
├── medusa-config.ts                   # Configuração Medusa TS
├── mikro-orm.config.ts                # Configuração MikroORM
├── node_modules/                      # Dependências Node.js
├── NORMALIZATION_COMPLETE.md          # Normalização completa
├── NORMALIZATION_FIXES.md             # Correções normalização
├── OPENAI_API_KEY_UPDATE.md           # Atualização chave OpenAI
├── package-lock.json                  # Lock file NPM
├── package.json                       # Package.json
├── package.json.patch                 # Patch package.json
├── pact/                              # Contratos Pact
├── QDRANT_OSS_SETUP.md                # Setup Qdrant OSS
├── RAG_SYSTEM_360_FINAL_REPORT.md     # Relatório final sistema RAG 360
├── RAG_SYSTEM_SETUP_COMPLETE.md       # Setup sistema RAG completo
├── README.md                          # README backend
├── REVISAO_360_BACKEND_REPORT.md      # Relatório revisão 360 backend
├── scripts/                           # Scripts backend
├── secrets/                           # Segredos
├── src/                               # Código fonte
├── start-dev.sh                       # Script iniciar desenvolvimento
├── static/                            # Arquivos estáticos
├── tailwind.config.js                 # Configuração Tailwind
├── test-calculator.http               # Teste calculadora HTTP
├── test-sku-extraction.js             # Teste extração SKU
├── TEST_APIS.md                       # Teste APIs
├── tsconfig.json                      # Configuração TypeScript
├── uploads/                           # Arquivos upload
├── V7_EXECUTIVE_SUMMARY.md            # Resumo executivo v7
├── VALIDATION_360_REPORT.md           # Relatório validação 360
├── yarn.lock                          # Lock file Yarn
└── src/                               # Código fonte
    ├── admin/                         # APIs admin
    ├── api/                           # APIs públicas
    ├── data/                          # Dados
    ├── entities/                      # Entidades
    ├── jobs/                          # Jobs em background
    ├── lib/                           # Bibliotecas utilitárias
    ├── links/                         # Links entre módulos
    ├── migrations/                    # Migrações banco
    ├── models/                        # Modelos de dados
    ├── modules/                       # Módulos personalizados
    ├── modules_disabled/              # Módulos desabilitados
    ├── pact/                          # Contratos Pact
    ├── scripts/                       # Scripts
    ├── shims/                         # Shims TypeScript
    ├── subscribers/                   # Subscribers eventos
    ├── types/                         # Tipos TypeScript
    ├── utils/                         # Utilitários
    └── workflows/                     # Workflows de negócio
```
