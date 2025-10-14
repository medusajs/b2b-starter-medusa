# HaaS Platform - README Docker

## 🐳 Containerização com Docker

Este projeto está totalmente containerizado usando Docker e Docker Compose para garantir consistência entre ambientes de desenvolvimento, teste e produção.

## 📋 Pré-requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

### Instalação do Docker

**Windows:**

```bash
# Baixar Docker Desktop do site oficial
# https://www.docker.com/products/docker-desktop
```

**Linux (Ubuntu/Debian):**

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
```

**macOS:**

```bash
# Usar Homebrew
brew install --cask docker
```

## 🚀 Quick Start

### 1. Clone e Configure

```bash
git clone <repository-url>
cd project-helios/haas

# Copiar arquivo de configuração
cp .env.example .env

# Editar configurações (opcional)
nano .env
```

### 2. Desenvolvimento Local

**Linux/macOS:**

```bash
# Dar permissão ao script
chmod +x scripts/dev.sh

# Iniciar ambiente completo
./scripts/dev.sh dev

# Ou comandos individuais
./scripts/dev.sh build   # Construir imagens
./scripts/dev.sh logs    # Ver logs
./scripts/dev.sh stop    # Parar serviços
```

**Windows:**

```cmd
# Iniciar ambiente completo
scripts\dev.bat dev

# Ou comandos individuais
scripts\dev.bat build   # Construir imagens
scripts\dev.bat logs    # Ver logs
scripts\dev.bat stop    # Parar serviços
```

### 3. Usando Docker Compose Diretamente

```bash
# Desenvolvimento
docker-compose up -d

# Produção
docker-compose -f docker-compose.prod.yml up -d

# Parar todos os serviços
docker-compose down
```

## 🏗️ Arquitetura dos Containers

### Serviços Disponíveis

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| `haas-api` | 8000 | API FastAPI principal |
| `postgres` | 5432 | Banco PostgreSQL |
| `redis` | 6379 | Cache e sessões |
| `adminer` | 8080 | Interface web do banco |
| `redis-commander` | 8081 | Interface web do Redis |
| `nginx` | 80/443 | Proxy reverso |

### URLs de Acesso

- **API Principal:** <http://localhost:8000>
- **Documentação:** <http://localhost:8000/docs>
- **Health Check:** <http://localhost:8000/health>
- **Adminer (DB):** <http://localhost:8080>
- **Redis Commander:** <http://localhost:8081>

## 📁 Estrutura de Arquivos Docker

```
haas/
├── Dockerfile              # Imagem de produção
├── Dockerfile.dev          # Imagem de desenvolvimento
├── docker-compose.yml      # Ambiente de desenvolvimento
├── docker-compose.prod.yml # Ambiente de produção
├── .dockerignore           # Arquivos ignorados no build
├── .env.example            # Exemplo de configurações
├── .env.production         # Configurações de produção
├── scripts/
│   ├── dev.sh             # Script Linux/macOS
│   ├── dev.bat            # Script Windows
│   └── init-db.sql        # Inicialização do banco
└── nginx/
    ├── nginx.conf         # Configuração para dev
    └── nginx.prod.conf    # Configuração para produção
```

## 🔧 Configuração de Ambiente

### Arquivo .env (Desenvolvimento)

```bash
# Copiado de .env.example
ENVIRONMENT=development
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://haas_user:haas_password@postgres:5432/haas_db
REDIS_URL=redis://redis:6379
LOG_LEVEL=DEBUG
```

### Arquivo .env.production

```bash
ENVIRONMENT=production
SECRET_KEY=${SECRET_KEY}
DATABASE_URL=${DATABASE_URL}
REDIS_URL=${REDIS_URL}
LOG_LEVEL=INFO
```

## 🛠️ Comandos Úteis

### Desenvolvimento

```bash
# Ver logs em tempo real
docker-compose logs -f haas-api

# Executar comandos no container
docker-compose exec haas-api bash
docker-compose exec haas-api python -c "from app.main import app; print(app.title)"

