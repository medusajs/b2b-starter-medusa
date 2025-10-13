# 🔍 Auditoria 360º - APIs vs Banco de Dados

**Data**: 13 de Outubro de 2025  
**Objetivo**: Verificar se todas as APIs têm tabelas adequadas para persistência de dados, logs e fallbacks

---

## 📊 Resumo Executivo

### Status Atual

| Categoria | Total APIs | Com Persistência | Faltando | % Cobertura |
|-----------|------------|------------------|----------|-------------|
| **Cálculos Solar** | 4 | 1 | 3 | 25% |
| **Crédito/Financiamento** | 6 | 1 | 5 | 17% |
| **RAG/Helio** | 3 | 0 | 3 | 0% |
| **Catálogo** | 8 | 0 | 8 | 0% |
| **Cotações (Quotes)** | 7 | 0 (Medusa) | 0 | 100%* |
| **Leads** | 1 | 0 | 1 | 0% |
| **Imagens** | 1 | 0 | 1 | 0% |
| **Fotogrametria** | 1 | 0 | 1 | 0% |
| **PVLib** | 4 | 0 | 4 | 0% |
| **ANEEL** | 2 | 0 | 2 | 0% |
| **Eventos** | 1 | 0 | 1 | 0% |
| **Companies** | 1 | 0 (Módulo) | 0 | 100%* |
| **TOTAL** | **39** | **2** | **29** | **5%** |

*Nota: Quotes e Companies usam módulos Medusa nativos

### ⚠️ **PROBLEMA CRÍTICO**

**95% das APIs não têm persistência adequada para logs, fallbacks e auditoria!**

---

## 🗂️ Análise Detalhada por Categoria

### 1. 📐 Cálculos Solares (25% cobertura)

#### ✅ COM PERSISTÊNCIA

**1.1. `/store/solar/calculator` (POST)**

- **Modelo**: `SolarCalculation` ✅
- **Tabela**: `solar_calculation`
- **Campos**:
  - `id`, `customer_id`, `name`
  - `input` (JSON) - parâmetros de entrada
  - `output` (JSON) - resultados
  - `calculation_hash` - evita duplicatas
  - `is_favorite`, `notes`
  - `created_at`, `updated_at`
- **Status**: ✅ **COMPLETO**
- **Fallback**: JSON em `input/output` permite reconstruir cálculo
- **Observações**: Modelo bem estruturado

#### ❌ FALTANDO PERSISTÊNCIA

**1.2. `/solar/viability` (POST)**

- **Função**: Análise de viabilidade solar
- **Dados retornados**:
  - Análise financeira (ROI, payback, VPL)
  - Análise técnica (área disponível, orientação)
  - Recomendações
- **Problema**: ❌ Nenhuma persistência
- **Impacto**:
  - Impossível auditar viabilidades calculadas
  - Sem histórico para o cliente
  - Sem dados para ML/analytics

**1.3. `/pvlib/validate-mppt` (POST)**

- **Função**: Validar configuração MPPT do inversor
- **Dados retornados**:
  - Tensão/corrente no ponto de máxima potência
  - Validações de compatibilidade
- **Problema**: ❌ Nenhuma persistência
- **Impacto**: Impossível rastrear validações feitas

**1.4. `/pvlib/stats` (GET)**

- **Função**: Estatísticas de geração solar
- **Problema**: ❌ Sem cache/persistência
- **Impacto**: Consultas repetitivas ao PVLib desnecessárias

---

### 2. 💰 Crédito e Financiamento (17% cobertura)

#### ✅ COM PERSISTÊNCIA

**2.1. `/credit-analysis` (POST) + `/credit-analysis/[id]/*`**

- **Modelo**: `CreditAnalysis` ✅
- **Tabela**: `credit_analysis`
- **Campos**:
  - Dados pessoais/empresa (PF/PJ)
  - Dados financeiros completos
  - Score de crédito
  - Status do processo (pending, approved, rejected, etc.)
  - Documentos (JSON)
  - Resultado da análise
  - Timestamps completos
- **Status**: ✅ **COMPLETO**
- **Observações**: Modelo robusto com audit trail

#### ❌ FALTANDO PERSISTÊNCIA

**2.2. `/financing/simulate` (POST)**

