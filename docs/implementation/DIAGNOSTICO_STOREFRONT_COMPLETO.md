# 🌳 Estrutura e Diagnóstico do Storefront - Yello Solar Hub

**Data**: 8 de outubro de 2025  
**Status**: Análise Completa de Configuração

---

## 🚨 PROBLEMAS IDENTIFICADOS

### 1. **Chave Publicável Incorreta no Runtime**

**Problema**: O storefront está usando `pk_dev_test` em vez da chave correta  
**Chave correta**: `pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d`  
**Evidência**: Logs mostram `"x-publishable-api-key": "pk_dev_test"`

**Impacto**:

- ❌ Conexão com backend falhando (retries infinitos)
- ❌ Categorias não carregam
- ❌ Collections não carregam
- ❌ Produtos não aparecem

**Causa Raiz**: Variável de ambiente não está sendo lida corretamente pelo container Docker

### 2. **Logos Oficiais Yello Não Utilizados**

**Localização**: `storefront/public/`

- ✅ `yello-black_logomark.png` - Logo oficial preto
- ✅ `yello-white_logomark.png` - Logo oficial branco
- ✅ `yello-icon.jpg` - Ícone oficial

**Problema**: Os componentes React estão usando SVGs gerados manualmente em vez dos logos oficiais

### 3. **Componentes de Logo Duplicados**

**Arquivos criados**:

- `src/modules/common/icons/yello-icon.tsx` - SVG manual
- `src/modules/common/icons/yello-logo-full.tsx` - SVG manual com texto
- `src/modules/common/icons/logo.tsx` - Wrapper duplicado

**Problema**: Caminhos quebrados - componentes não apontam para assets oficiais

---

## 📂 ESTRUTURA DO STOREFRONT

### Diretório Raiz

```
storefront/
├── .env                          # ✅ Tem a chave correta
├── .env.template
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── Dockerfile.dev                # ⚠️ Container não lê .env corretamente
├── docker-compose.dev.yml
└── AGENTS.md                     # Instruções para agentes
```

### Public Assets

```
public/
├── favicon.ico
├── manifest.json
├── yello-black_logomark.png      # 🎯 Logo oficial preto
├── yello-white_logomark.png      # 🎯 Logo oficial branco  
├── yello-icon.jpg                # 🎯 Ícone oficial
├── android-chrome-192x192.png
├── android-chrome-512x512.png
├── apple-touch-icon.png
├── logos/
│   ├── fabricantes/              # Logos de fabricantes (BYD, Huawei, etc.)
│   │   ├── BYD_Company,_Ltd._-_Logo.svg
│   │   ├── Growatt.png
│   │   ├── Huawei_idfUUSTrcr_0.svg
│   │   ├── JA_Solar_Logo.svg
│   │   ├── Trina_Solar_logo.svg
│   │   └── logos_manifest.csv
│   └── parceiros/                # ⚠️ Vazio
└── videos/
```

### Source Structure (Simplificado)

```
src/
├── app/
│   ├── layout.tsx                # Root layout com metadata
│   ├── [countryCode]/            # Rotas i18n
│   │   ├── (main)/              # Layout principal
│   │   │   ├── layout.tsx       # Com navegação
│   │   │   ├── page.tsx         # Home
│   │   │   ├── produtos/        # Catálogo
│   │   │   ├── solucoes/        # Soluções
│   │   │   ├── cotacao/         # Cotações
│   │   │   └── calculadora/     # Calculadora solar
│   │   └── (checkout)/          # Checkout isolado
│   └── api/
│       ├── health/              # Health check
│       └── quotes/              # API de cotações
│
├── modules/
│   ├── account/                 # Conta do usuário
│   ├── cart/                    # Carrinho de compras
│   ├── checkout/                # Processo de checkout
│   ├── common/
│   │   ├── components/          # Componentes compartilhados
│   │   └── icons/               # ⚠️ Ícones (problema aqui)
│   │       ├── logo.tsx         # Logo atual (SVG manual)
│   │       ├── yello-icon.tsx   # ⚠️ SVG manual (não usa asset oficial)
│   │       └── yello-logo-full.tsx # ⚠️ SVG manual com texto
│   ├── finance/                 # Módulo de financiamento
│   ├── layout/
│   │   ├── templates/
│   │   │   ├── nav/             # Navegação principal
│   │   │   │   └── index.tsx    # Usa LogoIcon
│   │   │   └── footer/          # Rodapé
│   │   │       └── index.tsx    # Usa YelloIcon
│   │   └── components/
│   ├── lead-quote/              # Leads e cotações
│   ├── products/                # Produtos
│   ├── quotes/                  # Sistema de cotações
│   ├── skeletons/               # Loading states
│   ├── solar/                   # Calculadora solar
│   └── store/                   # Loja
│
├── lib/
│   ├── config.ts                # ✅ Lê NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
│   ├── data/                    # Data fetching
│   │   ├── cart.ts              # ✅ Usa publishable key
│   │   ├── categories.ts
│   │   ├── collections.ts
│   │   └── products.ts
│   └── util/
│       └── env.ts               # Utilitários de ambiente
│
├── components/                  # Componentes globais
│   ├── PWAProvider.tsx
│   ├── SKUAutocomplete.tsx
│   ├── SKUQRCode.tsx
│   └── theme/                   # Sistema de tema dark/light
│
├── providers/
│   └── posthog-provider.tsx     # Analytics
│
└── styles/
    └── globals.css              # Estilos globais + Tailwind
```

