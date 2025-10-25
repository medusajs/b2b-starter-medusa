# Estrutura de Diretórios - Storefront

```bash
storefront/
├── .archive/                         # Arquivos arquivados
├── .dockerignore                     # Configuração Docker ignore
├── .env                              # Variáveis de ambiente
├── .env.local                        # Variáveis locais
├── .env.local.example                # Exemplo variáveis locais
├── .env.template                     # Template variáveis ambiente
├── .eslintrc.js                      # Configuração ESLint
├── .github/                          # Configurações GitHub
├── .gitignore                        # Arquivos ignorados pelo Git
├── .husky/                           # Configurações Husky
├── .next/                            # Cache Next.js
├── .prettierrc                       # Configuração Prettier
├── .publishable-key.txt              # Chave publicável
├── .storybook/                       # Configurações Storybook
├── .yarnrc.yml                       # Configuração Yarn
├── AGENTS.md                         # Documentação agentes
├── backstop/                         # Configurações BackstopJS
├── check-env-variables.js            # Script verificação variáveis
├── Containerfile.dev                 # Containerfile desenvolvimento
├── DEPLOYMENT_PLAN.md                # Plano deployment
├── DEPLOYMENT_SUCCESS.md             # Sucesso deployment
├── Dockerfile                        # Dockerfile produção
├── Dockerfile.dev                    # Dockerfile desenvolvimento
├── docs/                             # Documentação storefront
├── DOCUMENTATION_INDEX.md            # Índice documentação
├── e2e/                              # Testes E2E
├── FINAL_DELIVERY_V6.md              # Entrega final v6
├── jest.config.json                  # Configuração Jest
├── LICENSE                           # Licença
├── next-env.d.ts                     # Tipos Next.js
├── next-sitemap.js                   # Configuração sitemap
├── next.config.js                    # Configuração Next.js
├── node_modules/                     # Dependências Node.js
├── package-lock.json                 # Lock file NPM
├── package.json                      # Package.json
├── package.json.playwright           # Package.json Playwright
├── playwright.config.ts              # Configuração Playwright
├── postcss.config.js                 # Configuração PostCSS
├── public/                           # Arquivos públicos
├── QUICK_START.md                    # Início rápido
├── README.md                         # README storefront
├── REVIEW_SUMMARY.md                 # Resumo revisão
├── scripts/                          # Scripts storefront
├── src/                              # Código fonte
├── STOREFRONT_360_REVIEW_COMPLETE.md # Revisão 360 completa
├── STOREFRONT_360_REVIEW_REPORT.md   # Relatório revisão 360
├── STOREFRONT_MEGA_PROMPT_V6_COMPLETE.md # Mega prompt v6 completo
├── STOREFRONT_MEGA_PROMPT_V6_PLAN.md # Plano mega prompt v6
├── STOREFRONT_MEGA_PROMPT_V6_SUMMARY.md # Resumo mega prompt v6
├── STOREFRONT_V7_EXECUTION_PLAN.md   # Plano execução v7
├── STOREFRONT_V7_SUMMARY.md          # Resumo v7
├── tailwind.config.js                # Configuração Tailwind
├── test-results/                     # Resultados testes
├── tsconfig.json                     # Configuração TypeScript
├── tsconfig.tsbuildinfo              # Build info TypeScript
├── vercel.json                       # Configuração Vercel
├── vitest.config.ts                  # Configuração Vitest
├── vitest.shims.d.ts                 # Shims Vitest
├── yarn.lock                         # Lock file Yarn
└── [handle]/                         # Rota dinâmica handle
└── src/                              # Código fonte
    ├── app/                          # App Router Next.js
    ├── components/                   # Componentes React
    ├── hooks/                        # Hooks customizados
    ├── lib/                          # Bibliotecas utilitárias
    ├── middleware.ts                 # Middleware Next.js
    ├── modules/                      # Módulos funcionais
    ├── pact/                         # Contratos Pact
    ├── providers/                    # Context providers
    ├── stories/                      # Stories Storybook
    ├── styles/                       # Estilos CSS
    ├── types/                        # Tipos TypeScript
    └── __tests__/                    # Testes unitários