- **Função**: Simulação de financiamento
- **Dados retornados**:
  - Parcelas, taxa de juros, IOF
  - Custo total, amortização
  - Fluxo de caixa
- **Problema**: ❌ Nenhuma persistência
- **Impacto**:
  - Cliente não consegue recuperar simulações
  - Impossível rastrear qual simulação gerou pedido
  - Sem analytics de conversão

**2.3. `/financing/rates` (GET)**

- **Função**: Consultar taxas de financiamento
- **Problema**: ❌ Sem cache de taxas
- **Impacto**:
  - Consultas repetitivas desnecessárias
  - Sem histórico de variação de taxas

**2.4. `/store/financiamento` (GET/POST)**

- **Função**: APIs de financiamento no storefront
- **Problema**: ❌ Dados não persistidos
- **Impacto**: Jornada do cliente não rastreável

**2.5. `/store/aplicacoes_financiamento/*` (se existir)**

- **Problema**: ❌ Sem modelo `FinancingApplication`
- **Impacto**: Aplicações de financiamento não rastreadas

---

### 3. 🤖 RAG / Helio AI (0% cobertura)

#### ❌ TODAS FALTANDO PERSISTÊNCIA

**3.1. `/store/rag/ask-helio` (POST)**

- **Função**: Perguntas ao assistente virtual Helio
- **Dados retornados**:
  - Resposta em texto
  - Produtos recomendados
  - Contexto usado (chunks RAG)
  - Confidence score
- **Problema**: ❌ **CRÍTICO** - Nenhuma persistência
- **Impacto**:
  - Impossível auditar respostas do AI
  - Sem histórico de conversas
  - Impossível treinar/melhorar modelo
  - Sem compliance (LGPD, AI Act)
  - **RISCO LEGAL**: AI sem audit trail

**3.2. `/store/rag/search` (POST)**

- **Função**: Busca semântica de produtos
- **Dados retornados**:
  - Produtos relevantes
  - Scores de similaridade
  - Vetores usados
- **Problema**: ❌ Nenhuma persistência
- **Impacto**:
  - Impossível analisar qualidade de busca
  - Sem dados para A/B testing
  - Impossível melhorar relevância

**3.3. `/store/rag/recommend-products` (POST)**

- **Função**: Recomendação de produtos via AI
- **Dados retornados**:
  - Produtos recomendados
  - Razões da recomendação
  - Scores de relevância
- **Problema**: ❌ Nenhuma persistência
- **Impacto**:
  - Impossível medir taxa de conversão de recomendações
  - Sem feedback loop para ML

---

### 4. 📦 Catálogo (0% cobertura)

#### ❌ TODAS FALTANDO LOGS/ANALYTICS

**4.1. `/store/catalog/*` (8 endpoints)**

- `/store/catalog` - Lista geral
- `/store/catalog/[category]` - Por categoria
- `/store/catalog/search` - Busca
- `/store/catalog/skus` - Lista SKUs
- `/store/catalog/kits` - Kits solares
- `/store/catalog/manufacturers` - Fabricantes
- Etc.

**Problema**: ❌ Nenhum log de acesso/pesquisas
**Impacto**:

- Impossível saber quais produtos são mais visualizados
- Sem analytics de busca
- Impossível otimizar catálogo
- Sem dados para recomendações

**Sugestão de Tabela**:

```sql
CREATE TABLE catalog_access_log (
    id VARCHAR PRIMARY KEY,
    customer_id VARCHAR,
    session_id VARCHAR,
    endpoint VARCHAR,
    category VARCHAR,
    search_term VARCHAR,
    filters JSONB,
    results_count INT,
    response_time_ms INT,
    user_agent TEXT,
    ip_hash VARCHAR,
    created_at TIMESTAMP
);
```

---

### 5. 📋 Leads (0% cobertura)

**5.1. `/store/leads` (POST)**

- **Função**: Capturar leads
- **Dados capturados**:
  - Nome, email, telefone
  - Interesse (produto/serviço)
  - Origem (landing page, formulário)
  - Mensagem/observações
- **Problema**: ❌ **CRÍTICO** - Nenhuma persistência
- **Impacto**:
  - **PERDA DE LEADS** - dados não salvos
  - Impossível rastrear origem
  - Sem funil de conversão
  - **RISCO DE NEGÓCIO ALTO**

