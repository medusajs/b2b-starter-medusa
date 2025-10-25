# Brazilian Energy Data Pipeline Infrastructure
# OpenTofu/Terraform Configuration

terraform {
  required_version = ">= 1.6.0"
  
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

# Provider configuration
provider "docker" {
  host = "npipe:////./pipe/docker_engine"  # Windows named pipe
}

# Network for all services
resource "docker_network" "pipeline_network" {
  name = "ysh-pipeline-network"
  driver = "bridge"
}

# Redis Cache
resource "docker_image" "redis" {
  name = "redis:7-alpine"
}

resource "docker_container" "redis" {
  name  = "ysh-redis-cache"
  image = docker_image.redis.image_id
  
  ports {
    internal = 6379
    external = 6379
  }
  
  networks_advanced {
    name = docker_network.pipeline_network.name
  }
  
  restart = "unless-stopped"
  
  command = [
    "redis-server",
    "--appendonly", "yes",
    "--maxmemory", "512mb",
    "--maxmemory-policy", "allkeys-lru"
  ]
  
  volumes {
    host_path      = abspath("${path.module}/data/redis")
    container_path = "/data"
  }
}

# PostgreSQL Database
resource "docker_image" "postgres" {
  name = "postgres:16-alpine"
}

resource "docker_container" "postgres" {
  name  = "ysh-postgres-db"
  image = docker_image.postgres.image_id
  
  ports {
    internal = 5432
    external = 5432
  }
  
  networks_advanced {
    name = docker_network.pipeline_network.name
  }
  
  restart = "unless-stopped"
  
  env = [
    "POSTGRES_DB=ysh_pipeline",
    "POSTGRES_USER=ysh_user",
    "POSTGRES_PASSWORD=ysh_secure_password_change_me"
  ]
  
  volumes {
    host_path      = abspath("${path.module}/data/postgres")
    container_path = "/var/lib/postgresql/data"
  }
}

# Ollama Service
resource "docker_image" "ollama" {
  name = "ollama/ollama:latest"
}

resource "docker_container" "ollama" {
  name  = "ysh-ollama-service"
  image = docker_image.ollama.image_id
  
  ports {
    internal = 11434
    external = 11434
  }
  
  networks_advanced {
    name = docker_network.pipeline_network.name
  }
  
  restart = "unless-stopped"
  
  volumes {
    host_path      = abspath("${path.module}/data/ollama")
    container_path = "/root/.ollama"
  }
  
  # GPU support (optional - uncomment if NVIDIA GPU available)
  # runtime = "nvidia"
  # 
  # env = [
  #   "NVIDIA_VISIBLE_DEVICES=all"
  # ]
}

# Qdrant Vector Database
resource "docker_image" "qdrant" {
  name = "qdrant/qdrant:latest"
}

resource "docker_container" "qdrant" {
  name  = "ysh-qdrant-vectordb"
  image = docker_image.qdrant.image_id
  
  ports {
    internal = 6333
    external = 6333
  }
  
  ports {
    internal = 6334
    external = 6334
  }
  
  networks_advanced {
    name = docker_network.pipeline_network.name
  }
  
  restart = "unless-stopped"
  
  volumes {
    host_path      = abspath("${path.module}/data/qdrant")
    container_path = "/qdrant/storage"
  }
}

# Grafana Monitoring
resource "docker_image" "grafana" {
  name = "grafana/grafana:latest"
}

resource "docker_container" "grafana" {
  name  = "ysh-grafana-monitoring"
  image = docker_image.grafana.image_id
  
  ports {
    internal = 3000
    external = 3000
  }
  
  networks_advanced {
    name = docker_network.pipeline_network.name
  }
  
  restart = "unless-stopped"
  
  env = [
    "GF_SECURITY_ADMIN_USER=admin",
    "GF_SECURITY_ADMIN_PASSWORD=admin_change_me",
    "GF_USERS_ALLOW_SIGN_UP=false"
  ]
  
  volumes {
    host_path      = abspath("${path.module}/data/grafana")
    container_path = "/var/lib/grafana"
  }
}

# Prometheus Metrics
resource "docker_image" "prometheus" {
  name = "prom/prometheus:latest"
}

resource "docker_container" "prometheus" {
  name  = "ysh-prometheus-metrics"
  image = docker_image.prometheus.image_id
  
  ports {
    internal = 9090
    external = 9090
  }
  
  networks_advanced {
    name = docker_network.pipeline_network.name
  }
  
  restart = "unless-stopped"
  
  volumes {
    host_path      = abspath("${path.module}/config/prometheus.yml")
    container_path = "/etc/prometheus/prometheus.yml"
  }
  
  volumes {
    host_path      = abspath("${path.module}/data/prometheus")
    container_path = "/prometheus"
  }
  
  command = [
    "--config.file=/etc/prometheus/prometheus.yml",
    "--storage.tsdb.path=/prometheus",
    "--web.console.libraries=/usr/share/prometheus/console_libraries",
    "--web.console.templates=/usr/share/prometheus/consoles"
  ]
}

# Outputs
output "services" {
  value = {
    redis = {
      host = "localhost"
      port = 6379
      container = docker_container.redis.name
    }
    postgres = {
      host = "localhost"
      port = 5432
      database = "ysh_pipeline"
      container = docker_container.postgres.name
    }
    ollama = {
      host = "localhost"
      port = 11434
      api_url = "http://localhost:11434"
      container = docker_container.ollama.name
    }
    qdrant = {
      host = "localhost"
      port = 6333
      grpc_port = 6334
      container = docker_container.qdrant.name
    }
    grafana = {
      host = "localhost"
      port = 3000
      url = "http://localhost:3000"
      container = docker_container.grafana.name
    }
    prometheus = {
      host = "localhost"
      port = 9090
      url = "http://localhost:9090"
      container = docker_container.prometheus.name
    }
  }
  
  description = "Service connection information"
}

output "network_name" {
  value = docker_network.pipeline_network.name
  description = "Docker network name for inter-service communication"
}
