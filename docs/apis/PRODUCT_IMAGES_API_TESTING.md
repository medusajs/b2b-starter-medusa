# 🧪 Guia de Testes - APIs de Produto e Imagens

## Pré-requisitos

```powershell
# 1. Backend rodando
cd backend
yarn dev

# 2. Frontend rodando (terminal separado)
cd storefront
yarn dev

# 3. Ter um usuário admin criado
cd backend
yarn medusa user -e admin@test.com -p supersecret -i admin

# 4. (Opcional) Configurar S3 no .env
# Caso contrário, usará file-local
```

---

## 🔧 Testes Backend (API REST)

### 1. Login Admin (obter cookie de sessão)

```powershell
# PowerShell
$response = Invoke-WebRequest -Uri "http://localhost:9000/auth/user/emailpass" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@test.com","password":"supersecret"}' `
  -SessionVariable session

# Salvar token/cookie para próximas requisições
$cookie = $response.Headers['Set-Cookie']
```

### 2. Listar Produtos

```powershell
# GET - Listagem básica
curl -X GET "http://localhost:9000/admin/internal/products?limit=10" `
  -H "Cookie: $cookie"

# GET - Com busca
curl -X GET "http://localhost:9000/admin/internal/products?q=solar&limit=20&offset=0" `
  -H "Cookie: $cookie"

# GET - Por categoria
curl -X GET "http://localhost:9000/admin/internal/products?category=cat_solar" `
  -H "Cookie: $cookie"
```

### 3. Busca Avançada de Produtos

```powershell
# POST - Busca com filtros múltiplos
curl -X POST "http://localhost:9000/admin/internal/products" `
  -H "Content-Type: application/json" `
  -H "Cookie: $cookie" `
  -d '{
    "q": "painel",
    "category_ids": ["cat_solar"],
    "status": ["published"],
    "sort_by": "created_at",
    "sort_order": "DESC",
    "limit": 50
  }'
```

### 4. Gerenciar Imagens

#### Anexar Imagem (URL direta)

```powershell
curl -X POST "http://localhost:9000/admin/internal/products/prod_01234/images" `
  -H "Content-Type: application/json" `
  -H "Cookie: $cookie" `
  -d '{
    "files": [
      {
        "url": "https://example.com/solar-panel-front.jpg",
        "alt": "Painel Solar Frente"
      },
      {
        "url": "https://example.com/solar-panel-back.jpg",
        "alt": "Painel Solar Verso"
      }
    ],
    "attachTo": "product"
  }'
```

#### Reordenar Imagens

```powershell
curl -X PATCH "http://localhost:9000/admin/internal/products/prod_01234/images" `
  -H "Content-Type: application/json" `
  -H "Cookie: $cookie" `
  -d '{
    "reorder": [
      { "image_id": "img_001", "rank": 1 },
      { "image_id": "img_002", "rank": 0 },
      { "image_id": "img_003", "rank": 2 }
    ]
  }'
```

#### Remover Imagens

```powershell
curl -X DELETE "http://localhost:9000/admin/internal/products/prod_01234/images" `
  -H "Content-Type: application/json" `
  -H "Cookie: $cookie" `
  -d '{
    "image_ids": ["img_001", "img_002"]
  }'
```

### 5. Upload com Pré-assinatura S3

```powershell
# Passo 1: Obter URL pré-assinada
$presign = curl -X POST "http://localhost:9000/admin/internal/media/presign" `
  -H "Content-Type: application/json" `
  -H "Cookie: $cookie" `
  -d '{
    "filename": "solar-panel-400w.jpg",
    "contentType": "image/jpeg"
  }' | ConvertFrom-Json

# Passo 2: Upload direto ao S3
$file = [System.IO.File]::ReadAllBytes("C:\path\to\image.jpg")
Invoke-RestMethod -Uri $presign.data.url -Method POST -Body $file -ContentType "image/jpeg"

# Passo 3: Anexar ao produto usando file_url
curl -X POST "http://localhost:9000/admin/internal/products/prod_01234/images" `
  -H "Content-Type: application/json" `
  -H "Cookie: $cookie" `
  -d "{
    \"files\": [{
      \"url\": \"$($presign.data.file_url)\",
      \"alt\": \"Painel Solar 400W\"
    }]
  }"
```

