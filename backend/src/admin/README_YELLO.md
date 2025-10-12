# Yello Solar Hub - Admin Customizations

Painel administrativo personalizado para **Yello Solar Hub** com widgets especializados para gestão de equipamentos solares, cotações B2B, e branding corporativo.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Branding Personalizado](#branding-personalizado)
- [Widgets Solares](#widgets-solares)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Como Adicionar Novos Widgets](#como-adicionar-novos-widgets)
- [Documentação Oficial](#documentação-oficial)

---

## 🎨 Visão Geral

Customizações seguem os padrões oficiais do Medusa.js v2.10.3:

- ✅ **Widgets personalizados** em páginas existentes
- ✅ **UI Routes** (páginas custom) - *em desenvolvimento*
- ✅ **Branding** da Yello Solar Hub
- ✅ **Componentes reutilizáveis** com Medusa UI

**Limitação:** Não é possível alterar o logo principal do Medusa no header. [Saiba mais](./YELLO_BRANDING_GUIDE.md)

---

## 🌟 Branding Personalizado

### Logos Integrados

```
assets/
├── yello-black_logomark.svg  # Tema claro
└── yello-white_logomark.svg  # Tema escuro
```

### Componentes Disponíveis

```tsx
import { YelloBranding, YelloBrandingBadge } from "./components/yello-branding"

// Branding completo
<YelloBranding size="medium" variant="black" showText={true} />

// Badge compacto
<YelloBrandingBadge variant="black" />
```

**Documentação completa:** [YELLO_BRANDING_GUIDE.md](./YELLO_BRANDING_GUIDE.md)

---

## ☀️ Widgets Solares

### 1. Dashboard Welcome Widget

**Arquivo:** `widgets/yello-dashboard-welcome.tsx`

**Exibe:**
- Logo Yello Solar Hub
- Estatísticas rápidas (catálogo, cotações, modo)

**Localização:** Dashboard principal (antes da lista de pedidos)

### 2. Solar Inventory Dashboard

**Arquivo:** `widgets/solar-inventory-dashboard.tsx`

**Funcionalidades:**
- Métricas de inventário solar
- Produtos sem preço
- Distribuição por categoria
- Alertas de estoque

### 3. Solar Kit Composition

**Arquivo:** `widgets/solar-kit-composition.tsx`

**Exibe:**
- Composição de kits solares
- Componentes (painéis, inversores, etc)
- Fabricantes e modelos

**Documentação detalhada:** [YELLO_SOLAR_HUB_ADMIN_GUIDE.md](./YELLO_SOLAR_HUB_ADMIN_GUIDE.md)

---

## 📁 Estrutura de Arquivos

```
src/admin/
├── assets/                         # Logos e imagens
│   ├── yello-black_logomark.svg
│   └── yello-white_logomark.svg
├── components/                     # Componentes reutilizáveis
│   └── yello-branding.tsx
├── widgets/                        # Widgets injetados em páginas
│   ├── yello-dashboard-welcome.tsx
│   ├── solar-inventory-dashboard.tsx
│   └── solar-kit-composition.tsx
├── routes.disabled/                # UI Routes (em desenvolvimento)
│   ├── companies/
│   └── quotes/
├── types/                          # Declarações TypeScript
│   └── assets.d.ts
├── hooks/                          # Custom hooks
├── lib/                            # Utilidades
├── utils/                          # Helpers
├── README_YELLO.md                 # Este arquivo
├── YELLO_BRANDING_GUIDE.md         # Guia de branding
├── YELLO_SOLAR_HUB_ADMIN_GUIDE.md  # Guia de widgets solares
└── BRANDING_IMPLEMENTATION_SUMMARY.md  # Resumo de implementação
```

---

## 🛠️ Como Adicionar Novos Widgets

### Passo 1: Criar o Widget

Crie um arquivo em `widgets/meu-widget.tsx`:

```tsx
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"
import { YelloBranding } from "../components/yello-branding"

const MeuWidget = () => {
  return (
    <Container>
      <YelloBranding size="small" variant="black" showText={false} />
      <Heading level="h2">Meu Widget Personalizado</Heading>
      {/* Seu conteúdo aqui */}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.before", // Escolha a zona adequada
})

export default MeuWidget
```

### Passo 2: Escolher a Zona de Injeção

**Zonas comuns:**

| Zona | Localização |
|------|-------------|
| `order.list.before` | Dashboard principal (antes de pedidos) |
| `product.details.before` | Página de produto (antes dos detalhes) |
| `product.details.after` | Página de produto (depois dos detalhes) |
| `customer.details.before` | Página de cliente (antes dos detalhes) |

**Lista completa:** [Medusa Admin Widgets](https://docs.medusajs.com/learn/fundamentals/admin/widgets)

### Passo 3: Usar API Routes

Para buscar dados, use `fetch` com as rotas da sua API:

```tsx
import { useEffect, useState } from "react"

const MeuWidget = () => {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch("/admin/minha-rota")
      .then(res => res.json())
      .then(setData)
  }, [])

  return <div>{/* Renderizar data */}</div>
}
```

---

## 📚 Documentação Oficial

### Medusa.js

- **Admin Overview:** <https://docs.medusajs.com/learn/fundamentals/admin>
- **Widgets:** <https://docs.medusajs.com/learn/fundamentals/admin/widgets>
- **UI Routes:** <https://docs.medusajs.com/learn/fundamentals/admin/ui-routes>
- **Medusa UI:** <https://docs.medusajs.com/ui>

### Yello Solar Hub

- **Guia de Branding:** [YELLO_BRANDING_GUIDE.md](./YELLO_BRANDING_GUIDE.md)
- **Guia de Widgets Solares:** [YELLO_SOLAR_HUB_ADMIN_GUIDE.md](./YELLO_SOLAR_HUB_ADMIN_GUIDE.md)
- **Resumo de Implementação:** [BRANDING_IMPLEMENTATION_SUMMARY.md](./BRANDING_IMPLEMENTATION_SUMMARY.md)

---

## 🚀 Desenvolvimento

### Instalar Dependências

```bash
cd backend
npm install
```

### Iniciar em Modo Dev

```bash
npm run dev
```

**Admin acessível em:** `http://localhost:9000/app`

### Build para Produção

```bash
npm run build
```

---

## ✅ Status da Implementação

| Funcionalidade | Status | Arquivo |
|----------------|--------|---------|
| Logos Yello | ✅ Implementado | `assets/yello-*_logomark.svg` |
| Componente de Branding | ✅ Implementado | `components/yello-branding.tsx` |
| Widget Dashboard | ✅ Implementado | `widgets/yello-dashboard-welcome.tsx` |
| Widget Inventário Solar | ✅ Implementado | `widgets/solar-inventory-dashboard.tsx` |
| Widget Composição Kits | ✅ Implementado | `widgets/solar-kit-composition.tsx` |
| UI Routes Cotações | 🚧 Desabilitado | `routes.disabled/quotes/` |
| UI Routes Empresas | 🚧 Desabilitado | `routes.disabled/companies/` |

---

## 🎓 Exemplos de Uso

### Exemplo 1: Widget Simples

```tsx
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container } from "@medusajs/ui"

const SimpleWidget = () => {
  return <Container>Hello from Yello Solar Hub!</Container>
}

export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default SimpleWidget
```

### Exemplo 2: Widget com API

```tsx
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Table } from "@medusajs/ui"
import { useEffect, useState } from "react"

const DataWidget = () => {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetch("/admin/products?limit=5")
      .then(res => res.json())
      .then(data => setProducts(data.products))
  }, [])

  return (
    <Container>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Produto</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {products.map(p => (
            <Table.Row key={p.id}>
              <Table.Cell>{p.title}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default DataWidget
```

---

## 🔗 Links Úteis

- **Repositório:** [ysh-b2b](https://github.com/own-boldsbrain/ysh-b2b)
- **Medusa Docs:** <https://docs.medusajs.com>
- **Medusa UI:** <https://docs.medusajs.com/ui>

---

**Versão:** 1.0.0  
**Última Atualização:** 2025-10-12  
**Mantenedores:** Equipe Yello Solar Hub  
**Licença:** MIT
