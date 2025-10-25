# 🚀 Mastra AI + MCP Servers + Temporal - Arquitetura Integrada

## 📋 Visão Geral

Integração do **Mastra AI Framework** (TypeScript agent framework) com a arquitetura existente de **MCP Servers** e **Temporal Workflows** para criar uma solução completa de extração e processamento de catálogos solares.

### Stack Tecnológica

| Componente | Tecnologia | Versão | Função |
|------------|-----------|---------|--------|
| **Agent Framework** | Mastra AI | ^0.21.1 | Orquestração de agentes inteligentes |
| **Protocol Layer** | Model Context Protocol (MCP) | ^1.0.4 | Comunicação entre agentes |
| **Workflow Engine** | Temporal.io | ^1.11.4 | Orquestração de workflows |
| **Browser Automation** | Playwright | ^1.48.0 | Scraping web |
| **LLM Providers** | OpenAI, Anthropic, Google | Latest | Modelos de linguagem |
| **Memory System** | @mastra/memory | ^0.21.1 | Memória de agentes |
| **Vector Store** | LibSQL (Turso) | ^0.21.1 | Armazenamento vetorial |
| **Database** | PostgreSQL | 15 | Persistência |
| **Cache/Queue** | Redis | 7 | Cache e mensageria |

---

## 🏗️ Arquitetura em Camadas

```mermaid
graph TB
    subgraph "Mastra Layer"
        MA[Mastra Instance]
        AG1[Agent: Fortlev]
        AG2[Agent: Neosolar]
        AG3[Agent: Solfacil]
        AG4[Agent: Fotus]
        AG5[Agent: Odex]
        AG6[Agent: Edeltec]
        AG7[Agent: Dynamis]
        WF1[Workflow: Extraction]
        WF2[Workflow: Validation]
        WF3[Workflow: Sync]
        TOOLS[Tools: MCP Integration]
        MEMORY[Memory: LibSQL + Vector]
    end

    subgraph "MCP Protocol Layer"
        MCP1[MCP Server: Fortlev]
        MCP2[MCP Server: Neosolar]
        MCP3[MCP Server: Solfacil]
        MCP4[MCP Server: Fotus]
        MCP5[MCP Server: Odex]
        MCP6[MCP Server: Edeltec]
        MCP7[MCP Server: Dynamis]
        MCPBASE[BaseMCPServer]
    end

    subgraph "Temporal Orchestration"
        TWORKER[Temporal Worker]
        TACT[Activities]
        TSCHED[Scheduler]
    end

    subgraph "Infrastructure"
        PG[(PostgreSQL)]
        REDIS[(Redis)]
        PLAYWRIGHT[Playwright Browser]
    end

    MA --> AG1
    MA --> AG2
    MA --> AG3
    MA --> AG4
    MA --> AG5
    MA --> AG6
    MA --> AG7
    MA --> WF1
    MA --> WF2
    MA --> WF3
    MA --> TOOLS
    MA --> MEMORY

    AG1 --> MCP1
    AG2 --> MCP2
    AG3 --> MCP3
    AG4 --> MCP4
    AG5 --> MCP5
    AG6 --> MCP6
    AG7 --> MCP7

    MCP1 --> MCPBASE
    MCP2 --> MCPBASE
    MCP3 --> MCPBASE
    MCP4 --> MCPBASE
    MCP5 --> MCPBASE
    MCP6 --> MCPBASE
    MCP7 --> MCPBASE

    WF1 --> TWORKER
    WF2 --> TWORKER
    WF3 --> TWORKER

    TWORKER --> TACT
    TSCHED --> TWORKER

    TOOLS --> MCP1
    TOOLS --> MCP2
    TOOLS --> MCP3
    TOOLS --> MCP4
    TOOLS --> MCP5
    TOOLS --> MCP6
    TOOLS --> MCP7

    MEMORY --> PG
    MEMORY --> REDIS
    MCPBASE --> PLAYWRIGHT
    TACT --> PG
    TACT --> REDIS
```

