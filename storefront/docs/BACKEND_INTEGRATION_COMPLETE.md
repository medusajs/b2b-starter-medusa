# Backend Integration Summary - Catalog API Routes

## Overview

All catalog API routes in the storefront now integrate with the backend's `/store/internal-catalog` endpoints with automatic fallback to local JSON files when the backend is unavailable.

## Integration Pattern

Each route follows this pattern:

1. **Try Backend First**: Attempt to fetch from `BACKEND_URL/store/internal-catalog/[endpoint]`
2. **Timeout Protection**: 10-second timeout with AbortController
3. **Automatic Fallback**: On failure, use local JSON files from `ysh-erp/data/catalog/unified_schemas/`
4. **Response Flag**: All responses include `fromBackend: true/false` flag
5. **Cache Headers**: Appropriate cache control for each endpoint type

## Updated Routes

### 1. `/api/catalog/products` ✅

- **Backend**: `/store/internal-catalog/[category]`
- **Fallback**: Local category JSON files
- **Features**: Filters, search, pagination
- **Cache**: 1 hour

### 2. `/api/catalog/kits` ✅

- **Backend**: `/store/internal-catalog/kits`
- **Fallback**: Local kits_unified.json
- **Features**: Power range, type, roof type filters
- **Cache**: 1 hour

### 3. `/api/catalog/search` ✅

- **Backend**: `/store/internal-catalog/search`
- **Fallback**: Local multi-file search with relevance scoring
- **Features**: Cross-category search, distributor filter
- **Cache**: 30 minutes

### 4. `/api/catalog/categories` ✅

- **Backend**: `/store/internal-catalog/categories`
- **Fallback**: Local category stats calculation
- **Features**: Product counts, price ranges, distributor lists
- **Cache**: 2 hours

### 5. `/api/catalog/featured` ✅

- **Backend**: `/store/internal-catalog/featured`
- **Fallback**: Local featured selection logic
- **Features**: Category filtering, kit inclusion
- **Cache**: 1 hour

### 6. `/api/catalog/product/[id]` ✅

- **Backend**: `/store/internal-catalog/product/[id]`
- **Fallback**: Local product search across categories
- **Features**: Related products, category hint
- **Cache**: 1 hour

### 7. `/api/catalog/kit/[id]` ✅

- **Backend**: `/store/internal-catalog/kit/[id]`
- **Fallback**: Local kit lookup with component resolution
- **Features**: Component details, related kits
- **Cache**: 1 hour

### 8. `/api/catalog/distributors` ✅

- **Backend**: `/store/internal-catalog/distributors`
- **Fallback**: Local distributor aggregation
- **Features**: Stats, sample products, price ranges
- **Cache**: 2 hours

## New Routes Created

### 9. `/api/catalog/health` ✅

- **Backend**: `/store/internal-catalog/health`
- **Purpose**: System health monitoring
- **Returns**: Backend status, local catalog availability
- **Cache**: None (always fresh)

### 10. `/api/catalog/preload` ✅

- **Backend**: `/store/internal-catalog/preload`
- **Purpose**: Critical data for initial page loads
- **Returns**: Categories, stats, featured data
- **Cache**: 30 minutes

### 11. `/api/catalog/images/[sku]` ✅

- **Backend**: `/store/internal-catalog/images/[sku]`
- **Purpose**: Product image URLs by SKU
- **Fallback**: Local IMAGE_MAP.json
- **Features**: Format (json/redirect), size selection
- **Cache**: 24 hours

## Configuration

### Environment Variables Required

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your_key_here
```

### Backend Endpoints Expected

All endpoints should be under `/store/internal-catalog/`:

- `GET /store/internal-catalog/[category]` - Category products
- `GET /store/internal-catalog/kits` - Kit listings
- `GET /store/internal-catalog/search` - Global search
- `GET /store/internal-catalog/categories` - Category metadata
- `GET /store/internal-catalog/featured` - Featured products
- `GET /store/internal-catalog/product/[id]` - Product detail
- `GET /store/internal-catalog/kit/[id]` - Kit detail
- `GET /store/internal-catalog/distributors` - Distributor list
- `GET /store/internal-catalog/health` - Health check
- `GET /store/internal-catalog/preload` - Preload data
- `GET /store/internal-catalog/images/[sku]` - Product images

## Response Format

All endpoints return:

```typescript
{
  success: boolean
  data: any
  fromBackend: boolean  // NEW: indicates data source
  timestamp: string
  error?: string        // on failure
  message?: string      // on failure
}
```

## Error Handling

- Network timeouts (10s) → Fallback
- HTTP errors (4xx, 5xx) → Fallback
- Backend offline → Fallback
- Missing publishable key → Still attempts connection
- Local file errors → Returns empty arrays/objects

## Performance Optimizations

1. **In-Memory Caching**: Each route caches results in memory
2. **ISR Caching**: Next.js revalidation strategies
3. **Parallel Requests**: Uses Promise.all where applicable
4. **Timeout Protection**: Prevents hanging requests
5. **Graceful Degradation**: Always returns valid responses

## Testing Recommendations

1. Test with backend online
2. Test with backend offline (fallback)
3. Test with slow backend (timeout behavior)
4. Test cache invalidation
5. Test query parameter combinations
6. Verify `fromBackend` flag accuracy

## Next Steps

To complete the integration:

1. Implement CDN routes if needed (`/cdn/[category]/[filename]`)
2. Add monitoring/logging for fallback usage
3. Add metrics for backend vs fallback ratio
4. Implement cache warming on deployment
5. Add admin UI to force cache refresh

## Usage in Components

```typescript
import { fetchProducts, fetchKits } from '@/lib/api/catalog-client'

// Automatically uses backend with fallback
const products = await fetchProducts({ 
  category: 'panels', 
  limit: 12 
})
```

## Status Monitoring

Check system health:

```bash
curl http://localhost:3000/api/catalog/health
```

Response:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "backend": "online",
    "localCatalog": "available",
    "backendUrl": "http://localhost:9000",
    "timestamp": "2025-10-13T..."
  }
}
```

---
**Integration Complete**: All 11 catalog API routes now support backend integration with automatic fallback to local data sources.
