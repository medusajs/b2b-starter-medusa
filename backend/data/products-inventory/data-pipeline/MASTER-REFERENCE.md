# 🗂️ YSH Data Pipeline - Master Reference Index

**Date**: October 14, 2025  
**Version**: 1.0.0  
**Purpose**: Complete reference of all URLs, APIs, workflows, patterns, and integrations

---

## 📋 Table of Contents

1. [Documentation Index](#documentation-index)
2. [URLs & API Endpoints](#urls--api-endpoints)
3. [Regex Patterns Library](#regex-patterns-library)
4. [Tags & Categories](#tags--categories)
5. [E-commerce Integrations](#e-commerce-integrations)
6. [Regulatory References](#regulatory-references)
7. [Quick Reference Commands](#quick-reference-commands)

---

## 📚 Documentation Index

### Core Pipeline Documentation

| Document | Location | Lines | Description |
|----------|----------|-------|-------------|
| **ANEEL API Reference** | `ANEEL-API-REFERENCE.md` | 1,200+ | Complete API documentation (RSS, DCAT, Search, CKAN, OGC) |
| **Data Dictionary** | `DATA-DICTIONARY.md` | 900+ | All data models, validation rules, field definitions |
| **Data Flows** | `DATA-FLOWS.md` | 850+ | Workflows, pipelines, storage strategies, diagrams |
| **Implementation Summary** | `IMPLEMENTATION-COMPLETE.md` | 760+ | Phase 1-3 summary, architecture, quick starts |
| **Quick Start Guide** | `QUICKSTART.md` (PT-BR) | 400+ | Getting started in Portuguese |
| **Commands Reference** | `COMMANDS.md` | 600+ | All CLI commands for Docker, Airflow, AWS, Terraform |

### Component Documentation

| Component | Document | Location | Lines |
|-----------|----------|----------|-------|
| **Apache Airflow** | `README.md` | `workflows/airflow/` | 400 |
| **Node-RED** | `README.md` | `workflows/node-red/` | 250 |
| **AWS Terraform** | `README.md` | `workflows/aws/terraform/` | 400 |
| **FastAPI Gateway** | `README.md` | `workflows/api-gateway/` | 300 |
| **ANEEL Fetcher** | `aneel_data_fetcher.py` | `data-pipeline/` | 392 |
| **Utility Scraper** | `utility_portal_scraper.py` | `data-pipeline/` | 450 |
| **AI Processor** | `ollama_integration.py` | `data-pipeline/` | 450 |
| **Integrated Pipeline** | `integrated_data_pipeline.py` | `data-pipeline/` | 380 |

### Architecture Diagrams

All documents include ASCII diagrams for:

- System architecture (high-level)
- Data flow (ingestion → processing → storage → API)
- Daily full ingestion workflow
- Hourly incremental check workflow
- Fallback recovery workflow
- Multi-layer storage architecture
- Processing pipeline (normalization → deduplication → validation → AI → indexing)

---

## 🌐 URLs & API Endpoints

### ANEEL Official Portals

#### Open Data Portals

```
Primary Hub:
https://dadosabertos-aneel.opendata.arcgis.com

Legacy CKAN Portal:
https://dadosabertos.aneel.gov.br

Main Government Portal:
https://www.gov.br/aneel/pt-br

SIGA (Geração Distribuída):
https://www2.aneel.gov.br/scg/gd/login.asp
```

#### ANEEL Feed APIs

| API | Endpoint | Format | Purpose |
|-----|----------|--------|---------|
| **RSS 2.0** | `https://dadosabertos-aneel.opendata.arcgis.com/api/feed/rss/2.0` | XML | Latest datasets feed |
| **DCAT US 1.1** | `https://dadosabertos-aneel.opendata.arcgis.com/api/feed/dcat-us/1.1` | JSON | US Federal standard |
| **DCAT AP 2.1.1** | `https://dadosabertos-aneel.opendata.arcgis.com/api/feed/dcat-ap/2.1.1` | JSON-LD | European standard v2 |
| **DCAT AP 3.0.0** | `https://dadosabertos-aneel.opendata.arcgis.com/api/feed/dcat-ap/3.0.0` | JSON-LD | European standard v3 |
| **Search API** | `https://dadosabertos-aneel.opendata.arcgis.com/api/search/v1` | JSON | Full-text search |

**API Documentation**:

```tsx
RSS Feed Definition:
https://dadosabertos-aneel.opendata.arcgis.com/api/feed/definition/#/RSS%202.0/get_api_feed_rss_2_0

DCAT US Definition:
https://dadosabertos-aneel.opendata.arcgis.com/api/feed/definition/#/DCAT%20US%201.1/get_api_feed_dcat_us_1_1

DCAT AP 2.1.1 Definition:
https://dadosabertos-aneel.opendata.arcgis.com/api/feed/definition/#/DCAT%20AP%202.1.1/get_api_feed_dcat_ap_2_1_1

DCAT AP 3.0.0 Definition:
https://dadosabertos-aneel.opendata.arcgis.com/api/feed/definition/#/DCAT%20AP%203.0.0/get_api_feed_dcat_ap_3_0_0

Search API Definition:
https://dadosabertos-aneel.opendata.arcgis.com/api/search/definition/
```

#### ANEEL CKAN API

```tsx
Base URL:
https://dadosabertos.aneel.gov.br/api/3/action

Key Actions:
- package_list: /api/3/action/package_list
- package_show: /api/3/action/package_show?id={id}
- package_search: /api/3/action/package_search?q={query}
- resource_show: /api/3/action/resource_show?id={id}
- datastore_search: /api/3/action/datastore_search?resource_id={id}
```

#### ANEEL Regulatory Documents

```tsx
Resolutions Repository:
https://www2.aneel.gov.br/cedoc/

REN 1.059/2023 (Latest GD Rules):
https://www2.aneel.gov.br/cedoc/ren20231059.html

REN 1.000/2021 (Previous):
https://www2.aneel.gov.br/cedoc/ren20211000.html

Forms & Manuals Repository:
https://git.aneel.gov.br/publico/centralconteudo/

GD Forms:
https://www.gov.br/aneel/pt-br/centrais-de-conteudos/formularios/geracao-distribuida

Manual MMGD (PDF):
https://git.aneel.gov.br/publico/centralconteudo/-/raw/main/manuaisminstrucoes/mmgd/manual_instrucoes_mmgd.pdf

GD Form Template (PDF):
https://git.aneel.gov.br/publico/centralconteudo/-/raw/main/formularios/gd/2022-01-31-formulario-gd.pdf
```

### OGC API Standards

```tsx
OGC API Portal:
https://ogcapi.ogc.org/#standards

Supported Standards (Potential ANEEL Integration):
- OGC API - Features: Vector features (GeoJSON)
- OGC API - Coverages: Raster data
- OGC API - Tiles: Vector/raster tiles
- OGC API - Records: Catalog search (STAC-like)
```

### ArcGIS Hub

```tsx
ArcGIS Sign In:
https://www.arcgis.com/sharing/rest/oauth2/authorize?client_id=esriapps&response_type=token

US Government Data Catalog:
https://catalog.data.gov/dataset/?metadata_type=geospatial

EU Open Data Portal Survey:
https://ec.europa.eu/eusurvey/runner/2025-edp-user-survey

EUSurvey Login:
https://ec.europa.eu/eusurvey/auth/login
```

---

## 🏪 E-commerce Integrations

### Medusa.js (Primary Platform)

```tsx
Official Documentation:
https://docs.medusajs.com/

Product Workflows:
https://docs.medusajs.com/resources/commerce-modules/product/workflows

Core Workflows Reference:
https://docs.medusajs.com/resources/medusa-workflows-reference

IProductModuleService API:
https://docs.medusajs.com/resources/references/product

Product Data Models:
https://docs.medusajs.com/resources/references/product/models

Admin Extensions (GitHub):
https://github.com/medusajs/medusa/tree/develop/packages/admin/admin-shared/src/extensions
```

### Saleor (Alternative/Reference)

```tsx
Official Documentation:
https://docs.saleor.io/
```

### Medusa UI (Figma Design System)

```tsx
Official Documentation:
https://docs.medusajs.com/resources/medusa-ui/

```tsx
Medusa UI Community Kit:
https://www.figma.com/design/BLbIs755K7YaEECOO0vSeY/Medusa-UI--Community-?node-id=9167-6474&t=KB8W0bfa7LUhP3Av-0

Design Token Reference:
Node ID: 9167-6474
```

### Product Reference Sites

```tsx
MeuGerador (Competitor Reference):
https://www.meugerador.com.br/collections/kits-solar-ongrid

Example Kit:
https://www.meugerador.com.br/products/kit-energia-solar-offgrid-motorhome-1-75kwp-ate-230kwh-mes-aprox-7-painel-era-250w-flexivel-inversor-growatt-3kw-110v-bateria-dyness-5-12kwh
```

---

## 🔧 Development Tools & Resources

### GitHub Resources

```
PRD dev3000 360° (ChatGPT):
https://chatgpt.com/c/68d7442c-d17c-832e-aff7-63ee979b9aa2

Your Stars:
https://github.com/own-boldsbrain?tab=stars

Repository:
https://github.com/own-boldsbrain/ysh-b2b
Branch: main

Notable Stars:
- bolt.new: https://github.com/stackblitz/bolt.new
- scrcpy (Android): https://github.com/Genymobile/scrcpy
```

### Payment & Billing

```
GitHub Payment Info:
https://github.com/settings/billing/payment_information

PayPal Account:
https://www.paypal.com/br/home

GitHub Pages Domains:
https://github.com/settings/pages_verified_domains/new
```

### RSS & Feed Tools

```
RSS.com (Free Podcast/Feed):
https://dashboard.rss.com/auth/sign-up/?_gl=1*156vbiv*_gcl_au*MTk2MDI3NDM5My4xNzYwNDEwODMw

Inoreader (News Aggregator):
https://www.inoreader.com/

Feedly (Topic Tracking):
https://feedly.com/
```

---

## 🎯 Regex Patterns Library

### ANEEL Data Patterns

```python
ANEEL_PATTERNS = {
    # Dataset ID (GUID without dashes)
    'dataset_id': r'^[a-f0-9]{32}$',
    
    # Resolution number
    'resolution': r'^RE[HN]\s+n[º°]\s+[\d\.,]+/\d{4}$',
    # Examples: "REH nº 3.059/2023", "REN nº 1.000/2021"
    
    # Brazilian state code
    'state_code': r'^BR-[A-Z]{2}$',
    # Examples: "BR-MG", "BR-SP", "BR-RJ"
    
    # Utility code (4 digits)
    'utility_code': r'^\d{4}$',
    # Examples: "6585", "0266", "0477"
    
    # Power rating
    'power_kw': r'^\d+(\.\d{1,3})?$',
    # Examples: "5.5", "10.25", "440.0"
    
    # Tariff value (R$/kWh, 5 decimals)
    'tariff': r'^\d+\.\d{5}$',
    # Examples: "0.32145", "0.60879"
}
```

### Product Patterns

```python
PRODUCT_PATTERNS = {
    # SKU format
    'sku': r'^[A-Z]{3}-[A-Z]+-[\d\.]+-[A-Z0-9]+$',
    # Example: "FTV-ONGRID-5500-BASIC"
    
    # Kit ID
    'kit_id': r'^KIT-[A-Z]+-[\d\.]+KW-\d{3}$',
    # Example: "KIT-ONGRID-5.5KW-001"
    
    # Certificate number
    'certificate': r'^CERT-[A-Z]+-\d{4}-\d{6}$',
    # Example: "CERT-INV-2025-001234"
    
    # Model number (generic)
    'model': r'^[A-Z0-9-]+$',
    # Examples: "CS3W-440P", "MIN-3000TL-XH"
}
```

### Category & Classification Patterns

```python
CATEGORY_PATTERNS = {
    # Geração Distribuída
    'geracao_distribuida': r'(?i)gera[çc][aã]o\s+distribu[ií]da|gdmini|micro\s*gera[çc][aã]o',
    
    # Tarifas
    'tarifas': r'(?i)tarifa|te\b|tusd\b|pre[çc]o\s+(energia|kwh)',
    
    # Certificações
    'certificacoes': r'(?i)certifica[çc][aã]o|inmetro|homologa[çc][aã]o|conformidade',
    
    # Concessões
    'concessoes': r'(?i)concess[aã]o|permiss[aã]o|distribuidora|concession[aá]ria',
    
    # Regulação
    'regulacao': r'(?i)resolu[çc][aã]o|normativa|regula[çc][aã]o|lei\s+\d+|decreto',
    
    # Fiscalização
    'fiscalizacao': r'(?i)fiscaliza[çc][aã]o|auditoria|infra[çc][aã]o|multa',
}
```

### Equipment Type Patterns

```python
EQUIPMENT_PATTERNS = {
    # Solar Photovoltaic
    'solar_fotovoltaica': r'(?i)solar\s+fotovoltai[cv]|painel\s+solar|m[oó]dulo\s+fotovoltai[cv]',
    
    # Inverter
    'inversor': r'(?i)inversor|inverter',
    
    # Battery
    'bateria': r'(?i)bateria|battery|armazenamento',
    
    # String Box
    'stringbox': r'(?i)string\s*box|caixa\s+de\s+jun[çc][aã]o',
    
    # Structure
    'estrutura': r'(?i)estrutura|suporte|mounting',
    
    # Wind
    'eolica': r'(?i)e[oó]lica|vento|wind',
    
    # Biomass
    'biomassa': r'(?i)biomassa|biog[aá]s|biocombust',
    
    # Hydraulic
    'hidraulica': r'(?i)hidr[aá]ulica|h[ií]drica|cgh|pch',
}
```

### Source Type Patterns

```python
SOURCE_TYPE_PATTERNS = {
    'solar_fotovoltaica': {
        'regex': r'(?i)solar\s+fotovoltai[cv]',
        'keywords': ['solar', 'fotovoltaic', 'pv', 'painel'],
        'code': 'UFV'
    },
    'eolica': {
        'regex': r'(?i)e[oó]lica|vento|wind',
        'keywords': ['eolica', 'vento', 'wind'],
        'code': 'EOL'
    },
    'biomassa': {
        'regex': r'(?i)biomassa|biog[aá]s|biocombust',
        'keywords': ['biomassa', 'biogas', 'biocombustivel'],
        'code': 'BIO'
    },
    'hidraulica': {
        'regex': r'(?i)hidr[aá]ulica|h[ií]drica|cgh|pch',
        'keywords': ['hidraulica', 'hidrica', 'cgh', 'pch'],
        'code': 'CGH'
    },
    'gas_natural': {
        'regex': r'(?i)g[aá]s\s+natural',
        'keywords': ['gas', 'natural'],
        'code': 'GAS'
    }
}
```

### Validation Patterns

```python
VALIDATION_PATTERNS = {
    # Email
    'email': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    
    # URL (HTTP/HTTPS)
    'url': r'^https?://[^\s]+$',
    
    # ISO 8601 Date
    'iso8601_date': r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$',
    
    # Temporal Range
    'temporal_range': r'^\d{4}-\d{2}-\d{2}/\d{4}-\d{2}-\d{2}$',
    
    # Brazilian Phone
    'phone_br': r'^\+55\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$',
    # Examples: "+55 31 99999-9999", "(31) 3333-3333"
    
    # CPF
    'cpf': r'^\d{3}\.\d{3}\.\d{3}-\d{2}$',
    # Example: "123.456.789-00"
    
    # CNPJ
    'cnpj': r'^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$',
    # Example: "12.345.678/0001-90"
    
    # CEP (Postal Code)
    'cep': r'^\d{5}-\d{3}$',
    # Example: "30130-000"
}
```

### Technical Standards Patterns

```python
STANDARDS_PATTERNS = {
    # NBR Standard
    'nbr': r'NBR\s+\d+(?::\d{4})?',
    # Examples: "NBR 16690", "NBR 16690:2019"
    
    # IEC Standard
    'iec': r'IEC\s+\d+(?:-\d+)?',
    # Examples: "IEC 61215", "IEC 62109-1"
    
    # UL Standard
    'ul': r'UL\s+\d+',
    # Example: "UL 1741"
    
    # IEEE Standard
    'ieee': r'IEEE\s+\d+(?:\.\d+)?',
    # Example: "IEEE 1547"
}
```

---

## 🏷️ Tags & Categories

### Primary Categories (ANEEL Data)

```python
PRIMARY_CATEGORIES = {
    'geracao_distribuida': {
        'pt': 'Geração Distribuída',
        'en': 'Distributed Generation',
        'color': '#10B981',  # Green
        'icon': '⚡',
        'priority': 1
    },
    'tarifas': {
        'pt': 'Tarifas de Energia',
        'en': 'Energy Tariffs',
        'color': '#F59E0B',  # Amber
        'icon': '💰',
        'priority': 2
    },
    'certificacoes': {
        'pt': 'Certificações',
        'en': 'Certifications',
        'color': '#3B82F6',  # Blue
        'icon': '✓',
        'priority': 3
    },
    'concessoes': {
        'pt': 'Concessões',
        'en': 'Concessions',
        'color': '#8B5CF6',  # Purple
        'icon': '📜',
        'priority': 4
    },
    'regulacao': {
        'pt': 'Regulação',
        'en': 'Regulation',
        'color': '#EF4444',  # Red
        'icon': '⚖️',
        'priority': 5
    },
    'fiscalizacao': {
        'pt': 'Fiscalização',
        'en': 'Oversight',
        'color': '#6B7280',  # Gray
        'icon': '👁️',
        'priority': 6
    },
    'mercado': {
        'pt': 'Mercado de Energia',
        'en': 'Energy Market',
        'color': '#EC4899',  # Pink
        'icon': '📈',
        'priority': 7
    },
    'transmissao': {
        'pt': 'Transmissão',
        'en': 'Transmission',
        'color': '#14B8A6',  # Teal
        'icon': '🔌',
        'priority': 8
    },
    'qualidade': {
        'pt': 'Qualidade do Serviço',
        'en': 'Service Quality',
        'color': '#06B6D4',  # Cyan
        'icon': '⭐',
        'priority': 9
    }
}
```

### Product Categories (E-commerce)

```python
PRODUCT_CATEGORIES = {
    'kits': {
        'pt': 'Kits Completos',
        'subcategories': ['on-grid', 'off-grid', 'hybrid'],
        'seo_slug': 'kits-solares',
        'icon': '📦'
    },
    'paineis': {
        'pt': 'Painéis Solares',
        'subcategories': ['monocristalino', 'policristalino', 'flexivel'],
        'seo_slug': 'paineis-solares',
        'icon': '🔆'
    },
    'inversores': {
        'pt': 'Inversores',
        'subcategories': ['on-grid', 'off-grid', 'hibrido', 'microinversor'],
        'seo_slug': 'inversores',
        'icon': '🔄'
    },
    'baterias': {
        'pt': 'Baterias',
        'subcategories': ['litio', 'chumbo-acido', 'flow'],
        'seo_slug': 'baterias',
        'icon': '🔋'
    },
    'estruturas': {
        'pt': 'Estruturas de Fixação',
        'subcategories': ['telhado', 'solo', 'garagem'],
        'seo_slug': 'estruturas',
        'icon': '🏗️'
    },
    'acessorios': {
        'pt': 'Acessórios',
        'subcategories': ['cabos', 'conectores', 'stringbox', 'ferramentas'],
        'seo_slug': 'acessorios',
        'icon': '🔧'
    }
}
```

### System Types

```python
SYSTEM_TYPES = {
    'on-grid': {
        'pt': 'On-Grid (Conectado à Rede)',
        'en': 'Grid-Tied',
        'description': 'Sistema conectado à rede elétrica com compensação de energia',
        'benefits': [
            'Reduz conta de luz',
            'Créditos de energia',
            'Menor investimento inicial',
            'Não precisa de baterias'
        ],
        'typical_roi_months': 48,
        'icon': '🔌'
    },
    'off-grid': {
        'pt': 'Off-Grid (Isolado)',
        'en': 'Off-Grid',
        'description': 'Sistema independente sem conexão com a rede',
        'benefits': [
            'Total independência energética',
            'Ideal para locais remotos',
            'Energia durante apagões',
            'Não paga conta de luz'
        ],
        'typical_roi_months': 72,
        'icon': '🏠'
    },
    'hybrid': {
        'pt': 'Híbrido',
        'en': 'Hybrid',
        'description': 'Sistema conectado à rede com backup de baterias',
        'benefits': [
            'Melhor dos dois mundos',
            'Backup automático',
            'Energia 24/7',
            'Otimiza autoconsumo'
        ],
        'typical_roi_months': 60,
        'icon': '⚡'
    }
}
```

### Consumer Classes

```python
CONSUMER_CLASSES = {
    'RESIDENCIAL': {
        'pt': 'Residencial',
        'subclasses': ['B1'],
        'voltage': '127V/220V Monofásico ou Bifásico',
        'typical_power_kw': (1.0, 10.0),
        'description': 'Residências unifamiliares e apartamentos'
    },
    'COMERCIAL': {
        'pt': 'Comercial',
        'subclasses': ['B3'],
        'voltage': '220V/380V',
        'typical_power_kw': (5.0, 75.0),
        'description': 'Estabelecimentos comerciais e de serviços'
    },
    'INDUSTRIAL': {
        'pt': 'Industrial',
        'subclasses': ['B3', 'A4', 'A3a'],
        'voltage': '220V/380V/13.8kV',
        'typical_power_kw': (30.0, 5000.0),
        'description': 'Indústrias e grandes consumidores'
    },
    'RURAL': {
        'pt': 'Rural',
        'subclasses': ['B2'],
        'voltage': '127V/220V/380V',
        'typical_power_kw': (2.0, 100.0),
        'description': 'Propriedades rurais e agronegócio'
    },
    'PODER_PUBLICO': {
        'pt': 'Poder Público',
        'subclasses': ['B4'],
        'voltage': 'Variável',
        'typical_power_kw': (10.0, 500.0),
        'description': 'Órgãos públicos federais, estaduais e municipais'
    }
}
```

### Voltage Configurations

```python
VOLTAGE_CONFIGS = {
    '110V_MONO': {
        'nominal': 110,
        'phase': 'Monofásico',
        'typical_uses': ['Residencial (algumas regiões)'],
        'inverter_output': '110V/60Hz'
    },
    '127V_MONO': {
        'nominal': 127,
        'phase': 'Monofásico',
        'typical_uses': ['Residencial'],
        'inverter_output': '127V/60Hz'
    },
    '220V_MONO': {
        'nominal': 220,
        'phase': 'Monofásico',
        'typical_uses': ['Residencial', 'Comercial pequeno'],
        'inverter_output': '220V/60Hz'
    },
    '220V_BI': {
        'nominal': 220,
        'phase': 'Bifásico',
        'typical_uses': ['Residencial grande', 'Comercial'],
        'inverter_output': '220V/60Hz (2 fases)'
    },
    '380V_TRI': {
        'nominal': 380,
        'phase': 'Trifásico',
        'typical_uses': ['Comercial', 'Industrial'],
        'inverter_output': '380V/60Hz (3 fases)'
    }
}
```

---

## 📖 Regulatory References

### Brazilian Technical Standards (ABNT/NBR)

```python
BRAZILIAN_STANDARDS = {
    'NBR_16690': {
        'number': 'NBR 16690:2019',
        'title': 'Instalações elétricas de arranjos fotovoltaicos',
        'description': 'Requisitos de projeto',
        'scope': 'Installations',
        'mandatory': True,
        'url': 'http://www.abntcatalogo.com.br/norma.aspx?ID=431004'
    },
    'NBR_16274': {
        'number': 'NBR 16274:2014',
        'title': 'Sistemas fotovoltaicos conectados à rede',
        'description': 'Requisitos mínimos para documentação, ensaios de comissionamento, inspeção e avaliação de desempenho',
        'scope': 'Systems',
        'mandatory': True
    },
    'NBR_16149': {
        'number': 'NBR 16149:2013',
        'title': 'Sistemas fotovoltaicos (FV)',
        'description': 'Características da interface de conexão com a rede elétrica de distribuição',
        'scope': 'Grid connection',
        'mandatory': True
    },
    'NBR_16150': {
        'number': 'NBR 16150:2013',
        'title': 'Sistemas fotovoltaicos (FV)',
        'description': 'Características da interface de conexão com a rede elétrica de distribuição - Procedimento de ensaio de conformidade',
        'scope': 'Testing',
        'mandatory': True
    },
    'NBR_10899': {
        'number': 'NBR 10899:2020',
        'title': 'Energia solar fotovoltaica',
        'description': 'Terminologia',
        'scope': 'Terminology',
        'mandatory': False
    }
}
```

### International Standards (IEC)

```python
IEC_STANDARDS = {
    'IEC_61215': {
        'number': 'IEC 61215',
        'title': 'Crystalline silicon terrestrial photovoltaic (PV) modules - Design qualification and type approval',
        'scope': 'PV Modules',
        'reference_adoption': 'NBR 16274'
    },
    'IEC_61730': {
        'number': 'IEC 61730',
        'title': 'Photovoltaic (PV) module safety qualification',
        'scope': 'Safety',
        'parts': ['Part 1: Requirements', 'Part 2: Testing']
    },
    'IEC_62109': {
        'number': 'IEC 62109',
        'title': 'Safety of power converters for use in photovoltaic power systems',
        'scope': 'Inverters',
        'parts': ['Part 1: General', 'Part 2: Inverters']
    },
    'IEC_62446': {
        'number': 'IEC 62446',
        'title': 'Photovoltaic (PV) systems - Requirements for testing, documentation and maintenance',
        'scope': 'Installation & Maintenance'
    },
    'IEC_61727': {
        'number': 'IEC 61727',
        'title': 'Photovoltaic (PV) systems - Characteristics of the utility interface',
        'scope': 'Grid interface'
    }
}
```

### ANEEL Normative Resolutions

```python
ANEEL_RESOLUTIONS = {
    'REN_1059_2023': {
        'number': 'REN 1.059/2023',
        'date': '2023-12-19',
        'title': 'Atualiza as regras de geração distribuída',
        'summary': 'Principais mudanças no Marco Legal da GD',
        'key_points': [
            'Novas faixas de potência',
            'Regras de compensação',
            'Autoconsumo remoto',
            'Geração compartilhada',
            'EMUC (Múltiplas Unidades Consumidoras)'
        ],
        'url': 'https://www2.aneel.gov.br/cedoc/ren20231059.html',
        'replaces': ['REN 1.000/2021', 'REN 482/2012']
    },
    'REN_1000_2021': {
        'number': 'REN 1.000/2021',
        'date': '2021-12-07',
        'title': 'Revisão das regras de microgeração e minigeração distribuída',
        'summary': 'Lei 14.300/2022 regulamentada',
        'url': 'https://www2.aneel.gov.br/cedoc/ren20211000.html',
        'status': 'Substituída pela REN 1.059/2023'
    },
    'REN_482_2012': {
        'number': 'REN 482/2012',
        'date': '2012-04-17',
        'title': 'Estabelece as condições gerais para o acesso de microgeração e minigeração distribuída',
        'summary': 'Marco inicial da GD no Brasil',
        'historical_significance': 'Primeira regulamentação da GD',
        'status': 'Revogada'
    }
}
```

### INMETRO Certification

```python
INMETRO_REQUIREMENTS = {
    'portaria': 'Portaria INMETRO nº 004/2011',
    'description': 'Requisitos de Avaliação da Conformidade para Sistemas e Equipamentos para Energia Fotovoltaica',
    'mandatory_equipment': [
        'Módulos fotovoltaicos',
        'Inversores para conexão à rede',
        'Controladores de carga',
        'Baterias estacionárias'
    ],
    'certification_bodies': [
        'OCP 015 - Módulos',
        'OCP 016 - Inversores'
    ],
    'test_labs': [
        'LABSOLAR - UFSC',
        'LSF - UFRJ',
        'LABELO - PUCRS'
    ],
    'certificate_validity': '5 years',
    'renewal_required': True
}
```

---

## ⚙️ Quick Reference Commands

### Docker & Docker Compose

```bash
# Start Airflow (all services)
cd workflows/airflow
docker-compose up -d

# Start Node-RED
cd workflows/node-red
docker-compose up -d

# View logs
docker-compose logs -f airflow-webserver
docker-compose logs -f node-red

# Stop services
docker-compose down

# Full cleanup
docker-compose down -v  # Remove volumes
docker system prune -a  # Clean everything
```

### Airflow CLI

```bash
# List DAGs
docker-compose exec airflow-webserver airflow dags list

# Trigger DAG
docker-compose exec airflow-webserver airflow dags trigger daily_full_ingestion

# Pause/Unpause
docker-compose exec airflow-webserver airflow dags pause hourly_incremental
docker-compose exec airflow-webserver airflow dags unpause hourly_incremental

# Test task
docker-compose exec airflow-webserver airflow tasks test daily_full_ingestion fetch_aneel_data 2025-10-14

# View task logs
docker-compose exec airflow-webserver airflow tasks logs daily_full_ingestion fetch_aneel_data 2025-10-14 1
```

### AWS CLI

```bash
# Lambda invoke
aws lambda invoke \
  --function-name ysh-aneel-fetcher \
  --payload '{"action":"fetch_all"}' \
  response.json

# Start Step Function
aws stepfunctions start-execution \
  --state-machine-arn arn:aws:states:us-east-1:ACCOUNT:stateMachine:ysh-ingestion \
  --input '{"schedule":"manual"}'

# S3 operations
aws s3 ls s3://ysh-pipeline-data/
aws s3 cp local-file.json s3://ysh-pipeline-data/manual/

# DynamoDB query
aws dynamodb get-item \
  --table-name ysh-pipeline-cache \
  --key '{"pk":{"S":"latest"},"sk":{"S":"ingestion"}}'

# CloudWatch logs
aws logs tail /aws/lambda/ysh-aneel-fetcher --follow
```

### Terraform

```bash
cd workflows/aws/terraform

# Initialize
terraform init

# Plan changes
terraform plan -out=tfplan

# Apply
terraform apply tfplan

# Destroy
terraform destroy

# Show outputs
terraform output
```

### Python Pipeline

```bash
# Run ANEEL fetcher
cd data-pipeline
python aneel_data_fetcher.py

# Run utility scraper
python utility_portal_scraper.py

# Run integrated pipeline
python integrated_data_pipeline.py

# Test integration
python test_integration.py
```

### API Testing (PowerShell)

```powershell
# Get datasets
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/datasets?limit=10" -Method GET

# Search datasets
$body = @{query="energia solar"; limit=20} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/search" -Method POST -Body $body -ContentType "application/json"

# Get status
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/status" -Method GET

# Health check
Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET
```

---

## 📊 Summary Statistics

### Documentation Coverage

- **Total Documentation Files**: 7 major documents
- **Total Lines**: ~5,000+ lines of documentation
- **Code Files Documented**: 20+ components
- **API Endpoints Documented**: 10+ ANEEL APIs
- **Regex Patterns**: 50+ production-ready patterns
- **Data Models**: 15+ comprehensive models
- **Workflows Diagrammed**: 5 complete flows
- **Storage Layers**: 5 (Redis, DynamoDB, PostgreSQL, S3, Qdrant)

### API Coverage

- **ANEEL APIs**: RSS, DCAT US/AP (2 versions), Search, CKAN
- **AWS Services**: Lambda, Step Functions, S3, DynamoDB, SNS, EventBridge
- **Orchestration**: Airflow (3 DAGs), Node-RED (flows), Step Functions (2)
- **Storage**: PostgreSQL, DynamoDB, S3, Redis, Qdrant
- **API Gateway**: FastAPI (7 REST endpoints + WebSocket)

### Integration Points

- **E-commerce**: Medusa.js workflows, product models
- **Regulatory**: ANEEL, INMETRO, NBR, IEC standards
- **Design**: Figma Medusa UI components
- **Infrastructure**: Docker, Terraform/AWS, GitHub Actions
- **Monitoring**: CloudWatch, Airflow UI, Node-RED dashboard

---

**Last Updated**: October 14, 2025  
**Maintained By**: YSH Data Pipeline Team  
**Version**: 1.0.0  
**Repository**: <https://github.com/own-boldsbrain/ysh-b2b>

---

## 🎯 Next Steps

1. **Test All APIs**: Validate ANEEL endpoints with actual requests
2. **Deploy Infrastructure**: Run Terraform to provision AWS resources
3. **Start Local Pipeline**: Launch Airflow or Node-RED for testing
4. **Integrate with Medusa**: Connect pipeline to e-commerce backend
5. **Setup Monitoring**: Configure CloudWatch alarms and dashboards
6. **Document Custom Workflows**: Add project-specific flows as they develop

For detailed instructions, see:

- **Quick Start**: `QUICKSTART.md` (Portuguese)
- **Commands**: `COMMANDS.md`
- **Implementation**: `IMPLEMENTATION-COMPLETE.md`
