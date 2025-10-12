# Internal Catalog API Documentation

## Overview

API de catálogo interno otimizada para alta performance com ~100 produtos por categoria, sincronização garantida de imagens e cache em memória.

**Base URL**: `/store/internal-catalog`

## Features

- ✅ **Pre-loaded Images**: 861 imagens mapeadas para 854 SKUs
- ✅ **In-Memory Cache**: Cache LRU com hit rate tracking
- ✅ **Optimized Pagination**: Até 200 produtos por request
- ✅ **Sub-50ms Response**: Performance garantida com cache
- ✅ **Independent Loading**: Preload worker independente do backend
- ✅ **CDN Integration**: Servidor de imagens estáticas com cache headers

## Categories

Total: **12 categorias**

```json
[
  "accessories",
  "batteries",
  "cables",
  "controllers",
  "ev_chargers",
  "inverters",
  "kits",
  "others",
  "panels",
  "posts",
  "stringboxes",
  "structures"
]
```

## Endpoints

### 1. Catalog Overview

```http
GET /store/internal-catalog
```

**Response:**
```json
{
  "version": "1.0.0",
  "status": "operational",
  "categories": ["accessories", "batteries", ...],
  "total_categories": 12,
  "total_products": 1161,
  "total_with_images": 854,
  "image_coverage": "73.56%",
  "cache": {
    "size": 524288,
    "entries": 12,
    "hit_rate": "94.23%",
    "total_hits": 156,
    "total_misses": 9
  },
  "features": [...]
}
```

### 2. Category Products

```http
GET /store/internal-catalog/:category?page=1&limit=100
```

**Parameters:**
- `category` (path): Category name
- `page` (query): Page number (default: 1)
- `limit` (query): Items per page (max: 200, default: 100)
- `manufacturer` (query): Filter by manufacturer
- `minPrice` (query): Minimum price in BRL
- `maxPrice` (query): Maximum price in BRL
- `hasImage` (query): Filter products with images (boolean)

**Example Request:**
```bash
curl "http://localhost:9000/store/internal-catalog/inverters?page=1&limit=100&hasImage=true"
```

**Response:**
```json
{
  "products": [
    {
      "id": "neosolar_inverters_22916",
      "sku": "neosolar_inverters_22916",
      "name": "Microinversor Deye SUN2250 G4",
      "manufacturer": "DEYE",
      "model": "SUN2250 G4",
      "category": "inverters",
      "price_brl": 1850.00,
      "image": {
        "url": "/static/images-catálogo_distribuidores/NEOSOLAR-INVERTERS/22916.jpg",
        "sizes": {
          "original": "/static/images-catálogo_distribuidores/NEOSOLAR-INVERTERS/22916.jpg",
          "thumb": "/static/images-catálogo_distribuidores/NEOSOLAR-INVERTERS/22916.jpg",
          "medium": "/static/images-catálogo_distribuidores/NEOSOLAR-INVERTERS/22916.jpg",
          "large": "/static/images-catálogo_distribuidores/NEOSOLAR-INVERTERS/22916.jpg"
        },
        "preloaded": true,
        "cached": true
      },
      "technical_specs": {
        "power_w": 2250,
        "type": "MICROINVERSOR",
        "voltage_v": 220,
        "phases": "Monofásico"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 490,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  },
  "stats": {
    "category": "inverters",
    "total_products": 490,
    "with_images": 341,
    "with_prices": 412,
    "manufacturers": ["DEYE", "EPEVER", "GROWATT", ...],
    "avg_price_brl": 3245.67,
    "min_price_brl": 890.00,
    "max_price_brl": 18500.00
  },
  "cache": {
    "hit": true,
    "age_seconds": 42,
    "preloaded": true
  },
  "performance": {
    "query_time_ms": 8,
    "image_load_time_ms": 170.5,
    "total_time_ms": 12
  }
}
```

### 3. Health Check

```http
GET /store/internal-catalog/health
```

**Response:**
```json
{
  "status": "healthy",
  "categories": {
    "inverters": {
      "category": "inverters",
      "total_products": 490,
      "with_images": 341,
      "with_prices": 412,
      "manufacturers": [...]
    }
  },
  "images": {
    "total_images": 861,
    "synced": 854,
    "missing": 7,
    "pending": 0,
    "errors": 0,
    "sync_time_ms": 245,
    "last_sync": "2025-10-12T18:10:39.340Z"
  },
  "cache": {
    "size": 524288,
    "entries": 12,
    "hit_rate": 0.9423
  },
  "uptime_seconds": 3600,
  "last_updated": "2025-10-12T20:00:00.000Z"
}
```

