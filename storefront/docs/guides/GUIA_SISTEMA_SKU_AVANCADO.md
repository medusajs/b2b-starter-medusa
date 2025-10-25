# 🚀 Guia Completo: Sistema Avançado de SKU

Este documento descreve os 12 recursos avançados implementados para gerenciamento de SKUs no YSH Solar Hub.

## 📦 Índice

1. [Script de Normalização de SKUs](#1-script-de-normalização-de-skus)
2. [Endpoint de Busca por SKU](#2-endpoint-de-busca-por-sku)
3. [Filtro por Manufacturer](#3-filtro-por-manufacturer)
4. [Autocomplete de SKU](#4-autocomplete-de-sku)
5. [Sistema de Analytics](#5-sistema-de-analytics)
6. [QR Code para SKU](#6-qr-code-para-sku)
7. [Histórico de SKUs](#7-histórico-de-skus)
8. [Comparação de Produtos](#8-comparação-de-produtos)

---

## 1. Script de Normalização de SKUs

### 📍 Localização

```
ysh-erp/scripts/normalize_catalog_skus.py
```

### 🎯 Objetivo

Padronizar SKUs de todos os 1,123 produtos no formato:

```
[DISTRIBUTOR]-[CATEGORY]-[MANUFACTURER]-[MODEL]
```

### 📋 Exemplo

```
NEOSOLAR-PANEL-CANADIAN-CS7L550MS
TATICO-INVERTER-GROWATT-MIN5000TL
YSH-BATTERY-BYD-HVMB0320
```

### 🛠️ Funcionalidades

#### `clean_for_sku(text)`

Remove acentos, caracteres especiais e converte para maiúsculas:

```python
"Painel Fotovoltaico 550W" → "PAINEL FOTOVOLTAICO 550W"
```

#### `extract_distributor(product)`

Mapeia origem para distribuidor:

```python
{
    "neosolar": "NEOSOLAR",
    "tatico": "TATICO",
    "ysh": "YSH",
    "default": "YSH"
}
```

#### `extract_manufacturer(product)`

Limpa nome do fabricante (máx 15 caracteres):

```python
"Canadian Solar Inc." → "CANADIAN"
```

#### `extract_model(product)`

Extrai código do modelo (máx 20 caracteres):

```python
"CS7L-550MS 550W Mono PERC" → "CS7L550MS"
```

#### `generate_sku(product, category)`

Gera SKU padronizado:

```python
sku = f"{distributor}-{category}-{manufacturer}-{model}"[:60]
```

#### `check_sku_uniqueness(products)`

Detecta e resolve duplicatas adicionando sufixo numérico:

```python
# Se SKU duplicado:
"NEOSOLAR-PANEL-CANADIAN-CS7L550MS"
"NEOSOLAR-PANEL-CANADIAN-CS7L550MS-2"
"NEOSOLAR-PANEL-CANADIAN-CS7L550MS-3"
```

### 🚀 Como Executar

```powershell
# Navegar para o diretório
cd c:\Users\fjuni\ysh_medusa\ysh-erp

# Executar script
python scripts/normalize_catalog_skus.py
```

### 📁 Arquivos Processados

```
ysh-erp/data/catalog/
├── kits.json
├── panels.json
├── inverters.json
├── batteries.json
├── structures.json
├── cables.json
├── controllers.json
├── ev_chargers.json
├── stringboxes.json
├── accessories.json
├── posts.json
└── others.json
```

### 💾 Backups

O script cria backups automáticos antes de modificar:

```
ysh-erp/backups_sku_normalization/
├── kits_backup_20240115_143022.json
├── panels_backup_20240115_143022.json
└── ...
```

### ⚠️ Importante

- ✅ Cria backups antes de modificar
- ✅ Detecta e resolve duplicatas
- ✅ Valida SKU máximo 60 caracteres
- ✅ Preserva dados originais em metadata

---

## 2. Endpoint de Busca por SKU

### 📍 Localização

```
backend/src/api/store/products/by-sku/[sku]/route.ts
```

### 🎯 Endpoints

#### GET `/api/products/by-sku/:sku`

Busca exata por SKU:

```bash
curl http://localhost:9000/api/products/by-sku/NEOSOLAR-PANEL-CANADIAN-CS7L550MS
```

**Resposta:**

```json
{
  "product": {
    "id": "prod_123",
    "title": "Painel Canadian Solar 550W",
    "sku": "NEOSOLAR-PANEL-CANADIAN-CS7L550MS",
    "metadata": {
      "manufacturer": "Canadian Solar",
      "model": "CS7L-550MS"
    }
  },
  "variant": null,
  "matched_by": "product_sku"
}
```

#### GET `/api/products/search-sku?q=`

Busca fuzzy com resultados parciais:

```bash
curl http://localhost:9000/api/products/search-sku?q=CANADIAN
```

**Resposta:**

```json
{
  "products": [
    {
      "id": "prod_123",
      "title": "Painel Canadian Solar 550W",
      "sku": "NEOSOLAR-PANEL-CANADIAN-CS7L550MS"
    },
    {
      "id": "prod_456",
      "title": "Painel Canadian Solar 450W",
      "sku": "NEOSOLAR-PANEL-CANADIAN-CS6R450MS"
    }
  ],
  "count": 2
}
```

### 🔍 Estratégia de Busca

1. **product.sku** - SKU direto do produto
2. **variant.sku** - SKU de variante específica
3. **product.metadata.sku** - SKU em metadata
4. **Fuzzy search** - Busca parcial com `includes()`

### 🛠️ Integração no Frontend

```typescript
// Busca exata
const product = await fetch(`/api/products/by-sku/${sku}`).then(r => r.json())

// Busca fuzzy
const results = await fetch(`/api/products/search-sku?q=${query}`).then(r => r.json())
```

---

## 3. Filtro por Manufacturer

### 📍 Localização

```
storefront/src/modules/catalog/components/ManufacturerFilter.tsx
```

### 🎯 Features

✅ Dropdown com lista de fabricantes  
✅ Busca interna no dropdown  
✅ Contador de fabricantes disponíveis  
✅ Estado visual para selecionado  
✅ Opção "Todos os fabricantes"  

### 💻 Como Usar

```tsx
import { ManufacturerFilter } from '@modules/catalog/components/ManufacturerFilter'

export default function CatalogPage() {
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null)
  
  // Extrair fabricantes únicos dos produtos
  const manufacturers = Array.from(
    new Set(products.map(p => p.metadata?.manufacturer).filter(Boolean))
  )

  return (
    <ManufacturerFilter
      manufacturers={manufacturers}
      selected={selectedManufacturer}
      onChange={setSelectedManufacturer}
      className="w-full md:w-64"
    />
  )
}
```

### 🎨 Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `manufacturers` | `string[]` | Lista de fabricantes disponíveis |
| `selected` | `string \| null` | Fabricante atualmente selecionado |
| `onChange` | `(manufacturer: string \| null) => void` | Callback ao selecionar |
| `className?` | `string` | Classes CSS adicionais |

### 🖼️ Visual

```
┌─────────────────────────────────────┐
│ 🏭 Todos os fabricantes      ▼     │
└─────────────────────────────────────┘
         ↓ (clique)
┌─────────────────────────────────────┐
│ 🔍 Buscar fabricante...             │
├─────────────────────────────────────┤
│ ✓ Todos os fabricantes              │
│   Canadian Solar                    │
│   Growatt                           │
│   BYD                               │
│   JA Solar                          │
│   ...                               │
├─────────────────────────────────────┤
│ 15 fabricantes disponíveis          │
└─────────────────────────────────────┘
```

---

## 4. Autocomplete de SKU

### 📍 Localização

```
storefront/src/components/SKUAutocomplete.tsx
```

### 🎯 Features

✅ Sugestões em tempo real  
✅ Debouncing 300ms  
✅ Navegação por teclado (↑/↓/Enter/Esc)  
✅ Preview com imagem, preço e categoria  
✅ Loading state  
✅ Mensagem "Nenhum resultado"  

### 💻 Como Usar

```tsx
import { SKUAutocomplete } from '@/components/SKUAutocomplete'

export default function SearchBar() {
  return (
    <SKUAutocomplete
      placeholder="Buscar por SKU..."
      className="w-full"
      onSelect={(product) => {
        console.log('Produto selecionado:', product)
        // Navega automaticamente ou use callback customizado
      }}
    />
  )
}
```

### 🎨 Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `placeholder?` | `string` | Texto do placeholder (padrão: "Buscar por SKU...") |
| `className?` | `string` | Classes CSS adicionais |
| `onSelect?` | `(product: ProductSuggestion) => void` | Callback ao selecionar produto |

### 🖼️ Visual

```
┌─────────────────────────────────────┐
│ Buscar por SKU...            🔍     │
└─────────────────────────────────────┘
         ↓ (digita "CANADIAN")
┌─────────────────────────────────────┐
│ CANADIAN                      🔄     │ ← Loading
└─────────────────────────────────────┘
         ↓ (resultados)
┌─────────────────────────────────────┐
│ CANADIAN                      🔍     │
├─────────────────────────────────────┤
│ [IMG] Painel Canadian 550W   R$ 850 │
│       SKU: NEOSOLAR-PANEL-CANADIAN... │
│       □ panels                      │
├─────────────────────────────────────┤
│ [IMG] Painel Canadian 450W   R$ 720 │
│       SKU: NEOSOLAR-PANEL-CANADIAN... │
│       □ panels                      │
└─────────────────────────────────────┘
```

### ⌨️ Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| `↓` | Próxima sugestão |
| `↑` | Sugestão anterior |
| `Enter` | Selecionar sugestão |
| `Esc` | Fechar dropdown |

---

## 5. Sistema de Analytics

### 📍 Localização

```
storefront/src/lib/sku-analytics.tsx
```

### 🎯 Eventos Rastreados

#### 1. Copy SKU

```typescript
trackSKUCopy(sku, productId, category)
```

**Quando:** Usuário clica no botão copiar SKU  
**Dados enviados:**

```json
{
  "event": "sku_copied",
  "sku": "NEOSOLAR-PANEL-CANADIAN-CS7L550MS",
  "product_id": "prod_123",
  "category": "panels",
  "timestamp": 1705334400000
}
```

#### 2. Model Link Click

```typescript
trackModelLinkClick(manufacturer, model)
```

**Quando:** Usuário clica no link de busca por modelo  
**Dados enviados:**

```json
{
  "event": "product_model_clicked",
  "manufacturer": "Canadian Solar",
  "model": "CS7L-550MS",
  "timestamp": 1705334400000
}
```

#### 3. Category View

```typescript
trackCategoryView(category)
```

**Quando:** Usuário navega para página de categoria  
**Dados enviados:**

```json
{
  "event": "category_viewed",
  "category": "panels",
  "timestamp": 1705334400000
}
```

### 🔗 Integrações

#### PostHog

```typescript
if (window.posthog) {
  window.posthog.capture('sku_copied', {
    sku, productId, category
  })
}
```

#### Google Analytics

```typescript
if (window.gtag) {
  window.gtag('event', 'sku_copied', {
    event_category: 'Product',
    event_label: sku,
    value: productId
  })
}
```

### 💻 Como Usar

```tsx
import { trackSKUCopy, trackModelLinkClick, trackCategoryView } from '@/lib/sku-analytics'

// Em ProductSKU
const handleCopy = () => {
  // ... código de cópia
  trackSKUCopy(sku, productId, category)
}

// Em ProductModel
const handleClick = () => {
  trackModelLinkClick(manufacturer, model)
}

// Em CategoryPage
useEffect(() => {
  trackCategoryView(category)
}, [category])
```

---

## 6. QR Code para SKU

### 📍 Localização

```
storefront/src/components/SKUQRCode.tsx
```

### 🎯 Components

#### 1. `<SKUQRCode />`

Modal completo com QR code:

```tsx
import { SKUQRCode } from '@/components/SKUQRCode'

<SKUQRCode
  sku="NEOSOLAR-PANEL-CANADIAN-CS7L550MS"
  productName="Painel Canadian Solar 550W"
  size={200}
/>
```

#### 2. `<SKUQRCodeButton />`

Botão icon-only compacto:

```tsx
import { SKUQRCodeButton } from '@/components/SKUQRCode'

<SKUQRCodeButton
  sku="NEOSOLAR-PANEL-CANADIAN-CS7L550MS"
  size={150}
/>
```

### 🎨 Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `sku` | `string` | SKU do produto |
| `productName?` | `string` | Nome do produto (para compartilhamento) |
| `size?` | `number` | Tamanho do QR em pixels (padrão: 200) |
| `className?` | `string` | Classes CSS adicionais |

### 🖼️ Visual

```
┌─────────────────────────────────────┐
│            QR Code do SKU     ✕     │
├─────────────────────────────────────┤
│                                     │
│          ┌─────────────┐            │
│          │  ▓▓  ▓▓  ▓▓ │            │
│          │  ▓  ▓▓▓  ▓  │            │
│          │  ▓▓  ▓▓  ▓▓ │            │
│          └─────────────┘            │
│                                     │
│  NEOSOLAR-PANEL-CANADIAN-CS7L550MS  │
│                                     │
│     📥 Download     📤 Compartilhar  │
│                                     │
└─────────────────────────────────────┘
```

### 📱 Features

✅ **Geração via API:** `https://api.qrserver.com/v1/create-qr-code/`  
✅ **Download PNG:** Nome do arquivo = SKU  
✅ **Web Share API:** Compartilha QR + texto via apps nativos  
✅ **Mobile detection:** Mostra apenas em dispositivos móveis  
✅ **Responsive modal:** Overlay com backdrop blur  

### 🛠️ Integração

Já integrado em `ProductSKU`:

```tsx
<ProductSKU 
  sku="NEOSOLAR-PANEL-CANADIAN-CS7L550MS"
  productId="prod_123"
  productName="Painel Canadian Solar 550W"
  showQRCode={true}  // ← Habilita QR code
/>
```

---

## 7. Histórico de SKUs

### 📍 Localização

```
storefront/src/lib/sku-analytics.tsx
```

### 🎯 Hook: `useSKUHistory()`

Gerencia histórico de SKUs copiados em localStorage.

### 💻 Como Usar

```tsx
import { useSKUHistory } from '@/lib/sku-analytics'

export default function MyComponent() {
  const { history, addToHistory, clearHistory, removeFromHistory } = useSKUHistory()

  const handleCopy = (sku: string) => {
    // Adiciona ao histórico
    addToHistory({
      sku,
      timestamp: Date.now(),
      product: {
        id: productId,
        name: productName,
        category: category,
      }
    })
  }

  return (
    <div>
      <h3>Últimos SKUs copiados:</h3>
      <ul>
        {history.map(item => (
          <li key={item.timestamp}>
            {item.sku} - {new Date(item.timestamp).toLocaleString()}
            <button onClick={() => removeFromHistory(item.timestamp)}>
              Remover
            </button>
          </li>
        ))}
      </ul>
      <button onClick={clearHistory}>Limpar tudo</button>
    </div>
  )
}
```

### 🎨 Component: `<SKUHistoryDropdown />`

Dropdown pronto para uso:

```tsx
import { SKUHistoryDropdown } from '@/lib/sku-analytics'

<SKUHistoryDropdown />
```

### 🖼️ Visual

```
┌─────────────────────────────────────┐
│ 🕒 Histórico de SKUs          ▼     │
└─────────────────────────────────────┘
         ↓ (clique)
┌─────────────────────────────────────┐
│ 📋 Últimos 10 SKUs copiados         │
├─────────────────────────────────────┤
│ NEOSOLAR-PANEL-CANADIAN-CS7L550MS   │
│ 15/01/2024 14:30             ✕      │
├─────────────────────────────────────┤
│ TATICO-INVERTER-GROWATT-MIN5000TL   │
│ 15/01/2024 14:25             ✕      │
├─────────────────────────────────────┤
│ ...                                 │
├─────────────────────────────────────┤
│ 🗑️ Limpar histórico                 │
└─────────────────────────────────────┘
```

### 💾 LocalStorage

**Key:** `ysh_sku_history`  
**Max items:** 10  
**Format:**

```json
[
  {
    "sku": "NEOSOLAR-PANEL-CANADIAN-CS7L550MS",
    "timestamp": 1705334400000,
    "product": {
      "id": "prod_123",
      "name": "Painel Canadian Solar 550W",
      "category": "panels"
    }
  }
]
```

### 🔒 Funcionalidades

✅ **Automático:** Adiciona ao copiar SKU  
✅ **Limite:** Máximo 10 itens (FIFO)  
✅ **Duplicatas:** Remove e reinsere no topo  
✅ **Persistência:** Mantém entre sessões  
✅ **Privacidade:** Dados apenas no navegador do usuário  

---

## 8. Comparação de Produtos

### 📍 Localização

```
Component: storefront/src/modules/catalog/components/ProductComparison.tsx
Page: storefront/src/app/[countryCode]/(main)/produtos/comparar/page.tsx
```

### 🎯 Página: `/produtos/comparar`

Compare até 3 produtos lado a lado por SKU.

### 💻 Como Usar

#### Via URL

```
/produtos/comparar?skus=SKU1,SKU2,SKU3
```

Exemplo:

```
/produtos/comparar?skus=NEOSOLAR-PANEL-CANADIAN-CS7L550MS,TATICO-INVERTER-GROWATT-MIN5000TL,YSH-BATTERY-BYD-HVMB0320
```

#### Programaticamente

```tsx
import { ProductComparison } from '@modules/catalog/components/ProductComparison'

<ProductComparison 
  initialSkus={['SKU1', 'SKU2', 'SKU3']}
  maxProducts={3}
/>
```

### 🖼️ Visual

```
┌─────────────────────────────────────────────────────────────┐
│ Digite um SKU...                              [Adicionar]   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Especificação  │  Produto 1    │  Produto 2    │  Produto 3 │
├────────────────┼───────────────┼───────────────┼────────────┤
│                │  [IMG]        │  [IMG]        │  [IMG]     │
│                │  Nome         │  Nome         │  Nome      │
│                │  [Remover]    │  [Remover]    │  [Remover] │
├────────────────┼───────────────┼───────────────┼────────────┤
│ SKU            │  NEOSOLAR...  │  TATICO...    │  YSH...    │
│                │  [📋][QR]     │  [📋][QR]     │  [📋][QR]  │
├────────────────┼───────────────┼───────────────┼────────────┤
│ Categoria      │  🔲 Painéis   │  🔲 Inversores│  🔲 Baterias│
├────────────────┼───────────────┼───────────────┼────────────┤
│ Fabricante/    │  Canadian     │  Growatt      │  BYD       │
│ Modelo         │  CS7L-550MS   │  MIN-5000TL   │  HVM-B0320 │
├────────────────┼───────────────┼───────────────┼────────────┤
│ Preço          │  R$ 850,00    │  R$ 3.200,00  │  R$ 12.000 │
├────────────────┼───────────────┼───────────────┼────────────┤
│ Potência       │  550W         │  5000W        │  10.5kWh   │
│ Eficiência     │  21.2%        │  98.4%        │  95%       │
│ Garantia       │  25 anos      │  10 anos      │  10 anos   │
│ ...            │  ...          │  ...          │  ...       │
└─────────────────────────────────────────────────────────────┘
```

### 🎨 Features

✅ **Tabela responsiva:** Scroll horizontal em mobile  
✅ **Sticky header:** Especificações fixas ao rolar  
✅ **Comparação dinâmica:** Specs extraídas de metadata  
✅ **Imagens:** Preview de cada produto  
✅ **Ações:** Remover produtos individualmente  
✅ **URL persistente:** Compartilhe link com comparação  
✅ **Empty state:** Mensagem quando vazio  

### 📊 Dados Comparados

| Campo | Fonte |
|-------|-------|
| **SKU** | `product.sku` ou `metadata.sku` |
| **Categoria** | `categories[0].name` |
| **Fabricante** | `metadata.manufacturer` |
| **Modelo** | `metadata.model` |
| **Preço** | `variants[0].prices[0].amount` |
| **Descrição** | `product.description` |
| **Especificações** | `metadata.specifications.*` |

### 🔗 Integração

Adicione links de comparação em ProductCard:

```tsx
<Link 
  href={`/produtos/comparar?skus=${product.sku}`}
  className="text-blue-600 hover:underline text-sm"
>
  ⚖️ Comparar
</Link>
```

Ou botão "Adicionar à comparação":

```tsx
const [compareList, setCompareList] = useState<string[]>([])

const addToCompare = (sku: string) => {
  if (!compareList.includes(sku) && compareList.length < 3) {
    setCompareList([...compareList, sku])
  }
}

// Quando clicar em "Ver comparação":
router.push(`/produtos/comparar?skus=${compareList.join(',')}`)
```

---

## 🧪 Checklist de Testes

### Backend

- [ ] `/api/products/by-sku/:sku` retorna produto válido
- [ ] `/api/products/by-sku/:sku` retorna 404 para SKU inexistente
- [ ] `/api/products/search-sku?q=` retorna resultados fuzzy
- [ ] Busca verifica product.sku, variant.sku, metadata.sku

### Frontend - Autocomplete

- [ ] Sugestões aparecem após 3 caracteres
- [ ] Debouncing funciona (300ms)
- [ ] Navegação por teclado (↑/↓/Enter)
- [ ] Loading state exibido durante busca
- [ ] Mensagem "Nenhum resultado" quando vazio
- [ ] Clique fora fecha dropdown

### Frontend - Filtro Manufacturer

- [ ] Dropdown exibe lista de fabricantes
- [ ] Busca interna filtra fabricantes
- [ ] Seleção destaca visualmente
- [ ] "Todos" remove filtro
- [ ] Contador de fabricantes atualiza

### Analytics

- [ ] Copy SKU envia evento PostHog
- [ ] Copy SKU envia evento Google Analytics
- [ ] Click em ProductModel rastreia evento
- [ ] Category view registra navegação
- [ ] Eventos incluem timestamp

### QR Code

- [ ] QR code gerado corretamente
- [ ] Download salva como PNG
- [ ] Web Share API funciona em mobile
- [ ] Modal fecha ao clicar fora
- [ ] Exibe apenas em mobile (<768px)

### Histórico

- [ ] SKU adicionado ao copiar
- [ ] Máximo 10 itens respeitado
- [ ] Duplicata move para topo
- [ ] Remover individual funciona
- [ ] Limpar tudo esvazia lista
- [ ] Persiste em localStorage

### Comparação

- [ ] URL com SKUs carrega produtos
- [ ] Adicionar SKU atualiza URL
- [ ] Remover SKU atualiza URL
- [ ] Máximo 3 produtos respeitado
- [ ] Specs dinâmicas exibidas
- [ ] Tabela scroll horizontal mobile
- [ ] Empty state quando vazio

### Script de Normalização

- [ ] Processa todos 12 arquivos JSON
- [ ] Cria backups antes de modificar
- [ ] SKUs seguem formato padronizado
- [ ] Duplicatas recebem sufixo numérico
- [ ] SKU máximo 60 caracteres
- [ ] Caracteres especiais removidos

---

## 📚 Resumo de Arquivos

### Backend

```
backend/src/api/store/products/
└── by-sku/
    └── [sku]/
        └── route.ts          (GET /api/products/by-sku/:sku)
```

### Frontend - Components

```
storefront/src/
├── components/
│   ├── SKUAutocomplete.tsx
│   └── SKUQRCode.tsx
├── lib/
│   └── sku-analytics.tsx
└── modules/catalog/components/
    ├── ManufacturerFilter.tsx
    └── ProductComparison.tsx
```

### Frontend - Pages

```
storefront/src/app/[countryCode]/(main)/
└── produtos/
    └── comparar/
        └── page.tsx          (/produtos/comparar)
```

### Scripts

```
ysh-erp/scripts/
└── normalize_catalog_skus.py
```

### Data

```
ysh-erp/data/catalog/
├── kits.json
├── panels.json
├── inverters.json
├── batteries.json
├── structures.json
├── cables.json
├── controllers.json
├── ev_chargers.json
├── stringboxes.json
├── accessories.json
├── posts.json
└── others.json
```

---

## 🚀 Próximos Passos

### 1. Executar Normalização

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-erp
python scripts/normalize_catalog_skus.py
```

### 2. Importar Produtos Atualizados

- Via Medusa Admin: `/admin/products/import`
- Ou script customizado de importação

### 3. Integrar SKUHistoryDropdown

Adicionar ao navigation header:

```tsx
// storefront/src/modules/layout/templates/nav/index.tsx
import { SKUHistoryDropdown } from '@/lib/sku-analytics'

<nav>
  {/* ... outros elementos ... */}
  <SKUHistoryDropdown />
</nav>
```

### 4. Integrar ManufacturerFilter

Adicionar à página de catálogo:

```tsx
// storefront/src/app/[countryCode]/(main)/store/page.tsx
import { ManufacturerFilter } from '@modules/catalog/components/ManufacturerFilter'

<div className="filters">
  <ManufacturerFilter
    manufacturers={manufacturers}
    selected={selectedManufacturer}
    onChange={setSelectedManufacturer}
  />
</div>
```

### 5. Integrar SKUAutocomplete

Substituir search bar atual:

```tsx
// Onde estiver o SearchBar
import { SKUAutocomplete } from '@/components/SKUAutocomplete'

<SKUAutocomplete placeholder="Buscar por SKU..." />
```

### 6. Adicionar Links de Comparação

Em ProductCard:

```tsx
<Link href={`/produtos/comparar?skus=${product.sku}`}>
  ⚖️ Comparar
</Link>
```

### 7. Testar Analytics

- Verificar eventos no PostHog Dashboard
- Verificar eventos no Google Analytics
- Validar dados de tracking

### 8. Deploy

- Build frontend: `npm run build`
- Build backend: `npm run build`
- Deploy em produção
- Validar endpoints em produção

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique este guia completo
2. Consulte os comentários no código
3. Execute testes com dados de exemplo
4. Valide integrações passo a passo

---

**Criado em:** 15/01/2024  
**Versão:** 1.0.0  
**Última atualização:** 15/01/2024
