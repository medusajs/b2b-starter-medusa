# YSH Data Pipeline API Gateway

FastAPI REST API + GraphQL for accessing processed Brazilian energy data.

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 2. Set Environment Variables

```powershell
$env:REDIS_HOST="localhost"
$env:REDIS_PORT="6379"
$env:DYNAMODB_TABLE="ysh-pipeline-cache"
$env:S3_BUCKET="ysh-pipeline-data"
$env:AWS_DEFAULT_REGION="us-east-1"
```

### 3. Run API Server

```powershell
# Development
uvicorn main:app --reload --port 8000

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 4. Access Documentation

```powershell
# OpenAPI docs
start http://localhost:8000/api/docs

# ReDoc
start http://localhost:8000/api/redoc
```

## 📡 API Endpoints

### Health Check

```http
GET /health

Response:
{
  "status": "healthy",
  "timestamp": "2025-01-15T12:00:00Z",
  "services": {
    "redis": "healthy",
    "dynamodb": "healthy"
  }
}
```

### Get Datasets

```http
GET /api/v1/datasets?limit=10&offset=0&source=aneel&category=energia_solar

Parameters:
- limit (1-100): Number of results
- offset (>=0): Pagination offset
- source: Filter by source (aneel, cpfl, enel, cemig)
- category: Filter by AI category

Response:
[
  {
    "id": "dataset-123",
    "title": "Tarifas de Energia Solar 2025",
    "description": "...",
    "published": "2025-01-15T10:00:00Z",
    "source": "aneel",
    "ai_metadata": {
      "categoria": "energia_solar",
      "palavras_chave": ["tarifa", "solar", "2025"],
      "resumo_curto": "...",
      "relevancia_ysh": 9
    }
  }
]
```

### Search Datasets

```http
POST /api/v1/search

Body:
{
  "query": "homologação inversor",
  "limit": 20,
  "category": "certificacao"
}

Response:
{
  "query": "homologação inversor",
  "results": [...],
  "count": 15,
  "timestamp": "2025-01-15T12:00:00Z"
}
```

### Get Status

```http
GET /api/v1/status

Response:
{
  "last_run": "2025-01-15T02:00:00Z",
  "datasets_count": 1247,
  "status": "operational",
  "next_run": "2025-01-16T02:00:00Z"
}
```

### Trigger Ingestion

```http
POST /api/v1/ingest

Response:
{
  "status": "triggered",
  "execution_arn": "arn:aws:states:...",
  "timestamp": "2025-01-15T12:00:00Z"
}
```

## 🔌 WebSocket

### Connect to Real-time Updates

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
  console.log('Connected to pipeline updates');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
};

// Receive messages:
{
  "type": "ingestion_started",
  "timestamp": "2025-01-15T12:00:00Z"
}

{
  "type": "ingestion_completed",
  "datasets_count": 1250,
  "timestamp": "2025-01-15T12:15:00Z"
}
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Build and Run

```powershell
docker build -t ysh-api-gateway .
docker run -p 8000:8000 --name ysh-api `
  -e REDIS_HOST=ysh-redis-cache `
  -e DYNAMODB_TABLE=ysh-pipeline-cache `
  ysh-api-gateway
```

## 🔐 Authentication (Production)

### Add JWT Middleware

```python
from fastapi import Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    # Verify JWT token
    # raise HTTPException(status_code=401) if invalid
    return decoded_user

# Use in routes:
@app.post("/api/v1/ingest")
async def trigger_ingestion(user = Depends(verify_token)):
    if not user.is_admin:
        raise HTTPException(status_code=403)
    # ...
```

## 📊 Rate Limiting

### Add rate limiter

```powershell
pip install slowapi
```

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/v1/datasets")
@limiter.limit("100/minute")
async def get_datasets(request: Request):
    # ...
```

## 🧪 Testing

### Unit Tests

```python
# test_api.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] in ["healthy", "degraded"]

def test_get_datasets():
    response = client.get("/api/v1/datasets?limit=5")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_search():
    response = client.post("/api/v1/search", json={
        "query": "solar",
        "limit": 10
    })
    assert response.status_code == 200
    assert "results" in response.json()
```

### Run Tests

```powershell
pip install pytest httpx
pytest test_api.py -v
```

## 📈 Monitoring

### Add Prometheus Metrics

```powershell
pip install prometheus-fastapi-instrumentator
```

```python
from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app)
```

### Access Metrics

```http
GET /metrics

# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/api/v1/datasets"} 1247
```

## 🚀 AWS Deployment

### Using Lambda + API Gateway

```powershell
pip install mangum
```

```python
# lambda_handler.py
from mangum import Mangum
from main import app

handler = Mangum(app, lifespan="off")
```

### Deploy

```powershell
# Create Lambda function
aws lambda create-function `
  --function-name ysh-api-gateway `
  --runtime python3.11 `
  --handler lambda_handler.handler `
  --zip-file fileb://function.zip
```

## 📚 Client Examples

### Python

```python
import requests

# Get datasets
response = requests.get(
    'http://localhost:8000/api/v1/datasets',
    params={'limit': 10, 'category': 'energia_solar'}
)
datasets = response.json()

# Search
response = requests.post(
    'http://localhost:8000/api/v1/search',
    json={'query': 'inversor', 'limit': 20}
)
results = response.json()
```

### JavaScript

```javascript
// Get datasets
const response = await fetch(
  'http://localhost:8000/api/v1/datasets?limit=10'
);
const datasets = await response.json();

// Search
const searchResponse = await fetch(
  'http://localhost:8000/api/v1/search',
  {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({query: 'solar', limit: 20})
  }
);
const results = await searchResponse.json();
```

### cURL

```bash
# Health check
curl http://localhost:8000/health

# Get datasets
curl "http://localhost:8000/api/v1/datasets?limit=5"

# Search
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query":"solar","limit":10}'
```

## 🔗 GraphQL Alternative

See `graphql/` directory for Hasura configuration.

---

**API Ready!** 🎯 Start building your frontend clients.