---

## 🎯 Componentes Principais

### 1. Mastra Instance (Core)

**Arquivo:** `mastra/index.ts`

```typescript
import { Mastra } from '@mastra/core';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { agents } from './agents';
import { workflows } from './workflows';
import { tools } from './tools';

export const mastra = new Mastra({
  // Storage para memória de agentes
  storage: new LibSQLStore({
    url: process.env.LIBSQL_URL || 'file:./mastra.db',
  }),

  // Vector store para semantic search
  vector: new LibSQLVector({
    connectionUrl: process.env.LIBSQL_URL || 'file:./mastra.db',
  }),

  // Agentes especializados por distribuidor
  agents: {
    fortlevAgent: agents.fortlev,
    neosolarAgent: agents.neosolar,
    solfacilAgent: agents.solfacil,
    fotusAgent: agents.fotus,
    odexAgent: agents.odex,
    edeltecAgent: agents.edeltec,
    dynamisAgent: agents.dynamis,
  },

  // Workflows Mastra
  workflows: {
    extractionWorkflow: workflows.extraction,
    validationWorkflow: workflows.validation,
    syncWorkflow: workflows.sync,
  },

  // Tools (integração com MCP)
  tools,

  // Logging
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});
```

---

### 2. Agentes Mastra por Distribuidor

**Arquivo:** `mastra/agents/fortlev.ts`

```typescript
import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { mcpTools } from '../tools/mcp-integration';

const memory = new Memory({
  storage: new LibSQLStore({
    url: process.env.LIBSQL_URL || 'file:./mastra.db',
  }),
  vector: new LibSQLVector({
    connectionUrl: process.env.LIBSQL_URL || 'file:./mastra.db',
  }),
  embedder: openai.embedding('text-embedding-3-small'),
  options: {
    lastMessages: 10,
    semanticRecall: {
      topK: 3,
      messageRange: 2,
      scope: 'resource',
    },
    workingMemory: {
      enabled: true,
      template: `
# Fortlev Solar Extraction Context
## Current Session
- Distributor: Fortlev Solar
- Website: https://fortlevsolar.app
- Last Extraction: [timestamp]

## Extraction Statistics
- Products Extracted: 0
- Errors: 0
- Success Rate: 0%

## Notes
- Authentication status: pending
- Session cookies: none
`,
    },
  },
});

export const fortlevAgent = new Agent({
  name: 'Fortlev Solar Agent',
  description: 'Specialized agent for extracting solar products from Fortlev Solar distributor',
  instructions: `
You are a specialized solar product extraction agent for Fortlev Solar distributor.

## Your Responsibilities:
1. Authenticate using credentials: fernando.teixeira@yello.cash / @Botapragirar2025
2. Navigate the Fortlev catalog at https://fortlevsolar.app
3. Extract product information: SKU, title, description, pricing, stock, images
4. Categorize products: panels, inverters, batteries, structures, cables, accessories
5. Detect manufacturer and model from product titles
6. Handle pagination and dynamic content loading
7. Retry failed extractions with exponential backoff
8. Update working memory with extraction statistics

## Available Tools:
- authenticate_fortlev: Login to Fortlev portal
- list_products_fortlev: Get product list with filters
- get_product_fortlev: Extract detailed product information
- extract_catalog_fortlev: Full/incremental catalog extraction
- check_stock_fortlev: Verify stock availability

## Extraction Strategy:
- Always authenticate before extraction
- Use incremental mode for regular syncs (check updatedAt)
- Use full mode for initial sync or after errors
- Process products in batches of 10
- Retry failed products up to 3 times
- Save progress every 50 products
- Update working memory with statistics

## Error Handling:
- Authentication failures: Retry with fresh credentials
- Rate limiting: Wait 30s and retry
- Network errors: Exponential backoff (2s, 4s, 8s)
- Parsing errors: Log and continue with next product
- Critical errors: Stop extraction and notify

