# Sistema de Fallback Robusto para Catálogo YSH

## 📋 Visão Geral

Implementação de um sistema robusto de recuperação de dados do catálogo com **3 níveis de fallback** para garantir disponibilidade máxima dos produtos, mesmo em casos de falha do backend principal.

## 🎯 Objetivo

Garantir que o storefront **SEMPRE** consiga carregar dados de produtos, independente do estado do backend Medusa, através de múltiplas estratégias de recuperação em cascata.

## 🏗️ Arquitetura

### Níveis de Fallback (em ordem de prioridade)

```
┌─────────────────────────────────────────────────────┐
│  1️⃣  Backend Medusa Principal                       │
│     /store/internal-catalog/{category}              │
│     ✓ Dados em tempo real                           │
│     ✓ Sincronizado com database                     │
└─────────────────────────────────────────────────────┘
                    ↓ (se falhar)
┌─────────────────────────────────────────────────────┐
│  2️⃣  Backend Fallback API                           │
│     /store/fallback/products?category={category}    │
│     ✓ Dados pré-exportados (JSON)                   │
│     ✓ 100% cobertura de imagens validadas           │
│     ✓ Atualizado periodicamente                     │
└─────────────────────────────────────────────────────┘
                    ↓ (se falhar)
┌─────────────────────────────────────────────────────┐
│  3️⃣  Arquivos JSON Locais                           │
│     ../backend/data/catalog/fallback_exports/       │
│     ✓ Cópia local dos exports                       │
│     ✓ Garantia de funcionamento offline             │
│     ✓ Último recurso                                │
└─────────────────────────────────────────────────────┘
```

## 📁 Arquivos Criados/Atualizados

### 1. Core Fallback System

**`src/lib/catalog/fallback-loader.ts`** (NOVO)

- Sistema principal de carregamento com cascata de fallback
- Cache em memória com TTL de 1 hora
- Suporte para 13 categorias de produtos
- Filtros locais (search, distributor, price)
- Paginação integrada

### 2. API Routes Atualizadas

**`src/app/api/catalog/products/route.ts`** (ATUALIZADO)

- Rota principal de produtos
- Usa `loadCatalogProducts()` com fallback automático
- Retorna metadados de origem dos dados

**`src/app/api/catalog/panels/route.ts`** (ATUALIZADO)

- Especializada para painéis solares
- Fallback automático integrado

**`src/app/api/catalog/inverters/route.ts`** (ATUALIZADO)

- Especializada para inversores
- Fallback automático integrado

**`src/app/api/catalog/batteries/route.ts`** (ATUALIZADO)

- Especializada para baterias
- Fallback automático integrado

## 🔄 Fluxo de Execução

```typescript
// Requisição do cliente
GET /api/catalog/products?category=panels&limit=50

// 1. Tentar Backend Medusa
try fetch('http://localhost:9000/store/internal-catalog/panels')
  ✅ Sucesso → Retorna produtos
  ❌ Falha (timeout/erro) → Próximo nível

// 2. Tentar Fallback API
try fetch('http://localhost:9000/store/fallback/products?category=panels')
  ✅ Sucesso → Retorna produtos
  ❌ Falha → Próximo nível

// 3. Carregar arquivo local
try readFile('../backend/data/catalog/fallback_exports/panels.json')
  ✅ Sucesso → Retorna produtos
  ❌ Falha → Retorna array vazio

// Resposta sempre inclui metadados
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {...}
  },
  "meta": {
    "source": "backend" | "fallback-api" | "local-file",
    "fromCache": false,
    "timestamp": "2025-10-13T..."
  }
}
```

## 📊 Categorias Suportadas

```typescript
type ProductCategory =
  | 'panels'          // Painéis solares
  | 'inverters'       // Inversores
  | 'batteries'       // Baterias
  | 'structures'      // Estruturas
  | 'cables'          // Cabos
  | 'accessories'     // Acessórios
  | 'stringboxes'     // String boxes
  | 'kits'            // Kits completos
  | 'controllers'     // Controladores
  | 'ev_chargers'     // Carregadores EV
  | 'posts'           // Postes
  | 'others'          // Outros
  | 'all'             // Todos (products_master.json)
```

## 🎛️ Parâmetros de Query

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `category` | string | 'panels' | Categoria de produtos |
| `limit` | number | 50 | Produtos por página |
| `offset` | number | 0 | Offset de paginação |
| `search` | string | - | Busca por nome/SKU/fabricante |
| `distributor` | string | - | Filtrar por distribuidor |

## 💾 Sistema de Cache

```typescript
// Cache em memória com TTL
const CACHE_TTL_MS = 3600000 // 1 hora

interface CacheEntry {
  data: any
  timestamp: number
  source: 'backend' | 'fallback-api' | 'local-file'
}

// Limpeza automática de cache expirado
setInterval(clearExpiredCache, CACHE_TTL_MS)
```

## 🔍 Headers de Resposta

```http
HTTP/1.1 200 OK
Cache-Control: public, s-maxage=3600, stale-while-revalidate=7200
X-Data-Source: backend | fallback-api | local-file
X-From-Cache: true | false
```

## 📦 Estrutura de Dados Fallback

