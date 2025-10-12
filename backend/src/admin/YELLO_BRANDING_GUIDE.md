# Personalização de Branding - Yello Solar Hub Admin

## 📋 Resumo

Este documento descreve as personalizações de branding implementadas no painel administrativo Medusa.js para **Yello Solar Hub**, respeitando as limitações do framework.

---

## 🚨 Limitações do Medusa Admin (Documentado Oficialmente)

Segundo a [documentação oficial do Medusa.js](https://docs.medusajs.com/learn/fundamentals/admin):

> **"You can't customize the login page, the authentication flow, or change the Medusa logo used in the admin dashboard."**

### O que NÃO pode ser customizado

- ❌ **Logo principal** do dashboard (permanece Medusa)
- ❌ **Página de login** e fluxo de autenticação
- ❌ **Layout principal** do dashboard
- ❌ **Sidebar** e navegação core
- ❌ **Header principal** do admin

### O que PODE ser customizado

- ✅ **Widgets personalizados** em páginas existentes
- ✅ **Novas páginas** (UI Routes)
- ✅ **Conteúdo de widgets** existentes
- ✅ **Branding dentro de widgets e páginas custom**

---

## 🎨 Solução Implementada

Como não podemos alterar o logo principal, implementamos **branding contextual** em widgets e páginas personalizadas.

### 1. Assets do Logo

**Localização:** `backend/src/admin/assets/`

```tsx
assets/
├── yello-black_logomark.svg  # Logo para temas claros
└── yello-white_logomark.svg  # Logo para temas escuros
```

**Origem:** Copiados de `storefront/public/`

### 2. Componente de Branding Reutilizável

**Arquivo:** `backend/src/admin/components/yello-branding.tsx`

```tsx
import { YelloBranding } from "../components/yello-branding"

// Uso básico
<YelloBranding size="medium" variant="black" showText={true} />

// Badge compacto
<YelloBrandingBadge variant="black" />
```

**Props:**

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `size` | `"small"` \| `"medium"` \| `"large"` | `"medium"` | Tamanho do logo |
| `variant` | `"black"` \| `"white"` | `"black"` | Cor do logo |
| `showText` | `boolean` | `true` | Mostrar texto ao lado |

### 3. Widget de Boas-Vindas

**Arquivo:** `backend/src/admin/widgets/yello-dashboard-welcome.tsx`

**Funcionalidade:**

- Exibe logo e branding da Yello Solar Hub
- Cards de estatísticas rápidas:
  - ☀️ Catálogo Solar: 1.123 produtos
  - ⚡ Cotações B2B: Ativas
  - 📈 Modo: Produção (Medusa 2.10.3)

**Injeção:**

- **Zona:** `order.list.before`
- **Página:** Dashboard principal (`/`)
- **Posição:** Antes da lista de pedidos

**Configuração (padrão Medusa):**

```tsx
export const config = defineWidgetConfig({
  zone: "order.list.before",
})
```

**Zonas disponíveis:** [Lista completa na documentação](https://docs.medusajs.com/learn/fundamentals/admin/widgets)

---

## 🛠️ Como Usar em Novos Widgets

### Adicionar branding em widget existente

```tsx
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container } from "@medusajs/ui"
import { YelloBranding } from "../components/yello-branding"

const MyCustomWidget = () => {
  return (
    <Container>
      {/* Header com branding */}
      <YelloBranding size="small" variant="black" showText={false} />
      
      {/* Seu conteúdo aqui */}
      <div>...</div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.before",
})

export default MyCustomWidget
```

### Adicionar branding em UI Route (página custom)

```tsx
import { Container } from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { YelloBrandingBadge } from "../../components/yello-branding"

const CustomPage = () => {
  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <h1>Minha Página Personalizada</h1>
        <YelloBrandingBadge variant="black" />
      </div>
      
      {/* Conteúdo da página */}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Minha Página",
  icon: () => "🔧",
})

export default CustomPage
```

---

## 📁 Estrutura de Arquivos

```tsx
backend/src/admin/
├── assets/
│   ├── yello-black_logomark.svg
│   └── yello-white_logomark.svg
├── components/
│   └── yello-branding.tsx           # Componente reutilizável
├── widgets/
│   ├── yello-dashboard-welcome.tsx  # Widget de boas-vindas
│   ├── solar-inventory-dashboard.tsx
│   ├── solar-kit-composition.tsx
│   └── ...outros widgets
├── types/
│   └── assets.d.ts                  # Declarações TypeScript para SVG
└── README.md
```

---

## 🎯 Recomendações de Uso

### 1. **Dashboard Principal**

✅ Widget de boas-vindas já implementado (`yello-dashboard-welcome.tsx`)

### 2. **Páginas de Produtos**

Adicionar badge Yello em widgets de produtos solares:

```tsx
// Exemplo: widget na página de produto
export const config = defineWidgetConfig({
  zone: "product.details.before",
})
```

### 3. **Páginas Custom**

Para páginas completamente personalizadas (ex: relatórios solares), usar `YelloBranding` no header:

```tsx
<YelloBranding size="large" variant="black" showText={true} />
```

### 4. **Badges em Cards**

Para cards informativos, usar `YelloBrandingBadge`:

```tsx
<YelloBrandingBadge variant="black" />
```

---

## 🔍 Referências Oficiais

1. **Admin Overview:** <https://docs.medusajs.com/learn/fundamentals/admin>
2. **Widgets:** <https://docs.medusajs.com/learn/fundamentals/admin/widgets>
3. **UI Routes:** <https://docs.medusajs.com/learn/fundamentals/admin/ui-routes>
4. **Medusa UI Components:** <https://docs.medusajs.com/ui>

---

## ⚠️ Notas Importantes

1. **Logo Principal:** O logo Medusa no header principal **não pode ser alterado** via customizações. Para branding completo, considere:
   - Construir admin custom usando Admin API REST
   - Aguardar futuras versões do Medusa que suportem logo customizável

2. **TypeScript:** Declarações de tipos SVG estão em `types/assets.d.ts` para evitar erros de compilação

3. **Performance:** SVGs são importados estaticamente via Vite, otimizando bundle size

4. **Temas:** Componentes suportam variantes `black` e `white` para adaptar a diferentes temas

---

## 🚀 Próximos Passos

- [ ] Adicionar branding em páginas de cotações B2B (quando rotas forem ativadas)
- [ ] Criar widget de métricas solares com logo Yello
- [ ] Documentar padrões de uso em páginas custom futuras
- [ ] Considerar adicionar logo em email templates (não afeta admin, mas mantém consistência)

---

**Criado em:** 2025-10-12  
**Versão Medusa:** 2.10.3  
**Status:** ✅ Implementado e documentado segundo padrões oficiais