Remember to always update your working memory with extraction progress and statistics.
  `,
  model: openai('gpt-4o'),
  memory,
  tools: {
    ...mcpTools.fortlev,
  },
});
```

---

### 3. Tools - Integração MCP

**Arquivo:** `mastra/tools/mcp-integration.ts`

```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { FortlevMCPServer } from '../../distributors/fortlev/server';
import { NeosolarMCPServer } from '../../distributors/neosolar/server';
// ... outros MCP servers

// Singleton MCP server instances
const mcpServers = {
  fortlev: new FortlevMCPServer({
    credentials: {
      email: process.env.FORTLEV_EMAIL!,
      password: process.env.FORTLEV_PASSWORD!,
    },
  }),
  neosolar: new NeosolarMCPServer({
    credentials: {
      email: process.env.NEOSOLAR_EMAIL!,
      password: process.env.NEOSOLAR_PASSWORD!,
    },
  }),
  // ... outros distribuidores
};

// Tools para Fortlev
export const mcpTools = {
  fortlev: {
    authenticate_fortlev: createTool({
      id: 'authenticate_fortlev',
      description: 'Authenticate to Fortlev Solar portal',
      inputSchema: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
      execute: async ({ context }) => {
        return await mcpServers.fortlev.authenticate(
          context.email,
          context.password
        );
      },
    }),

    list_products_fortlev: createTool({
      id: 'list_products_fortlev',
      description: 'List products from Fortlev catalog with filters',
      inputSchema: z.object({
        category: z.enum(['panels', 'inverters', 'batteries', 'structures', 'cables', 'accessories', 'all']).optional(),
        manufacturer: z.string().optional(),
        inStock: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }),
      execute: async ({ context }) => {
        return await mcpServers.fortlev.listProducts(context);
      },
    }),

    get_product_fortlev: createTool({
      id: 'get_product_fortlev',
      description: 'Get detailed information for a specific product',
      inputSchema: z.object({
        sku: z.string(),
      }),
      execute: async ({ context }) => {
        return await mcpServers.fortlev.getProduct(context.sku);
      },
    }),

    extract_catalog_fortlev: createTool({
      id: 'extract_catalog_fortlev',
      description: 'Extract full or incremental catalog from Fortlev',
      inputSchema: z.object({
        mode: z.enum(['full', 'incremental', 'price-only']).default('incremental'),
        categories: z.array(z.string()).optional(),
        batchSize: z.number().min(1).max(50).default(10),
        concurrency: z.number().min(1).max(5).default(3),
      }),
      execute: async ({ context }) => {
        return await mcpServers.fortlev.extractCatalog(context);
      },
    }),

    check_stock_fortlev: createTool({
      id: 'check_stock_fortlev',
      description: 'Check stock availability for multiple SKUs',
      inputSchema: z.object({
        skus: z.array(z.string()),
      }),
      execute: async ({ context }) => {
        return await mcpServers.fortlev.checkStock(context.skus);
      },
    }),
  },

  // Tools similares para outros distribuidores
  // neosolar: { ... },
  // solfacil: { ... },
  // etc.
};
```

---

### 4. Workflows Mastra

**Arquivo:** `mastra/workflows/extraction.ts`

