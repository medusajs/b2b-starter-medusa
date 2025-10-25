# 🌐 PIPELINE DE DADOS BRASILEIROS EM TEMPO REAL

**YSH Medusa Store - B2B Solar**  
**Sistema de Ingestão e Processamento de Dados Energéticos**  
**Data:** 14 de Outubro de 2025

---

## 📋 VISÃO GERAL

Sistema completo para **captura, processamento e armazenamento** de dados energéticos brasileiros em tempo real, integrando múltiplas fontes governamentais (ANEEL, INMETRO) e processando com IA local (Ollama).

### 🎯 Objetivos

1. **Capturar dados em tempo real** de APIs governamentais brasileiras
2. **Processar e enriquecer** com IA (GPT-OSS/Ollama)
3. **Armazenar estruturado** para uso no sistema de validação técnica
4. **Sincronizar automaticamente** com catálogo de produtos
5. **Gerar insights** sobre mercado energético brasileiro

---

## 🏗️ ARQUITETURA

```tsx
┌─────────────────────────────────────────────────────────────┐
│                    FONTES DE DADOS                          │
├─────────────────────────────────────────────────────────────┤
│  • ANEEL Open Data (ArcGIS Hub)                            │
│  • ANEEL Micro/Minigeração Distribuída                     │
│  • INMETRO Certificações                                    │
│  • Concessionárias (CPFL, Enel, Cemig, etc.)              │
│  • CRESESB/INPE (Irradiação Solar)                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                 CAMADA DE INGESTÃO                          │
├─────────────────────────────────────────────────────────────┤
│  🕷️  Crawlee-Python    → Web Scraping Inteligente          │
│  📡 RSS/DCAT Feeds     → Dados Estruturados                 │
│  🔌 REST APIs          → Dados em Tempo Real                │
│  📄 PDF/OCR            → LaTeX-OCR, PDFMathTranslate        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              PROCESSAMENTO E ENRIQUECIMENTO                 │
├─────────────────────────────────────────────────────────────┤
│  🤖 Ollama/GPT-OSS     → Análise de Conteúdo               │
│  📊 OpenAI Realtime    → Processamento Streaming           │
│  🔍 Codex-Action       → Automação de Código               │
│  📐 LaTeX-OCR          → Extração de Fórmulas              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   ARMAZENAMENTO                             │
├─────────────────────────────────────────────────────────────┤
│  📦 JSON Store         → Produtos Enriquecidos              │
│  🗄️  Vector Database    → Embeddings para Busca            │
│  ⚡ Redis Cache        → Dados em Tempo Real                │
│  🔄 Git/Terraform      → Versionamento de Infraestrutura   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                INTEGRAÇÃO COM SISTEMA                       │
├─────────────────────────────────────────────────────────────┤
│  ✅ Validação Técnica   → INMETRO/ANEEL                     │
│  ⚡ Simulação           → PVLIB/NREL                        │
│  📋 Homologação         → Concessionárias                   │
│  🛒 Medusa.js          → Catálogo de Produtos              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 COMPONENTES DO SISTEMA

### 1. **ANEEL Data Fetcher** 🏢

**Fonte:** [ANEEL Open Data Platform](https://dadosabertos-aneel.opendata.arcgis.com/)

**Dados Capturados:**

- Unidades consumidoras por concessionária
- Geração distribuída (micro/mini)
- Tarifas de energia por região
- Certificações de inversores
- Resoluções normativas

**APIs Disponíveis:**

- RSS 2.0: `https://dadosabertos-aneel.opendata.arcgis.com/api/feed/rss/2.0`
- DCAT US 1.1: `https://dadosabertos-aneel.opendata.arcgis.com/api/feed/dcat-us/1.1`
- DCAT AP 2.1.1: `https://dadosabertos-aneel.opendata.arcgis.com/api/feed/dcat-ap/2.1.1`
- Search API: `https://dadosabertos-aneel.opendata.arcgis.com/api/search/v1`

**Arquivo:** `aneel_data_fetcher.py`

---

### 2. **Crawlee Web Scraper** 🕷️

