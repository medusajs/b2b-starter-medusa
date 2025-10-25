# 🚀 YSH MCP Servers - Setup Guide

## Arquitetura Implementada

```
✅ MCP Servers (Model Context Protocol)
├── Base Server abstrato com Playwright
├── Fortlev MCP Server completo
├── 6 distribuidores restantes (esqueleto)
└── Tipos compartilhados (Zod schemas)

✅ Temporal Orchestration
├── Workflows (sync-distributors)
├── Activities (auth, extract, save)
├── Worker process
└── Scheduler (cron schedules)

✅ Stack FOSS
├── Temporal.io - Workflow engine
├── PostgreSQL - Storage
├── Redis - Cache & sessions
├── Redpanda - Message queue
└── Playwright - Browser automation
```

## 📦 Instalação

### 1. Instalar dependências

```bash
cd backend/mcp-servers
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Editar `.env` com as credenciais corretas.

### 3. Iniciar infraestrutura (Docker Compose)

```bash
cd ../
docker-compose -f .deploy/docker-compose.agents.yml up -d
```

Isso iniciará:
- ✅ Temporal Server (porta 7233 gRPC, 8080 WebUI)
- ✅ PostgreSQL (porta 5432)
- ✅ Redis (porta 6379)
- ✅ Redpanda (porta 19092 Kafka)
- ✅ Supabase DB + Studio

### 4. Criar tabelas no banco

```sql
-- Executar no Supabase Studio (localhost:54321)

CREATE TABLE IF NOT EXISTS distributor_extractions (
  id SERIAL PRIMARY KEY,
  distributor VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  products_extracted INTEGER DEFAULT 0,
  products_created INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  duration INTEGER, -- milisegundos
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_distributor_timestamp 
ON distributor_extractions(distributor, timestamp DESC);

CREATE TABLE IF NOT EXISTS extracted_products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(255) UNIQUE NOT NULL,
  distributor VARCHAR(50) NOT NULL,
  distributor_product_id VARCHAR(255),
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50),
  manufacturer VARCHAR(255),
  model VARCHAR(255),
  technical_specs JSONB,
  pricing JSONB,
  stock JSONB,
  images TEXT[],
  documents JSONB,
  metadata JSONB,
  extracted_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_distributor ON extracted_products(distributor);
CREATE INDEX idx_product_category ON extracted_products(category);
CREATE INDEX idx_product_sku ON extracted_products(sku);
```

### 5. Configurar Temporal Schedules

```bash
npm run setup:schedules
```

Isso criará os schedules:
- `full-sync-daily` - Full sync diário às 2 AM BRT
- `incremental-sync-4h` - Sync incremental a cada 4 horas
- `price-sync-hourly` - Atualização de preços a cada hora (9 AM - 6 PM)
- `stock-check-30min` - Check de estoque a cada 30min (horário comercial)

### 6. Iniciar Temporal Worker

```bash
npm run worker
```

### 7. Testar MCP Server individual

```bash
# Fortlev
npm run dev:fortlev

# Outros distribuidores
npm run dev:neosolar
npm run dev:solfacil
npm run dev:fotus
npm run dev:odex
npm run dev:edeltec
npm run dev:dynamis
```

## 🧪 Testes

### Testar autenticação

```bash
# Via MCP stdio
echo '{"method":"tools/call","params":{"name":"authenticate","arguments":{"email":"test@example.com","password":"pass123"}}}' | npm run dev:fortlev
```

### Trigger manual workflow

```bash
npm run trigger:fortlev
npm run trigger:all
```

## 📊 Monitoramento

### Temporal WebUI
- URL: http://localhost:8080
- Visualizar workflows, histórico, erros

### Redpanda Console
- URL: http://localhost:8082
- Monitorar mensagens, topics

### Supabase Studio
- URL: http://localhost:54321
- Query database, visualizar dados extraídos

### Redis Insight
- URL: http://localhost:8001
- Visualizar cache, sessões

## 🏗️ Próximas Implementações

### MCP Servers Restantes
- [ ] Neosolar MCP Server
- [ ] Solfácil MCP Server
- [ ] Fotus MCP Server
- [ ] Odex MCP Server
- [ ] Edeltec MCP Server
- [ ] Dynamis MCP Server

Todos seguem o mesmo padrão do Fortlev Server, apenas mudando:
1. URLs de login/catálogo
2. Seletores CSS/XPath
3. Lógica de parsing específica

### Integrações
- [ ] Sync com Medusa.js Products
- [ ] Webhook notifications
- [ ] Grafana dashboards
- [ ] Alerting (PagerDuty/Slack)

### Features Avançadas
- [ ] Product matching (dedupe cross-distributor)
- [ ] Price history tracking
- [ ] Auto-retry failed extractions
- [ ] ML-based product categorization
- [ ] OCR para extrair specs de PDFs

## 🔧 Comandos Úteis

```bash
# Build TypeScript
npm run build

# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm test

# Clean & rebuild
rm -rf dist node_modules
npm install
npm run build
```

## 📖 Documentação Adicional

- [MCP Protocol Spec](https://modelcontextprotocol.io/docs)
- [Temporal Docs](https://docs.temporal.io/)
- [Playwright Docs](https://playwright.dev/)

## 🐛 Troubleshooting

### Erro: "Browser not initialized"
```bash
npx playwright install chromium
```

### Erro: "Connection refused to Temporal"
```bash
docker-compose -f .deploy/docker-compose.agents.yml restart temporal-server
```

### Erro: "Redis connection failed"
```bash
docker-compose -f .deploy/docker-compose.agents.yml restart redis
```

## 📝 Notas

- **Credenciais**: NUNCA commitar `.env` com credenciais reais
- **Rate Limiting**: Cada distribuidor tem limites diferentes
- **Sessions**: Válidas por 24h, auto-refresh implementado
- **Concurrency**: Limitado a 3 requests paralelos por distributor
- **Retries**: 3 tentativas com backoff exponencial

## 🎯 Status dos Distribuidores

| Distribuidor | MCP Server | Auth | Extraction | Status |
|--------------|-----------|------|-----------|--------|
| Fortlev      | ✅        | ✅   | ✅        | 🟢 Pronto |
| Neosolar     | ⏳        | ⏳   | ⏳        | 🟡 Pendente |
| Solfácil     | ⏳        | ⏳   | ⏳        | 🟡 Pendente |
| Fotus        | ⏳        | ⏳   | ⏳        | 🟡 Pendente |
| Odex         | ⏳        | ⏳   | ⏳        | 🟡 Pendente |
| Edeltec      | ⏳        | ⏳   | ⏳        | 🟡 Pendente |
| Dynamis      | ⏳        | ⏳   | ⏳        | 🟡 Pendente |

---

**Desenvolvido para YSH Solar Hub** 🌞