```
backend/data/catalog/fallback_exports/
├── products_master.json          # Todos os produtos (1061)
├── panels.json                   # Painéis
├── inverters.json                # Inversores
├── batteries.json                # Baterias
├── structures.json               # Estruturas
├── cables.json                   # Cabos
├── accessories.json              # Acessórios
├── stringboxes.json              # String boxes
├── kits.json                     # Kits
├── controllers.json              # Controladores
├── ev_chargers.json              # Carregadores EV
├── posts.json                    # Postes
├── others.json                   # Outros
└── image_validation_report.json  # Relatório de cobertura
```

### Formato dos Arquivos

```json
{
  "category": "panels",
  "total_products": 245,
  "with_images": 245,
  "image_coverage_percent": "100.00",
  "generated_at": "2025-10-13T11:42:19.467Z",
  "cleaned": true,
  "products": [
    {
      "id": "FOTUS-CANADIAN-CS7N-665TB-AG",
      "name": "Painel Solar Canadian 665W TOPHiKu7 CS7N-665TB-AG",
      "manufacturer": "Canadian Solar",
      "category": "panels",
      "price": "R$ 799,00",
      "image": "https://...",
      "availability": true,
      "technical_specs": {
        "power_wp": 665,
        "efficiency_pct": 21.6,
        "voltage_vmp": 45.9,
        "current_imp": 14.49
      },
      "metadata": {
        "source": "consolidated",
        "normalized": true,
        "specs_enriched": true
      }
    }
  ]
}
```

## 🚀 Uso

### No Storefront (Client-Side)

```typescript
// Usando a API route
const response = await fetch('/api/catalog/products?category=panels&limit=50')
const data = await response.json()

console.log(data.meta.source) // 'backend', 'fallback-api', ou 'local-file'
console.log(data.data.products) // Array de produtos
```

### Direto no Backend (Server-Side)

```typescript
import { loadCatalogProducts } from '@/lib/catalog/fallback-loader'

const result = await loadCatalogProducts('inverters', {
  limit: 100,
  offset: 0,
  search: 'fronius',
  useCache: true
})

console.log(result.source) // Origem dos dados
console.log(result.products) // Produtos carregados
```

## ⚙️ Configuração

### Variáveis de Ambiente

```bash
# Backend Medusa principal
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Backend alternativo (opcional, default: mesmo do principal)
FALLBACK_BACKEND_URL=http://localhost:9000

# Chave de API (se necessário)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
```

### Timeouts e TTL

```typescript
const REQUEST_TIMEOUT_MS = 10000  // 10 segundos
const CACHE_TTL_MS = 3600000     // 1 hora
```

## 🔧 Manutenção

### Limpar Cache Manualmente

```typescript
import { clearAllCache, clearExpiredCache } from '@/lib/catalog/fallback-loader'

// Limpar todo o cache
clearAllCache()

// Limpar apenas cache expirado
clearExpiredCache()
```

### Atualizar Arquivos Fallback

```bash
# No backend
cd backend
npm run export:catalog

# Arquivos gerados em:
# data/catalog/fallback_exports/
```

## 📈 Monitoramento

### Logs

```
[Fallback Loader] ✅ Backend fetch successful: 245 products
[Fallback Loader] ⚠️  Backend fetch failed for panels: timeout
[Fallback Loader] ✅ Fallback API successful: 245 products
[Fallback Loader] ⚠️  Fallback API failed for panels: 500 error
[Fallback Loader] ✅ Local file loaded: 245 products
[Fallback Loader] ❌ All strategies failed for panels
[Fallback Loader] 📦 Cache hit for panels
```

### Métricas

- Taxa de sucesso por nível
- Tempo médio de resposta
- Taxa de cache hit
- Produtos retornados vs total

## ✅ Testes

### Teste de Fallback

```bash
# 1. Testar com backend funcionando
curl http://localhost:3000/api/catalog/products?category=panels
# Deve retornar: "source": "backend"

# 2. Derrubar backend
docker stop medusa-backend

# 3. Testar novamente
curl http://localhost:3000/api/catalog/products?category=panels
# Deve retornar: "source": "fallback-api" ou "local-file"

# 4. Verificar dados
# Produtos devem estar disponíveis normalmente
```

## 🎯 Benefícios

✅ **Alta Disponibilidade**: 3 níveis de redundância
✅ **Performance**: Cache em memória com TTL
✅ **Resiliência**: Funciona mesmo com backend offline
✅ **Transparência**: Metadados indicam origem dos dados
✅ **Manutenibilidade**: Sistema modular e extensível
✅ **Offline-First**: Funciona sem conexão com backend

## 🔐 Segurança

- Headers de API key opcionais
- Validação de categorias
- Timeouts configuráveis
- Logs detalhados de erros
- Sem exposição de dados sensíveis

## 📝 Próximos Passos

- [ ] Adicionar retry logic com exponential backoff
- [ ] Implementar health check endpoint
- [ ] Adicionar métricas Prometheus
- [ ] Criar dashboard de monitoramento
- [ ] Implementar circuit breaker pattern
- [ ] Adicionar compression dos arquivos fallback
- [ ] Implementar CDN para arquivos estáticos

## 🤝 Contribuição

Para adicionar nova categoria:

1. Adicionar ao tipo `ProductCategory` em `fallback-loader.ts`
2. Adicionar mapeamento em `CATEGORY_FILES`
3. Criar arquivo JSON em `backend/data/catalog/fallback_exports/`
4. Criar rota específica se necessário

---

**Documentação gerada em:** 2025-10-13  
**Versão:** 1.0.0  
**Status:** ✅ Implementado e Testado
