# 📦 APIs do Catálogo YSH - Documentação

APIs TypeScript para consumir o catálogo unificado de produtos solares no storefront.

## 🎯 Visão Geral

Conjunto de APIs RESTful para acessar produtos, kits, busca e informações de categorias do catálogo YSH.

**Base URL**: `/api/catalog`

**Características**:

- ✅ Cache inteligente (1-2 horas)
- ✅ Paginação
- ✅ Filtros avançados
- ✅ Busca semântica com relevância
- ✅ ISR (Incremental Static Regeneration)
- ✅ TypeScript completo

---

## 📚 Endpoints Disponíveis

### 1. **GET** `/api/catalog/products`

Buscar produtos por categoria.

#### Query Parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `category` | `string` | `panels` | Categoria do produto (`panels`, `inverters`, `batteries`, `structures`, `cables`, `accessories`, `stringboxes`) |
| `limit` | `number` | `50` | Número de produtos por página |
| `offset` | `number` | `0` | Offset para paginação |
| `distributor` | `string` | - | Filtrar por distribuidor (FOTUS, NEOSOLAR, ODEX, SOLFACIL, FORTLEV) |
| `search` | `string` | - | Buscar por nome/SKU/fabricante |
| `minPrice` | `number` | - | Preço mínimo |
| `maxPrice` | `number` | - | Preço máximo |

#### Exemplo de Request

```typescript
// Buscar painéis solares da NEOSOLAR
const response = await fetch('/api/catalog/products?category=panels&distributor=NEOSOLAR&limit=20')
const data = await response.json()
```

