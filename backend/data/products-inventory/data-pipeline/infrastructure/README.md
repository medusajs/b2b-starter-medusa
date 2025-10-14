# YSH Data Pipeline Infrastructure

Infrastructure as Code (IaC) for the Brazilian Energy Data Pipeline using OpenTofu/Terraform.

## 📋 Overview

This infrastructure deploys all required services for the real-time data pipeline:

- **Redis**: Caching layer for API responses
- **PostgreSQL**: Relational database for structured data
- **Ollama**: Local LLM service for AI processing
- **Qdrant**: Vector database for semantic search
- **Grafana**: Monitoring and visualization
- **Prometheus**: Metrics collection

## 🛠️ Prerequisites

### Required Software

1. **OpenTofu** (recommended) or **Terraform**:
   ```powershell
   # Install OpenTofu via Chocolatey (Windows)
   choco install opentofu
   
   # Or download from: https://opentofu.org/
   ```

2. **Docker Desktop**:
   ```powershell
   # Install Docker Desktop for Windows
   # Download from: https://www.docker.com/products/docker-desktop/
   
   # Verify installation
   docker --version
   docker ps
   ```

## 🚀 Quick Start

### 1. Initialize Infrastructure

```powershell
# Navigate to infrastructure directory
cd data-pipeline/infrastructure

# Initialize OpenTofu/Terraform
tofu init
# Or with Terraform:
# terraform init
```

### 2. Review Plan

```powershell
# See what will be created
tofu plan

# Review the output carefully
```

### 3. Deploy Infrastructure

```powershell
# Apply configuration
tofu apply

# Type 'yes' to confirm deployment
```

### 4. Verify Deployment

```powershell
# Check running containers
docker ps

# Expected containers:
# - ysh-redis-cache
# - ysh-postgres-db
# - ysh-ollama-service
# - ysh-qdrant-vectordb
# - ysh-grafana-monitoring
# - ysh-prometheus-metrics
```

## 📊 Service Access

After deployment, services are available at:

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| Redis | `localhost:6379` | No auth (local) |
| PostgreSQL | `localhost:5432` | User: `ysh_user`<br>Password: (see `main.tf`) |
| Ollama API | `http://localhost:11434` | No auth |
| Qdrant | `http://localhost:6333` | No auth (local) |
| Grafana | `http://localhost:3000` | User: `admin`<br>Password: (see `main.tf`) |
| Prometheus | `http://localhost:9090` | No auth |

## 🔧 Configuration

### Customizing Services

Edit `main.tf` to customize:

```hcl
# Example: Change Redis memory limit
resource "docker_container" "redis" {
  command = [
    "redis-server",
    "--maxmemory", "1gb",  # Changed from 512mb
    "--maxmemory-policy", "allkeys-lru"
  ]
}
```

### Environment Variables

Create `.env` file for sensitive data:

```env
# PostgreSQL
POSTGRES_PASSWORD=your_secure_password

# Grafana
GRAFANA_ADMIN_PASSWORD=your_admin_password

# Optional: OpenAI API Key
OPENAI_API_KEY=sk-...
```

### GPU Support (Optional)

If you have NVIDIA GPU for Ollama:

1. Install NVIDIA Container Toolkit
2. Uncomment GPU settings in `main.tf`:

```hcl
resource "docker_container" "ollama" {
  runtime = "nvidia"
  
  env = [
    "NVIDIA_VISIBLE_DEVICES=all"
  ]
}
```

## 📁 Data Persistence

Data is persisted in local directories:

```
data-pipeline/infrastructure/
├── data/
│   ├── redis/          # Redis cache data
│   ├── postgres/       # PostgreSQL database
│   ├── ollama/         # Ollama models
│   ├── qdrant/         # Vector embeddings
│   ├── grafana/        # Grafana dashboards
│   └── prometheus/     # Prometheus metrics
```

**Important**: These directories are created automatically but not tracked in Git.

## 🔄 Management Commands

### Start Services

```powershell
# Start all containers
docker compose up -d
# Or use OpenTofu:
tofu apply
```

### Stop Services

```powershell
# Stop all containers
docker compose down
# Or destroy infrastructure:
tofu destroy
```

### View Logs

```powershell
# View all logs
docker compose logs -f

# View specific service
docker logs -f ysh-ollama-service
```

### Restart Service

```powershell
# Restart specific service
docker restart ysh-redis-cache
```

## 📈 Monitoring

### Grafana Dashboards

