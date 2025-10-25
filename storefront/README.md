# ☀️ YSH Solar Hub - Storefront

> **Loja Next.js 15** para e-commerce B2B de energia solar com Medusa 2.4

---

## 🚀 Quick Start

### Com Docker (Recomendado)

```bash
# Na raiz do projeto
docker-compose up --build

# Acesse: http://localhost:8000
```

### Desenvolvimento Local

```bash
# Instalar dependências
yarn install

# Configurar variáveis de ambiente
cp .env.template .env.local
# Edite .env.local com suas configurações

# Iniciar servidor de desenvolvimento
yarn dev

# Acesse: http://localhost:8000
```

---

## 📚 Documentação

### 📖 Navegação Principal

- **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Índice completo de toda documentação (74 documentos)
- **[AGENTS.md](AGENTS.md)** - Instruções para agentes de IA (GitHub Copilot)
- **[docs/ESTRUTURA_ORGANIZADA.md](docs/ESTRUTURA_ORGANIZADA.md)** - Guia da estrutura de diretórios

### 🗂️ Categorias de Documentação

```
docs/
├── analysis/        # 15 análises técnicas e de UX
├── implementation/  # 32 relatórios de implementação
├── guides/          # 11 guias de desenvolvimento
├── status/          # 12 relatórios de status
└── testing/         # 4 documentos de testes
```

### 🔗 Links Rápidos por Categoria

| Categoria | Descrição | Acesso Rápido |
|-----------|-----------|---------------|
| **Análises** | Arquitetura, componentes, UX/UI | [`docs/analysis/`](docs/analysis/) |
| **Implementações** | Features, fases, integrações | [`docs/implementation/`](docs/implementation/) |
| **Guias** | Como usar, desenvolver, configurar | [`docs/guides/`](docs/guides/) |
| **Status** | Progresso, resumos, inventários | [`docs/status/`](docs/status/) |
| **Testes** | Configuração e cobertura | [`docs/testing/`](docs/testing/) |

---

## 🏗️ Arquitetura

### Stack Tecnológico

- **Framework**: Next.js 15 (App Router + Server Components)
- **Backend**: Medusa 2.4 (módulos B2B personalizados)
- **Styling**: Tailwind CSS + Radix UI
- **Estado**: React Context + Server Actions
- **Testes**: Jest (unit) + Playwright (E2E)
- **Analytics**: PostHog
- **Type Safety**: TypeScript 5

### Estrutura do Projeto

```
storefront/
├── src/
│   ├── app/[countryCode]/      # Rotas multi-região
│   │   ├── (main)/             # Páginas públicas
│   │   └── (checkout)/         # Fluxo de checkout
│   ├── modules/                # Módulos por recurso
│   │   ├── account/            # Conta do usuário
│   │   ├── cart/               # Carrinho de compras
│   │   ├── checkout/           # Processo de checkout
│   │   ├── products/           # Catálogo de produtos
│   │   ├── quotes/             # Sistema de cotações
│   │   ├── company/            # Gestão de empresa
│   │   ├── approval/           # Aprovações B2B
│   │   └── solar/              # Módulos específicos solar
│   ├── lib/
│   │   ├── data/               # Server Actions para busca
│   │   ├── hooks/              # React Hooks customizados
│   │   ├── config/             # Configurações (SDK, etc)
│   │   └── utils/              # Funções utilitárias
│   └── styles/                 # Estilos globais
├── public/                     # Assets estáticos
├── docs/                       # Documentação organizada
└── scripts/                    # Scripts utilitários
```

---

## 🌟 Funcionalidades Principais

### B2B Core
- ✅ **Gestão de Empresas** - Hierarquia de empresas e colaboradores
- ✅ **Limites de Gastos** - Controle por colaborador/empresa
- ✅ **Aprovações** - Workflow de aprovação de carrinhos/pedidos
- ✅ **Cotações** - Sistema de RFQ (Request for Quote) com mensagens
- ✅ **Bulk Add to Cart** - Adição em massa de produtos

### E-commerce
- ✅ **Catálogo de Produtos** - Busca, filtros, categorias
- ✅ **Carrinho Multi-moeda** - Suporte a múltiplas regiões
- ✅ **Checkout** - Fluxo otimizado com validações B2B
- ✅ **Gestão de Pedidos** - Histórico e tracking
- ✅ **Pagamentos** - Integração com provedores via Medusa

### Solar-Specific
- ✅ **Viabilidade Técnica** - Análise de instalação solar
- ✅ **Simulador de Economia** - Cálculo de ROI
- ✅ **Sistema SKU Avançado** - SKUs parametrizados para painéis/inversores
- ✅ **Análise de Crédito** - Integração BACEN para financiamento
- ✅ **Geração de Propostas** - PDFs técnicos e comerciais

### UX/UI
- ✅ **Dark Mode** - Tema claro/escuro com persistência
- ✅ **Responsive Design** - Mobile-first, otimizado para tablets
- ✅ **Toast Notifications** - Feedback visual consistente
- ✅ **Loading States** - Skeletons e spinners
- ✅ **Error Handling** - Fallbacks e mensagens amigáveis

---

## 🔧 Desenvolvimento

### Comandos Disponíveis

