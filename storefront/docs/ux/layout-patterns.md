# Layout Patterns - Medusa.js + UX Strategy

## Visão Geral

Este documento define os padrões de layouts implementados no YSH Storefront, combinando convenções do Medusa.js com a hierarquia UX Strategy definida no `AGENTS.md` (persona Hélio).

## Hierarquia de Layouts (Next.js App Router)

```
src/app/
├── layout.tsx                    # Root Layout (metadata + providers globais)
├── [countryCode]/
│   ├── layout.tsx               # Country Layout (header + footer)
│   └── (main)/
│       ├── layout.tsx          # Main Layout (estrutura semântica)
│       └── page.tsx            # Home Page
```

### 1. Root Layout (`src/app/layout.tsx`)

**Responsabilidades:**

- Metadata global (SEO, Open Graph, Twitter Cards)
- Providers (Analytics, PostHog, PWA, LeadQuote)
- Design System (GradientDefs, CSS global, fonts)
- Structured Data (JSON-LD Organization)
- Performance (preconnect, preload, theme script)
- Acessibilidade (skip links, ARIA live regions)

**Padrões Implementados:**

```tsx
import { GradientDefs } from "@ysh/ui"
import { getBaseURL } from "@/lib/util/env"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: { default: "...", template: "%s | Yello Solar Hub" },
  // ... Open Graph, Twitter, etc.
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <GradientDefs /> {/* Design System gradients */}
        <SkipLinks />
        <Providers>
          <main id="main-content">{children}</main>
        </Providers>
        <Toaster />
        <ConsentBanner />
      </body>
    </html>
  )
}
```

### 2. Country Layout (`src/app/[countryCode]/layout.tsx`)

**Responsabilidades:**

- Navegação global (header + footer)
- Skip link para acessibilidade
- ARIA landmarks (role="main")
- Estrutura flex para footer fixo

**Padrões Implementados:**

```tsx
import { getBaseURL } from "@/lib/util/env"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  alternates: {
    canonical: getBaseURL(),
    languages: { 'pt-BR': getBaseURL() },
  },
}

export default function CountryLayout({ children, params }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Skip link com estilo melhorado */}
      <a href="#main-content" className="sr-only focus:not-sr-only ...">
        Pular para o conteúdo principal
      </a>
      <NavigationHeader />
      <main id="main-content" className="flex-1" role="main">
        {children}
      </main>
      <Footer />
    </div>
  )
}
```

### 3. Main Layout (`src/app/[countryCode]/(main)/layout.tsx`)

**Responsabilidades:**

- Agrupamento lógico de rotas públicas principais
- Metadata específica do grupo (se necessário)
- Container wrapper minimal

**Padrões Implementados:**

```tsx
/**
 * MainLayout - Layout do grupo de rotas (main)
 * Hierarquia Medusa: RootLayout → CountryLayout → MainLayout → Pages
 */
export default function MainLayout({ children }) {
  return <div className="relative">{children}</div>
}
```

## Componentes de Estado (Loading, Error, Not Found)

### Loading State (`loading.tsx`)

**UX Strategy:** Feedback visual imediato, previne CLS (Cumulative Layout Shift)

```tsx
export default function Loading() {
  return (
    <div 
      role="status" 
      aria-busy="true" 
      aria-label="Carregando conteúdo..."
    >
      {/* Skeleton matching final layout */}
      <span className="sr-only">Carregando produtos do catálogo...</span>
    </div>
  )
}
```

**Checklist:**

- ✅ `role="status"` + `aria-busy="true"` para screen readers
- ✅ Skeleton que previne layout shift
- ✅ Mensagem sr-only descritiva

### Not Found (`not-found.tsx`)

**UX Strategy (Hélio):** Cordial, prestativo, sempre oferece soluções

```tsx
export const metadata: Metadata = {
  title: "404 - Página Não Encontrada | Yello Solar Hub",
  description: "Esta rota não existe. Explore produtos, dimensionamento ou fale com especialista.",
}

export default function NotFound() {
  return (
    <div>
      <h1>404 — Rota Não Encontrada</h1>
      <p>
        Comandante, esta página não existe no nosso sistema. 
        Vamos redirecionar você para onde precisa.
      </p>
      {/* CTAs primários */}
      {/* Sugestões contextuais com ícones */}
    </div>
  )
}
```

**Microcopy Hélio:**

- ✅ Usa "Comandante" (tratamento persona)
- ✅ Tom cordial, não culpa usuário
- ✅ Oferece atalhos úteis (produtos, dimensionamento, suporte)
- ✅ CTAs visuais claros