### 6. Rota Store Pública (com publishable key)

```powershell
# Obter publishable key no Admin → Configurações → Chaves de API Publicáveis
$pk = "pk_01234567890"

# GET produto por handle
curl -X GET "http://localhost:9000/store/internal/products/solar-panel-400w" `
  -H "x-publishable-api-key: $pk"
```

---

## 🎨 Testes Frontend (React Hooks)

### 1. Criar Componente de Teste

```typescript
// storefront/src/app/test-products/page.tsx
"use client"

import { useInternalProducts } from "@/hooks/use-products"
import { useAttachImages, usePresignedUpload } from "@/hooks/use-product-images"
import { buildThumbnail } from "@/lib/utils/images"

export default function TestProductsPage() {
  // Hook de listagem
  const { data, meta, isLoading, error, refetch } = useInternalProducts("solar", 0, 10)

  // Hook de upload
  const { upload, isLoading: uploading } = usePresignedUpload()
  const { mutate: attach } = useAttachImages("prod_01234")

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const url = await upload(file)
      if (url) {
        await attach({ files: [{ url, alt: file.name }] })
      }
    }

    refetch()
  }

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error.message}</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Produtos Internos</h1>

      {/* Upload */}
      <div className="mb-8">
        <input type="file" multiple onChange={handleUpload} disabled={uploading} />
        {uploading && <span>Enviando...</span>}
      </div>

      {/* Listagem */}
      <div className="grid grid-cols-3 gap-4">
        {data.map(product => (
          <div key={product.id} className="border p-4 rounded">
            {product.images[0] && (
              <img
                src={buildThumbnail(product.images[0].url, "md")}
                alt={product.images[0].alt || product.title}
                className="w-full h-48 object-cover mb-2"
              />
            )}
            <h3 className="font-bold">{product.title}</h3>
            <p className="text-sm text-gray-600">{product.images.length} imagens</p>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {meta && (
        <div className="mt-4 text-center text-sm">
          Página {Math.floor(meta.offset / meta.limit) + 1} de {meta.total_pages}
          <span className="ml-4">Total: {meta.count} produtos</span>
        </div>
      )}
    </div>
  )
}
```

### 2. Acessar Página de Teste

```powershell
# Abrir navegador
Start-Process "http://localhost:8000/test-products"
```

### 3. Testar Funcionalidades

1. **Listagem**: Verifica se produtos aparecem com imagens
2. **Upload**: Seleciona arquivos e verifica upload
3. **Thumbnails**: Verifica se imagens são otimizadas
4. **Paginação**: Verifica se meta.total_pages está correto

---

## 🧪 Testes Automatizados

### Backend (Jest)

```typescript
// backend/src/api/admin/internal/products/__tests__/route.test.ts
import { describe, it, expect, beforeAll } from "@jest/globals"
import request from "supertest"

describe("GET /admin/internal/products", () => {
  let adminCookie: string

  beforeAll(async () => {
    // Login admin
    const res = await request("http://localhost:9000")
      .post("/auth/user/emailpass")
      .send({ email: "admin@test.com", password: "supersecret" })
    
    adminCookie = res.headers["set-cookie"][0]
  })

  it("should list products", async () => {
    const res = await request("http://localhost:9000")
      .get("/admin/internal/products?limit=10")
      .set("Cookie", adminCookie)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.items).toBeInstanceOf(Array)
    expect(res.body.meta).toHaveProperty("count")
    expect(res.body.meta).toHaveProperty("total_pages")
  })

  it("should search products", async () => {
    const res = await request("http://localhost:9000")
      .get("/admin/internal/products?q=solar")
      .set("Cookie", adminCookie)

    expect(res.status).toBe(200)
    expect(res.body.data.items.length).toBeGreaterThan(0)
  })

  it("should return images ordered by rank", async () => {
    const res = await request("http://localhost:9000")
      .get("/admin/internal/products")
      .set("Cookie", adminCookie)

    const product = res.body.data.items[0]
    if (product.images.length > 1) {
      for (let i = 1; i < product.images.length; i++) {
        expect(product.images[i].rank).toBeGreaterThanOrEqual(product.images[i-1].rank)
      }
    }
  })
})
```

### Frontend (Jest + React Testing Library)

```typescript
// storefront/src/hooks/__tests__/use-products.test.ts
import { renderHook, waitFor } from "@testing-library/react"
import { useInternalProducts } from "@/hooks/use-products"

