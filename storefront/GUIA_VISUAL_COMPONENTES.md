# 🎨 Componentes SKU e Model - Guia Visual Rápido

## 📸 Componentes Criados

### 1. ProductSKU

```
┌─────────────────────────────────────────────────────┐
│ SKU: [NEOSOLAR-PANEL-CANADIAN-CS7L550MS] [📋 Copiar]│
│      └─ monospace, bg-gray-100  └─ ícone SVG       │
└─────────────────────────────────────────────────────┘
```

**Tamanhos:**

- `sm` - 12px (mobile)
- `md` - 14px (tablet/desktop) ⭐ default
- `lg` - 16px (wide screens)

**Features:**

- ✅ Copiar para clipboard
- ✅ Feedback visual (2 segundos)
- ✅ SKU interno opcional
- ✅ Acessibilidade completa

---

### 2. ProductModel

```
┌────────────────────────────────────┐
│ [Canadian Solar] › [CS7L-550MS]    │
│  └─ gray-700        └─ gray-900    │
│                                    │
│ Ou com série:                      │
│ [Canadian Solar] › [CS7L-550MS] • [HiKu7] │
└────────────────────────────────────┘
```

**Tamanhos:**

- `sm` - texto-xs (cards)
- `md` - texto-sm (lista) ⭐ default
- `lg` - texto-base (detalhes)

**Features:**

- ✅ Hierarquia visual clara
- ✅ Link para busca (opcional)
- ✅ Suporte a série/família

---

### 3. CategoryIcon

```
┌─────────────────────────────────────────────┐
│     Ícones por Categoria (12 tipos)         │
├─────────────────────────────────────────────┤
│ 📦 Kits         🏗️ Estruturas              │
│ ☀️ Painéis      🔌 Cabos                   │
│ ⚡ Inversores   🎛️ Controladores           │
│ 🔋 Baterias    🚗 Carregadores EV          │
│ 📊 Stringboxes 🔧 Acessórios               │
│ 🏛️ Postes      📋 Outros                   │
└─────────────────────────────────────────────┘
```

**Tamanhos:**

- `sm` - 24px (badges)
- `md` - 32px (cards) ⭐ default
- `lg` - 48px (headers)
- `xl` - 64px (hero)

**Modos:**

- Simple: Apenas ícone
- Label: Ícone + texto
- Badge: Badge completo

---

## 🎯 Onde Estão Integrados

### ProductCard (Catálogo)

```
┌─────────────────────────────────────┐
│ [Imagem do Produto]      [☀️ Icon]  │
│                                     │
│ Canadian Solar › CS7L-550MS         │ ← ProductModel
│                                     │
│ Módulo Fotovoltaico 550W            │
│                                     │
│ SKU: NEOSOLAR-PANEL-...  [📋]       │ ← ProductSKU
│                                     │
│ 550W • 21.5% η                      │
│                                     │
│ R$ 1.247,00          [Ver Detalhes] │
└─────────────────────────────────────┘
```

---

### ProductInfo (Página de Detalhes)

```
┌───────────────────────────────────────────────────┐
│ Product Identifiers                               │
├───────────────────────────────────────────────────┤
│                                                   │
│ Fabricante e Modelo                               │
│ Canadian Solar › CS7L-550MS • HiKu7 [🔗 link]    │
│                                                   │
│ Código SKU                                        │
│ SKU: NEOSOLAR-PANEL-CANADIAN-CS7L550MS [📋]      │
│                                                   │
│ ID do Produto                                     │
│ prod_01J9ZXYZ...                                  │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

## 💻 Código de Exemplo

### Uso Básico

```tsx
// ProductCard.tsx
import { ProductSKU, ProductModel } from '@/modules/catalog/components/product-identifiers'
import { CategoryIcon } from '@/modules/catalog/components/CategoryIcon'

<div className="product-card">
  {/* Ícone de categoria */}
  <CategoryIcon category="panels" size="md" />
  
  {/* Fabricante e Modelo */}
  <ProductModel 
    manufacturer="Canadian Solar"
    model="CS7L-550MS"
    size="sm"
  />
  
  {/* Nome do produto */}
  <h3>{product.name}</h3>
  
  {/* SKU */}
  <ProductSKU 
    sku={product.sku}
    size="sm"
  />
</div>
```

---

### Uso Avançado

```tsx
// ProductInfo.tsx
<div className="product-detail-identifiers">
  {/* Grid de 3 colunas em desktop */}
  
  <div className="identifier-group">
    <label>Fabricante e Modelo</label>
    <ProductModel 
      manufacturer={manufacturer}
      model={model}
      series={series}
      link={true}        // ← Com link de busca
      size="md"
    />
  </div>
  
  <div className="identifier-group">
    <label>Código SKU</label>
    <ProductSKU 
      sku={sku}
      internal_sku="YSH-001234"  // ← SKU interno
      size="md"
    />
  </div>
  
  <div className="identifier-group">
    <label>ID do Produto</label>
    <code>{product.id}</code>
  </div>
