# 🤖 Mastra AI + MCP Servers - Solar Distributors Extraction

> **TypeScript AI agent framework** integrado com **Model Context Protocol** e **Temporal workflows** para extração automatizada de catálogos de distribuidores solares no Brasil.

---

## 🎯 Visão Geral

Este projeto implementa uma arquitetura completa de **agentes inteligentes** para extração, validação e sincronização de catálogos de produtos solares de 7 distribuidores brasileiros:

| Distribuidor | Website | Status | Products | Last Sync |
|--------------|---------|--------|----------|-----------|
| **Fortlev Solar** | fortlevsolar.app | ✅ Ready | - | Never |
| **Neosolar** | portalb2b.neosolar.com.br | ⏳ Pending | - | Never |
| **Solfacil** | sso.solfacil.com.br | ⏳ Pending | - | Never |
| **Fotus** | app.fotus.com.br | ⏳ Pending | - | Never |
| **Odex** | plataforma.odex.com.br | ⏳ Pending | - | Never |
| **Edeltec** | edeltecsolar.com.br | ⏳ Pending | - | Never |
| **Dynamis** | app.dynamisimportadora.com.br | ⏳ Pending | - | Never |

---

## 🚀 Quick Start

### 1. Instalar Dependências

```bash
cd backend/mcp-servers
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
# Editar .env com suas credenciais
```

### 3. Iniciar Infraestrutura (Docker)

```bash
cd ../../docker
docker-compose -f docker-compose.agents.yml up -d
```

**Serviços iniciados:**