```typescript
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

// Step 1: Authenticate
const authenticateStep = createStep({
  id: 'authenticate',
  inputSchema: z.object({
    distributor: z.enum(['fortlev', 'neosolar', 'solfacil', 'fotus', 'odex', 'edeltec', 'dynamis']),
  }),
  outputSchema: z.object({
    sessionId: z.string(),
    expiresAt: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agentName = `${inputData.distributor}Agent`;
    const agent = mastra.getAgent(agentName);

    const result = await agent.generate(
      `Please authenticate to ${inputData.distributor} using the stored credentials.`,
      {
        memory: {
          thread: `extraction-${inputData.distributor}`,
          resource: 'catalog-sync',
        },
      }
    );

    // Parse authentication result from agent response
    const authData = JSON.parse(result.text);
    return authData;
  },
});

// Step 2: Extract Products
const extractProductsStep = createStep({
  id: 'extract-products',
  inputSchema: z.object({
    distributor: z.enum(['fortlev', 'neosolar', 'solfacil', 'fotus', 'odex', 'edeltec', 'dynamis']),
    mode: z.enum(['full', 'incremental', 'price-only']),
    sessionId: z.string(),
  }),
  outputSchema: z.object({
    productsExtracted: z.number(),
    errors: z.array(z.string()),
    duration: z.number(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agentName = `${inputData.distributor}Agent`;
    const agent = mastra.getAgent(agentName);

    const result = await agent.generate(
      `Extract ${inputData.mode} catalog from ${inputData.distributor}. Session ID: ${inputData.sessionId}`,
      {
        memory: {
          thread: `extraction-${inputData.distributor}`,
          resource: 'catalog-sync',
        },
      }
    );

    const extractionData = JSON.parse(result.text);
    return extractionData;
  },
});

// Step 3: Validate Products
const validateProductsStep = createStep({
  id: 'validate-products',
  inputSchema: z.object({
    distributor: z.string(),
    productsExtracted: z.number(),
  }),
  outputSchema: z.object({
    validProducts: z.number(),
    invalidProducts: z.number(),
    validationErrors: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    // Validation logic
    return {
      validProducts: inputData.productsExtracted,
      invalidProducts: 0,
      validationErrors: [],
    };
  },
});

// Step 4: Save to Database
const saveToDatabaseStep = createStep({
  id: 'save-to-database',
  inputSchema: z.object({
    distributor: z.string(),
    validProducts: z.number(),
  }),
  outputSchema: z.object({
    saved: z.number(),
    errors: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    // Save to PostgreSQL
    return {
      saved: inputData.validProducts,
      errors: [],
    };
  },
});

// Compose workflow
export const extractionWorkflow = createWorkflow({
  id: 'extraction-workflow',
  description: 'Extract catalog from solar distributor using Mastra agents',
  inputSchema: z.object({
    distributor: z.enum(['fortlev', 'neosolar', 'solfacil', 'fotus', 'odex', 'edeltec', 'dynamis']),
    mode: z.enum(['full', 'incremental', 'price-only']).default('incremental'),
  }),
  outputSchema: z.object({
    distributor: z.string(),
    productsExtracted: z.number(),
    validProducts: z.number(),
    saved: z.number(),
    duration: z.number(),
    success: z.boolean(),
  }),
})
  .then(authenticateStep)
  .then(extractProductsStep)
  .then(validateProductsStep)
  .then(saveToDatabaseStep)
  .commit();
```

---

### 5. Integração Temporal + Mastra

**Arquivo:** `orchestrator/mastra-temporal-bridge.ts`

```typescript
import { proxyActivities } from '@temporalio/workflow';
import { mastra } from '../mastra';
import type * as activities from './activities/mastra-activities';

const { executeMastraWorkflow } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 minutes',
  retry: {
    maximumAttempts: 3,
    initialInterval: '10s',
    backoffCoefficient: 2,
  },
});

// Temporal Workflow que executa Mastra Workflow
export async function syncDistributorMastraWorkflow(input: {
  distributor: string;
  mode: 'full' | 'incremental' | 'price-only';
}): Promise<any> {
  // Execute Mastra extraction workflow
  const result = await executeMastraWorkflow({
    workflowName: 'extractionWorkflow',
    input: {
      distributor: input.distributor,
      mode: input.mode,
    },
  });

  return result;
}

export async function syncAllDistributorsMastraWorkflow(): Promise<any[]> {
  const distributors = ['fortlev', 'neosolar', 'solfacil', 'fotus', 'odex', 'edeltec', 'dynamis'];

  const results = await Promise.allSettled(
    distributors.map(distributor =>
      executeMastraWorkflow({
        workflowName: 'extractionWorkflow',
        input: { distributor, mode: 'incremental' },
      })
    )
  );

  return results;
}
```