---

## 🔑 CONFIGURAÇÃO DE AMBIENTE

### Arquivo `.env` (Correto)

```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_REGION=br
REVALIDATE_SECRET=supersecret
```

### Onde a Chave é Lida

1. ✅ `src/lib/config.ts` - Configuração do SDK Medusa
2. ✅ `src/lib/data/cart.ts` - API de carrinho
3. ✅ `src/middleware.ts` - Middleware de região
4. ✅ `check-env-variables.js` - Validação no build

### Problema: Container Docker

O container não está recebendo a variável de ambiente corretamente. Está usando fallback `pk_dev_test`.

---

## 🎨 SISTEMA DE LOGOS

### Logos Oficiais Disponíveis (Public)

| Arquivo | Tipo | Uso Recomendado |
|---------|------|-----------------|
| `yello-black_logomark.png` | PNG | Navegação (tema claro) |
| `yello-white_logomark.png` | PNG | Navegação (tema escuro) |
| `yello-icon.jpg` | JPG | Favicon, PWA icons |

### Logos Fabricantes (Para Páginas de Produtos)

- BYD
- Canadian Solar
- Growatt
- Huawei
- JA Solar
- Trina Solar

### Componentes React Atuais (Problemáticos)

```typescript
// ⚠️ yello-icon.tsx - SVG manual (16 raios)
// Gradiente: #FDD835 → #FF9800 → #FF5252
const YelloIcon = () => (
  <svg viewBox="0 0 200 200">
    {/* Círculo com gradiente radial */}
    {/* 16 raios brancos */}
    {/* Centro branco */}
  </svg>
)

// ⚠️ yello-logo-full.tsx - SVG com texto
const YelloLogoFull = () => (
  <svg viewBox="0 0 600 200">
    {/* Ícone solar */}
    {/* Texto "yello" */}
    {/* Ponto vermelho final */}
  </svg>
)

// ⚠️ logo.tsx - Wrapper duplicado
const LogoIcon = () => (
  /* Cópia do YelloIcon */
)
```

**Problema**: Não usam os assets oficiais em `public/`

---

## 📊 MÓDULOS PRINCIPAIS

### 1. **Solar Calculator** (`src/modules/solar/`)

- Calculadora de dimensionamento fotovoltaico
- Integração com API de irradiação solar
- Geração de leads e cotações

### 2. **Finance** (`src/modules/finance/`)

- Simulador de financiamento
- Integração com BACEN (taxa Selic)
- Cálculo de parcelas

### 3. **Quotes** (`src/modules/quotes/`)

- Sistema de cotações
- Histórico de cotações
- Export para CSV/PDF

### 4. **Lead Quote** (`src/modules/lead-quote/`)

- Captura de leads
- Carrinho de cotação
- Contexto global de lead

### 5. **Products** (`src/modules/products/`)

- Catálogo de produtos
- Filtros e busca
- SKU tracking

---

## 🔍 ANÁLISE DE IMPORTS

### Imports do Logo (Grep Results)

```typescript
// nav/index.tsx
import LogoIcon from "@/modules/common/icons/logo"

// footer/index.tsx  
import YelloIcon from "@/modules/common/icons/yello-icon"

// checkout (provavelmente)
import LogoIcon from "@/modules/common/icons/logo"
```

### Uso da Publishable Key

```typescript
// lib/config.ts
publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

// lib/data/cart.ts
if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
  headers["x-publishable-api-key"] = 
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
}
```

---