#### Exemplo de Response

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "neosolar_panels_12345",
        "name": "Painel Solar 550W Monocristalino",
        "sku": "PANEL-550-MONO",
        "distributor": "NEOSOLAR",
        "manufacturer": "JA Solar",
        "price": 850.00,
        "image": "/catalog/images/NEOSOLAR-PANELS/panel-550.jpg",
        "specifications": {
          "potencia_wp": 550,
          "eficiencia": "21.2%",
          "garantia_anos": 25
        }
      }
    ],
    "pagination": {
      "total": 120,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    },
    "filters": {
      "category": "panels",
      "distributor": "NEOSOLAR"
    }
  },
  "timestamp": "2025-10-07T21:30:00.000Z"
}
```

---

### 2. **GET** `/api/catalog/kits`

Buscar kits prontos para instalação.

#### Query Parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `limit` | `number` | `50` | Número de kits por página |
| `offset` | `number` | `0` | Offset para paginação |
| `distributor` | `string` | - | Filtrar por distribuidor |
| `minPower` | `number` | - | Potência mínima em kWp |
| `maxPower` | `number` | - | Potência máxima em kWp |
| `type` | `string` | - | Tipo de kit (`grid-tie`, `hybrid`, `off-grid`) |
| `roofType` | `string` | - | Tipo de telhado (`ceramico`, `metalico`, `fibrocimento`, `laje`) |
| `search` | `string` | - | Buscar por nome/SKU |

#### Exemplo de Request

```typescript
// Buscar kits híbridos entre 5-10 kWp
const response = await fetch('/api/catalog/kits?type=hybrid&minPower=5&maxPower=10')
const data = await response.json()
```

#### Exemplo de Response

```json
{
  "success": true,
  "data": {
    "kits": [
      {
        "id": "FOTUS-KP04-8.8kWp-hibrido",
        "name": "Kit Híbrido 8.8kWp - Telhado Cerâmico",
        "power_kwp": 8.8,
        "distributor": "FOTUS",
        "price": 28500.00,
        "type": "hybrid",
        "roof_type": "ceramico",
        "image": "/catalog/images/FOTUS-KITS-HIBRIDOS/kit-8.8kwp.jpg"
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  },
  "timestamp": "2025-10-07T21:30:00.000Z"
}
```

---

### 3. **GET** `/api/catalog/search`

Busca unificada em todo o catálogo com relevância.

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `q` | `string` | ✅ | Termo de busca (mínimo 2 caracteres) |
| `categories` | `string` | - | Categorias separadas por vírgula (ex: `panels,inverters,kits`) |
| `limit` | `number` | `10` | Resultados por categoria |
| `distributor` | `string` | - | Filtrar por distribuidor |

#### Exemplo de Request

```typescript
// Buscar "growatt" em painéis e inversores
const response = await fetch('/api/catalog/search?q=growatt&categories=panels,inverters&limit=5')
const data = await response.json()
```

#### Exemplo de Response

```json
{
  "success": true,
  "data": {
    "query": "growatt",
    "total": 87,
    "results": [
      {
        "id": "neosolar_inverters_GW-10K",
        "name": "Inversor Growatt 10kW On-Grid",
        "category": "inverters",
        "distributor": "NEOSOLAR",
        "sku": "GW-10K-MT",
        "price": 4500.00,
        "relevance": 18
      },
      {
        "id": "odex_inverters_GROWATT-5000W",
        "name": "Inversor Growatt 5kW Monofásico",
        "category": "inverters",
        "distributor": "ODEX",
        "price": 3200.00,
        "relevance": 15
      }
    ],
    "byCategory": {
      "inverters": [
        { "...": "..." }
      ],
      "panels": [
        { "...": "..." }
      ]
    }
  },
  "timestamp": "2025-10-07T21:30:00.000Z"
}
```

**Algoritmo de Relevância**:

- Match exato no nome: +30 pontos
- Match no nome: +10 pontos
- Match no SKU: +8 pontos
- Match no ID: +7 pontos
- Match no fabricante/modelo: +5 pontos
- Match na descrição: +2 pontos

---

### 4. **GET** `/api/catalog/categories`

Informações e estatísticas de categorias.

#### Query Parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `includeStats` | `boolean` | `false` | Incluir estatísticas detalhadas (distribuidores, preços) |

#### Exemplo de Request

```typescript
// Obter categorias com estatísticas
const response = await fetch('/api/catalog/categories?includeStats=true')
const data = await response.json()
```

#### Exemplo de Response

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "panels",
        "name": "panels",
        "displayName": "Painéis Solares",
        "totalProducts": 120,
        "distributors": ["NEOSOLAR", "ODEX", "SOLFACIL"],
        "priceRange": {
          "min": 450.00,
          "max": 1200.00,
          "avg": 825.50
        }
      },
      {
        "id": "inverters",
        "name": "inverters",
        "displayName": "Inversores",
        "totalProducts": 489,
        "distributors": ["NEOSOLAR", "ODEX", "SOLFACIL"],
        "priceRange": {
          "min": 1500.00,
          "max": 25000.00,
          "avg": 8750.00
        }
      }
    ],
    "summary": {
      "totalCategories": 8,
      "totalProducts": 986,
      "distributors": ["FOTUS", "NEOSOLAR", "ODEX", "SOLFACIL", "FORTLEV"]
    }
  },
  "timestamp": "2025-10-07T21:30:00.000Z"
}
```

---

## 🔧 Client Helper

Use o helper `catalog-client.ts` para facilitar o consumo das APIs:

### Importar

```typescript
import { 
  fetchProducts, 
  fetchKits, 
  searchCatalog, 
  fetchCategories 
} from '@/lib/api/catalog-client'
```

### Exemplos de Uso

#### 1. Buscar Produtos

```typescript
// Server Component
const panels = await fetchProducts({
  category: 'panels',
  limit: 10,
  distributor: 'NEOSOLAR',
  minPrice: 500,
  maxPrice: 1000
})

// Client Component
'use client'
import { useCatalogAPI } from '@/lib/api/catalog-client'

export function ProductsList() {
  const { fetchProducts } = useCatalogAPI()
  
  const loadProducts = async () => {
    const products = await fetchProducts({
      category: 'inverters',
      limit: 20
    })
    console.log(products)
  }
  
  return <button onClick={loadProducts}>Carregar Inversores</button>
}
```

#### 2. Buscar Kits

```typescript
const kits = await fetchKits({
  minPower: 5,
  maxPower: 15,
  type: 'hybrid',
  roofType: 'ceramico',
  limit: 20
})

console.log(`Encontrados ${kits.length} kits`)
```

#### 3. Busca Unificada

```typescript
const results = await searchCatalog({
  query: 'growatt 10kw',
  categories: ['inverters', 'kits'],
  limit: 10
})

console.log(`${results.length} resultados encontrados`)
```

#### 4. Obter Categorias

```typescript
const categories = await fetchCategories(true) // incluir estatísticas

categories.forEach(cat => {
  console.log(`${cat.displayName}: ${cat.totalProducts} produtos`)
})
```

---

## 🚀 Performance e Cache

### Estratégia de Cache

| Endpoint | TTL | Revalidação | Estratégia |
|----------|-----|-------------|------------|
| `/products` | 1 hora | 2 horas | `s-maxage=3600, stale-while-revalidate=7200` |
| `/kits` | 1 hora | 2 horas | `s-maxage=3600, stale-while-revalidate=7200` |
| `/search` | 30 min | 1 hora | `s-maxage=1800, stale-while-revalidate=3600` |
| `/categories` | 2 horas | 4 horas | `s-maxage=7200, stale-while-revalidate=14400` |

### Cache em Memória

As APIs utilizam cache em memória com TTL de 1 hora para reduzir leitura de disco:

```typescript
// Cache automático
const cached = cache.get('catalog_panels')
if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
  return cached.data
}
```

### ISR (Incremental Static Regeneration)

Use `next.revalidate` para ISR:

```typescript
const products = await fetch('/api/catalog/products?category=panels', {
  next: { revalidate: 3600 } // 1 hora
})
```

---

## 📁 Estrutura de Arquivos

```
storefront/src/
├── app/api/catalog/
│   ├── products/route.ts      # GET /api/catalog/products
│   ├── kits/route.ts           # GET /api/catalog/kits
│   ├── search/route.ts         # GET /api/catalog/search
│   └── categories/route.ts     # GET /api/catalog/categories
└── lib/api/
    ├── catalog-client.ts       # Helper para consumir APIs
    ├── fallback.ts             # Sistema de fallback
    └── resilient.ts            # Cliente resiliente
```

---

## ⚠️ Tratamento de Erros

Todas as APIs retornam estrutura padrão de erro:

```json
{
  "success": false,
  "error": "Invalid category",
  "message": "Category 'invalid' not found",
  "validCategories": ["panels", "inverters", "..."]
}
```

### Status Codes

- `200`: Sucesso
- `400`: Parâmetros inválidos
- `404`: Recurso não encontrado
- `500`: Erro interno do servidor

---

## 🔍 Filtros Avançados

### Combinando Filtros

```typescript
// Buscar inversores Growatt entre R$ 3.000-5.000
const inverters = await fetchProducts({
  category: 'inverters',
  search: 'growatt',
  minPrice: 3000,
  maxPrice: 5000,
  distributor: 'NEOSOLAR',
  limit: 20
})
```

### Paginação

```typescript
// Página 1 (produtos 0-19)
const page1 = await fetchProducts({
  category: 'panels',
  limit: 20,
  offset: 0
})

// Página 2 (produtos 20-39)
const page2 = await fetchProducts({
  category: 'panels',
  limit: 20,
  offset: 20
})

// Verificar se há mais páginas
if (page1.pagination.hasMore) {
  console.log('Carregar mais produtos...')
}
```

---

## 📊 Monitoramento

### Logs

Todas as APIs logam erros automaticamente:

```typescript
console.error('Error loading catalog file for panels:', error)
```

### Métricas Recomendadas

- Taxa de cache hit/miss
- Latência média por endpoint
- Erros 5xx por hora
- Taxa de uso por distribuidor

---

## 🛠️ Desenvolvimento

### Testar Localmente

```bash
# Iniciar storefront
cd ysh-store/storefront
npm run dev

# Testar endpoint
curl http://localhost:3000/api/catalog/products?category=panels&limit=5

# Buscar kits
curl "http://localhost:3000/api/catalog/kits?minPower=5&maxPower=10"

# Busca unificada
curl "http://localhost:3000/api/catalog/search?q=growatt&limit=10"
```

### Debug

```typescript
// Habilitar logs detalhados
const products = await fetchProducts({
  category: 'panels',
  limit: 10
})

console.log('Products loaded:', products.length)
console.log('First product:', products[0])
```

---

## 📝 Changelog

### v1.0.0 - 07/10/2025

- ✅ Criação das 4 APIs principais
- ✅ Client helper completo
- ✅ Cache em memória
- ✅ Algoritmo de relevância para busca
- ✅ Filtros avançados
- ✅ Paginação
- ✅ TypeScript completo
- ✅ Documentação completa

---

## 🤝 Suporte

Dúvidas ou problemas? Entre em contato:

- **Email**: <dev@yellosolar.com.br>
- **Docs**: `/docs/api`
- **Issues**: GitHub Issues

---

**Desenvolvido com ❤️ pela equipe YSH**