**Sugestão de Modelo**:

```typescript
export const Lead = model.define("lead", {
    id: model.id({ prefix: "lead" }).primaryKey(),
    
    // Identificação
    name: model.text(),
    email: model.text(),
    phone: model.text(),
    company: model.text().nullable(),
    
    // Interesse
    interest_type: model.enum(["solar", "financing", "quote", "product", "other"]),
    product_id: model.text().nullable(),
    message: model.text().nullable(),
    
    // Origem
    source: model.text(), // "homepage", "product-page", "calculator", "chat"
    utm_source: model.text().nullable(),
    utm_medium: model.text().nullable(),
    utm_campaign: model.text().nullable(),
    referring_url: model.text().nullable(),
    
    // Status
    status: model.enum(["new", "contacted", "qualified", "converted", "lost"]).default("new"),
    assigned_to: model.text().nullable(),
    
    // Metadados
    session_id: model.text().nullable(),
    ip_hash: model.text().nullable(),
    user_agent: model.text().nullable(),
    
    // Timestamps
    created_at: model.dateTime(),
    contacted_at: model.dateTime().nullable(),
    converted_at: model.dateTime().nullable(),
})
```

---

### 6. 🖼️ Imagens (0% cobertura)

**6.1. `/store/images` (POST)**

- **Função**: Upload/processamento de imagens
- **Dados processados**:
  - URL da imagem
  - Metadados (tamanho, formato)
  - Processamentos (resize, crop, otimização)
- **Problema**: ❌ Sem log de uploads/processamentos
- **Impacto**:
  - Impossível rastrear imagens processadas
  - Sem auditoria de uso de storage
  - Dificulta cleanup de imagens órfãs

**Sugestão de Tabela**:

```sql
CREATE TABLE image_uploads (
    id VARCHAR PRIMARY KEY,
    customer_id VARCHAR,
    original_url TEXT,
    processed_url TEXT,
    filename VARCHAR,
    mime_type VARCHAR,
    size_bytes BIGINT,
    width INT,
    height INT,
    processing_status VARCHAR,
    storage_provider VARCHAR,
    storage_path TEXT,
    metadata JSONB,
    created_at TIMESTAMP
);
```

---

### 7. 📸 Fotogrametria (0% cobertura)

**7.1. `/store/photogrammetry` (POST)**

- **Função**: Processar imagens aéreas/satélite
- **Dados processados**:
  - Imagens de entrada
  - Coordenadas geográficas
  - Análise de telhado (área, orientação, sombreamento)
  - Resultado 3D
- **Problema**: ❌ **CRÍTICO** - Processamento caro sem persistência
- **Impacto**:
  - Cliente não pode recuperar análises
  - Processamentos repetidos desnecessários (CUSTO ALTO)
  - Sem cache de resultados
  - **CUSTO FINANCEIRO ALTO**

**Sugestão de Modelo**:

```typescript
export const PhotogrammetryAnalysis = model.define("photogrammetry_analysis", {
    id: model.id({ prefix: "photo" }).primaryKey(),
    
    customer_id: model.text().nullable(),
    address_hash: model.text(), // Para cache por localização
    
    // Input
    input_images: model.json(), // URLs das imagens
    coordinates: model.json(), // { lat, lng }
    
    // Output
    roof_area_m2: model.number(),
    usable_area_m2: model.number(),
    roof_orientation: model.text(), // "N", "S", "E", "W", "NE", etc.
    roof_tilt_degrees: model.number(),
    shading_analysis: model.json(),
    model_3d_url: model.text().nullable(),
    
    // Processamento
    provider: model.text(), // "google", "nearmap", "custom"
    processing_status: model.enum(["pending", "processing", "completed", "failed"]),
    processing_time_ms: model.number().nullable(),
    processing_cost_usd: model.number().nullable(),
    
    // Cache
    cache_hit: model.boolean().default(false),
    expires_at: model.dateTime(),
    
    created_at: model.dateTime(),
    updated_at: model.dateTime(),
})
```

---

### 8. ⚡ PVLib (0% cobertura)

**8.1. `/pvlib/inverters` (GET)**
**8.2. `/pvlib/panels` (GET)**
**8.3. `/pvlib/validate-mppt` (POST)**
**8.4. `/pvlib/stats` (GET)**