</div>
```

---

## 📱 Comportamento Responsivo

### Mobile (< 768px)

```
┌──────────────────┐
│ [Ícone] ☀️       │
│                  │
│ Canadian Solar   │
│ › CS7L-550MS     │
│                  │
│ Módulo 550W      │
│                  │
│ SKU: NEO...      │
│ [📋]             │
│                  │
│ R$ 1.247,00      │
└──────────────────┘
```

### Tablet (768px - 1023px)

```
┌──────────────────────────────┐
│ [Imagem]           [☀️ Icon]  │
│                               │
│ Canadian Solar › CS7L-550MS   │
│                               │
│ Módulo Fotovoltaico 550W      │
│                               │
│ SKU: NEOSOLAR-PANEL-... [📋] │
│                               │
│ R$ 1.247,00    [Ver Detalhes] │
└──────────────────────────────┘
```

### Desktop (> 1024px)

```
┌─────────────────────────────────────────┐
│ [Imagem Grande]           [☀️ Ícone]    │
│                                         │
│ Canadian Solar › CS7L-550MS • HiKu7     │
│                                         │
│ Módulo Fotovoltaico Canadian 550W       │
│                                         │
│ SKU: NEOSOLAR-PANEL-CANADIAN-CS7L550MS  │
│      [📋 Copiar SKU]                    │
│                                         │
│ 550W • 21.5% η • Tier 1                 │
│                                         │
│ R$ 1.247,00              [Ver Detalhes] │
└─────────────────────────────────────────┘
```

---

## 🎨 Paleta de Cores por Categoria

| Categoria | Cor Principal | Background | Uso |
|-----------|---------------|------------|-----|
| Kits | Purple-600 | Purple-100 | Badge, ícone |
| Painéis | Yellow-600 | Yellow-100 | Badge, ícone |
| Inversores | Blue-600 | Blue-100 | Badge, ícone |
| Baterias | Green-600 | Green-100 | Badge, ícone |
| Estruturas | Gray-600 | Gray-100 | Badge, ícone |
| Cabos | Orange-600 | Orange-100 | Badge, ícone |

*Cores consistentes com o Design System YSH*

---

## ✅ Checklist Visual

### ProductSKU

- [x] Monospace font
- [x] Background gray-100
- [x] Ícone de copiar visível
- [x] Feedback de "copiado" (verde)
- [x] SKU interno em cinza claro

### ProductModel

- [x] Fabricante em gray-700
- [x] Modelo em gray-900 (bold)
- [x] Separador › visível
- [x] Série em gray-600 (menor)
- [x] Hover effect se link

### CategoryIcon

- [x] Ícone centralizado
- [x] Background colorido
- [x] Sombra sutil
- [x] Tooltip ao hover
- [x] Responsive sizes

---

## 🚀 Teste Agora

```bash
# 1. Página de teste visual
http://localhost:3000/test-components

# 2. Catálogo de produtos
http://localhost:3000/br/store

# 3. Qualquer produto individual
http://localhost:3000/br/produtos/panels/[id]
```

---

## 📊 Estrutura de Arquivos

```
storefront/
├── src/
│   ├── app/
│   │   ├── [countryCode]/(main)/
│   │   │   └── layout.tsx              ← CSS importado aqui
│   │   └── test-components/
│   │       └── page.tsx                ← Página de testes
│   ├── modules/
│   │   ├── catalog/
│   │   │   └── components/
│   │   │       ├── ProductCard.tsx      ← Usa componentes
│   │   │       ├── CategoryIcon.tsx     ← Novo componente
│   │   │       └── product-identifiers/
│   │   │           ├── ProductSKU.tsx   ← Novo componente
│   │   │           ├── ProductModel.tsx ← Novo componente
│   │   │           ├── index.ts
│   │   │           └── README.md
│   │   └── products/
│   │       └── templates/
│   │           └── product-info/
│   │               └── index.tsx        ← Usa componentes
│   └── styles/
│       ├── globals.css
│       └── product-identifiers.css      ← Novos estilos
├── scripts/
│   └── create-sku-model-components.py   ← Script de criação
├── QUICK_START_COMPONENTES.md           ← Guia completo
├── PERSONALIZACAO_SKU_MODEL.md          ← Documentação
├── IMPLEMENTACAO_COMPLETA.md            ← Este arquivo
└── GUIA_VISUAL_COMPONENTES.md           ← Guia visual
```

---

## 🎯 Próximas Ações Recomendadas

1. ✅ **Testar visualmente** - `http://localhost:3000/test-components`
2. ✅ **Ver no catálogo** - `http://localhost:3000/br/store`
3. ⚠️ **Normalizar backend** - Adicionar SKUs padronizados
4. 🔜 **Implementar busca** - Endpoint de busca por SKU
5. 🔜 **Analytics** - Tracking de eventos

---

*YSH Solar Hub - Componentes de Identificação v1.0.0*
