# 🛡️ Sistema de APIs Resiliente - Guia de Implementação

## ✅ Arquivos Criados

### 1. Core APIs
- ✅ `src/lib/api/fallback.ts` (720 linhas)
  - Sistema de fallback com dados do catálogo unificado
  - Health monitoring do backend
  - Carrinho local com localStorage
  - Cache de produtos e imagens

- ✅ `src/lib/api/resilient.ts` (470 linhas)
  - Cliente API com retry automático
  - Circuit breaker pattern
  - Fallback transparente
  - Exponential backoff

### 2. API Routes
- ✅ `src/app/api/health/route.ts`
  - Endpoint de health check
  - Status do backend e fallback
  - Retorna JSON com métricas

### 3. Componentes UI
- ✅ `src/components/ui/offline-banner.tsx`
  - Banner de aviso quando offline
  - Botão de reconexão
  - Badge "Catálogo Local"

### 4. Documentação e Exemplos
- ✅ `src/lib/api/README.md` (documentação completa)
- ✅ `EXAMPLE_RESILIENT_PRODUCTS_PAGE.tsx` (exemplo de uso)

---

## 🚀 Como Usar

### Passo 1: Configurar Variáveis de Ambiente

Adicione ao `.env.local`:

```bash
# Backend Medusa URL
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Paths do catálogo (opcional - usa paths padrão se não definido)
CATALOG_PATH=../../../ysh-erp/data/catalog/unified_schemas
IMAGE_MAP_PATH=../../../ysh-erp/data/catalog/images/IMAGE_MAP.json
```

### Passo 2: Adicionar Banner de Offline no Layout

Edite `src/app/[countryCode]/(main)/layout.tsx`:

```tsx
import { OfflineBanner } from '@/components/ui/offline-banner'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OfflineBanner />
      <Nav />
      {children}
      <Footer />
    </>
  )
}
```

### Passo 3: Usar API Resiliente nas Páginas

#### Exemplo: Página de Produtos

```tsx
import { ResilientAPI } from '@/lib/api/resilient'
import { FallbackBadge } from '@/components/ui/offline-banner'

export default async function ProductsPage() {
  const response = await ResilientAPI.listProducts({
    category: 'inverters',
    limit: 12,
    fallback: true
  })
  
  const { data, fromFallback } = response
  
  return (
    <div>
      {fromFallback && <FallbackBadge />}
      
      {data?.products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

#### Exemplo: Detalhes de Produto

```tsx
import { ResilientAPI } from '@/lib/api/resilient'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const response = await ResilientAPI.getProduct(params.id)
  
  if (!response.data?.product) {
    return <div>Produto não encontrado</div>
  }
  
  return (
    <div>
      <h1>{response.data.product.title}</h1>
      {response.fromFallback && (
        <p className="text-amber-600">
          ⚠️ Dados do catálogo local (backend offline)
        </p>
      )}
    </div>
  )
}
```

### Passo 4: Testar Modo Offline

1. **Desligar o backend Medusa**:
```bash
# Parar container Docker
docker-compose stop backend

# OU parar processo Node
# Ctrl+C no terminal do backend
```

2. **Acessar o storefront**:
```bash
npm run dev
```

3. **Verificar comportamento**:
- ✅ Banner "Modo Offline Ativo" aparece no topo
- ✅ Produtos carregam do catálogo unificado
- ✅ Badges "Catálogo Local" aparecem nos produtos
- ✅ Botão "Reconectar" permite testar reconexão

4. **Religar o backend**:
```bash
docker-compose start backend
```

5. **Clicar "Reconectar"** no banner
- ✅ Banner desaparece
- ✅ Produtos voltam a vir do backend

---

## 📋 Checklist de Integração

### ✅ Obrigatório (Core)
- [ ] Configurar `.env.local` com `NEXT_PUBLIC_MEDUSA_BACKEND_URL`
- [ ] Adicionar `<OfflineBanner />` no layout principal
- [ ] Substituir fetch direto por `ResilientAPI` nas páginas de produtos
- [ ] Testar com backend offline

### ⚙️ Recomendado (Melhorias)
- [ ] Adicionar `FallbackBadge` em cards de produtos
- [ ] Desabilitar checkout quando em modo fallback
- [ ] Implementar sincronização de carrinho local → backend
- [ ] Adicionar métricas de fallback (DataDog, Sentry)

### 🎨 Opcional (UX)
- [ ] Customizar cores do banner offline
- [ ] Adicionar animação de reconexão
- [ ] Criar página de status do sistema (`/status`)
- [ ] Toast notification quando backend reconecta

---

## 🔧 Personalização

### Ajustar Timeouts

Edite `src/lib/api/resilient.ts`:

```typescript
const MAX_RETRIES = 3            // Tentativas antes de fallback
const RETRY_DELAY_MS = 1000      // Delay inicial (exponential)
const REQUEST_TIMEOUT_MS = 10000 // Timeout de requisição
```

### Customizar Banner Offline

Edite `src/components/ui/offline-banner.tsx`:

```tsx
// Mudar cores
<div className="bg-blue-50 border-b border-blue-200">
  