- PostgreSQL (porta 5432)
- Redis (porta 6379)
- Temporal Server (WebUI em http://localhost:8080)
- Supabase Studio (porta 54321)

### 4. Executar Agente Fortlev (Teste)

```bash
npm run mastra:dev
```

Abrir em outra janela:

```bash
npm run test:fortlev
```

---

## 📚 Documentação

### Arquitetura

- **[MASTRA_INTEGRATION_ARCHITECTURE.md](./MASTRA_INTEGRATION_ARCHITECTURE.md)** - Arquitetura completa (868 linhas)
  - Stack tecnológica
  - Diagramas mermaid (4 camadas)
  - 7 componentes principais
  - Configuração Docker
  - Guia de deployment
  
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Resumo de implementação (500+ linhas)
  - Arquivos criados
  - Estatísticas
  - Pendências por sprint
  - Fluxo de execução
  - Métricas de sucesso

### Code Documentation

```
mcp-servers/
├── mastra/
│   ├── index.ts                     # Mastra instance central (112 linhas)
│   ├── agents/
│   │   ├── fortlev.ts              # Agente Fortlev (248 linhas) ✅
│   │   ├── neosolar.ts             # Agente Neosolar ⏳
│   │   ├── solfacil.ts             # Agente Solfacil ⏳
│   │   ├── fotus.ts                # Agente Fotus ⏳
│   │   ├── odex.ts                 # Agente Odex ⏳
│   │   ├── edeltec.ts              # Agente Edeltec ⏳
│   │   └── dynamis.ts              # Agente Dynamis ⏳
│   ├── tools/
│   │   └── mcp-integration.ts      # MCP Tools (297 linhas) ✅
│   └── workflows/
│       ├── extraction.ts           # Workflow extração ⏳
│       ├── validation.ts           # Workflow validação ⏳
│       └── sync.ts                 # Workflow sincronização ⏳
│
├── distributors/                    # MCP Servers (existing)
│   ├── fortlev/server.ts           # Fortlev MCP Server (453 linhas) ✅
│   └── ...                         # Outros distribuidores ⏳
│
├── orchestrator/                    # Temporal integration
│   ├── workflows/
│   │   └── sync-distributors-mastra.ts  ⏳
│   ├── activities/
│   │   └── mastra-activities.ts         ⏳
│   ├── worker.ts
│   └── scheduler.ts
│
└── shared/                          # Shared types and utils
    ├── types/distributor.ts
    └── base/mcp-server.ts
```

---

## 🔧 Configuração

### Environment Variables

```env
# Mastra Configuration
LIBSQL_URL=file:./mastra.db
MASTRA_LOG_LEVEL=info

# LLM Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

# Distributors (7x)
FORTLEV_EMAIL=fernando.teixeira@yello.cash
FORTLEV_PASSWORD=@Botapragirar2025
NEOSOLAR_EMAIL=product@boldsbrain.ai
NEOSOLAR_PASSWORD=Rookie@010100
SOLFACIL_EMAIL=fernando.teixeira@yello.cash
SOLFACIL_PASSWORD=Rookie@010100
FOTUS_EMAIL=fernando@yellosolarhub.com
FOTUS_PASSWORD=Rookie@010100
ODEX_EMAIL=fernando@yellosolarhub.com
ODEX_PASSWORD=Rookie@010100
EDELTEC_EMAIL=fernando@yellosolarhub.com
EDELTEC_PASSWORD=010100@Rookie
DYNAMIS_EMAIL=fernando@yellosolarhub.com
DYNAMIS_PASSWORD=Rookie@010100

# Infrastructure
POSTGRES_URL=postgresql://supabase_admin:your-password@localhost:5432/postgres
REDIS_URL=redis://localhost:6379
TEMPORAL_ADDRESS=localhost:7233
```

---

## 🎮 Comandos

### Development

```bash
# Iniciar Mastra server (HTTP API em porta 4111)
npm run mastra:dev

# Iniciar MCP server específico
npm run dev:fortlev
npm run dev:neosolar
# ... etc.

# Iniciar Temporal worker
npm run worker

# Configurar schedules
npm run scheduler
```

### Build & Deploy

```bash
# Build TypeScript
npm run build

# Bundle Mastra (production)
npm run mastra:build

# Docker Compose (full stack)
docker-compose up -d
```

### Testing

```bash
# Testes unitários
npm test

# Testes E2E (Fortlev)
npm run test:e2e:fortlev

# Testes de integração (todos os distribuidores)
npm run test:integration
```

---

## 🏗️ Arquitetura

### Camadas

```
┌─────────────────────────────────────────┐
│      Mastra AI Layer                    │
│  ┌────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Agents │  │Workflows │  │  Tools  │ │
│  └────────┘  └──────────┘  └─────────┘ │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┼───────────────────────┐
│   MCP Protocol Integration Layer        │
│  ┌──────────┐  ┌──────────┐           │
│  │ MCP Srv  │  │ MCP Srv  │  ...      │
│  │ Fortlev  │  │ Neosolar │           │
│  └──────────┘  └──────────┘           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┼───────────────────────┐
│     Infrastructure Layer                │
│  ┌─────┐  ┌─────┐  ┌────────┐  ┌────┐ │
│  │ PG  │  │Redis│  │Temporal│  │ P  │ │
│  └─────┘  └─────┘  └────────┘  └────┘ │
└─────────────────────────────────────────┘
```

### Fluxo de Extração

1. **User Request** → Mastra API `/workflows/extraction/execute`
2. **Mastra** → Invoca `fortlevAgent` com instruções
3. **Agent** → Checa working memory (session status)
4. **Agent** → Invoca tool `authenticate_fortlev` (se necessário)
5. **Tool** → Chama `FortlevMCPServer.authenticate()`
6. **MCP Server** → Usa Playwright para login
7. **MCP Server** → Retorna session cookies
8. **Agent** → Atualiza working memory
9. **Agent** → Invoca tool `extract_catalog_fortlev`
10. **MCP Server** → Extrai produtos em batches
11. **MCP Server** → Retorna produtos normalizados
12. **Agent** → Salva no PostgreSQL
13. **Agent** → Retorna resultado final

---

## 🎯 Capabilities

### Fortlev Agent (Implemented)

✅ **Authentication** - Login com session management (24h TTL)  
✅ **Product Listing** - Filtros: category, manufacturer, inStock  
✅ **Product Extraction** - 14 campos: SKU, title, description, pricing, stock, images  
✅ **Catalog Extraction** - Full/incremental/price-only modes  
✅ **Stock Verification** - Multi-SKU batch checking  
✅ **Working Memory** - Automatic statistics tracking  
✅ **Error Handling** - Retries com exponential backoff  

### Tools Available

1. **authenticate_fortlev** - Login e sessão
2. **list_products_fortlev** - Listagem com filtros
3. **get_product_fortlev** - Extração detalhada
4. **extract_catalog_fortlev** - Extração full/incremental
5. **check_stock_fortlev** - Verificação de estoque

---

## 📊 Status do Projeto

### Progress

```
Foundation:    ████████████████████░░ 85% (Architecture + Core)
Agents:        ███░░░░░░░░░░░░░░░░░░░ 14% (1/7 implemented)
Workflows:     ░░░░░░░░░░░░░░░░░░░░░░  0% (0/3 implemented)
Integration:   ████░░░░░░░░░░░░░░░░░░ 20% (Tools ready)
Testing:       ░░░░░░░░░░░░░░░░░░░░░░  0% (E2E pending)
Documentation: ████████████████░░░░░░ 80% (2 files complete)

Overall:       ███████░░░░░░░░░░░░░░░ 33%
```

### Roadmap

- **Sprint 1 (Week 1)** - ⏳ Pending
  - [ ] Install Mastra dependencies
  - [ ] Implement 3 workflows (extraction, validation, sync)
  - [ ] Temporal integration
  - [ ] E2E tests Fortlev

- **Sprint 2 (Week 2)** - ⏳ Pending
  - [ ] Implement 6 agents (Neosolar, Solfacil, Fotus, Odex, Edeltec, Dynamis)
  - [ ] Implement 6 MCP servers
  - [ ] Tools for all distributors
  - [ ] Integration tests

- **Sprint 3 (Week 3)** - ⏳ Pending
  - [ ] Dashboard de monitoramento
  - [ ] Alertas e notificações
  - [ ] Documentação completa

- **Sprint 4 (Week 4)** - ⏳ Pending
  - [ ] Performance tuning
  - [ ] Load testing (1000+ products)
  - [ ] Production deployment
  - [ ] Handoff

**ETA Production:** 4 weeks

---

## 🤝 Contributing

### Development Workflow

1. Clone o repositório
2. Instalar dependências: `npm install`
3. Configurar `.env` com credenciais
4. Iniciar infraestrutura: `docker-compose up -d`
5. Desenvolver feature em branch
6. Executar testes: `npm test`
7. Commit com conventional commits
8. Abrir Pull Request

### Code Standards

- **TypeScript** - Strict mode enabled
- **ESLint** - Airbnb config
- **Prettier** - Auto-formatting
- **Jest** - Unit + E2E testing
- **Zod** - Runtime validation

---

## 📞 Suporte

### Monitoring

- **Temporal WebUI:** http://localhost:8080
- **Mastra API:** http://localhost:4111
- **Supabase Studio:** http://localhost:54321
- **Redis Insight:** http://localhost:8001

### Troubleshooting

**Q: Erro de autenticação no Fortlev**  
A: Verifique se `FORTLEV_EMAIL` e `FORTLEV_PASSWORD` estão corretos no `.env`

**Q: MCP server não inicia**  
A: Execute `npx playwright install chromium` para instalar browser

**Q: Temporal worker não conecta**  
A: Verifique se `TEMPORAL_ADDRESS=localhost:7233` está correto

**Q: Erro de memória (LibSQL)**  
A: Verifique se `LIBSQL_URL=file:./mastra.db` aponta para diretório com permissão de escrita

---

## 📄 License

MIT License - Bold AI Team

---

## 🔗 Links

- [Mastra AI Docs](https://mastra.ai/docs)
- [Mastra GitHub](https://github.com/mastra-ai/mastra)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Temporal Docs](https://docs.temporal.io)

---

**Status:** 🟡 Foundation Complete - Ready for Sprint 1  
**Version:** 1.0.0  
**Last Updated:** 2025-10-19
