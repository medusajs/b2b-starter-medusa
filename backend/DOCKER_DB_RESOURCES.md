# Docker Database Resources

**Data**: 2024-12-19  
**Status**: ✅ Configurado

---

## 📊 Recursos Docker Identificados

### PostgreSQL Containers

#### 1. ysh-b2b-postgres (Principal)
```yaml
Container: ysh-b2b-postgres
Image: postgres:16-alpine
Ports: 0.0.0.0:5432->5432/tcp
Status: Up 44 minutes (healthy)

Credenciais:
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  POSTGRES_DB: medusa-backend

Bancos de Dados:
  - medusa-backend (produção)
  - medusa_test (testes) ✅
```

#### 2. Supabase PostgreSQL (Kubernetes)
```yaml
Container: k8s_postgres_supabase-db-*
Image: fbaf25fc785d
Status: Up 43 minutes

Credenciais:
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  POSTGRES_DB: ysh_medusa
```

### Redis Container

```yaml
Container: ysh-b2b-redis
Image: redis:7-alpine
Ports: 0.0.0.0:6379->6379/tcp
Status: Up
```

---

## ✅ Configuração de Testes

### Arquivo: backend/.env.test

```bash
NODE_ENV=test

# Database Configuration (Test Database - Docker ysh-b2b-postgres)
DATABASE_URL=postgres://postgres:postgres@localhost:5432/medusa_test
DATABASE_TYPE=postgres
DATABASE_SSL=false
DATABASE_LOGGING=false

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Security (Test Secrets)
JWT_SECRET=test_jwt_secret_2025
COOKIE_SECRET=test_cookie_secret_2025

# Server Configuration
PORT=9001

# Feature Flags
MEDUSA_FF_MEDUSA_V2=true
```

---

## 🔧 Comandos Úteis

### Verificar Bancos de Dados
```bash
docker exec ysh-b2b-postgres psql -U postgres -lqt
```

### Criar Banco de Teste
```bash
docker exec ysh-b2b-postgres psql -U postgres -c "CREATE DATABASE medusa_test;"
```

### Dropar Banco de Teste
```bash
docker exec ysh-b2b-postgres psql -U postgres -c "DROP DATABASE medusa_test;"
```

### Testar Conexão
```bash
docker exec ysh-b2b-postgres psql -U postgres -d medusa_test -c "SELECT version();"
```

### Executar Migrations no Banco de Teste
```bash
cd backend
DATABASE_URL=postgres://postgres:postgres@localhost:5432/medusa_test yarn medusa db:migrate
```

---

## 📋 Stack FOSS Completa

### Observability
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686
- **Loki**: (interno)
- **Promtail**: (interno)

### Database Management
- **pgAdmin**: http://localhost:5050
- **Redis Commander**: http://localhost:8081

### Queue Management
- **Bull Board**: http://localhost:8082

### Testing
- **Pact Broker**: http://localhost:9292 (pact/pact)
- **MailHog**: http://localhost:8025

### Storage
- **MinIO**: http://localhost:9001 (console), http://localhost:9100 (API)

---

## 🎯 Status de Conexão

| Recurso | Host | Port | User | Password | Status |
|---------|------|------|------|----------|--------|
| PostgreSQL (Prod) | localhost | 5432 | postgres | postgres | ✅ |
| PostgreSQL (Test) | localhost | 5432 | postgres | postgres | ✅ |
| Redis | localhost | 6379 | - | - | ✅ |
| Supabase PG | k8s | - | postgres | postgres | ✅ |

---

## 🚀 Próximos Passos

1. ✅ Banco de teste criado
2. ✅ Credenciais configuradas em .env.test
3. ✅ Conexão validada
4. ⏳ Executar migrations no banco de teste
5. ⏳ Executar suite E2E 360°

---

**Última Atualização**: 2024-12-19  
**Autor**: Amazon Q Developer