// Mudar texto
<p className="text-sm font-medium text-blue-900">
  Sistema em Manutenção
</p>
```

### Adicionar Mais Fallbacks

No `fallback.ts`, adicione novas funções:

```typescript
export async function fallbackSearchProducts(query: string) {
  const allCategories = await loadAllCategories()
  // ... implementar busca
}

export async function fallbackGetManufacturers() {
  // ... carregar do manufacturer_index.json
}
```

---

## 📊 Monitoramento

### Health Check Endpoint

```bash
# Verificar status do sistema
curl http://localhost:3000/api/health

# Response
{
  "healthy": true,
  "backend": {
    "online": true,
    "errorCount": 0
  },
  "fallback": {
    "available": true,
    "active": false
  }
}
```

### Logs no Console

Durante desenvolvimento, monitore os logs:

```
[Resilient] Retrying after 1000ms... (2 retries left)
[Resilient] Using fallback for listProducts
[Fallback] Loaded 489 products from inverters
```

### Adicionar Métricas (Produção)

```typescript
// Em resilient.ts
import { trackEvent } from '@/lib/analytics'

// Quando fallback é ativado
trackEvent('api.fallback.activated', {
  endpoint,
  reason: error.message
})

// Quando backend reconecta
trackEvent('api.backend.reconnected', {
  downtime: Date.now() - backendStatus.lastCheck.getTime()
})
```

---

## 🐛 Troubleshooting

### "Produtos não carregam no modo fallback"

**Causa**: Path do catálogo incorreto

**Solução**:
```bash
# Verificar se arquivo existe
ls ../../../ysh-erp/data/catalog/unified_schemas/inverters_unified.json

# Ajustar path no .env.local se necessário
CATALOG_PATH=/caminho/correto/para/unified_schemas
```

### "Banner offline não aparece"

**Causa**: `<OfflineBanner />` não adicionado ao layout

**Solução**: Adicione no layout principal (ver Passo 2)

### "Erro: Cannot read properties of undefined (reading 'products')"

**Causa**: Estrutura de resposta diferente entre backend e fallback

**Solução**: Use optional chaining:
```typescript
const products = response.data?.products || []
```

### "Fallback muito lento"

**Causa**: Arquivos JSON grandes sendo lidos a cada requisição

**Solução**: O sistema já usa `cache()` do React, mas você pode adicionar Redis:
```typescript
// Em fallback.ts
const redis = new Redis(process.env.REDIS_URL)

const loadCatalogCategory = cache(async (category: string) => {
  const cached = await redis.get(`catalog:${category}`)
  if (cached) return JSON.parse(cached)
  
  // ... carrega do arquivo
  await redis.setex(`catalog:${category}`, 3600, JSON.stringify(data))
  return data
})
```

---

## 🎯 Próximos Passos

1. **Curto Prazo** (Esta Semana):
   - [ ] Integrar nos produtos existentes
   - [ ] Testar com backend real
   - [ ] Deploy em staging

2. **Médio Prazo** (Próximo Sprint):
   - [ ] Implementar sincronização de carrinho
   - [ ] Adicionar Service Worker (PWA)
   - [ ] Métricas e alertas

3. **Longo Prazo** (Backlog):
   - [ ] Cache Redis para performance
   - [ ] Offline completo (instalável)
   - [ ] Sincronização em background

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique a documentação: `src/lib/api/README.md`
2. Consulte o exemplo: `EXAMPLE_RESILIENT_PRODUCTS_PAGE.tsx`
3. Revise os logs no console
4. Teste o health check: `GET /api/health`

---

**Sistema pronto para uso! 🎉**

O storefront agora continuará funcionando mesmo se o backend Medusa cair, proporcionando uma experiência resiliente e degradação graciosa para os usuários.
