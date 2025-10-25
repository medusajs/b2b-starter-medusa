# Qdrant OSS - Quick Reference Guide

## 🚀 Quick Start

### Start Qdrant (Docker Compose)

```bash
# From project root
cd docker
docker-compose -f docker-compose.foss.yml up -d qdrant

# Check status
docker-compose -f docker-compose.foss.yml ps qdrant
docker-compose -f docker-compose.foss.yml logs -f qdrant
```

### Access Qdrant

- **Web Dashboard**: <http://localhost:6333/dashboard>
- **API Endpoint**: <http://localhost:6333>
- **gRPC Endpoint**: localhost:6334
- **API Key**: `qdrant_dev_key_foss_2025` (development)

### Environment Variables (.env)

```properties
QDRANT_API_KEY=qdrant_dev_key_foss_2025
QDRANT_URL=http://localhost:6333
```

---

## 🔍 API Examples

### 1. Health Check

```bash
curl http://localhost:6333/healthz
```

### 2. List Collections

```bash
curl -H "api-key: qdrant_dev_key_foss_2025" \
  http://localhost:6333/collections
```

### 3. Create Collection (Example: ysh-catalog)

```bash
curl -X PUT http://localhost:6333/collections/ysh-catalog \
  -H "api-key: qdrant_dev_key_foss_2025" \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 3072,
      "distance": "Cosine"
    },
    "optimizers_config": {
      "indexing_threshold": 20000
    },
    "hnsw_config": {
      "m": 16,
      "ef_construct": 100
    }
  }'
```

### 4. Insert Vector (Upsert)

```bash
curl -X PUT http://localhost:6333/collections/ysh-catalog/points \
  -H "api-key: qdrant_dev_key_foss_2025" \
  -H "Content-Type: application/json" \
  -d '{
    "points": [
      {
        "id": 1,
        "vector": [0.1, 0.2, 0.3, ...],
        "payload": {
          "product_id": "prod_123",
          "title": "Painel Solar 550W",
          "category": "panel"
        }
      }
    ]
  }'
```

### 5. Search Vectors

```bash
curl -X POST http://localhost:6333/collections/ysh-catalog/points/search \
  -H "api-key: qdrant_dev_key_foss_2025" \
  -H "Content-Type: application/json" \
  -d '{
    "vector": [0.1, 0.2, 0.3, ...],
    "limit": 10,
    "with_payload": true
  }'
```

### 6. Delete Collection

```bash
curl -X DELETE http://localhost:6333/collections/ysh-catalog \
  -H "api-key: qdrant_dev_key_foss_2025"
```

---

## 📊 Collections Schema (YSH B2B)

### Collection: `ysh-catalog`

**Purpose**: Product catalog embeddings (panels, inverters, batteries)

```json
{
  "vectors": {
    "size": 3072,  // OpenAI text-embedding-3-large
    "distance": "Cosine"
  },
  "payload_schema": {
    "product_id": "string",
    "handle": "string",
    "title": "string",
    "description": "string",
    "category": "string",
    "manufacturer": "string",
    "power_wp": "float",
    "voltage_v": "float",
    "price_brl": "float"
  }
}
```

### Collection: `ysh-regulations`

**Purpose**: ANEEL regulations and technical standards

```json
{
  "vectors": {
    "size": 3072,
    "distance": "Cosine"
  },
  "payload_schema": {
    "regulation_id": "string",
    "title": "string",
    "content": "string",
    "category": "string",
    "effective_date": "string",
    "source_url": "string"
  }
}
```

### Collection: `ysh-tariffs`

**Purpose**: Electricity tariffs by region and class

```json
{
  "vectors": {
    "size": 3072,
    "distance": "Cosine"
  },
  "payload_schema": {
    "tariff_id": "string",
    "state": "string",
    "utility": "string",
    "consumer_class": "string",
    "tariff_brl_kwh": "float",
    "tax_icms_percent": "float",
    "valid_from": "string",
    "valid_until": "string"
  }
}
```

### Collection: `ysh-technical`

**Purpose**: Technical specifications and installation guides

```json
{
  "vectors": {
    "size": 3072,
    "distance": "Cosine"
  },
  "payload_schema": {
    "doc_id": "string",
    "title": "string",
    "content": "string",
    "category": "string",
    "tags": ["string"],
    "version": "string"
  }
}
```

---

## 🛠️ Maintenance Commands

### View Logs

```bash
docker logs ysh-qdrant-foss -f
```

### Restart Qdrant

```bash
cd docker
docker-compose -f docker-compose.foss.yml restart qdrant
```

### Stop Qdrant

```bash
cd docker
docker-compose -f docker-compose.foss.yml stop qdrant
```

### Remove Qdrant (data persists in volume)

```bash
cd docker
docker-compose -f docker-compose.foss.yml down qdrant
```

### Remove Qdrant + Data (⚠️ CAUTION)

```bash
cd docker
docker-compose -f docker-compose.foss.yml down -v qdrant
```

### Backup Data

```bash
# Create backup directory
mkdir -p backups/qdrant

# Copy volume data
docker cp ysh-qdrant-foss:/qdrant/storage backups/qdrant/$(date +%Y%m%d_%H%M%S)
```

### Restore Data

```bash
# Stop Qdrant
docker-compose -f docker-compose.foss.yml stop qdrant

# Restore from backup
docker cp backups/qdrant/20250101_120000/storage ysh-qdrant-foss:/qdrant/

# Restart Qdrant
docker-compose -f docker-compose.foss.yml start qdrant
```

---

## 📈 Performance Tips

### Memory Usage

- **Small collections (<100k vectors)**: Default config OK
- **Medium collections (100k-1M)**: Enable `on_disk_payload: true`
- **Large collections (>1M)**: Enable `on_disk: true` for vectors

### Indexing

- **HNSW parameters**:
  - `m`: 16 (default) - Higher = better search, more memory
  - `ef_construct`: 100 (default) - Higher = better index, slower build

### Search Performance

- Use `limit` to reduce returned results
- Use `score_threshold` to filter low-quality matches
- Use `filter` to narrow search space

---

## 🔐 Security (Production)

### Change API Key

```bash
# In .env or docker-compose.foss.yml
QDRANT_API_KEY=YOUR_STRONG_RANDOM_KEY_HERE
```

### Enable TLS

Edit `infra/qdrant/config.yaml`:

```yaml
tls:
  enabled: true
  cert: /qdrant/tls/cert.pem
  key: /qdrant/tls/key.pem
```

### Network Isolation

```yaml
# In docker-compose.foss.yml
qdrant:
  networks:
    - ysh-foss-network  # Internal only
  # Remove ports: to block external access
```

---

## 📚 Resources

- **Official Docs**: <https://qdrant.tech/documentation/>
- **API Reference**: <https://qdrant.tech/documentation/interfaces/>
- **Docker Hub**: <https://hub.docker.com/r/qdrant/qdrant>
- **GitHub**: <https://github.com/qdrant/qdrant>

---

## ✅ Quick Validation

```bash
# 1. Check Qdrant is running
curl http://localhost:6333/healthz

# 2. List collections
curl -H "api-key: qdrant_dev_key_foss_2025" http://localhost:6333/collections

# 3. Check from backend
cd ../backend
yarn validate:api-keys
# Should show: ✅ QDRANT_API_KEY: qdrant_dev_key_foss_2025
```

---

**Last Updated**: 2025-10-13  
**Qdrant Version**: latest (OSS)  
**Status**: ✅ Ready for development