```bash
# Desenvolvimento
yarn dev                # Servidor dev (localhost:8000)
yarn build              # Build de produção
yarn start              # Servidor de produção

# Qualidade de Código
yarn lint               # ESLint
yarn format             # Prettier
yarn type-check         # TypeScript

# Testes
yarn test               # Testes unitários (Jest)
yarn test:watch         # Watch mode
yarn test:e2e           # Testes E2E (Playwright)
yarn test:coverage      # Cobertura de testes

# Utilitários
yarn check-env          # Validar variáveis de ambiente
```

### Variáveis de Ambiente Essenciais

```bash
# Backend Medusa
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxx  # Obter no Admin

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# PostHog (opcional)
NEXT_PUBLIC_POSTHOG_KEY=your_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Stripe (se usando)
NEXT_PUBLIC_STRIPE_KEY=pk_test_xxxxx
```

**⚠️ Crítico**: Obtenha a `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` em:  
Admin → Configurações → Chaves de API Publicáveis

---

## 🎨 Padrões de Código

### Server Actions

**Toda busca de dados usa Server Actions**:

```typescript
// src/lib/data/companies.ts
"use server"
import "server-only"

export const retrieveCompany = async (companyId: string) => {
  const headers = { ...(await getAuthHeaders()) };
  const next = { ...(await getCacheOptions("companies")) };
  
  return await sdk.client.fetch(`/store/companies/${companyId}`, {
    headers,
    next,
  });
};
```

### Componentes

- **Server Components** (padrão) - Para busca de dados
- **Client Components** (`"use client"`) - Para interatividade

```typescript
// Server Component
async function ProductList() {
  const products = await retrieveProducts();
  return <div>{/* render */}</div>;
}

// Client Component
"use client"
function AddToCartButton() {
  const [loading, setLoading] = useState(false);
  // ...
}
```

### Cache Management

```typescript
import { revalidateTag } from "next/cache";

// Após mutação
const cacheTag = await getCacheTag("companies");
revalidateTag(cacheTag);
```

---

## 🧪 Testes

### Executar Testes

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Coverage
yarn test:coverage
```

### Documentação de Testes

- [`docs/testing/TEST_INSTRUCTIONS.md`](docs/testing/TEST_INSTRUCTIONS.md) - Como testar
- [`docs/testing/TESTING_FLOW.md`](docs/testing/TESTING_FLOW.md) - Fluxo de testes
- [`docs/testing/TEST_COVERAGE_AUDIT.md`](docs/testing/TEST_COVERAGE_AUDIT.md) - Auditoria

---

## 📊 Status do Projeto

### Progresso Geral

Para status detalhado, veja [`docs/status/`](docs/status/):

- [STATUS_EXECUTIVO.md](docs/status/STATUS_EXECUTIVO.md) - Visão executiva
- [MODULOS_COMPLETOS_FINAL.md](docs/status/MODULOS_COMPLETOS_FINAL.md) - Módulos implementados
- [READY_TO_TEST.md](docs/status/READY_TO_TEST.md) - Pronto para testar

### Módulos Implementados

| Módulo | Status | Documentação |
|--------|--------|--------------|
| Account | ✅ Completo | [`docs/implementation/`](docs/implementation/) |
| Cart | ✅ Completo | [`docs/implementation/`](docs/implementation/) |
| Checkout | ✅ Completo | [`docs/implementation/`](docs/implementation/) |
| Products | ✅ Completo | [`docs/implementation/`](docs/implementation/) |
| Quotes | ✅ Completo | [`docs/implementation/`](docs/implementation/) |
| Company | ✅ Completo | [`docs/implementation/`](docs/implementation/) |
| Approval | ✅ Completo | [`docs/implementation/`](docs/implementation/) |
| Solar | ✅ Completo | [`docs/implementation/`](docs/implementation/) |
| Onboarding | ✅ Completo | [`docs/implementation/MODULO_ONBOARDING_COMPLETO.md`](docs/implementation/MODULO_ONBOARDING_COMPLETO.md) |

---

## 🤝 Contribuindo

### Workflow

1. **Antes de começar**: Leia [`AGENTS.md`](AGENTS.md)
2. **Durante desenvolvimento**: Siga os guias em [`docs/guides/`](docs/guides/)
3. **Ao adicionar features**: Documente em [`docs/implementation/`](docs/implementation/)
4. **Atualizar status**: Edite [`docs/status/`](docs/status/)

### Adicionando Documentação

1. Coloque no diretório apropriado em `docs/`
2. Atualize [`DOCUMENTATION_INDEX.md`](DOCUMENTATION_INDEX.md)
3. Mantenha [`docs/ESTRUTURA_ORGANIZADA.md`](docs/ESTRUTURA_ORGANIZADA.md) atualizado

---

## 🔗 Links Úteis

### Documentação Externa
- [Medusa Documentation](https://docs.medusajs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)

### Repositório
- **Backend**: `../backend/` - Servidor Medusa com módulos B2B
- **Docs raiz**: `../docs/` - Documentação do projeto completo

---

## 📝 Licença

Ver [`LICENSE`](LICENSE) para detalhes.

---

## 👥 Equipe

**YSH Solar Hub** - E-commerce B2B para energia solar

---

**Última atualização**: 09/10/2025  
**Versão**: 2.0 (Reorganização completa)