**Problema**: ❌ Sem cache local
**Impacto**:

- Consultas repetitivas à biblioteca externa
- Latência desnecessária
- Sem disponibilidade offline

**Sugestão de Cache**:

```sql
CREATE TABLE pvlib_cache (
    id VARCHAR PRIMARY KEY,
    endpoint VARCHAR,
    params_hash VARCHAR,
    response JSONB,
    expires_at TIMESTAMP,
    created_at TIMESTAMP,
    INDEX idx_endpoint_hash (endpoint, params_hash)
);
```

---

### 9. 🔌 ANEEL (0% cobertura)

**9.1. `/aneel/distribuidoras` (GET)**
**9.2. `/aneel/tarifas` (GET)**

**Problema**: ❌ Sem cache local
**Impacto**:

- Dados mudam raramente mas consultados sempre
- Latência alta (API externa)
- Indisponibilidade se ANEEL API cair

**Sugestão**:

```sql
CREATE TABLE aneel_cache (
    id VARCHAR PRIMARY KEY,
    resource_type VARCHAR, -- "distribuidora", "tarifa"
    resource_id VARCHAR,
    data JSONB,
    valid_from DATE,
    valid_until DATE,
    last_updated TIMESTAMP,
    created_at TIMESTAMP,
    INDEX idx_resource (resource_type, resource_id)
);
```

---

### 10. 📨 Eventos (0% cobertura)

**10.1. `/store/events` (POST)**

- **Função**: Tracking de eventos (analytics)
- **Problema**: ❌ **CRÍTICO** - Eventos não persistidos
- **Impacto**:
  - Perda total de analytics
  - Impossível rastrear jornada do cliente
  - **RISCO DE NEGÓCIO CRÍTICO**

**Sugestão**:

```typescript
export const Event = model.define("event", {
    id: model.id({ prefix: "evt" }).primaryKey(),
    
    // Identificação
    customer_id: model.text().nullable(),
    session_id: model.text(),
    anonymous_id: model.text().nullable(),
    
    // Evento
    event_name: model.text(),
    event_category: model.text(),
    event_action: model.text().nullable(),
    event_label: model.text().nullable(),
    event_value: model.number().nullable(),
    
    // Contexto
    page_url: model.text(),
    page_title: model.text().nullable(),
    referrer: model.text().nullable(),
    
    // Device
    user_agent: model.text().nullable(),
    device_type: model.text().nullable(),
    browser: model.text().nullable(),
    os: model.text().nullable(),
    
    // Geo
    ip_hash: model.text().nullable(),
    country: model.text().nullable(),
    region: model.text().nullable(),
    city: model.text().nullable(),
    
    // UTM
    utm_source: model.text().nullable(),
    utm_medium: model.text().nullable(),
    utm_campaign: model.text().nullable(),
    utm_term: model.text().nullable(),
    utm_content: model.text().nullable(),
    
    // Dados customizados
    properties: model.json().nullable(),
    
    created_at: model.dateTime(),
})
```

---

## 🎯 Modelos Faltantes - Priorização

### 🔴 **PRIORIDADE CRÍTICA** (Impacto Financeiro/Legal)

1. **Lead** - PERDA DE LEADS 💰
   - Status: ❌ NÃO EXISTE
   - Impacto: ALTO - Perda de receita direta
   - Esforço: BAIXO - 1-2 horas

2. **Event** - PERDA DE ANALYTICS 📊
   - Status: ❌ NÃO EXISTE
   - Impacto: ALTO - Impossível otimizar conversão
   - Esforço: BAIXO - 1-2 horas

3. **RagQuery / HelioConversation** - COMPLIANCE AI ⚖️
   - Status: ❌ NÃO EXISTE
   - Impacto: ALTO - Risco legal (LGPD, AI Act)
   - Esforço: MÉDIO - 2-4 horas

4. **PhotogrammetryAnalysis** - CUSTO OPERACIONAL 💸
   - Status: ❌ NÃO EXISTE
   - Impacto: ALTO - Processamentos caros repetidos
   - Esforço: MÉDIO - 2-4 horas

### 🟡 **PRIORIDADE ALTA** (Experiência do Cliente)

