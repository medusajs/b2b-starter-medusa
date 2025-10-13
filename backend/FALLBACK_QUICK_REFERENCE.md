# 📚 Fallback System - Quick Reference Index

## 🚀 Quick Start

```bash
# 1. Generate data
node scripts/generate-fallback-data.js

# 2. Validate images
node scripts/validate-image-paths.js

# 3. Start TypeScript API (Medusa)
npm start

# 4. Start FastAPI (Python)
python fallback_api.py
```

## 📁 File Locations

### Data Files

- **CSV/JSON/JSON-LD**: `data/catalog/fallback_exports/`
- **Master Files**: `products_master.{csv,json,jsonld}`
- **Validation Report**: `image_validation_report.json`

### APIs

- **TypeScript**: `src/api/store/fallback/`
- **Python**: `fallback_api.py`

### Scripts

- **Generator**: `scripts/generate-fallback-data.js`
- **Validator**: `scripts/validate-image-paths.js`

## 🔗 API Endpoints

### TypeScript (Port 9000)

```
GET /store/fallback/products
GET /store/fallback/products/:category
GET /store/fallback/products/:category/:id
```

### FastAPI (Port 8000)

```
GET /api/v1/health
GET /api/v1/products
GET /api/v1/products/{category}
GET /api/v1/products/{category}/{product_id}
GET /api/v1/categories
GET /docs  # Interactive documentation
```

## 📊 Coverage Stats

- **Total Products**: 1,123
- **Valid Images**: 421 (37.49%)
- **Categories**: 12
- **Files Generated**: 39 (13 CSV + 13 JSON + 13 JSON-LD)

## 📖 Documentation

- **Complete Report**: `FALLBACK_COVERAGE_360_REPORT.md`
- **Implementation Summary**: `FALLBACK_IMPLEMENTATION_SUMMARY.md`
- **This Index**: `FALLBACK_QUICK_REFERENCE.md`

## ✅ Status

**Production Ready** - October 13, 2025