**Activity Implementation:**

```typescript
// orchestrator/activities/mastra-activities.ts
import { mastra } from '../../mastra';

export async function executeMastraWorkflow(params: {
  workflowName: string;
  input: Record<string, any>;
}): Promise<any> {
  const workflow = mastra.workflows[params.workflowName];

  if (!workflow) {
    throw new Error(`Workflow ${params.workflowName} not found`);
  }

  const { runId, start } = await workflow.createRunAsync();

  console.log(`Starting Mastra workflow ${params.workflowName} - Run ID: ${runId}`);

  const result = await start({ inputData: params.input });

  return result.results;
}
```

---

## 📊 Schemas do Sistema

### Product Schema (Zod)

```typescript
import { z } from 'zod';

export const ProductSchema = z.object({
  sku: z.string(),
  distributor: z.enum(['fortlev', 'neosolar', 'solfacil', 'fotus', 'odex', 'edeltec', 'dynamis']),
  title: z.string(),
  description: z.string().optional(),
  category: z.enum(['panels', 'inverters', 'batteries', 'structures', 'cables', 'accessories', 'monitoring', 'protection', 'tools', 'other']),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  technicalSpecs: z.record(z.string()).optional(),
  pricing: z.object({
    retail: z.number().optional(),
    wholesale: z.number().optional(),
    promotional: z.number().optional(),
    currency: z.string().default('BRL'),
    lastUpdated: z.string(),
  }),
  stock: z.object({
    available: z.number(),
    reserved: z.number().default(0),
    warehouse: z.string().optional(),
    leadTime: z.number().optional(),
  }),
  images: z.array(z.string()).default([]),
  documents: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional(),
  extractedAt: z.string(),
  updatedAt: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;
```

---

## 🔧 Configuração

### 1. Package.json Updates

```json
{
  "dependencies": {
    "@mastra/core": "^0.21.1",
    "@mastra/memory": "^0.21.1",
    "@mastra/libsql": "^0.21.1",
    "@ai-sdk/openai": "^1.0.0",
    "@ai-sdk/anthropic": "^1.0.0",
    "@ai-sdk/google": "^1.0.0",
    "@modelcontextprotocol/sdk": "^1.0.4",
    "@temporalio/activity": "^1.11.4",
    "@temporalio/client": "^1.11.4",
    "@temporalio/worker": "^1.11.4",
    "@temporalio/workflow": "^1.11.4",
    "playwright": "^1.48.0",
    "zod": "^3.23.8",
    "pino": "^9.5.0",
    "p-queue": "^8.0.1",
    "p-retry": "^6.2.1",
    "redis": "^4.7.0",
    "pg": "^8.13.1"
  },
  "scripts": {
    "mastra:dev": "tsx mastra/server.ts",
    "mastra:build": "mastra bundle",
    "worker": "tsx orchestrator/worker.ts",
    "scheduler": "tsx orchestrator/scheduler.ts"
  }
}
```

### 2. Environment Variables

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

## 🚀 Deployment

### Docker Compose