### 4. Preload Cache

```http
POST /store/internal-catalog/preload
Content-Type: application/json

{
  "categories": ["inverters", "panels", "kits"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preloaded 3 categories",
  "categories": ["inverters", "panels", "kits"],
  "total_products": 855,
  "total_with_images": 606,
  "load_time_ms": 1245,
  "cache": {
    "entries": 3,
    "size_bytes": 2458624,
    "hit_rate": "0.00%"
  },
  "performance": {
    "products_per_second": 687,
    "avg_time_per_category_ms": 415
  }
}
```

### 5. Image Info

```http
GET /store/internal-catalog/images/:sku
```

**Response:**
```json
{
  "sku": "neosolar_inverters_22916",
  "image": {
    "url": "/static/images-catálogo_distribuidores/NEOSOLAR-INVERTERS/22916.jpg",
    "sizes": { ... },
    "preloaded": true,
    "cached": true
  },
  "file_checks": [
    {
      "size": "original",
      "exists": true,
      "url": "/static/images-catálogo_distribuidores/NEOSOLAR-INVERTERS/22916.jpg"
    }
  ],
  "all_files_exist": true,
  "recommendations": {
    "use_cdn": true,
    "fallback_needed": false
  }
}
```

### 6. CDN Image Server

```http
GET /store/internal-catalog/cdn/:category/:filename
```

**Features:**
- Cache-Control: 1 year (immutable)
- ETag support
- 304 Not Modified responses
- Streaming file delivery

**Example:**
```bash
curl "http://localhost:9000/store/internal-catalog/cdn/NEOSOLAR-INVERTERS/22916.jpg"
```

## Preload Worker

Script independente para pré-carregar catálogo antes do backend iniciar:

```bash
cd backend
node scripts/preload-catalog.js
```

**Output:**
```
[0.00s] 🚀 Starting catalog preload...
[0.15s] 📸 Loading image map...
[0.18s] ✅ Loaded 861 images from 854 SKUs
[0.20s] 📦 Loading 12 categories...
[2.45s]
[2.45s] 📊 Preload Results:
[2.45s] ────────────────────────────────────────────────────────────────────────────────
[2.45s] ✅ accessories       6/17 (35.3% coverage)
[2.45s] ✅ batteries         3/9 (33.3% coverage)
[2.45s] ✅ cables           51/55 (92.7% coverage)
[2.45s] ✅ inverters       341/490 (69.6% coverage)
[2.45s] ✅ kits            247/336 (73.5% coverage)
[2.45s] ✅ panels           18/29 (62.1% coverage)
[2.45s] ────────────────────────────────────────────────────────────────────────────────
[2.45s] 📦 Total Products: 1161
[2.45s] 📸 With Images: 854 (73.6% coverage)
[2.45s] ⚡ Cache Entries: 12
[2.45s] ⏱️  Total Time: 2.45s
[2.45s] ────────────────────────────────────────────────────────────────────────────────
[2.46s] 💾 Saved preload report to ../data/catalog/preload-report.json
```

## Performance Benchmarks

### Cold Start (no cache)
- Category load: ~200ms
- 100 products: ~250ms
- Image mapping: ~50ms

### Warm Cache
- Category load: ~5ms
- 100 products: ~12ms
- Image mapping: <1ms

### CDN Performance
- First request: ~15ms
- Cached request (304): ~2ms
- Image streaming: ~8ms

## Integration Example

```typescript
// Frontend integration
async function loadProducts(category: string) {
  const response = await fetch(
    `/store/internal-catalog/${category}?page=1&limit=100&hasImage=true`
  );
  const data = await response.json();
  
  return {
    products: data.products,
    hasMore: data.pagination.has_next,
    performance: data.performance.total_time_ms
  };
}

// Preload on app start
async function preloadCatalog() {
  await fetch('/store/internal-catalog/preload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      categories: ['inverters', 'panels', 'kits']
    })
  });
}
```

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "context": { /* additional context */ }
}
```

**Status Codes:**
- `200`: Success
- `304`: Not Modified (cached images)
- `400`: Bad Request
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Monitoring

Use `/health` endpoint for monitoring:

```bash
# Check status
curl http://localhost:9000/store/internal-catalog/health | jq '.status'

# Monitor cache hit rate
curl http://localhost:9000/store/internal-catalog/health | jq '.cache.hit_rate'

# Check image sync status
curl http://localhost:9000/store/internal-catalog/health | jq '.images'
```

---

**Version**: 1.0.0  
**Last Updated**: October 12, 2025  
**Maintained by**: YSH B2B Development Team
