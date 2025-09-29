# Instruções do GitHub Copilot

## Visão Geral do Repositório

- O repositório contém dois workspaces Yarn 4: `backend/` (servidor Medusa 2.0) e `storefront/` (storefront B2B em Next.js 15 App Router). Trabalhe neles de forma independente; não há `package.json` na raiz.
- O backend exige Postgres + Redis (veja `docker-compose.yml`) e variáveis de ambiente a partir de `backend/.env.template`; a configuração fica centralizada em `backend/medusa-config.ts`.
- O desenvolvimento usa Node 20; execute `yarn install` em cada workspace antes de usar qualquer CLI para que o Yarn PnP construa o mapa de dependências.
- Use `yarn dev` em `backend/` para o Medusa e `yarn dev` em `storefront/` para o storefront; `backend/start-dev.sh` é o entrypoint preparado para containers.

## Essenciais do Backend

- A lógica de domínio é organizada em módulos Medusa sob `backend/src/modules/{company,quote,approval}`; cada módulo estende `MedusaService` com modelos Mikro-ORM e migrations.
- Relações entre entidades core do Medusa e módulos customizados são declaradas em `backend/src/links/*.ts` via `defineLink` (ex.: `cart-approvals.ts` liga carrinhos a registros de aprovação); adicione novas relações aqui para que consultas remotas possam atravessá-las.
- Enums e tipos de DTO compartilhados ficam em `backend/src/types/**` e são importados por workflows, camada de API e utilitários; exporte novos tipos através de `backend/src/types/index.ts`.
- A carga inicial de dados passa por `backend/src/scripts/seed.ts`, que encadeia workflows core da Medusa para criar regiões, produtos e publishable keys; reutilize esse padrão ao estender os dados iniciais.

## Workflows e Hooks

- Processos de negócio são orquestrados com definições `createWorkflow` em `backend/src/workflows/**`; elas normalmente envolvem fluxos core da Medusa e retornam um `WorkflowResponse`.
- Hooks em `backend/src/workflows/hooks/` interceptam fluxos core (`addToCartWorkflow`, `completeCartWorkflow`, etc.) para impor aprovações e limites de gasto; replique esse padrão ao interceptar eventos do ciclo de vida.
- Workflows de aprovação (`backend/src/workflows/approval/workflows/*.ts`) criam automaticamente registros de status e remote links após eventos de empresa ou carrinho.
- Workflows de cotação (`backend/src/workflows/quote/workflows/*.ts`) preparam edições de pedido chamando fluxos como `createOrdersWorkflow` e `beginOrderEditOrderWorkflow`; use `runAsStep` para compor operações multi-etapas.
- Utilitários como `backend/src/utils/check-spending-limit.ts` encapsulam cálculos compartilhados; mantenha validações aqui e reutilize em hooks para evitar regras duplicadas.

## Camada de API

- Rotas admin baseadas em arquivos residem em `backend/src/api/admin/**/route.ts` e dependem das extensões de requisição da Medusa (`req.queryConfig`, `req.validatedBody`); siga o padrão GET/POST existente ao criar rotas.
- `backend/src/api/**/middlewares.ts` registra middlewares `validateAndTransform*` com definições compartilhadas de `query-config.ts` para controlar seleções padrão (a sintaxe `*relation` dispara joins); atualize ambos ao expor novos campos.
- Consulte o banco via `ContainerRegistrationKeys.QUERY.graph` para respeitar o isolamento de módulos e links existentes; isso retorna objetos `{ data, metadata }` usados nas respostas.
- Mutations são orquestradas pelo workflow apropriado (`createCompaniesWorkflow`, `createApprovalsWorkflow`, etc.) e reconsultadas para honrar as projeções configuradas.

## Notas sobre o Storefront

- O app Next.js vive em `storefront/src/app` usando App Router; segmentos de página ficam aninhados sob rotas por país (`[countryCode]/`), então novas páginas devem respeitar o prefixo de locale.
- A busca de dados ocorre via Medusa JS SDK configurado em `storefront/src/lib/config.ts`; prefira os helpers `sdk.store.*` em `storefront/src/lib/data/**`.
- O middleware (`storefront/src/middleware.ts`) define cookies de região e carrinho; evite APIs exclusivas de Node nele, pois roda no runtime Edge.
- Módulos de UI ficam em `storefront/src/modules/**` com componentes server/client colocados juntos; siga a convenção de pastas existente ao introduzir novos módulos de domínio.

## Testes e Ferramentas

- Os testes do backend usam Jest + SWC; escolha a suíte com scripts como `yarn test:unit`, `yarn test:integration:http` ou `yarn test:integration:modules`, que definem `TEST_TYPE` para orientar `jest.config.js`.
- `backend/integration-tests/http/` contém specs estilo supertest que exercitam rotas de API; reutilize a configuração de `integration-tests/setup.js` para limpar metadados do Mikro-ORM entre suítes.
- Ao adicionar workflows ou hooks, inclua testes unitários em `backend/src/**/__tests__` com sufixo `.unit.spec.ts` para que os matchers atuais do Jest os encontrem.
- Lint/build são executados por workspace (`yarn build` no backend roda `medusa build`; `yarn lint` no storefront usa o Next lint).

## Jornada do Comprador

- **Onboarding corporativo**: admins criam a companhia e colaboradores via `backend/src/api/admin/companies/**` que disparam `createCompaniesWorkflow`; approval settings são gerados automaticamente.
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

- Remote links costumam depender de metadados do carrinho ou pedido (veja `backend/src/workflows/hooks/cart-created.ts` e `order-created.ts`); garanta que novos fluxos preencham `metadata` de forma consistente para permitir o cleanup dos links.
- Prefira passos de workflows Medusa em vez de acessar repositórios diretamente—combinar consultas Mikro-ORM cruas com workflows pode contornar hooks e gerar estados de aprovação inconsistentes.