## 🛠️ CORREÇÕES NECESSÁRIAS

### Prioridade 1: Fixar Publishable Key

**Ação**: Garantir que o container Docker recebe a variável de ambiente

```powershell
# Opção A: Rebuild com --build-arg
docker-compose -f docker-compose.dev.yml build --build-arg NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d storefront

# Opção B: Restart forçado
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d

# Opção C: Verificar .env no container
docker exec ysh-b2b-storefront-dev env | grep PUBLISHABLE
```

### Prioridade 2: Usar Logos Oficiais

**Ação**: Modificar componentes para usar assets em `public/`

```typescript
// Exemplo: Logo com tema
import Image from 'next/image'
import { useTheme } from 'next-themes'

const YelloLogo = () => {
  const { theme } = useTheme()
  const src = theme === 'dark' 
    ? '/yello-white_logomark.png'
    : '/yello-black_logomark.png'
  
  return (
    <Image 
      src={src}
      alt="Yello Solar Hub"
      width={40}
      height={40}
    />
  )
}
```

### Prioridade 3: Cleanup de Componentes

**Ação**: Remover/consolidar SVGs manuais

```bash
# Manter apenas um componente que usa assets oficiais
# Remover duplicatas: yello-icon.tsx, yello-logo-full.tsx
# Atualizar logo.tsx para usar Image next/image
```

---

## 📈 MÉTRICAS DE QUALIDADE

### Cobertura de Testes

- ✅ Unit tests configurados (Jest + Vitest)
- ✅ Coverage reports disponíveis
- ⚠️ Faltam testes para componentes de logo

### Performance

- ✅ Next.js 15.5.4 (App Router)
- ✅ Imagens otimizadas via next/image
- ⚠️ Logos usando SVG inline (pode cachear melhor com PNG)

### Acessibilidade

- ✅ Semantic HTML
- ✅ ARIA labels
- ⚠️ Logos precisam alt text adequado

---

## 🔄 STATUS DOS CONTAINERS

### Containers Ativos

```
ysh-b2b-storefront-dev  - UP (healthy) - Port 8000
ysh-b2b-backend-dev     - UP - Ports 9000-9002
ysh-b2b-postgres-dev    - UP (healthy) - Port 15432
ysh-b2b-redis-dev       - UP (healthy) - Port 16379
```

### Health Checks

- ✅ Backend: <http://localhost:9000/health> (200 OK)
- ⚠️ Storefront: <http://localhost:8000> (200 OK mas com erros de API)

---

## 📝 PRÓXIMOS PASSOS

### Imediato

1. ✅ **Extrair árvore completa** - CONCLUÍDO
2. 🔄 **Fixar publishable key no container**
3. 🔄 **Modificar componentes de logo para usar assets oficiais**
4. 🔄 **Testar tema dark/light com logos corretos**

### Curto Prazo

5. ⏳ Adicionar logos de fabricantes nas páginas de produtos
6. ⏳ Criar favicon.ico a partir de yello-icon.jpg
7. ⏳ Otimizar PWA icons (192x192, 512x512)
8. ⏳ Adicionar testes para componentes de logo

### Médio Prazo

9. ⏳ Documentar uso dos logos oficiais
10. ⏳ Criar style guide para branding
11. ⏳ Implementar lazy loading para logos de fabricantes
12. ⏳ Adicionar logos de parceiros (pasta vazia)

---

## 🎯 RESUMO EXECUTIVO

**Problemas Críticos**:

1. ❌ Publishable key incorreta em runtime (bloqueador)
2. ❌ Logos oficiais não utilizados (qualidade visual)
3. ❌ Componentes duplicados (manutenção)

**Assets Disponíveis**:

- ✅ 3 logos oficiais Yello (preto, branco, ícone)
- ✅ 6 logos de fabricantes
- ✅ Estrutura completa de módulos

**Ação Imediata**:
Corrigir variável de ambiente no container Docker para desbloquear o storefront.

---

## 📚 ARQUIVOS DE REFERÊNCIA

- **Estrutura completa**: `ARVORE_STOREFRONT_COMPLETA.txt` (84,443 linhas)
- **Ícones**: `ARVORE_STOREFRONT_ICONS.txt`
- **Credenciais**: `CREDENCIAIS_ADMIN.md`
- **Implementação logos**: `LOGO_YELLO_IMPLEMENTACAO.md`

---

**Gerado em**: 8 de outubro de 2025  
**Autor**: GitHub Copilot  
**Sessão**: Diagnóstico de configuração pós-implementação