## Padrões de Acessibilidade (WCAG AA)

### Skip Links

```tsx
<a 
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] 
             focus:top-4 focus:left-4 focus:px-4 focus:py-2 
             focus:bg-brand-500 focus:text-white focus:rounded-md 
             focus:shadow-lg focus:outline-none focus:ring-2 
             focus:ring-brand-600 focus:ring-offset-2"
>
  Pular para o conteúdo principal
</a>
```

**Requisitos:**

- ✅ Primeiro elemento focável da página
- ✅ `sr-only` até receber foco (keyboard-only)
- ✅ z-index alto (9999) para sobrepor tudo
- ✅ Contraste WCAG AAA (brand-500 bg + white text)
- ✅ Ring focus indicator (2px brand-600)

### ARIA Landmarks

```tsx
<header role="banner">...</header>
<nav role="navigation" aria-label="Menu principal">...</nav>
<main id="main-content" role="main">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>
```

### Live Regions (Anúncios Dinâmicos)

```tsx
{/* Root Layout */}
<div 
  role="status" 
  aria-live="assertive" 
  aria-atomic="true"
  className="sr-only"
  id="sr-announcements"
/>

{/* Uso em componentes */}
document.getElementById('sr-announcements').textContent = 
  'Item adicionado ao carrinho'
```

## Padrões de SEO (Medusa.js)

### Metadata Hierárquica

```tsx
// Root Layout - Base global
export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: { template: "%s | Yello Solar Hub" },
  openGraph: { siteName: "Yello Solar Hub" },
}

// Page - Override específico
export const metadata: Metadata = {
  title: "Painéis Solares 600W", // Renderiza: "Painéis Solares 600W | Yello Solar Hub"
  description: "...",
}
```

### Structured Data (JSON-LD)

```tsx
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Yello Solar Hub",
  "url": getBaseURL(),
  // ...
})}
</script>
```

**Schemas Recomendados:**

- Organization (Root Layout)
- Product (PDPs)
- BreadcrumbList (Category pages)
- FAQPage (Support pages)

## Padrões de Performance

### Preload Critical Assets

```tsx
<link rel="preload" href="/yello-black_logomark.png" as="image" fetchPriority="high" />
<link rel="preload" href="..." as="font" type="font/woff2" crossOrigin="anonymous" />
```

### Preconnect Third-Party

```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href={MEDUSA_BACKEND_URL} />
```

### Theme Script (Prevent FOUC)

```tsx
<script dangerouslySetInnerHTML={{
  __html: `(() => {
    const stored = localStorage.getItem('theme');
    const dark = stored === 'dark' || 
                 (!stored && matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  })();`
}} />
```

## Padrões de Design System

### Gradient Defs (Global)

```tsx
import { GradientDefs } from "@ysh/ui"

// Root Layout
<GradientDefs /> // Torna gradientes disponíveis para SVG strokes

// Uso em componentes
<svg className="stroke-gradient-ysh">
  <circle ... />
</svg>
```

### CSS Variables (Theme)

```css
/* packages/ui/src/theme/tokens.json */
{
  "color": {
    "brand": {
      "50": "#FFF9E6",
      "500": "#FFEE00",
      "600": "#FF6600"
    }
  }
}

/* Tailwind config */
theme.extend.colors.brand = tokens.color.brand
```

## Checklist de Implementação

### ✅ Layout deve ter

- [ ] Metadata (`title`, `description`, `openGraph`)
- [ ] Skip link (apenas CountryLayout)
- [ ] ARIA landmarks (`role="main"`, etc.)
- [ ] Semantic HTML5 (`<main>`, `<nav>`, `<footer>`)
- [ ] GradientDefs (apenas RootLayout)

### ✅ Página deve ter

- [ ] Metadata específica (override title/description)
- [ ] Heading hierarchy (apenas um `<h1>`)
- [ ] Alt text em imagens
- [ ] Labels em inputs (`<label>` ou `aria-label`)
- [ ] Focus indicators visíveis

### ✅ Microcopy deve

- [ ] Usar persona Hélio (cordial, técnico, direto)
- [ ] Estar em pt-BR
- [ ] Oferecer próximos passos claros
- [ ] Evitar jargões desnecessários
- [ ] Incluir feedback de ações

## Referências

- [Medusa.js Docs - Layouts](https://docs.medusajs.com/)
- [Next.js App Router - Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [YSH AGENTS.md - Hélio Persona](../AGENTS.md#1-contexto-global--defaults)
- [UX README](./README.md)

---

**Última atualização:** 2025-10-13  
**Responsável:** UX Strategist + Frontend Team