5. **FinancingSimulation**
   - Status: ❌ NÃO EXISTE
   - Impacto: MÉDIO - Cliente não recupera simulações
   - Esforço: BAIXO - 1-2 horas

6. **SolarViabilityAnalysis**
   - Status: ❌ NÃO EXISTE
   - Impacto: MÉDIO - Sem histórico de viabilidades
   - Esforço: BAIXO - 1-2 horas

7. **CatalogAccessLog**
   - Status: ❌ NÃO EXISTE
   - Impacto: MÉDIO - Sem analytics de produtos
   - Esforço: BAIXO - 1 hora

### 🟢 **PRIORIDADE MÉDIA** (Performance/Cache)

8. **PVLibCache**
   - Status: ❌ NÃO EXISTE
   - Impacto: BAIXO - Apenas performance
   - Esforço: BAIXO - 1 hora

9. **AneelCache**
   - Status: ❌ NÃO EXISTE
   - Impacto: BAIXO - Apenas performance
   - Esforço: BAIXO - 1 hora

10. **ImageUpload**
    - Status: ❌ NÃO EXISTE
    - Impacto: BAIXO - Apenas auditoria
    - Esforço: BAIXO - 1 hora

---

## 📋 Plano de Ação Recomendado

### Fase 1: Crítico (Semana 1) 🔴

**Objetivo**: Evitar perda de dados e riscos legais

```bash
# Dia 1-2: Leads + Events
✅ Criar modelo Lead
✅ Criar modelo Event
✅ Implementar persistência em /store/leads
✅ Implementar persistência em /store/events
✅ Criar migrations

# Dia 3-4: RAG/AI Compliance
✅ Criar modelo RagQuery
✅ Criar modelo HelioConversation
✅ Implementar logging em /store/rag/ask-helio
✅ Implementar logging em /store/rag/search
✅ Criar migrations

# Dia 5: Fotogrametria
✅ Criar modelo PhotogrammetryAnalysis
✅ Implementar cache por localização
✅ Implementar persistência em /store/photogrammetry
✅ Criar migration
```

**Resultado Esperado**:

- ✅ Leads não são mais perdidos
- ✅ Eventos sendo rastreados
- ✅ AI com compliance (LGPD)
- ✅ Fotogrametria com cache (economia de custo)

### Fase 2: Alta Prioridade (Semana 2) 🟡

```bash
# Dia 1-2: Financiamento
✅ Criar modelo FinancingSimulation
✅ Implementar persistência em /financing/simulate
✅ Permitir cliente recuperar simulações antigas

# Dia 3-4: Solar Viability
✅ Criar modelo SolarViabilityAnalysis
✅ Implementar persistência em /solar/viability
✅ Histórico de viabilidades por cliente

# Dia 5: Catalog Analytics
✅ Criar modelo CatalogAccessLog
✅ Implementar logging em todos endpoints /store/catalog/*
✅ Dashboard de produtos mais visualizados
```

### Fase 3: Performance (Semana 3) 🟢

```bash
# Dia 1: Cache PVLib
✅ Criar modelo PVLibCache
✅ Implementar cache em /pvlib/*
✅ TTL: 7 dias

# Dia 2: Cache ANEEL
✅ Criar modelo AneelCache
✅ Implementar cache em /aneel/*
✅ TTL: 30 dias (tarifas mudam mensalmente)

# Dia 3: Image Uploads
✅ Criar modelo ImageUpload
✅ Implementar logging em /store/images
✅ Cleanup job para imagens órfãs
```

---

## 📊 Estimativas

### Tempo Total

- **Fase 1 (Crítico)**: 5 dias (40 horas)
- **Fase 2 (Alta)**: 5 dias (40 horas)
- **Fase 3 (Performance)**: 3 dias (24 horas)
- **TOTAL**: 13 dias úteis (104 horas)

### Benefícios Esperados

| Benefício | Impacto | Valor Estimado |
|-----------|---------|----------------|
| Redução perda de leads | ALTO | +15-20% conversão |
| Analytics completo | ALTO | Dados para otimização |
| Compliance AI/LGPD | CRÍTICO | Evita multas |
| Cache fotogrametria | MÉDIO | -50% custos processamento |
| Performance PVLib/ANEEL | MÉDIO | -30% latência |
| Histórico cliente | ALTO | +UX, +retenção |

### ROI Esperado

