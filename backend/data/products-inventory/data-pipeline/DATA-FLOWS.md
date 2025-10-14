# 🌊 YSH Data Pipeline - Complete Data Flows & Workflows

**Date**: October 14, 2025  
**Version**: 1.0.0  
**Purpose**: Comprehensive documentation of all data flows, workflows, and system integrations

---

## 📋 Table of Contents

- [🌊 YSH Data Pipeline - Complete Data Flows \& Workflows](#-ysh-data-pipeline---complete-data-flows--workflows)
  - [📋 Table of Contents](#-table-of-contents)
  - [🏗️ System Architecture Overview](#️-system-architecture-overview)
    - [High-Level Architecture](#high-level-architecture)
  - [🌊 Data Flow Diagrams](#-data-flow-diagrams)
    - [1. Daily Full Ingestion Flow](#1-daily-full-ingestion-flow)
    - [2. Hourly Incremental Check Flow](#2-hourly-incremental-check-flow)
    - [3. Fallback Recovery Flow](#3-fallback-recovery-flow)
  - [🔄 Processing Pipelines](#-processing-pipelines)
    - [Data Processing Pipeline](#data-processing-pipeline)
  - [💾 Storage Strategies](#-storage-strategies)
    - [Multi-Layer Storage Architecture](#multi-layer-storage-architecture)
    - [Data Flow Between Storage Layers](#data-flow-between-storage-layers)

---

## 🏗️ System Architecture Overview

### High-Level Architecture

```tsx
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL DATA SOURCES                               │
├──────────────────┬──────────────────────┬──────────────────┬────────────────┤
│                  │                      │                  │                │
│  ANEEL APIs      │  Utility Portals     │  PDF Documents   │  Manufacturers │
│  ├─ RSS 2.0      │  ├─ CPFL            │  ├─ NBR Standards│  ├─ Fortlev    │
│  ├─ DCAT US 1.1  │  ├─ Enel            │  ├─ Resolutions  │  ├─ Fotus      │
│  ├─ DCAT AP 2/3  │  ├─ Energisa        │  └─ Manuals      │  ├─ Neosolar   │
│  ├─ Search API   │  ├─ Cemig           │                  │  └─ Odex       │
│  └─ CKAN API     │  └─ Light           │                  │                │
│                  │                      │                  │                │
└────────┬─────────┴───────────┬──────────┴────────┬─────────┴────────┬───────┘
         │                     │                   │                  │
         ▼                     ▼                   ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INGESTION LAYER                                    │
├──────────────────┬──────────────────────┬──────────────────┬────────────────┤
│                  │                      │                  │                │
│  ANEEL Fetcher   │  Crawlee Scraper     │  PDF Extractor   │  CSV Parser    │
│  (392 lines)     │  (450 lines)         │  (300 lines)     │  (200 lines)   │
│                  │                      │                  │                │
│  • Async HTTP    │  • Playwright        │  • PyMuPDF       │  • Pandas      │
│  • RSS parsing   │  • JavaScript        │  • Regex extract │  • Validation  │
│  • Rate limiting │  • Smart navigation  │  • Table parsing │  • Mapping     │
│                  │                      │                  │                │
└────────┬─────────┴───────────┬──────────┴────────┬─────────┴────────┬───────┘
         │                     │                   │                  │
         └──────────────┬──────┴───────────────────┴──────────────────┘
                        │
                        ▼
         ┌──────────────────────────────────────┐
         │     ORCHESTRATION & SCHEDULING       │
         ├──────────────┬──────────────────────┤
         │  Airflow     │  Node-RED  │  Step   │
         │  3 DAGs      │  Flows     │  Fns    │
         └──────┬───────┴──────┬─────┴────┬────┘
                │              │          │
                ▼              ▼          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROCESSING LAYER                                     │
├──────────────────┬──────────────────────┬──────────────────┬────────────────┤
│                  │                      │                  │                │
│  Data Processor  │  AI Enrichment       │  Validator       │  Normalizer    │
│  (280 lines)     │  (450 lines)         │  (250 lines)     │  (200 lines)   │
│                  │                      │                  │                │
│  • Deduplication │  • Ollama LLM        │  • INMETRO check │  • Field map   │
│  • Merging       │  • Categorization    │  • ANEEL rules   │  • Type cast   │
│  • Transformation│  • Keyword extract   │  • PVLIB calc    │  • Sanitize    │
│                  │                      │                  │                │
└────────┬─────────┴───────────┬──────────┴────────┬─────────┴────────┬───────┘
         │                     │                   │                  │
         └──────────────┬──────┴───────────────────┴──────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STORAGE LAYER                                      │
├──────────────────┬──────────────────────┬──────────────────┬────────────────┤
│                  │                      │                  │                │
│  PostgreSQL      │  DynamoDB            │  S3              │  Redis         │
│  (Structured)    │  (Cache/NoSQL)       │  (Objects)       │  (Cache)       │
│                  │                      │                  │                │
│  • Products      │  • Latest ingestion  │  • Raw JSON      │  • API cache   │
│  • Tariffs       │  • Fallback data     │  • Processed     │  • Session     │
│  • Generation    │  • TTL auto-expire   │  • Images        │  • 5-min TTL   │
│  • Certs         │                      │  • Documents     │                │
│                  │                      │                  │                │
└────────┬─────────┴───────────┬──────────┴────────┬─────────┴────────┬───────┘
         │                     │                   │                  │
         └──────────────┬──────┴───────────────────┴──────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VECTOR STORE LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Qdrant Vector Database                                                      │
│  • Semantic search with embeddings (all-MiniLM-L6-v2)                       │
│  • 384-dimensional vectors                                                   │
│  • Cosine similarity matching                                                │
│  • Collections: datasets, products, manuals                                  │
│                                                                               │
└────────────────────────────────────────────────┬────────────────────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                                  │
├──────────────────┬──────────────────────┬──────────────────┬────────────────┤
│                  │                      │                  │                │
│  FastAPI REST    │  GraphQL             │  WebSocket       │  API Gateway   │
│  (370 lines)     │  (Future)            │  (Real-time)     │  (AWS)         │
│                  │                      │                  │                │
│  • 7 endpoints   │  • Flexible queries  │  • Live updates  │  • Rate limit  │
│  • Pagination    │  • Nested relations  │  • Pub/Sub Redis │  • Auth        │
│  • Filtering     │  • Type safety       │  • Event stream  │  • Throttle    │
│  • OpenAPI docs  │                      │                  │                │
│                  │                      │                  │                │
└────────┬─────────┴───────────┬──────────┴────────┬─────────┴────────┬───────┘
         │                     │                   │                  │
         └──────────────┬──────┴───────────────────┴──────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CONSUMERS                                         │
├──────────────────┬──────────────────────┬──────────────────┬────────────────┤
│                  │                      │                  │                │
│  Medusa Backend  │  Next.js Storefront  │  Mobile App      │  Admin Panel   │
│  (E-commerce)    │  (Customer)          │  (Future)        │  (Management)  │
│                  │                      │                  │                │
│  • Product sync  │  • Product catalog   │  • Native exp    │  • Data mgmt   │
│  • Inventory     │  • Search            │  • Offline mode  │  • Analytics   │
│  • Pricing       │  • Calculator        │  • Push notifs   │  • Reports     │
│                  │                      │                  │                │
└──────────────────┴──────────────────────┴──────────────────┴────────────────┘
```

---

## 🌊 Data Flow Diagrams

### 1. Daily Full Ingestion Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DAILY FULL INGESTION WORKFLOW                             │
│                    Trigger: Cron (02:00 AM daily)                           │
└─────────────────────────────────────────────────────────────────────────────┘

START (02:00 AM)
    │
    ├─────────────────────────────────────────────────────────┐
    │                                                           │
    ▼                                                           ▼
┌─────────────────────────┐                        ┌─────────────────────────┐
│  FETCH ANEEL DATA       │                        │  SCRAPE UTILITIES       │
│  (Parallel execution)   │                        │  (Parallel execution)   │
├─────────────────────────┤                        ├─────────────────────────┤
│  • RSS Feed             │                        │  • CPFL Portal          │
│  • DCAT Catalogs        │                        │  • Enel Portal          │
│  • Search API           │                        │  • Energisa Portal      │
│  • Generation data      │                        │  • Cemig Portal         │
│  • Tariffs              │                        │  • Light Portal         │
│  • Certifications       │                        │                         │
│                         │                        │                         │
│  Output: ~50-200        │                        │  Output: ~100-500       │
│  datasets JSON          │                        │  records JSON           │
│                         │                        │                         │
│  XCom: aneel_datasets   │                        │  XCom: utility_records  │
└────────────┬────────────┘                        └────────────┬────────────┘
             │                                                  │
             │     ┌────────────────────────────────────────────┘
             │     │
             ▼     ▼
    ┌─────────────────────────┐
    │  MERGE & DEDUPLICATE    │
    ├─────────────────────────┤
    │  • Combine sources      │
    │  • Remove duplicates    │
    │  • Resolve conflicts    │
    │  • Normalize fields     │
    │                         │
    │  Logic:                 │
    │  1. Group by ID         │
    │  2. Keep most recent    │
    │  3. Merge metadata      │
    │                         │
    │  Output: ~150-700       │
    │  unique records         │
    └────────────┬────────────┘
                 │
                 ▼
    ┌─────────────────────────┐
    │  PROCESS WITH AI        │
    │  (Ollama LLM)           │
    ├─────────────────────────┤
    │  • Categorize datasets  │
    │  • Extract keywords     │
    │  • Generate summaries   │
    │  • Calculate relevance  │
    │                         │
    │  Model: llama3.2:3b     │
    │  Batch: 20 at a time    │
    │  Timeout: 120s each     │
    │                         │
    │  Enrichment:            │
    │  {                      │
    │    categoria: string    │
    │    palavras_chave: []   │
    │    resumo_curto: str    │
    │    relevancia_ysh: 1-10 │
    │  }                      │
    └────────────┬────────────┘
                 │
                 ▼
    ┌─────────────────────────┐
    │  VALIDATE & CLEAN       │
    ├─────────────────────────┤
    │  • INMETRO compliance   │
    │  • ANEEL regulations    │
    │  • Technical specs      │
    │  • Data quality         │
    │                         │
    │  Checks:                │
    │  • Power rating valid   │
    │  • Dates consistent     │
    │  • Location valid       │
    │  • URLs accessible      │
    │                         │
    │  Output: Clean + marked │
    │  validation flags       │
    └────────────┬────────────┘
                 │
                 ├─────────────────────────────────────┐
                 │                                     │
                 ▼                                     ▼
    ┌─────────────────────────┐          ┌─────────────────────────┐
    │  INDEX IN VECTOR STORE  │          │  SAVE TO DATABASES      │
    │  (Qdrant)               │          │  (PostgreSQL + Dynamo)  │
    ├─────────────────────────┤          ├─────────────────────────┤
    │  • Generate embeddings  │          │  PostgreSQL:            │
    │  • Store vectors        │          │  • INSERT products      │
    │  • Update collections   │          │  • UPDATE tariffs       │
    │                         │          │  • UPSERT generation    │
    │  Embedding model:       │          │                         │
    │  all-MiniLM-L6-v2       │          │  DynamoDB:              │
    │  Dimension: 384         │          │  • PUT latest state     │
    │  Similarity: Cosine     │          │  • TTL: 24 hours        │
    │                         │          │                         │
    │  Indexed: ~150-700 docs │          │  S3:                    │
    └────────────┬────────────┘          │  • JSON backup          │
                 │                       │  • Timestamped files    │
                 │                       └────────────┬────────────┘
                 │                                    │
                 └────────────────┬───────────────────┘
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │  UPDATE CACHE           │
                     │  (Redis)                │
                     ├─────────────────────────┤
                     │  • SET last_run         │
                     │  • SET dataset_count    │
                     │  • SET status           │
                     │  • TTL: 6 hours         │
                     │                         │
                     │  Keys:                  │
                     │  - ysh:last_ingestion   │
                     │  - ysh:dataset_count    │
                     │  - ysh:status           │
                     └────────────┬────────────┘
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │  SEND NOTIFICATIONS     │
                     ├─────────────────────────┤
                     │  • Email summary        │
                     │  • SNS publish          │
                     │  • Slack webhook        │
                     │                         │
                     │  Content:               │
                     │  - Datasets processed   │
                     │  - Errors encountered   │
                     │  - Execution time       │
                     │  - Next run scheduled   │
                     └────────────┬────────────┘
                                  │
                                  ▼
                              SUCCESS
                         (Duration: ~15-20 min)
```

### 2. Hourly Incremental Check Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  HOURLY INCREMENTAL CHECK WORKFLOW                           │
│                  Trigger: Cron (00 * * * * - every hour)                   │
└─────────────────────────────────────────────────────────────────────────────┘

START (Every hour)
    │
    ▼
┌─────────────────────────┐
│  CHECK FOR UPDATES      │
│  (BranchPythonOperator) │
├─────────────────────────┤
│  Logic:                 │
│  1. Query Redis         │
│     last_run timestamp  │
│                         │
│  2. Check RSS feed      │
│     for new items since │
│     last_run            │
│                         │
│  3. Query Search API    │
│     modified:[lastrun   │
│     TO now]             │
│                         │
│  Decision:              │
│  • new_datasets > 0     │
│    → process_updates    │
│  • new_datasets == 0    │
│    → skip_processing    │
└────────────┬────────────┘
             │
         ┌───┴───┐
         │       │
    YES  │       │  NO
         │       │
         ▼       ▼
    ┌─────────────────────────┐     ┌─────────────────────────┐
    │  PROCESS UPDATES        │     │  SKIP PROCESSING        │
    ├─────────────────────────┤     ├─────────────────────────┤
    │  • Fetch new datasets   │     │  • Log "No updates"     │
    │  • AI enrichment        │     │  • Update Redis         │
    │  • Validation           │     │    check_timestamp      │
    │  • Index in Qdrant      │     │  • Exit gracefully      │
    │  • Save to DB           │     │                         │
    │  • Update cache         │     │  Duration: ~5 seconds   │
    │                         │     └─────────────────────────┘
    │  Output: Incremental    │
    │  update summary         │
    │                         │
    │  Duration: ~3-5 min     │
    └────────────┬────────────┘
                 │
                 ▼
            ┌─────────────────────────┐
            │  LOG SUMMARY            │
            ├─────────────────────────┤
            │  • New datasets: N      │
            │  • Updated: M           │
            │  • Errors: E            │
            │  • Duration: Xs         │
            └─────────────────────────┘
                 │
                 ▼
             SUCCESS
```

### 3. Fallback Recovery Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     FALLBACK RECOVERY WORKFLOW                               │
│                     Trigger: Manual or Auto (on failure)                    │
└─────────────────────────────────────────────────────────────────────────────┘

START (Error detected)
    │
    ▼
┌─────────────────────────┐
│  HEALTH CHECK SERVICES  │
├─────────────────────────┤
│  • Redis connection     │
│  • PostgreSQL query     │
│  • Ollama endpoint      │
│  • S3 access            │
│  • DynamoDB read        │
│                         │
│  Status: {              │
│    redis: UP/DOWN       │
│    postgres: UP/DOWN    │
│    ollama: UP/DOWN      │
│  }                      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  TRY PRIMARY SOURCE     │
│  (ANEEL API)            │
├─────────────────────────┤
│  Endpoint:              │
│  dadosabertos-aneel...  │
│                         │
│  Timeout: 30s           │
│  Retry: 3 times         │
│  Backoff: 2^n seconds   │
└────────────┬────────────┘
             │
         ┌───┴───┐
         │       │
    SUCCESS│     │ FAILURE
         │       │
         ▼       ▼
    ┌─────────────────────────┐     ┌─────────────────────────┐
    │  USE PRIMARY DATA       │     │  WAIT 60 SECONDS        │
    │  (Fresh from API)       │     └────────────┬────────────┘
    ├─────────────────────────┤                  │
    │  • Process normally     │                  ▼
    │  • Update cache         │     ┌─────────────────────────┐
    │  • Clear fallback flags │     │  TRY RSS FEED           │
    │                         │     │  (Alternative source)   │
    └────────────┬────────────┘     ├─────────────────────────┤
                 │                  │  Endpoint:              │
                 │                  │  .../api/feed/rss/2.0   │
                 │                  │                         │
                 │                  │  Timeout: 30s           │
                 │                  │  Retry: 3 times         │
                 │                  └────────────┬────────────┘
                 │                               │
                 │                           ┌───┴───┐
                 │                           │       │
                 │                      SUCCESS│     │ FAILURE
                 │                           │       │
                 │                           ▼       ▼
                 │              ┌─────────────────────────┐     ┌─────────────────────────┐
                 │              │  USE RSS DATA           │     │  WAIT 60 SECONDS        │
                 │              │  (Limited metadata)     │     └────────────┬────────────┘
                 │              ├─────────────────────────┤                  │
                 │              │  • Parse feed           │                  ▼
                 │              │  • Basic enrichment     │     ┌─────────────────────────┐
                 │              │  • Mark as fallback     │     │  USE CACHED DATA        │
                 │              │                         │     │  (Last successful run)  │
                 │              └────────────┬────────────┘     ├─────────────────────────┤
                 │                           │                  │  Source:                │
                 │                           │                  │  • Redis cache          │
                 │                           │                  │  • DynamoDB latest      │
                 │                           │                  │  • S3 backup            │
                 │                           │                  │                         │
                 │                           │                  │  Age check:             │
                 │                           │                  │  • If > 7 days old      │
                 │                           │                  │    → CRITICAL ALERT     │
                 │                           │                  │  • If < 7 days old      │
                 │                           │                  │    → Use with warning   │
                 │                           │                  │                         │
                 │                           │                  └────────────┬────────────┘
                 │                           │                               │
                 └───────────────┬───────────┴───────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  NOTIFY FALLBACK USED   │
                    ├─────────────────────────┤
                    │  • Email alert          │
                    │  • SNS high severity    │
                    │  • Log to CloudWatch    │
                    │                         │
                    │  Message:               │
                    │  - Source used          │
                    │  - Data age             │
                    │  - Action needed        │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  ATTEMPT SERVICE        │
                    │  RESTART (if needed)    │
                    ├─────────────────────────┤
                    │  Services:              │
                    │  • Restart Ollama       │
                    │  • Clear Redis          │
                    │  • Reconnect PostgreSQL │
                    │                         │
                    │  Logic: Only if health  │
                    │  check showed DOWN      │
                    └────────────┬────────────┘
                                 │
                                 ▼
                            SUCCESS
                    (With fallback marker)
```

---

## 🔄 Processing Pipelines

### Data Processing Pipeline

```
RAW DATA INPUT
    │
    ├─ ANEELDataset JSON
    ├─ Utility Scrape HTML
    ├─ PDF Extract Text
    └─ CSV Product Data
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: NORMALIZATION                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Field Mapping:                                                               │
│  • title → normalized_title (strip, lowercase, no accents)                  │
│  • description → clean_description (HTML stripped, 200 char limit)          │
│  • date fields → ISO 8601 datetime                                           │
│  • numeric fields → float with validation                                    │
│                                                                               │
│  Type Casting:                                                                │
│  • String → enforce UTF-8                                                     │
│  • Numbers → float/int with bounds check                                     │
│  • Dates → datetime with timezone                                            │
│  • Arrays → list with type validation                                        │
│                                                                               │
│  Example:                                                                     │
│  IN:  {"title": "  PAINEL SOLAR 440W  ", "power": "440"}                   │
│  OUT: {"title": "painel solar 440w", "power_w": 440.0}                     │
│                                                                               │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: DEDUPLICATION                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Strategies:                                                                  │
│                                                                               │
│  1. Exact Match (by ID)                                                       │
│     • Hash: MD5(id)                                                          │
│     • Action: Keep most recent by modified date                              │
│                                                                               │
│  2. Fuzzy Match (by title + metadata)                                         │
│     • Algorithm: Levenshtein distance < 5                                    │
│     • Fields: title, manufacturer, model                                     │
│     • Action: Merge if score > 0.85                                          │
│                                                                               │
│  3. Semantic Match (by embeddings)                                            │
│     • Model: all-MiniLM-L6-v2                                                │
│     • Threshold: Cosine similarity > 0.90                                    │
│     • Action: Flag as potential duplicate for review                         │
│                                                                               │
│  Rules:                                                                       │
│  • Prefer: ANEEL data > utility data > manual entry                          │
│  • Merge: Combine non-conflicting metadata                                   │
│  • Conflict: Keep most authoritative source                                  │
│                                                                               │
│  Example:                                                                     │
│  A: {id: "123", title: "Painel 440W", source: "aneel"}                      │
│  B: {id: "456", title: "Painel 440w", source: "fortlev"}                    │
│  → MERGED: {id: "123", title: "Painel 440W", alt_id: "456"}                │
│                                                                               │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: VALIDATION                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Technical Validation:                                                        │
│                                                                               │
│  • Power Rating:                                                              │
│    - Solar panels: 100W - 700W                                               │
│    - Inverters: 1kW - 100kW                                                  │
│    - Batteries: 1kWh - 50kWh                                                 │
│                                                                               │
│  • Efficiency:                                                                │
│    - Solar panels: 15% - 23%                                                 │
│    - Inverters: 94% - 99%                                                    │
│                                                                               │
│  • Voltage:                                                                   │
│    - MPPT range: 50V - 1000V                                                 │
│    - Output: 110V, 127V, 220V, 380V                                          │
│                                                                               │
│  Regulatory Validation:                                                       │
│                                                                               │
│  • INMETRO Certification:                                                     │
│    - Check cert number format                                                │
│    - Verify not expired                                                      │
│    - Match manufacturer                                                      │
│                                                                               │
│  • ANEEL Compliance:                                                          │
│    - NBR 16690:2019 (installations)                                          │
│    - NBR 16274:2014 (systems)                                                │
│    - REN 1.059/2023 (GD rules)                                               │
│                                                                               │
│  Output: validation_status {                                                 │
│    technical: PASS/FAIL                                                      │
│    regulatory: PASS/FAIL/PENDING                                             │
│    errors: [list of issues]                                                  │
│    warnings: [list of concerns]                                              │
│  }                                                                            │
│                                                                               │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: AI ENRICHMENT                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  LLM Processing (Ollama llama3.2:3b):                                        │
│                                                                               │
│  Prompt Template:                                                             │
│  """                                                                          │
│  Analise este produto/dataset de energia solar e retorne JSON:               │
│                                                                               │
│  Título: {title}                                                             │
│  Descrição: {description}                                                    │
│                                                                               │
│  Retorne:                                                                     │
│  {                                                                            │
│    "categoria": "string (inversor|painel|bateria|kit|...)",                 │
│    "palavras_chave": ["keyword1", "keyword2", ...],                         │
│    "resumo_curto": "string (max 200 chars)",                                │
│    "relevancia_ysh": 1-10,                                                   │
│    "aplicacao": "string (residencial|comercial|industrial)",                │
│    "destaque": "string (unique selling point)"                               │
│  }                                                                            │
│  """                                                                          │
│                                                                               │
│  Parameters:                                                                  │
│  • temperature: 0.3 (low creativity)                                         │
│  • top_p: 0.9                                                                │
│  • max_tokens: 500                                                           │
│  • timeout: 120 seconds                                                      │
│                                                                               │
│  Batch Processing:                                                            │
│  • Process 20 items at a time                                                │
│  • Parallel requests: 3                                                      │
│  • Retry on timeout: 2 times                                                 │
│                                                                               │
│  Fallback on Error:                                                           │
│  • Use regex-based categorization                                            │
│  • Extract keywords from title/description                                   │
│  • Set relevancia_ysh = 5 (neutral)                                          │
│                                                                               │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 5: SEMANTIC INDEXING                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Embedding Generation:                                                        │
│                                                                               │
│  Model: sentence-transformers/all-MiniLM-L6-v2                               │
│  • Dimensions: 384                                                            │
│  • Max sequence: 512 tokens                                                  │
│  • Normalization: L2                                                          │
│                                                                               │
│  Input Text Construction:                                                     │
│  text = f"{title} {description} {' '.join(keywords)}"                       │
│                                                                               │
│  Qdrant Indexing:                                                             │
│  • Collection: ysh-products                                                  │
│  • Distance metric: Cosine                                                   │
│  • HNSW parameters:                                                          │
│    - m: 16                                                                   │
│    - ef_construct: 100                                                       │
│                                                                               │
│  Payload:                                                                     │
│  {                                                                            │
│    "id": "...",                                                              │
│    "title": "...",                                                           │
│    "category": "...",                                                        │
│    "metadata": {...}                                                         │
│  }                                                                            │
│                                                                               │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
                              PROCESSED DATA
                           Ready for storage/API
```

---

## 💾 Storage Strategies

### Multi-Layer Storage Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STORAGE LAYER ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────────────┘

LAYER 1: HOT CACHE (Redis)
├─ Purpose: Ultra-fast read access, session data
├─ TTL: 5 minutes - 6 hours
├─ Data Types: Strings, Hashes, Lists, Sets
└─ Keys:
   ├─ ysh:api:datasets:{id} → Dataset JSON
   ├─ ysh:api:search:{hash} → Search results
   ├─ ysh:last_ingestion → Timestamp
   ├─ ysh:dataset_count → Counter
   └─ ysh:status:{service} → Health status

LAYER 2: WARM CACHE (DynamoDB)
├─ Purpose: Recent data, fallback source
├─ TTL: 24 hours (auto-expire)
├─ Billing: Pay-per-request
└─ Tables:
   └─ ysh-pipeline-cache
      ├─ PK: pk (partition key) = "latest" | "ingestion" | "fallback"
      ├─ SK: sk (sort key) = timestamp | dataset_id
      ├─ Attributes: JSON blob, metadata
      └─ GSI: By source, by category

LAYER 3: STRUCTURED DATA (PostgreSQL)
├─ Purpose: Transactional data, complex queries
├─ ACID: Full consistency
└─ Tables:
   ├─ products (id, sku, name, category, specs, price, ...)
   ├─ generation_units (unit_id, utility, location, power, ...)
   ├─ tariffs (tariff_id, utility, class, te, tusd, ...)
   ├─ certifications (cert_id, equipment_type, manufacturer, ...)
   └─ ingestion_log (run_id, timestamp, status, records, ...)

LAYER 4: OBJECT STORAGE (S3)
├─ Purpose: Raw data, backups, large files
├─ Lifecycle: 30 days → Glacier, 90 days → Delete
├─ Structure:
   └─ ysh-pipeline-data/
      ├─ raw/
      │  ├─ aneel/{date}/datasets.json
      │  ├─ utilities/{utility}/{date}/data.json
      │  └─ pdf/{type}/{filename}.pdf
      ├─ processed/
      │  ├─ enriched/{date}/datasets.json
      │  └─ validated/{date}/datasets.json
      ├─ images/
      │  └─ products/{id}/{filename}.{ext}
      └─ backups/
         └─ {timestamp}/full-backup.tar.gz

LAYER 5: VECTOR STORE (Qdrant)
├─ Purpose: Semantic search, similarity matching
├─ Collections:
   ├─ ysh-products (384-dim vectors)
   ├─ ysh-datasets (384-dim vectors)
   └─ ysh-manuals (384-dim vectors)
└─ Features:
   ├─ Cosine similarity search
   ├─ Filtered search (by category, etc.)
   ├─ Multi-vector search (hybrid)
   └─ Payload storage (metadata)
```

### Data Flow Between Storage Layers

```
WRITE PATH:
-----------

   Airflow/Lambda
        │
        ▼
   1. Redis (cache)
      - SET with 5-min TTL
      - Pub/Sub notify
        │
        ▼
   2. DynamoDB (warm)
      - PutItem with TTL
      - For fallback
        │
        ▼
   3. PostgreSQL (structured)
      - INSERT/UPDATE/UPSERT
      - Transactional
        │
        ▼
   4. S3 (archive)
      - PutObject
      - Versioning enabled
        │
        ▼
   5. Qdrant (vectors)
      - Upsert points
      - With payload


READ PATH (API Request):
------------------------

   FastAPI Endpoint
        │
        ▼
   1. Check Redis
      ├─ HIT → Return (fastest)
      └─ MISS ↓
              │
              ▼
   2. Query PostgreSQL
      ├─ Found → Cache to Redis → Return
      └─ Not Found ↓
                    │
                    ▼
   3. Check DynamoDB
      ├─ Found → Return (fallback data)
      └─ Not Found ↓
                    │
                    ▼
   4. Query S3 (rare)
      └─ Return latest backup


SEMANTIC SEARCH PATH:
---------------------

   Search Query
        │
        ▼
   1. Generate Embedding
      (sentence-transformers)
        │
        ▼
   2. Query Qdrant
      - Top K similar vectors
      - With filters
        │
        ▼
   3. Fetch Full Data
      ├─ Try Redis cache
      └─ Fallback PostgreSQL
        │
        ▼
   4. Return Ranked Results
```

---

*[Document continues with sections on API Data Flows, Orchestration Patterns, Error Handling, Caching, and Monitoring...]*

**Next sections to complete**:

- API Gateway Data Flows (REST + WebSocket)
- Orchestration Patterns (Airflow vs Node-RED vs Step Functions)
- Complete Error Handling Strategies
- Caching Invalidation Patterns
- Monitoring & Observability Setup

This document is now at **~1,100 lines**. Continue with remaining sections?