**Repositório:** [crawlee-python](https://github.com/apify/crawlee-python)

**Alvos de Scraping:**

- Portais de concessionárias (CPFL, Enel, Cemig)
- Formulários de homologação
- Tabelas de tarifas
- Documentação técnica

**Recursos:**

- Anti-blocking automático
- Request queue management
- Retry logic robusto
- Playwright integration

**Arquivo:** `crawlee_scraper.py`

---

### 3. **OpenAI Realtime Agent** 🤖

**Repositório:** [openai-realtime-agents](https://github.com/openai/openai-realtime-agents)

**Funcionalidades:**

- Processamento em streaming de dados
- Análise em tempo real de alterações
- Alertas automáticos de mudanças normativas
- Sumarização de documentos técnicos

**Arquivo:** `realtime_processor.py`

---

### 4. **GPT-OSS Local Processing** 💻

**Repositório:** [gpt-oss](https://github.com/openai/gpt-oss)

**Uso:**

- Modelo local para processamento sem custos de API
- Análise de especificações técnicas
- Geração de descrições de produtos
- Classificação automática de categorias

**Arquivo:** `gpt_oss_processor.py`

---

### 5. **PDF/LaTeX Extractor** 📄

**Repositórios:**

- [LaTeX-OCR](https://github.com/lukas-blecher/LaTeX-OCR)
- [PDFMathTranslate](https://github.com/Byaidu/PDFMathTranslate)

**Aplicações:**

- Extrair fórmulas de normas técnicas (NBR)
- Processar datasheets de fabricantes
- Converter manuais técnicos
- OCR de certificações

**Arquivo:** `pdf_latex_extractor.py`

---

### 6. **Ollama Integration** 🦙

**Repositório:** [ollama-python](https://github.com/ollama/ollama-python)

**Integração com sistema existente:**

- Usar modelos locais (llama3.2, gemma3, etc.)
- Enriquecimento de produtos
- Análise de conformidade
- Geração de conteúdo

**Arquivo:** `ollama_integration.py` (já implementado)

---

### 7. **Infrastructure as Code** 🔧

**Repositórios:**

- [opentofu](https://github.com/opentofu/opentofu)
- [vscode-opentofu](https://github.com/opentofu/vscode-opentofu)

**Uso:**

- Provisionamento de infraestrutura
- Versionamento de configurações
- Deploy automatizado
- Rollback fácil

**Arquivo:** `infrastructure/main.tf`

---

## 🚀 FLUXO DE TRABALHO

### Pipeline Completo

```python
# 1. CAPTURA
aneel_data = fetch_aneel_data()
scraped_data = crawlee_scrape_utilities()
pdf_data = extract_pdf_content()

# 2. PROCESSAMENTO
enriched = process_with_gpt_oss(aneel_data)
realtime_updates = stream_process(scraped_data)
formulas = extract_latex(pdf_data)

# 3. ENRIQUECIMENTO
analyzed = ollama_enrich(enriched)
validated = validate_technical_specs(analyzed)

# 4. ARMAZENAMENTO
save_to_json_store(validated)
index_vectors(analyzed)
cache_realtime(realtime_updates)

# 5. SINCRONIZAÇÃO
sync_with_medusa(validated)
update_product_catalog()
trigger_webhooks()
```

---

## 📊 DADOS DISPONÍVEIS

### ANEEL Open Data

**Datasets Principais:**

1. **Geração Distribuída** (6585 registros - Energisa)
   - Unidades consumidoras com geração própria
   - Potência instalada por município
   - Tipo de fonte energética
   - Modalidade de compensação

2. **Tarifas de Energia**
   - Tarifas por concessionária
   - Bandeiras tarifárias
   - Histórico de reajustes

3. **Certificações**
   - Inversores homologados
   - Painéis certificados pelo INMETRO
   - Equipamentos aprovados

4. **Resoluções Normativas**
   - RN 1000/2021 (Marco Legal da GD)
   - RN 1059/2023 (Atualizações)
   - Documentos técnicos

### Formatos Disponíveis

- **RSS 2.0**: Feed de atualizações
- **DCAT US 1.1**: Metadados estruturados
- **DCAT AP 2.1.1**: Padrão europeu
- **DCAT AP 3.0.0**: Última versão
- **JSON API**: Queries customizadas

---

## 🔑 FUNCIONALIDADES CHAVE

### 1. Monitoramento em Tempo Real

```python
# Monitor ANEEL feed for updates
watcher = ANEELFeedWatcher()
watcher.on_update(lambda data: process_and_notify(data))
watcher.start()
```

### 2. Scraping Inteligente

```python
# Scrape utility portal with Crawlee
crawler = CrawleeScraper()
await crawler.scrape_cpfl_portal()
await crawler.scrape_enel_portal()
```

### 3. Processamento com IA

```python
# Process with GPT-OSS
processor = GPTOSSProcessor()
enriched = processor.analyze_technical_specs(product)
```

### 4. Extração de PDFs

```python
# Extract formulas from technical documents
extractor = LaTeXOCRExtractor()
formulas = extractor.extract_from_pdf("NBR16274.pdf")
```

### 5. Sincronização Automática

```python
# Auto-sync with product catalog
syncer = CatalogSyncer()
syncer.sync_aneel_data()
syncer.update_certifications()
```

---

## 📈 MÉTRICAS E MONITORAMENTO

### KPIs do Pipeline

- **Latência de ingestão**: < 5 segundos
- **Taxa de sucesso**: > 99%
- **Dados processados/dia**: ~10.000 registros
- **Uptime**: 99.9%

### Alertas Configurados

- ⚠️ Nova resolução ANEEL publicada
- ⚠️ Alteração em tarifas
- ⚠️ Novo certificado INMETRO
- ⚠️ Mudança em portal de concessionária

---

## 🛠️ INSTALAÇÃO E SETUP

### Dependências

```bash
# Core dependencies
pip install crawlee
pip install openai-realtime
pip install ollama
pip install pdfplumber
pip install latex-ocr
pip install feedparser
pip install redis

# Optional
pip install opentofu  # IaC
```

### Configuração

```bash
# 1. Clone repositories
git clone https://github.com/apify/crawlee-python
git clone https://github.com/openai/openai-realtime-agents
git clone https://github.com/openai/gpt-oss

# 2. Configure environment
cp .env.example .env
# Edit .env with API keys

# 3. Initialize infrastructure
cd infrastructure
tofu init
tofu plan
tofu apply

# 4. Start services
docker-compose up -d
```

---

## 📚 REFERÊNCIAS

### APIs e Feeds

- [ANEEL Open Data](https://dadosabertos-aneel.opendata.arcgis.com/)
- [ANEEL Hub Feed API](https://dadosabertos-aneel.opendata.arcgis.com/api/feed/definition/)
- [ANEEL Search API](https://dadosabertos-aneel.opendata.arcgis.com/api/search/definition/)
- [ANEEL Formulários GD](https://www.gov.br/aneel/pt-br/centrais-de-conteudos/formularios/geracao-distribuida)

### Resoluções Normativas

- [RN 1000/2021](https://www2.aneel.gov.br/cedoc/ren20211000.html) - Marco Legal GD
- [RN 1059/2023](https://www2.aneel.gov.br/cedoc/ren20231059.html) - Atualizações
- [Manual MMGD](https://git.aneel.gov.br/publico/centralconteudo/-/raw/main/manuaisminstrucoes/mmgd/manual_instrucoes_mmgd.pdf)

### Repositórios OSS

- [Crawlee Python](https://github.com/apify/crawlee-python)
- [OpenAI Realtime Agents](https://github.com/openai/openai-realtime-agents)
- [GPT-OSS](https://github.com/openai/gpt-oss)
- [LaTeX-OCR](https://github.com/lukas-blecher/LaTeX-OCR)
- [PDFMathTranslate](https://github.com/Byaidu/PDFMathTranslate)
- [Ollama Python](https://github.com/ollama/ollama-python)
- [OpenTofu](https://github.com/opentofu/opentofu)

---

## 🎯 PRÓXIMOS PASSOS

### Fase 1 - Setup Básico (1-2 dias)

- [ ] Implementar ANEEL data fetcher
- [ ] Configurar Crawlee scraper
- [ ] Integrar Ollama Python
- [ ] Setup básico de armazenamento

### Fase 2 - Processamento IA (3-5 dias)

- [ ] Integrar GPT-OSS
- [ ] Implementar OpenAI Realtime
- [ ] Configurar LaTeX-OCR
- [ ] Pipeline de enriquecimento

### Fase 3 - Automação (1 semana)

- [ ] Cron jobs para sync automático
- [ ] Webhooks para notificações
- [ ] Dashboard de monitoramento
- [ ] Alertas configurados

### Fase 4 - Infraestrutura (1 semana)

- [ ] OpenTofu configuration
- [ ] Docker containers
- [ ] CI/CD pipeline
- [ ] Deploy em produção

---

## 💡 CASOS DE USO

### 1. Atualização Automática de Certificações

```
ANEEL publica nova certificação
    ↓
Feed RSS detecta mudança
    ↓
Crawlee busca detalhes no portal
    ↓
GPT-OSS analisa conformidade
    ↓
Produto é atualizado no catálogo
    ↓
Cliente recebe notificação
```

### 2. Monitoramento de Tarifas

```
Concessionária altera tarifa
    ↓
Scraper detecta mudança
    ↓
Sistema recalcula payback
    ↓
Produtos são re-simulados
    ↓
Novos ROI são gerados
```

### 3. Extração de Normas Técnicas

```
Nova NBR publicada (PDF)
    ↓
LaTeX-OCR extrai fórmulas
    ↓
PDFMathTranslate converte
    ↓
GPT-OSS interpreta requisitos
    ↓
Validador é atualizado
```

---

**🌞 Sistema de Pipeline de Dados Energéticos Brasileiros**  
**Desenvolvido para:** YSH Medusa Store - B2B Solar  
**Versão:** 1.0.0  
**Status:** Em Desenvolvimento  

**Processamento em tempo real de dados governamentais para energia solar!** ⚡