1. Access Grafana: `http://localhost:3000`
2. Login with credentials
3. Add Prometheus data source:
   - URL: `http://ysh-prometheus-metrics:9090`
   - Access: Server (default)
4. Import dashboards:
   - Docker Container Monitoring
   - PostgreSQL Database
   - Redis Statistics

### Prometheus Metrics

View metrics at: `http://localhost:9090`

Query examples:
```promql
# Container CPU usage
rate(container_cpu_usage_seconds_total[5m])

# PostgreSQL connections
pg_stat_database_numbackends

# Redis memory usage
redis_memory_used_bytes
```

## 🛡️ Security

### Production Deployment

For production environments:

1. **Change default passwords** in `main.tf`
2. **Enable authentication** for Redis:
   ```hcl
   command = [
     "redis-server",
     "--requirepass", "your_redis_password"
   ]
   ```
3. **Use secrets management** (HashiCorp Vault, Azure Key Vault)
4. **Configure SSL/TLS** for external access
5. **Set up firewall rules** to restrict access
6. **Enable backup** for databases

## 🔌 Integration with Pipeline

### Python Configuration

Update pipeline scripts to use deployed services:

```python
# Redis
REDIS_HOST = "localhost"
REDIS_PORT = 6379

# PostgreSQL
DB_CONNECTION = "postgresql://ysh_user:password@localhost:5432/ysh_pipeline"

# Ollama
OLLAMA_API_URL = "http://localhost:11434"

# Qdrant
QDRANT_URL = "http://localhost:6333"
```

### Docker Network

All services are connected via `ysh-pipeline-network`. To add custom containers:

```powershell
docker run -d --name my-app \
  --network ysh-pipeline-network \
  my-app-image
```

## 🧪 Testing

### Health Checks

```powershell
# Redis
docker exec ysh-redis-cache redis-cli ping
# Expected: PONG

# PostgreSQL
docker exec ysh-postgres-db pg_isready
# Expected: accepting connections

# Ollama
curl http://localhost:11434/api/tags
# Expected: JSON with model list

# Qdrant
curl http://localhost:6333/healthz
# Expected: OK
```

## 📦 Backup & Restore

### PostgreSQL Backup

```powershell
# Create backup
docker exec ysh-postgres-db pg_dump -U ysh_user ysh_pipeline > backup.sql

# Restore backup
docker exec -i ysh-postgres-db psql -U ysh_user ysh_pipeline < backup.sql
```

### Redis Backup

```powershell
# Trigger save
docker exec ysh-redis-cache redis-cli SAVE

# Backup file located in:
# ./data/redis/dump.rdb
```

### Qdrant Backup

```powershell
# Create snapshot
curl -X POST http://localhost:6333/collections/my_collection/snapshots

# Download snapshot
curl http://localhost:6333/collections/my_collection/snapshots/{snapshot-name} -o snapshot.tar
```

## 🔧 Troubleshooting

### Container Won't Start

```powershell
# Check logs
docker logs ysh-redis-cache

# Check resource usage
docker stats

# Recreate container
tofu taint docker_container.redis
tofu apply
```

### Port Already in Use

Change port mapping in `main.tf`:

```hcl
ports {
  internal = 6379
  external = 6380  # Changed from 6379
}
```

### Data Directory Permissions

```powershell
# Windows: Ensure Docker has access to data directories
# Check Docker Desktop settings > Resources > File Sharing
```

## 📚 Additional Resources

- [OpenTofu Documentation](https://opentofu.org/docs/)
- [Docker Provider Docs](https://registry.terraform.io/providers/kreuzwerker/docker/latest/docs)
- [Ollama Documentation](https://ollama.ai/docs)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Grafana Documentation](https://grafana.com/docs/)

## 🤝 Support

For issues or questions:
1. Check service logs: `docker logs <container_name>`
2. Verify network connectivity: `docker network inspect ysh-pipeline-network`
3. Review OpenTofu state: `tofu show`

## 📝 Next Steps

After infrastructure is running:

1. **Initialize Ollama models**:
   ```powershell
   docker exec -it ysh-ollama-service ollama pull llama3.2
   ```

2. **Create Qdrant collections**:
   ```python
   # Run create_collections.py
   python create_qdrant_collections.py
   ```

3. **Test integration**:
   ```python
   # Run integration tests
   python test_infrastructure.py
   ```

4. **Start data pipeline**:
   ```python
   python integrated_data_pipeline.py
   ```
