# APIs Internas de Produto e Imagens - Medusa v2 + Next.js 15

Implementação completa das APIs internas para gerenciamento de produtos e imagens, seguindo os padrões **Medusa v2** e consumo no **Next.js 15 App Router**.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Backend (Medusa v2)](#backend-medusa-v2)
- [Frontend (Next.js 15)](#frontend-nextjs-15)
- [Configuração](#configuração)
- [Uso](#uso)
- [Testes](#testes)

---

## 🎯 Visão Geral

### Funcionalidades Implementadas

#### Backend

✅ **Rotas Internas de Produtos** (`/admin/internal/products`)

- GET: Listagem com paginação, busca e filtros
- POST: Busca avançada com múltiplos critérios

✅ **Rotas de Imagens** (`/admin/internal/products/:id/images`)

- POST: Anexar imagens ao produto/variante
- PATCH: Reordenar imagens por rank
- DELETE: Remover imagens

✅ **Workflow de Upload** (`upload_and_attach_image`)

- Upload via File Module (S3 ou local)
- Anexação automática ao produto
- Rollback em caso de falha

✅ **Upload Direto S3** (`/admin/internal/media/presign`)

- Geração de URLs pré-assinadas
- Upload browser → S3 sem passar pelo servidor

✅ **Rota Store Pública** (`/store/internal/products/:handle`)

- PDP enhanced para consumo público
- Requer `x-publishable-api-key`

#### Frontend

✅ **SDK e Wrappers** (`src/lib/api/*`)

- Fetchers admin e store
- Gerenciamento de autenticação
- Injeção automática de publishable key

✅ **Hooks React** (`src/hooks/*`)

- `useInternalProducts`: Listagem com estado
- `useSearchInternalProducts`: Busca avançada
- `useAttachImages`: Anexar imagens
- `useReorderImages`: Reordenar por rank
- `useRemoveImages`: Remover imagens
- `usePresignedUpload`: Upload direto S3

✅ **Utilitários de Imagem** (`src/lib/utils/images.ts`)

- Construção de URLs otimizadas
- Geração de srcSet responsivo
- Presets de thumbnail
- Validação de URLs

✅ **Camada de Resiliência** (`src/lib/utils/resilient.ts`)

- Retry exponencial
- Circuit breaker
- Cache com TTL
- Stale-while-revalidate

---

## 🔧 Backend (Medusa v2)

### Estrutura de Arquivos

```
backend/src/
├── api/
│   ├── admin/
│   │   └── internal/
│   │       ├── products/
│   │       │   ├── route.ts          # GET/POST listagem e busca
│   │       │   └── [id]/
│   │       │       └── images/
│   │       │           └── route.ts  # POST/PATCH/DELETE imagens
│   │       ├── media/
│   │       │   └── presign/
│   │       │       └── route.ts      # POST pré-assinatura S3
│   │       └── types.ts              # Tipos compartilhados
│   └── store/
│       └── internal/
│           └── products/
│               └── [handle]/
│                   └── route.ts      # GET produto público
└── workflows/
    └── media/
        └── upload_and_attach_image.ts # Workflow de upload
```

### Rotas Disponíveis

#### `/admin/internal/products` (GET)

```typescript
Query params:
- q: string          // Busca textual
- category: string   // ID da categoria
- limit: number      // Itens por página (default: 20)
- offset: number     // Deslocamento (default: 0)

Response:
{
  success: true,
  data: {
    items: Product[]  // Imagens ordenadas por rank
  },
  meta: {
    count: number,
    limit: number,
    offset: number,
    total_pages: number
  }
}
```

#### `/admin/internal/products` (POST)

```typescript
Body:
{
  q?: string
  category_ids?: string[]
  collection_id?: string
  tags?: string[]
  status?: string[]
  limit?: number
  offset?: number
  sort_by?: string
  sort_order?: "ASC" | "DESC"
}

Response: (mesmo formato do GET)
```

#### `/admin/internal/products/:id/images` (POST)

```typescript
Body:
{
  files: Array<{
    url?: string      // URL direta
    fileId?: string   // ID de arquivo pré-existente
    alt?: string      // Texto alternativo
  }>
  attachTo?: "product" | "variant"  // Default: "product"
  variant_id?: string               // Requerido se attachTo = "variant"
}

Response:
{
  success: true,
  data: { attached: number }
}
```

#### `/admin/internal/products/:id/images` (PATCH)

```typescript
Body:
{
  reorder: Array<{
    image_id: string
    rank: number      // Nova posição (0-based)
  }>
}

Response:
{
  success: true,
  data: { reordered: number }
}
```

#### `/admin/internal/products/:id/images` (DELETE)

```typescript
Body:
{
  image_ids: string[]
}

Response:
{
  success: true,
  data: { removed: number }
}
```

#### `/admin/internal/media/presign` (POST)

```typescript
Body:
{
  filename: string
  contentType: string
}

Response:
{
  success: true,
  data: {
    url: string           // URL de upload
    fields?: {}           // Campos para FormData
    file_url?: string     // URL pública final
  }
}
```

#### `/store/internal/products/:handle` (GET)

```typescript
Headers:
- x-publishable-api-key: string (OBRIGATÓRIO)

Response:
{
  success: true,
  data: Product  // Imagens ordenadas por rank
}
```

### Padrões Implementados

#### ✅ Ordenação de Imagens por Rank

```typescript
// Todas as rotas retornam imagens ordenadas
images: (p.images ?? [])
  .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
```

#### ✅ Proteção de Rotas

- `/admin/**` → Autenticação automática (admin session)
- `/store/**` → Requer `x-publishable-api-key`

#### ✅ Tratamento de Erros

```typescript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human readable message"
  }
}
```

---

## 🎨 Frontend (Next.js 15)

### Estrutura de Arquivos

```
storefront/src/
├── lib/
│   ├── api/
│   │   ├── http.ts           # Fetchers base
│   │   └── internal.ts       # Wrappers tipados
│   ├── data/
│   │   └── types.ts          # DTOs e interfaces
│   └── utils/
│       ├── images.ts         # Utilitários de imagem
│       └── resilient.ts      # Resiliência e retry
└── hooks/
    ├── use-products.ts       # Hooks de produtos
    └── use-product-images.ts # Hooks de imagens
```

### Uso dos Hooks

#### Listar Produtos

```typescript
import { useInternalProducts } from "@/hooks/use-products"

function ProductList() {
  const { data, meta, isLoading, error, refetch } = useInternalProducts(
    "painel solar",  // busca
    0,               // página
    20               // limite
  )

  if (isLoading) return <Loading />
  if (error) return <Error message={error.message} />

  return (
    <div>
      {data.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
      <Pagination meta={meta} />
    </div>
  )
}
```

#### Busca Avançada

```typescript
import { useSearchInternalProducts } from "@/hooks/use-products"

function AdvancedSearch() {
  const { data, isLoading, search } = useSearchInternalProducts({
    category_ids: ["cat_solar"],
    status: ["published"],
    sort_by: "created_at",
    sort_order: "DESC",
    limit: 50
  })

  return <SearchResults products={data} />
}
```

#### Upload de Imagens

```typescript
import { useAttachImages, usePresignedUpload } from "@/hooks/use-product-images"

function ImageUploader({ productId }: { productId: string }) {
  const { upload, isLoading: uploading } = usePresignedUpload()
  const { mutate: attach } = useAttachImages(productId)

  const handleUpload = async (files: FileList) => {
    const urls = []
    
    for (const file of Array.from(files)) {
      const url = await upload(file)
      if (url) urls.push({ url, alt: file.name })
    }

    await attach({ files: urls })
  }

  return <input type="file" multiple onChange={(e) => handleUpload(e.target.files!)} />
}
```

#### Reordenar Imagens

```typescript
import { useReorderImages } from "@/hooks/use-product-images"

function ImageReorder({ productId, images }: Props) {
  const { mutate: reorder } = useReorderImages(productId)

  const handleReorder = async (newOrder: Array<{ id: string; rank: number }>) => {
    await reorder({
      reorder: newOrder.map(img => ({ image_id: img.id, rank: img.rank }))
    })
  }

  return <DraggableImageList images={images} onReorder={handleReorder} />
}
```

### Otimização de Imagens

#### URLs Responsivas

```typescript
import { buildImageUrl, buildSrcSet, buildThumbnail } from "@/lib/utils/images"

// URL otimizada
const optimized = buildImageUrl(image.url, { w: 800, q: 85, fm: "webp" })

// Thumbnail
const thumb = buildThumbnail(image.url, "md") // 256x256 webp

// srcSet responsivo
const srcSet = buildSrcSet(image.url, [320, 640, 1024])
```

#### Next/Image

```typescript
import Image from "next/image"
import { buildImageUrl } from "@/lib/utils/images"

<Image
  src={buildImageUrl(product.thumbnail, { w: 400, fm: "webp" })}
  alt={product.title}
  width={400}
  height={400}
  loading="lazy"
/>
```

### Resiliência

```typescript
import { resilientApiCall } from "@/lib/utils/resilient"

// Com retry e cache
const products = await resilientApiCall(
  "products-list",
  () => listInternalProducts("", 0, 20),
  {
    cache: true,
    ttl: 60000,      // 1 minuto
    retry: {
      maxRetries: 3,
      initialDelay: 200
    }
  }
)
```

---

## ⚙️ Configuração

### Backend (.env.template)

```bash
# File Module - S3 Storage (Opcional)
FILE_S3_URL=https://{your-bucket}.s3.{region}.amazonaws.com
FILE_S3_BUCKET={your-bucket-name}
FILE_S3_REGION={region}
FILE_S3_ACCESS_KEY_ID=
FILE_S3_SECRET_ACCESS_KEY=

# Nota: Sem credenciais, usa file-local provider
```

### medusa-config.ts

```typescript
modules: {
  // File Module com fallback para local
  "@medusajs/file": process.env.FILE_S3_BUCKET
    ? {
        resolve: "@medusajs/medusa/file-s3",
        options: {
          file_url: process.env.FILE_S3_URL,
          access_key_id: process.env.FILE_S3_ACCESS_KEY_ID,
          secret_access_key: process.env.FILE_S3_SECRET_ACCESS_KEY,
          region: process.env.FILE_S3_REGION,
          bucket: process.env.FILE_S3_BUCKET,
        },
      }
    : {
        resolve: "@medusajs/medusa/file-local",
        options: {
          upload_dir: "uploads",
          backend_url: process.env.MEDUSA_DEV_URL || "http://localhost:9000",
        },
      },
}
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxxxxxxxxxx
```

### Next.js (next.config.js)

```javascript
module.exports = {
  images: {
    domains: [
      'localhost',
      '{your-bucket}.s3.{region}.amazonaws.com'
    ],
    formats: ['image/avif', 'image/webp'],
  }
}
```

---

## 🧪 Testes

### Backend

```bash
cd backend

# Testar rotas de produtos
curl -X GET "http://localhost:9000/admin/internal/products?q=solar&limit=10" \
  -H "Cookie: connect.sid=xxx"

# Anexar imagem
curl -X POST "http://localhost:9000/admin/internal/products/prod_123/images" \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=xxx" \
  -d '{
    "files": [{"url": "https://example.com/image.jpg", "alt": "Solar Panel"}]
  }'

# Reordenar
curl -X PATCH "http://localhost:9000/admin/internal/products/prod_123/images" \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=xxx" \
  -d '{
    "reorder": [
      {"image_id": "img_1", "rank": 1},
      {"image_id": "img_2", "rank": 0}
    ]
  }'
```

### Frontend

```typescript
// __tests__/use-products.test.ts
import { renderHook, waitFor } from "@testing-library/react"
import { useInternalProducts } from "@/hooks/use-products"

test("should fetch products", async () => {
  const { result } = renderHook(() => useInternalProducts("solar"))
  
  await waitFor(() => expect(result.current.isLoading).toBe(false))
  expect(result.current.data.length).toBeGreaterThan(0)
})
```

---

## 📚 Referências

- [Medusa v2 API Routes](https://docs.medusajs.com/learn/fundamentals/api-routes)
- [File Module S3 Provider](https://docs.medusajs.com/resources/infrastructure-modules/file/s3)
- [Publishable API Keys](https://docs.medusajs.com/resources/storefront-development/publishable-api-keys)
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

---

## 🎯 Próximos Passos

### Melhorias Recomendadas

1. **Testes E2E**
   - Playwright para fluxos completos
   - Pact para contratos de API

2. **Validação de Schema**
   - Zod para body/query params
   - Type-safe em runtime

3. **Observabilidade**
   - OpenTelemetry para tracing
   - Logs estruturados

4. **Performance**
   - Redis cache para listagens
   - CDN para imagens

5. **Segurança**
   - Rate limiting
   - CORS refinado
   - CSP headers

---

**Implementado por:** Boldsbrain AI  
**Data:** Janeiro 2025  
**Versão:** 1.0.0