# Reiniciar apenas a API
docker-compose restart haas-api

# Rebuild com cache limpo
docker-compose build --no-cache haas-api
```

### Banco de Dados

```bash
# Conectar ao PostgreSQL
docker-compose exec postgres psql -U haas_user -d haas_db

# Backup do banco
docker-compose exec postgres pg_dump -U haas_user haas_db > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U haas_user -d haas_db < backup.sql

# Ver tabelas
docker-compose exec postgres psql -U haas_user -d haas_db -c "\dt"
```

### Monitoramento

```bash
# Status dos containers
docker-compose ps

# Uso de recursos
docker stats

# Logs específicos
docker-compose logs postgres
docker-compose logs redis
```

## 🚀 Deploy em Produção

### 1. Preparação

```bash
# Configurar variáveis de ambiente
export SECRET_KEY="your-super-secret-key-32-chars"
export DATABASE_URL="postgresql://user:pass@db:5432/haas_prod"
export REDIS_URL="redis://redis-prod:6379"

# Ou usar arquivo .env.production
source .env.production
```

### 2. Deploy

```bash
# Build da imagem de produção
docker build -f Dockerfile -t haas-api:latest .

# Deploy com Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Ou usar o script
./scripts/dev.sh deploy
```

### 3. Verificação

```bash
# Verificar saúde dos serviços
curl http://localhost:8000/health

# Ver logs de produção
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔍 Debugging

### Problemas Comuns

1. **Porta já em uso:**

   ```bash
   # Verificar o que está usando a porta
   netstat -tulpn | grep :8000
   # Ou alterar a porta no docker-compose.yml
   ```

2. **Problemas de permissão:**

   ```bash
   # Verificar se o usuário está no grupo docker
   sudo usermod -aG docker $USER
   # Logout e login novamente
   ```

3. **Containers não iniciam:**

   ```bash
   # Ver logs detalhados
   docker-compose logs
   # Verificar recursos disponíveis
   docker system df
   ```

### Health Checks

Todos os serviços incluem health checks automáticos:

```bash
# Verificar saúde dos containers
docker-compose ps
docker inspect <container_name> | grep Health -A 10
```

## 📊 Monitoramento e Logs

### Logs Centralizados

Os logs são estruturados e incluem:

- Timestamp
- Nível de log
- Módulo/função
- Mensagem
- Contexto adicional (JSON)

### Métricas

O container da API expõe métricas para monitoramento:

- Health check endpoint: `/health`
- Métricas de sistema (se configurado)
- Logs estruturados em JSON

## 🔒 Segurança

### Práticas Implementadas

1. **Usuário não-root** nos containers
2. **Health checks** automáticos
3. **Secrets** via variáveis de ambiente
4. **Network isolation** entre serviços
5. **Resource limits** configurados

### Configurações de Produção

```yaml
# docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'
```

## 📈 Escalabilidade

### Horizontal Scaling

```bash
# Escalar API para 3 instâncias
docker-compose up -d --scale haas-api=3

# Com load balancer (nginx)
# Configurar upstream no nginx.conf
```

### Vertical Scaling

```yaml
# Ajustar recursos no docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '1.0'
```

## 🆘 Troubleshooting

### Comandos de Diagnóstico

```bash
# Informações do sistema Docker
docker system info
docker system df

# Logs detalhados
docker-compose logs --details haas-api

# Executar shell no container
docker-compose exec haas-api /bin/bash

# Verificar conectividade de rede
docker-compose exec haas-api ping postgres
docker-compose exec haas-api nslookup redis
```

### Reset Completo

```bash
# Parar tudo e limpar
docker-compose down -v --rmi all
docker system prune -a --volumes

# Reconstruir do zero
docker-compose build --no-cache
docker-compose up -d
```

---

## 📚 Recursos Adicionais

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [FastAPI with Docker](https://fastapi.tiangolo.com/deployment/docker/)
- [PostgreSQL Docker Official Image](https://hub.docker.com/_/postgres)
