# 🚀 YSH Data Pipeline - Full Stack FOSS Infrastructure

**Complete local development environment with Docker Compose**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/ysh)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-20.10+-blue.svg)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-14+-336791.svg)](https://www.postgresql.org/)
[![Airflow](https://img.shields.io/badge/airflow-2.7+-017cee.svg)](https://airflow.apache.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Stack Components](#stack-components)
- [Quick Start](#quick-start)
- [Services & Ports](#services--ports)
- [Configuration](#configuration)
- [Usage](#usage)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

---

## 🎯 Overview

**YSH Data Pipeline** é uma infraestrutura completa de dados para ingestão, processamento e análise de dados do setor de energia solar brasileiro. Inclui:

- ✅ **14 serviços containerizados** (PostgreSQL, Redis, Airflow, Grafana, etc.)
- ✅ **Automação completa** com Airflow DAGs
- ✅ **Monitoring stack** com Prometheus + Grafana
- ✅ **Multi-layer caching** (Redis → DynamoDB → PostgreSQL)
- ✅ **Semantic search** com Qdrant vector database
- ✅ **Object storage** com MinIO (S3-compatible)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT REQUESTS                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                             │
│                      YSH API (Port 8888)                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
┌─────────────────┐  ┌──────────┐  ┌──────────────┐
│  CACHE LAYER    │  │ NOSQL DB │  │   STORAGE    │
│  Redis (6379)   │  │ DynamoDB │  │ MinIO (9000) │
│                 │  │  (8000)  │  │              │
└─────────────────┘  └──────────┘  └──────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PRIMARY DATABASE                           │
│                 PostgreSQL + PostGIS (5432)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  ANEEL   │  │ PRODUCTS │  │ PIPELINE │  │  AUDIT   │       │
│  │  Schema  │  │  Schema  │  │  Schema  │  │  Schema  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VECTOR DATABASE                              │
│                   Qdrant (6333/6334)                            │
│                   Semantic Search                               │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   WORKFLOW ORCHESTRATION                        │
│                   Apache Airflow (8080)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Scheduler  │  │   Webserver  │  │    Worker    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MONITORING STACK                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Prometheus  │→ │   Grafana    │  │   Exporters  │         │
│  │    (9090)    │  │    (3000)    │  │ (various)    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Stack Components

### **Core Services**

| Service | Version | Port | Purpose |
|---------|---------|------|---------|
| **PostgreSQL** | 14+ | 5432 | Primary database with PostGIS |
| **Redis** | 7 | 6379 | Cache layer + session store |
| **DynamoDB Local** | Latest | 8000 | NoSQL database for metadata |
| **MinIO** | Latest | 9000, 9001 | S3-compatible object storage |
| **Qdrant** | Latest | 6333, 6334 | Vector database for semantic search |

### **Orchestration**

| Service | Version | Port | Purpose |
|---------|---------|------|---------|
| **Airflow Webserver** | 2.7.3 | 8080 | DAG management UI |
| **Airflow Scheduler** | 2.7.3 | - | Task scheduling |
| **Airflow Worker** | 2.7.3 | - | Task execution |
| **Airflow Flower** | 2.7.3 | 5555 | Celery monitoring |

### **Monitoring**

| Service | Version | Port | Purpose |
|---------|---------|------|---------|
| **Prometheus** | Latest | 9090 | Metrics collection |
| **Grafana** | Latest | 3000 | Visualization dashboards |
| **Postgres Exporter** | Latest | 9187 | PostgreSQL metrics |
| **Redis Exporter** | Latest | 9121 | Redis metrics |
| **cAdvisor** | Latest | 8081 | Container metrics |
| **Node Exporter** | Latest | 9100 | Host metrics |

### **Application**

| Service | Port | Purpose |
|---------|------|---------|
| **YSH API** | 8888 | REST API service |
| **YSH Worker** | - | Background task processor |

---

## 🚀 Quick Start

### **Prerequisites**

- Docker Desktop 20.10+ (Windows/Mac) or Docker Engine 20.10+ (Linux)
- Docker Compose 2.0+
- PowerShell 5.1+ (Windows)
- 8GB+ RAM available
- 20GB+ disk space

### **Installation**

1. **Clone repository** (if not already done)

   ```powershell
   git clone https://github.com/your-org/ysh-pipeline.git
   cd ysh-pipeline/data-pipeline
   ```

2. **Initialize environment**

   ```powershell
   # Create .env file
   Copy-Item .env.example .env
   
   # Edit with your settings
   notepad .env
   ```

3. **Start all services**

   ```powershell
   # Start stack (first time will download images)
   docker-compose up -d
   
   # Check status
   docker-compose ps
   
   # View logs
   docker-compose logs -f
   ```

4. **Initialize databases**

   ```powershell
   # Wait for PostgreSQL to be ready (check logs)
   docker-compose logs -f postgres
   
   # Run migrations
   docker-compose exec postgres psql -U ysh_admin -d ysh_pipeline -f /docker-entrypoint-initdb.d/01-schema.sql
   
   # Verify tables created
   docker-compose exec postgres psql -U ysh_admin -d ysh_pipeline -c "\dt aneel.*"
   ```

5. **Populate test data**

   ```powershell
   # Copy migration script to container
   docker cp SQL-MIGRATION.py ysh-api:/app/
   
   # Run migration
   docker-compose exec ysh-api python SQL-MIGRATION.py test --pg-host postgres
   ```

6. **Access services**
   - 🌐 **Airflow**: <http://localhost:8080> (admin/admin_2025)
   - 📊 **Grafana**: <http://localhost:3000> (admin/grafana_2025)
   - 📈 **Prometheus**: <http://localhost:9090>
   - 🗄️ **MinIO Console**: <http://localhost:9001> (ysh_admin/ysh_minio_2025)
   - 🔍 **Qdrant Dashboard**: <http://localhost:6333/dashboard>
   - 🌸 **Flower (Celery)**: <http://localhost:5555>
   - 🚀 **YSH API**: <http://localhost:8888/docs>

---

## 🔌 Services & Ports

### **Main Services**

| Service | URL | Credentials |
|---------|-----|-------------|
| Airflow | <http://localhost:8080> | admin / admin_2025 |
| Grafana | <http://localhost:3000> | admin / grafana_2025 |
| Prometheus | <http://localhost:9090> | - |
| MinIO Console | <http://localhost:9001> | ysh_admin / ysh_minio_2025 |
| Qdrant | <http://localhost:6333> | - |
| YSH API | <http://localhost:8888> | - |

### **Database Connections**

**PostgreSQL**

```bash
Host: localhost
Port: 5432
Database: ysh_pipeline
User: ysh_admin
Password: ysh_secure_2025
```

**Redis**

```bash
Host: localhost
Port: 6379
Password: ysh_redis_2025
DB: 0
```

**DynamoDB Local**

```bash
Endpoint: http://localhost:8000
Region: us-east-1
Access Key: test
Secret Key: test
```

---

## ⚙️ Configuration

### **Environment Variables**

Create `.env` file:

```bash
# PostgreSQL
POSTGRES_DB=ysh_pipeline
POSTGRES_USER=ysh_admin
POSTGRES_PASSWORD=ysh_secure_2025

# Redis
REDIS_PASSWORD=ysh_redis_2025

# MinIO
MINIO_ROOT_USER=ysh_admin
MINIO_ROOT_PASSWORD=ysh_minio_2025

# Airflow
AIRFLOW_ADMIN_USER=admin
AIRFLOW_ADMIN_PASSWORD=admin_2025

# Grafana
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=grafana_2025

# Application
YSH_API_PORT=8888
YSH_LOG_LEVEL=INFO
```

### **Resource Limits**

Edit `docker-compose.yml` to adjust resource limits:

```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

---

## 📖 Usage

### **Common Commands**

```powershell
# Start stack
docker-compose up -d

# Stop stack
docker-compose down

# Restart service
docker-compose restart <service-name>

# View logs
docker-compose logs -f <service-name>

# Execute command in container
docker-compose exec <service-name> <command>

# Scale workers
docker-compose up -d --scale airflow-worker=3

# Update single service
docker-compose up -d --no-deps --build <service-name>
```

### **Database Operations**

```powershell
# Connect to PostgreSQL
docker-compose exec postgres psql -U ysh_admin -d ysh_pipeline

# Backup database
docker-compose exec postgres pg_dump -U ysh_admin ysh_pipeline > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U ysh_admin ysh_pipeline

# Connect to Redis
docker-compose exec redis redis-cli -a ysh_redis_2025

# DynamoDB operations
aws dynamodb list-tables --endpoint-url http://localhost:8000 --region us-east-1
```

### **Airflow DAGs**

```powershell
# List DAGs
docker-compose exec airflow-webserver airflow dags list

# Trigger DAG
docker-compose exec airflow-webserver airflow dags trigger ysh_aneel_daily_ingestion

# Test task
docker-compose exec airflow-webserver airflow tasks test ysh_aneel_daily_ingestion fetch_rss_feeds 2025-10-14
```

---

## 📊 Monitoring

### **Grafana Dashboards**

1. **Access**: <http://localhost:3000>
2. **Login**: admin / grafana_2025
3. **Dashboards**: Navigate to "YSH Pipeline" folder

**Available Dashboards:**

- **Overview**: High-level metrics
- **PostgreSQL**: Database performance
- **Redis**: Cache statistics
- **Airflow**: DAG execution metrics
- **API**: Request/response metrics

### **Prometheus Metrics**

Access: <http://localhost:9090>

**Key Metrics:**

```promql
# PostgreSQL connections
pg_stat_activity_count

# Redis memory usage
redis_memory_used_bytes / redis_memory_max_bytes

# API request rate
rate(http_requests_total[5m])

# API latency (p95)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### **Alerts**

Configured alerts in `infrastructure/prometheus/alerts.yml`:

- Database down
- High connections
- High memory usage
- API errors
- DAG failures

---

## 🐛 Troubleshooting

### **Common Issues**

**1. Port already in use**

```powershell
# Find process using port
netstat -ano | findstr :5432

# Stop process or change port in docker-compose.yml
```

**2. Container won't start**

```powershell
# Check logs
docker-compose logs <service-name>

# Rebuild image
docker-compose build --no-cache <service-name>
docker-compose up -d <service-name>
```

**3. PostgreSQL connection refused**

```powershell
# Wait for PostgreSQL to initialize (first start takes ~30s)
docker-compose logs -f postgres

# Check health
docker-compose exec postgres pg_isready -U ysh_admin
```

**4. Airflow webserver not accessible**

```powershell
# Check if database migration completed
docker-compose logs airflow-webserver | Select-String "migration"

# Restart webserver
docker-compose restart airflow-webserver
```

**5. Out of disk space**

```powershell
# Clean up unused Docker resources
docker system prune -a --volumes

# Remove old logs
docker-compose exec postgres find /var/log -name "*.log" -type f -mtime +7 -delete
```

### **Health Checks**

```powershell
# Check all services
docker-compose ps

# Test PostgreSQL
docker-compose exec postgres psql -U ysh_admin -d ysh_pipeline -c "SELECT 1"

# Test Redis
docker-compose exec redis redis-cli -a ysh_redis_2025 ping

# Test API
curl http://localhost:8888/health
```

---

## 👨‍💻 Development

### **Project Structure**

```
data-pipeline/
├── docker-compose.yml           # Main orchestration file
├── Dockerfile.api               # API service image
├── Dockerfile.worker            # Worker service image
├── SQL-SCHEMA-POSTGRESQL.sql    # Database schema
├── SQL-MIGRATION.py             # Data migration script
├── requirements.txt             # Python dependencies
├── infrastructure/              # Infrastructure configs
│   ├── postgres/
│   │   └── postgresql.conf
│   ├── redis/
│   │   └── redis.conf
│   ├── prometheus/
│   │   ├── prometheus.yml
│   │   └── alerts.yml
│   └── grafana/
│       ├── provisioning/
│       └── dashboards/
└── workflows/
    └── dags/                    # Airflow DAGs
        ├── aneel_daily_ingestion.py
        └── product_scraping_weekly.py
```

### **Building Custom Images**

```powershell
# Build API image
docker-compose build ysh-api

# Build worker image
docker-compose build ysh-worker

# Build and start
docker-compose up -d --build
```

### **Adding New Services**

1. Edit `docker-compose.yml`
2. Add service configuration
3. Update `infrastructure/prometheus/prometheus.yml` for monitoring
4. Add Grafana dashboard if needed

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📞 Support

- 📧 Email: <support@ysh.com>
- 💬 Slack: #ysh-pipeline
- 📖 Docs: <https://docs.ysh.com>

---

**Made with ❤️ by YSH Team**