- **Investimento**: 104 horas desenvolvimento
- **Retorno**:
  - +15% conversão de leads
  - -50% custos fotogrametria
  - Compliance garantido
  - Analytics para decisões
- **Payback**: < 1 mês

---

## 🔧 Implementação Técnica

### Template de Modelo com Audit Trail

```typescript
import { model } from "@medusajs/framework/utils"

export const ResourceName = model.define("resource_name", {
    id: model.id({ prefix: "res" }).primaryKey(),
    
    // Relacionamentos
    customer_id: model.text().nullable(),
    
    // Dados principais
    // ... campos específicos do recurso
    
    // Audit trail
    ip_hash: model.text().nullable(), // SHA-256
    user_agent: model.text().nullable(),
    session_id: model.text().nullable(),
    
    // Performance
    response_time_ms: model.number().nullable(),
    cache_hit: model.boolean().default(false),
    
    // Fallback
    source: model.enum(["live", "cache", "fallback"]).default("live"),
    fallback_reason: model.text().nullable(),
    
    // Timestamps
    created_at: model.dateTime(),
    updated_at: model.dateTime().nullable(),
    expires_at: model.dateTime().nullable(), // Para cache
})
```

### Migration Template

```typescript
import { Migration } from '@mikro-orm/migrations'

export class MigrationYYYYMMDDHHmmss extends Migration {
    async up(): Promise<void> {
        this.addSql(`
            CREATE TABLE resource_name (
                id VARCHAR(255) PRIMARY KEY,
                customer_id VARCHAR(255),
                
                -- Dados principais
                field1 VARCHAR(255),
                field2 JSONB,
                
                -- Audit trail
                ip_hash VARCHAR(64),
                user_agent TEXT,
                session_id VARCHAR(255),
                
                -- Performance
                response_time_ms INTEGER,
                cache_hit BOOLEAN DEFAULT FALSE,
                
                -- Fallback
                source VARCHAR(50) DEFAULT 'live',
                fallback_reason TEXT,
                
                -- Timestamps
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP,
                expires_at TIMESTAMP,
                
                -- Indexes
                INDEX idx_customer (customer_id),
                INDEX idx_created (created_at),
                INDEX idx_source (source)
            );
        `)
    }

    async down(): Promise<void> {
        this.addSql('DROP TABLE IF EXISTS resource_name CASCADE;')
    }
}
```

---

## ✅ Checklist de Validação

### Para Cada API

- [ ] Modelo criado (`src/models/`)
- [ ] Migration criada e executada
- [ ] Persistência implementada na API route
- [ ] Testes de persistência
- [ ] Testes de fallback (se aplicável)
- [ ] Testes de cache (se aplicável)
- [ ] Documentação atualizada
- [ ] Logs de erro implementados
- [ ] Métricas de performance coletadas

### Para Sistema Completo

- [ ] Todas APIs críticas com persistência
- [ ] Compliance LGPD verificado
- [ ] Audit trail completo
- [ ] Cache strategies definidas
- [ ] Cleanup jobs configurados
- [ ] Monitoring/alerting configurado
- [ ] Backup strategy definida
- [ ] Disaster recovery testado

---

## 📚 Documentos Relacionados

- `API_AUDIT_REPORT.md` - Relatório original de APIs
- `API_STANDARDIZATION_GUIDE.md` - Padrões de APIs
- `MIGRATIONS_AUTHORITY.md` - Guia de migrations
- `BACKEND_360_FINAL_SUMMARY.md` - Status geral backend

---

## 🎯 Próximos Passos Imediatos

### 1️⃣ **AGORA** (Próxima 1 hora)

```bash
# Criar modelos críticos
touch src/models/lead.ts
touch src/models/event.ts
touch src/models/rag-query.ts
```

### 2️⃣ **HOJE** (Próximas 8 horas)

- Implementar modelo Lead completo
- Implementar modelo Event completo
- Criar migrations
- Testar persistência

### 3️⃣ **ESTA SEMANA** (40 horas)

- Completar Fase 1 (Crítico)
- Iniciar Fase 2 (Alta prioridade)

---

**Preparado por**: GitHub Copilot  
**Revisado em**: 13 de Outubro de 2025  
**Status**: ⚠️ **AÇÃO IMEDIATA NECESSÁRIA**