describe("useInternalProducts", () => {
  it("should fetch products", async () => {
    const { result } = renderHook(() => useInternalProducts("solar", 0, 10))

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data.length).toBeGreaterThan(0)
    expect(result.current.meta).toHaveProperty("count")
  })

  it("should handle errors", async () => {
    const { result } = renderHook(() => useInternalProducts("", 0, 10))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Se não houver produtos, erro será null
    // Se houver erro de rede, error será Error
    expect(result.current.error).toBeNull()
  })
})
```

---

## 📊 Validação de Respostas

### Estrutura Esperada - GET /admin/internal/products

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "prod_01234",
        "title": "Painel Solar 400W",
        "handle": "painel-solar-400w",
        "description": "...",
        "thumbnail": "https://...",
        "images": [
          {
            "id": "img_001",
            "url": "https://...",
            "alt": "Frente",
            "rank": 0
          },
          {
            "id": "img_002",
            "url": "https://...",
            "alt": "Verso",
            "rank": 1
          }
        ],
        "variants": [...],
        "categories": [...]
      }
    ]
  },
  "meta": {
    "count": 150,
    "limit": 10,
    "offset": 0,
    "total_pages": 15
  }
}
```

### Estrutura Esperada - POST /admin/internal/products/:id/images

```json
{
  "success": true,
  "data": {
    "attached": 2
  }
}
```

### Estrutura Esperada - Erro

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found"
  }
}
```

---

## 🔍 Troubleshooting

### ❌ Erro: "x-publishable-api-key header is required"

**Causa**: Rota `/store/**` sem publishable key

**Solução**:

```powershell
# Obter key no Admin → Configurações → Chaves de API Publicáveis
curl -X GET "http://localhost:9000/store/internal/products/handle" `
  -H "x-publishable-api-key: pk_YOUR_KEY"
```

### ❌ Erro: "Property 'updateProducts' does not exist"

**Causa**: Tipagem incompleta do Product Module

**Solução**: Usar `@ts-expect-error` ou atualizar `@medusajs/types`

### ❌ Erro: "Circuit breaker is OPEN"

**Causa**: Muitas falhas consecutivas

**Solução**: Aguardar timeout (60s) ou reiniciar backend

### ❌ Imagens não ordenadas por rank

**Causa**: `.sort()` não aplicado

**Solução**: Verificar se todas as rotas implementam:

```typescript
images: (p.images ?? []).sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
```

---

## ✅ Checklist de Testes

### Backend

- [ ] GET /admin/internal/products retorna lista
- [ ] GET com query `?q=` filtra corretamente
- [ ] POST /admin/internal/products com filtros avançados
- [ ] POST /admin/internal/products/:id/images anexa imagens
- [ ] PATCH .../images reordena por rank
- [ ] DELETE .../images remove corretamente
- [ ] POST /admin/internal/media/presign retorna URL S3
- [ ] GET /store/internal/products/:handle requer publishable key
- [ ] Imagens sempre ordenadas por rank (crescente)
- [ ] Erros retornam formato padrão `{ success: false, error: {...} }`

### Frontend

- [ ] useInternalProducts retorna dados e meta
- [ ] useSearchInternalProducts aceita filtros
- [ ] useAttachImages anexa com sucesso
- [ ] useReorderImages atualiza ranks
- [ ] useRemoveImages deleta
- [ ] usePresignedUpload faz upload direto
- [ ] buildImageUrl gera URLs com params
- [ ] buildThumbnail usa presets corretos
- [ ] resilientFetch faz retry em falhas
- [ ] cachedFetch respeita TTL

---

**Última atualização:** 13 de Janeiro de 2025  
**Status:** ✅ Completo
