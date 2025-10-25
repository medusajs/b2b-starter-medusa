# Extração da Estrutura do Storefront

## 📁 Módulos (Modules)

### Core Business Modules

- **account/** - Gerenciamento de contas de usuário
- **cart/** - Funcionalidades do carrinho de compras
- **catalog/** - Catálogo de produtos e kits solares
- **categories/** - Gerenciamento de categorias
- **checkout/** - Processo de checkout
- **collections/** - Coleções de produtos
- **compliance/** - Conformidade e validações
- **finance/** - Funcionalidades financeiras
- **financing/** - Financiamento de projetos
- **home/** - Página inicial e landing
- **insurance/** - Seguros (seguros/)
- **layout/** - Layouts compartilhados
- **lead-quote/** - Leads e cotações
- **logistics/** - Logística (logistica/, logistics/)
- **onboarding/** - Onboarding de usuários
- **operations-maintenance/** - Operações e manutenção
- **order/** - Gerenciamento de pedidos
- **products/** - Produtos individuais
- **quotes/** - Sistema de cotações
- **shipping/** - Envio e frete
- **solar/** - Funcionalidades solares gerais
- **solar-cv/** - Computer vision para análise solar
- **solutions/** - Soluções (solucoes/)
- **store/** - Funcionalidades da loja
- **tariffs/** - Tarifas e preços
- **viability/** - Viabilidade de projetos

### Supporting Modules

- **analytics/** - Analytics e métricas
- **bizops/** - Business operations
- **common/** - Componentes comuns
- **skeletons/** - Componentes de loading/skeleton

## 📄 Páginas (Pages) - App Router

### Main Routes (`(main)`)

- **account/** - Páginas de conta do usuário
- **cart/** - Página do carrinho
- **catalogo/** - Catálogo de produtos
- **categories/** - Páginas de categorias
- **collections/** - Páginas de coleções
- **compliance/** - Páginas de conformidade
- **cotacao/** - Sistema de cotações
- **dashboard/** - Dashboard do usuário
- **dimensionamento/** - Dimensionamento de sistemas
- **financiamento/** - Páginas de financiamento
- **logistica/** - Páginas de logística
- **operacao-manutencao/** - Operações e manutenção
- **order/** - Páginas de pedidos
- **products/** - Páginas de produtos individuais
- **proposta/** - Propostas comerciais
- **search/** - Página de busca
- **seguros/** - Páginas de seguros
- **solar-cv/** - Computer vision solar
- **solucoes/** - Soluções oferecidas
- **store/** - Páginas da loja
- **suporte/** - Suporte ao cliente
- **tarifas/** - Páginas de tarifas
- **viabilidade/** - Análise de viabilidade

### Checkout Routes (`(checkout)`)

- **checkout/** - Fluxo completo de checkout

### Root Pages

- **page.tsx** - Página inicial
- **layout.tsx** - Layout raiz
- **not-found.tsx** - Página 404
- **suporte/** - Páginas de suporte

## 🎯 Features (Funcionalidades)

### Core Features

- **B2B E-commerce** - Comércio eletrônico B2B
- **Solar System Design** - Dimensionamento de sistemas solares
- **Quote Management** - Gerenciamento de cotações
- **Compliance Validation** - Validação de conformidade
- **Financial Analysis** - Análise financeira
- **Logistics Management** - Gerenciamento logístico
- **Computer Vision** - Visão computacional para análise solar
- **Insurance Integration** - Integração com seguros
- **Operations & Maintenance** - Operações e manutenção

### Advanced Features

- **Multi-region Support** - Suporte multi-região ([countryCode])
- **PWA Support** - Progressive Web App
- **SEO Optimization** - Otimização SEO
- **Analytics Integration** - Integração com analytics
- **A/B Testing** - Testes A/B
- **Internationalization** - Internacionalização

## 📚 Resources (Recursos)

### Libraries & Utilities (`lib/`)

- **analytics/** - Utilitários de analytics
- **api/** - Cliente API e integrações
- **bacen/** - Integração com BACEN
- **cache/** - Sistema de cache
- **catalog/** - Utilitários do catálogo
- **config.ts** - Configurações da aplicação
- **constants.tsx** - Constantes da aplicação
- **context/** - Context providers
- **copy/** - Utilitários de cópia
- **data/** - Camada de dados e hooks
- **design-system/** - Sistema de design
- **experiments.tsx** - Experimentos A/B
- **hooks/** - Custom hooks
- **http-client.ts** - Cliente HTTP
- **http.ts** - Utilitários HTTP
- **i18n/** - Internacionalização
- **integrations/** - Integrações externas
- **mappings.ts** - Mapeamentos de dados
- **medusa-client.ts** - Cliente Medusa
- **seo/** - Utilitários SEO
- **sku-analytics.tsx** - Analytics de SKU
- **solar-calculator-client.ts** - Cliente calculadora solar
- **solar-cv-client.ts** - Cliente CV solar
- **storage/** - Utilitários de storage
- **util/** - Utilitários gerais
- **utils/** - Utilitários adicionais

### Components (`components/`)

- **catalog/** - Componentes do catálogo
- **client/** - Componentes client-side
- **common/** - Componentes comuns
- **ConsentBanner.tsx** - Banner de consentimento
- **DesignSystemTest.tsx** - Teste do sistema de design
- **PWAProvider.tsx** - Provider PWA
- **SKUAutocomplete.tsx** - Autocomplete de SKU
- **SKUQRCode.tsx** - QR Code de SKU
- **solar/** - Componentes solares
- **theme/** - Componentes de tema
- **ui/** - Componentes UI básicos
- **WebVitals.tsx** - Web Vitals

### Types & Configuration

- **types/** - Definições de tipos TypeScript
- **middleware.ts** - Middleware Next.js
- **providers/** - Context providers
- **styles/** - Estilos globais
- **stories/** - Stories para Storybook

## 🏗️ Architecture Overview

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Medusa.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Deployment**: Docker/Vercel

### Project Structure

```
storefront/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── modules/       # Feature modules
│   ├── components/    # Shared components
│   ├── lib/          # Utilities & business logic
│   ├── types/        # TypeScript definitions
│   └── ...
├── public/           # Static assets
├── docs/            # Documentation
└── e2e/            # End-to-end tests
```

### Key Patterns

- **Module-based architecture** - Cada feature em seu próprio módulo
- **App Router** - Next.js 13+ App Router com layouts aninhados
- **Multi-region routing** - Suporte a múltiplas regiões via [countryCode]
- **Component composition** - Composição de componentes reutilizáveis
- **Custom hooks** - Lógica de negócio em hooks customizados
- **Type safety** - TypeScript rigoroso em toda a aplicação</content>
<parameter name="filePath">c:\Users\fjuni\ysh_medusa\ysh-store\storefront\ARCHITECTURE_EXTRACTION.md