```yaml
version: '3.8'

services:
  # Mastra + MCP Servers
  mastra-server:
    build:
      context: .
      dockerfile: Dockerfile.mastra
    container_name: ysh-mastra-server
    ports:
      - "4111:4111"
    environment:
      LIBSQL_URL: file:/data/mastra.db
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      POSTGRES_URL: postgresql://postgres:postgres@postgres:5432/ysh_solar
      REDIS_URL: redis://redis:6379
    volumes:
      - mastra_data:/data
      - ./mcp-servers:/app/mcp-servers
    depends_on:
      - postgres
      - redis
    networks:
      - ysh-network

  # Temporal Worker (executa workflows Mastra)
  temporal-worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    container_name: ysh-temporal-worker
    environment:
      TEMPORAL_ADDRESS: temporal-server:7233
      POSTGRES_URL: postgresql://postgres:postgres@postgres:5432/ysh_solar
      REDIS_URL: redis://redis:6379
    volumes:
      - ./mcp-servers:/app/mcp-servers
    depends_on:
      - temporal-server
      - postgres
      - redis
      - mastra-server
    networks:
      - ysh-network

  # Infrastructure (já existe no docker-compose.agents.yml)
  postgres:
    image: postgres:15-alpine
    # ... config existente

  redis:
    image: redis:7-alpine
    # ... config existente

  temporal-server:
    image: temporalio/auto-setup:1.22.0
    # ... config existente

volumes:
  mastra_data:
  postgres_data:
  redis_data:

networks:
  ysh-network:
    driver: bridge
```

---

## 📈 Monitoramento

### Métricas Mastra

- **Agent Executions:** Total de invocações por agente
- **Extraction Success Rate:** Taxa de sucesso por distribuidor
- **Products Extracted:** Total de produtos extraídos
- **Error Rate:** Erros por tipo (auth, network, parsing)
- **Latency:** Tempo médio de extração por produto
- **Memory Usage:** Uso de memória working/semantic

### Dashboards

1. **Temporal WebUI:** `http://localhost:8080`
2. **Mastra Playground:** `http://localhost:4111`
3. **Grafana:** `http://localhost:3001` (custom dashboards)

---

## ✅ Vantagens da Integração

### 1. Mastra AI Framework

✅ **Agentes Inteligentes** com memória e contexto  
✅ **Workflows declarativos** com sintaxe .then()/.branch()  
✅ **Multi-LLM support** (OpenAI, Anthropic, Google)  
✅ **Memory system** (working + semantic recall)  
✅ **Tools integration** nativa com MCP protocol  
✅ **TypeScript-first** com type safety completo  

### 2. MCP Protocol Layer

✅ **Padronização** de comunicação entre agentes  
✅ **Reutilização** de MCP servers existentes  
✅ **Isolation** de lógica de scraping/business  
✅ **Testability** com mocks e stubs  

### 3. Temporal Orchestration

✅ **Reliability** com retries automáticos  
✅ **Scheduling** com cron expressions  
✅ **Observability** built-in (traces, metrics)  
✅ **Scalability** horizontal com workers  

---

## 🎯 Próximos Passos

### Sprint 1 (1 semana)

- [ ] Setup Mastra instance com LibSQL
- [ ] Implementar `fortlevAgent` completo
- [ ] Criar tools MCP integration
- [ ] Workflow `extractionWorkflow` funcional
- [ ] Testes E2E Fortlev

### Sprint 2 (1 semana)

- [ ] Implementar agentes: Neosolar, Solfacil, Fotus
- [ ] Workflows de validação e sync
- [ ] Integração Temporal + Mastra
- [ ] Testes de concorrência

### Sprint 3 (1 semana)

- [ ] Implementar agentes: Odex, Edeltec, Dynamis
- [ ] Dashboard de monitoramento
- [ ] Alertas e notificações
- [ ] Documentação completa

### Sprint 4 (1 semana)

- [ ] Performance tuning
- [ ] Load testing (1000+ products)
- [ ] Production deployment
- [ ] Handoff e treinamento

---

## 📚 Referências

- **Mastra AI:** https://mastra.ai/docs
- **MCP Protocol:** https://modelcontextprotocol.io
- **Temporal:** https://docs.temporal.io
- **Playwright:** https://playwright.dev

---

**Status:** 🟡 Ready for Implementation  
**Last Updated:** 2025-10-19  
**Version:** 1.0.0
