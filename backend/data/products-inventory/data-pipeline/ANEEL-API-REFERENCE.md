# 🏢 ANEEL API Reference - Complete Documentation

**Date**: October 14, 2025  
**Version**: 1.0.0  
**Base URL**: `https://dadosabertos-aneel.opendata.arcgis.com`

---

## 📋 Table of Contents

1. [API Endpoints Overview](#api-endpoints-overview)
2. [RSS 2.0 Feed API](#rss-20-feed-api)
3. [DCAT US 1.1 API](#dcat-us-11-api)
4. [DCAT AP 2.1.1 API](#dcat-ap-211-api)
5. [DCAT AP 3.0.0 API](#dcat-ap-300-api)
6. [Search API](#search-api)
7. [OGC API Standards](#ogc-api-standards)
8. [CKAN API](#ckan-api)
9. [Authentication & Rate Limits](#authentication--rate-limits)
10. [Error Handling](#error-handling)
11. [Data Models](#data-models)
12. [Usage Examples](#usage-examples)

---

## 🌐 API Endpoints Overview

| API | Endpoint | Format | Purpose | Update Frequency |
|-----|----------|--------|---------|------------------|
| **RSS 2.0** | `/api/feed/rss/2.0` | XML | Latest datasets feed | Real-time |
| **DCAT US 1.1** | `/api/feed/dcat-us/1.1` | JSON | US Federal standard | Daily |
| **DCAT AP 2.1.1** | `/api/feed/dcat-ap/2.1.1` | JSON-LD | European standard | Daily |
| **DCAT AP 3.0.0** | `/api/feed/dcat-ap/3.0.0` | JSON-LD | Latest European std | Daily |
| **Search API** | `/api/search/v1` | JSON | Dataset search | Real-time |
| **CKAN API** | `https://dadosabertos.aneel.gov.br/api/3/action` | JSON | Legacy CKAN | Hourly |

---

## 📡 RSS 2.0 Feed API

### Endpoint

```
GET https://dadosabertos-aneel.opendata.arcgis.com/api/feed/rss/2.0
```

### Description

Returns an RSS 2.0 XML feed with the latest ANEEL datasets. Ideal for monitoring new publications.

### Response Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Agência Nacional de Energia Elétrica</title>
    <link>https://dadosabertos-aneel.opendata.arcgis.com</link>
    <description>Open Data Hub ANEEL</description>
    <language>pt-br</language>
    <lastBuildDate>Mon, 14 Oct 2025 10:00:00 GMT</lastBuildDate>
    
    <item>
      <guid>b7ad164d258245e79c1b8e0593d65cc0</guid>
      <title>Energisa Minas Rio 6585 2016-12-31 M6 20170919-1004</title>
      <link>https://dadosabertos-aneel.opendata.arcgis.com/datasets/b7ad164d258245e79c1b8e0593d65cc0</link>
      <description>Dados de geração distribuída da Energisa Minas Gerais</description>
      <dc:date>2025-10-14T10:00:00Z</dc:date>
      <dc:creator>ANEEL</dc:creator>
      <category>Geração Distribuída</category>
    </item>
    
    <!-- More items -->
  </channel>
</rss>
```

### Parsing Logic

```python
import feedparser

feed = feedparser.parse(rss_content)

for entry in feed.entries:
    dataset = {
        'id': entry.get('guid', entry.get('link')),
        'title': entry.get('title', ''),
        'description': entry.get('summary', ''),
        'url': entry.get('link', ''),
        'published': entry.get('published', ''),
        'updated': entry.get('updated', ''),
        'category': entry.get('category', 'Unknown'),
        'author': entry.get('author', 'ANEEL')
    }
```

### Update Frequency

- **Real-time**: New datasets appear immediately
- **Check interval**: Recommended every 1-6 hours
- **Caching**: Cache for 1 hour with `If-Modified-Since` header

### Tags & Categories

| Category | Description | Regex Pattern |
|----------|-------------|---------------|
| `geracao_distribuida` | Distributed generation units | `(?i)gera[çc][aã]o\s+distribu[ií]da` |
| `tarifas` | Electricity tariffs | `(?i)tarifa` |
| `certificacoes` | Equipment certifications | `(?i)certifica[çc][aã]o` |
| `concessoes` | Utility concessions | `(?i)concess[aã]o` |
| `regulacao` | Regulatory documents | `(?i)regula[çc][aã]o\|resolu[çc][aã]o` |

---

## 📊 DCAT US 1.1 API

### Endpoint

```
GET https://dadosabertos-aneel.opendata.arcgis.com/api/feed/dcat-us/1.1
```

### Description

DCAT US 1.1 (Data Catalog Vocabulary) - US Federal Government standard for open data catalogs.

### Response Format (JSON)

```json
{
  "@context": "https://project-open-data.cio.gov/v1.1/schema/catalog.jsonld",
  "@type": "dcat:Catalog",
  "conformsTo": "https://project-open-data.cio.gov/v1.1/schema",
  "describedBy": "https://project-open-data.cio.gov/v1.1/schema/catalog.json",
  "dataset": [
    {
      "@type": "dcat:Dataset",
      "identifier": "b7ad164d258245e79c1b8e0593d65cc0",
      "title": "Energisa Minas Rio 6585 2016-12-31 M6",
      "description": "Dados de geração distribuída da Energisa Minas Gerais",
      "keyword": [
        "energia",
        "geracao distribuida",
        "energisa",
        "minas gerais"
      ],
      "modified": "2025-10-14T10:00:00Z",
      "publisher": {
        "@type": "org:Organization",
        "name": "ANEEL - Agência Nacional de Energia Elétrica"
      },
      "contactPoint": {
        "@type": "vcard:Contact",
        "fn": "ANEEL Open Data",
        "hasEmail": "mailto:opendata@aneel.gov.br"
      },
      "accessLevel": "public",
      "license": "http://opendefinition.org/licenses/cc-by/",
      "spatial": "BR",
      "temporal": "2016-12-31/2025-10-14",
      "distribution": [
        {
          "@type": "dcat:Distribution",
          "mediaType": "application/json",
          "format": "JSON",
          "downloadURL": "https://dadosabertos-aneel.opendata.arcgis.com/datasets/b7ad164d258245e79c1b8e0593d65cc0.json"
        },
        {
          "@type": "dcat:Distribution",
          "mediaType": "text/csv",
          "format": "CSV",
          "downloadURL": "https://dadosabertos-aneel.opendata.arcgis.com/datasets/b7ad164d258245e79c1b8e0593d65cc0.csv"
        }
      ],
      "theme": ["Energy", "Distributed Generation"]
    }
  ]
}
```

### Key Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `identifier` | string | ✅ | Unique dataset ID (GUID) |
| `title` | string | ✅ | Dataset title |
| `description` | string | ✅ | Detailed description |
| `keyword` | array[string] | ✅ | Keywords for discovery |
| `modified` | ISO-8601 | ✅ | Last modification date |
| `publisher` | object | ✅ | Publishing organization |
| `contactPoint` | object | ✅ | Contact information |
| `accessLevel` | enum | ✅ | public, restricted, private |
| `distribution` | array[object] | ✅ | Download formats available |
| `spatial` | string | ⚪ | Geographic coverage |
| `temporal` | string | ⚪ | Time period coverage |

### Validation Regex

```python
PATTERNS = {
    'identifier': r'^[a-f0-9]{32}$',  # GUID without dashes
    'email': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    'iso8601_date': r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$',
    'temporal_range': r'^\d{4}-\d{2}-\d{2}/\d{4}-\d{2}-\d{2}$',
    'url': r'^https?://[^\s]+$'
}
```

---

## 🇪🇺 DCAT AP 2.1.1 API

### Endpoint

```
GET https://dadosabertos-aneel.opendata.arcgis.com/api/feed/dcat-ap/2.1.1
```

### Description

DCAT-AP 2.1.1 (Application Profile) - European standard for data portals.

### Response Format (JSON-LD)

```json
{
  "@context": {
    "@vocab": "http://www.w3.org/ns/dcat#",
    "dcat": "http://www.w3.org/ns/dcat#",
    "dct": "http://purl.org/dc/terms/",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "vcard": "http://www.w3.org/2006/vcard/ns#",
    "adms": "http://www.w3.org/ns/adms#"
  },
  "@type": "Catalog",
  "dct:title": {
    "@language": "pt",
    "@value": "Catálogo de Dados Abertos ANEEL"
  },
  "dct:description": {
    "@language": "pt",
    "@value": "Portal de dados abertos da Agência Nacional de Energia Elétrica"
  },
  "dct:publisher": {
    "@type": "foaf:Organization",
    "foaf:name": "ANEEL"
  },
  "dcat:dataset": [
    {
      "@type": "Dataset",
      "@id": "https://dadosabertos-aneel.opendata.arcgis.com/datasets/b7ad164d258245e79c1b8e0593d65cc0",
      "dct:identifier": "b7ad164d258245e79c1b8e0593d65cc0",
      "dct:title": {
        "@language": "pt",
        "@value": "Energisa Minas Rio - Geração Distribuída"
      },
      "dct:description": {
        "@language": "pt",
        "@value": "Unidades de geração distribuída conectadas à rede da Energisa Minas Gerais"
      },
      "dcat:keyword": ["energia", "geração distribuída", "energisa"],
      "dct:issued": "2017-09-19T10:04:00Z",
      "dct:modified": "2025-10-14T10:00:00Z",
      "dct:publisher": {
        "@type": "foaf:Organization",
        "foaf:name": "ANEEL"
      },
      "dcat:contactPoint": {
        "@type": "vcard:Organization",
        "vcard:fn": "ANEEL Open Data Team",
        "vcard:hasEmail": "mailto:opendata@aneel.gov.br"
      },
      "dct:spatial": {
        "@type": "dct:Location",
        "@id": "http://publications.europa.eu/resource/authority/country/BRA"
      },
      "dct:temporal": {
        "@type": "dct:PeriodOfTime",
        "dcat:startDate": "2016-12-31",
        "dcat:endDate": "2025-10-14"
      },
      "dcat:theme": [
        "http://publications.europa.eu/resource/authority/data-theme/ENER"
      ],
      "dct:accrualPeriodicity": "http://publications.europa.eu/resource/authority/frequency/MONTHLY",
      "dcat:distribution": [
        {
          "@type": "Distribution",
          "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON",
          "dcat:accessURL": "https://dadosabertos-aneel.opendata.arcgis.com/datasets/b7ad164d258245e79c1b8e0593d65cc0",
          "dcat:downloadURL": "https://dadosabertos-aneel.opendata.arcgis.com/datasets/b7ad164d258245e79c1b8e0593d65cc0.json",
          "dcat:byteSize": 1048576,
          "dct:license": "http://creativecommons.org/licenses/by/4.0/"
        }
      ]
    }
  ]
}
```

### Enhanced Fields (vs DCAT US)

| Field | Description | Example |
|-------|-------------|---------|
| `dct:accrualPeriodicity` | Update frequency (EU vocabulary) | `MONTHLY`, `DAILY`, `ANNUAL` |
| `dcat:theme` | EU theme taxonomy | `ENER` (Energy), `ENVI` (Environment) |
| `adms:identifier` | Alternative identifiers | Previous system IDs |
| `dct:conformsTo` | Standards compliance | NBR, IEC standards |
| `dcat:landingPage` | Human-readable page | Web portal URL |

### Multilingual Support

```json
{
  "dct:title": [
    {
      "@language": "pt",
      "@value": "Geração Distribuída"
    },
    {
      "@language": "en",
      "@value": "Distributed Generation"
    }
  ]
}
```

---

## 🆕 DCAT AP 3.0.0 API

### Endpoint

```
GET https://dadosabertos-aneel.opendata.arcgis.com/api/feed/dcat-ap/3.0.0
```

### Description

DCAT-AP 3.0.0 - Latest European standard with enhanced metadata.

### New Features (vs 2.1.1)

1. **Data Services** (`dcat:DataService`)
   - API endpoints as first-class objects
   - Service-level metadata

2. **Enhanced Quality Metadata**
   - `dqv:hasQualityMeasurement` for data quality metrics
   - Provenance tracking with `prov:wasGeneratedBy`

3. **FAIR Principles Support**
   - Findable, Accessible, Interoperable, Reusable
   - `dcat:qualifiedRelation` for complex relationships

4. **Versioning**
   - `adms:versionInfo` and `adms:versionNotes`
   - Dataset lineage tracking

### Example: Data Service

```json
{
  "@type": "DataService",
  "@id": "https://dadosabertos-aneel.opendata.arcgis.com/api/search/v1",
  "dct:title": "ANEEL Search API",
  "dcat:endpointURL": "https://dadosabertos-aneel.opendata.arcgis.com/api/search/v1",
  "dcat:endpointDescription": "https://dadosabertos-aneel.opendata.arcgis.com/api/search/definition/",
  "dcat:servesDataset": ["b7ad164d258245e79c1b8e0593d65cc0"],
  "dct:conformsTo": "https://www.openapis.org/",
  "dct:license": "http://creativecommons.org/licenses/by/4.0/"
}
```

---

## 🔍 Search API

### Endpoint

```
GET https://dadosabertos-aneel.opendata.arcgis.com/api/search/v1
```

### Description

Full-text search across all ANEEL datasets with filtering and pagination.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | ✅ | - | Search query (full-text) |
| `limit` | integer | ⚪ | 10 | Results per page (1-100) |
| `offset` | integer | ⚪ | 0 | Pagination offset |
| `sort` | string | ⚪ | `relevance` | Sort field: `relevance`, `modified`, `title` |
| `order` | string | ⚪ | `desc` | Sort order: `asc`, `desc` |
| `filter` | string | ⚪ | - | Filter expression (see below) |
| `fields` | string | ⚪ | `*` | Comma-separated field list |

### Search Query Syntax

```
# Simple term
q=energia solar

# Phrase search
q="geração distribuída"

# Boolean operators
q=energia AND solar
q=energia OR eólica
q=energia NOT nuclear

# Wildcards
q=energ*        # Matches energia, energético, etc.
q=cert???ação   # Matches certificação

# Field-specific search
q=title:tarifa
q=category:geração
q=modified:[2025-01-01 TO 2025-12-31]

# Proximity search
q="energia solar"~5  # Words within 5 positions
```

### Filter Expressions

```
# Category filter
filter=category:geracao_distribuida

# Date range
filter=modified:[2025-01-01T00:00:00Z TO 2025-12-31T23:59:59Z]

# Multiple filters (AND)
filter=category:tarifa AND spatial:BR-MG

# OR filters
filter=category:(geracao_distribuida OR tarifa)

# Negation
filter=NOT category:arquivo
```

### Request Example

```http
GET /api/search/v1?q=energia%20solar&limit=20&offset=0&sort=modified&order=desc&filter=category:geracao_distribuida
Host: dadosabertos-aneel.opendata.arcgis.com
Accept: application/json
```

### Response Format

```json
{
  "total": 1234,
  "count": 20,
  "offset": 0,
  "limit": 20,
  "query": "energia solar",
  "filters": {
    "category": "geracao_distribuida"
  },
  "sort": {
    "field": "modified",
    "order": "desc"
  },
  "data": [
    {
      "id": "b7ad164d258245e79c1b8e0593d65cc0",
      "title": "Energisa Minas Rio - Geração Solar",
      "description": "Unidades de geração solar fotovoltaica",
      "url": "https://dadosabertos-aneel.opendata.arcgis.com/datasets/b7ad164d258245e79c1b8e0593d65cc0",
      "modified": "2025-10-14T10:00:00Z",
      "category": "geracao_distribuida",
      "keywords": ["energia", "solar", "fotovoltaica", "geração distribuída"],
      "format": ["JSON", "CSV", "GeoJSON"],
      "spatial": "BR-MG",
      "temporal": "2016-12-31/2025-10-14",
      "score": 0.95,
      "highlights": {
        "title": ["<em>Energia</em> <em>Solar</em>"],
        "description": ["geração <em>solar</em> fotovoltaica"]
      }
    }
  ],
  "facets": {
    "category": {
      "geracao_distribuida": 456,
      "tarifas": 234,
      "certificacoes": 123
    },
    "format": {
      "JSON": 890,
      "CSV": 890,
      "GeoJSON": 234
    },
    "spatial": {
      "BR-MG": 345,
      "BR-SP": 289,
      "BR-RJ": 178
    }
  }
}
```

### Pagination Example

```python
# Python example
import requests

base_url = "https://dadosabertos-aneel.opendata.arcgis.com/api/search/v1"
query = "energia solar"
limit = 100
offset = 0
all_results = []

while True:
    params = {
        'q': query,
        'limit': limit,
        'offset': offset
    }
    
    response = requests.get(base_url, params=params)
    data = response.json()
    
    all_results.extend(data['data'])
    
    if offset + limit >= data['total']:
        break
    
    offset += limit

print(f"Fetched {len(all_results)} total results")
```

---

## 🗺️ OGC API Standards

### Supported Standards

ANEEL may support OGC (Open Geospatial Consortium) standards for spatial data:

| Standard | Version | Endpoint | Purpose |
|----------|---------|----------|---------|
| OGC API - Features | 1.0 | `/ogcapi/features` | Access vector features (GeoJSON) |
| OGC API - Coverages | 1.0 | `/ogcapi/coverages` | Access raster data |
| OGC API - Tiles | 1.0 | `/ogcapi/tiles` | Vector/raster tiles |
| OGC API - Records | 1.0 | `/ogcapi/records` | Catalog search (STAC-like) |

### Reference

Official documentation: <https://ogcapi.ogc.org/#standards>

### OGC API - Features Example

```http
GET /ogcapi/features/collections/geracao_distribuida/items?limit=10&bbox=-48,-24,-44,-20
```

Response:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "unit-12345",
      "geometry": {
        "type": "Point",
        "coordinates": [-46.6333, -23.5505]
      },
      "properties": {
        "unit_id": "12345",
        "utility": "Energisa",
        "installed_power_kw": 5.5,
        "source_type": "Solar Fotovoltaica",
        "connection_date": "2023-05-15"
      }
    }
  ]
}
```

---

## 🔧 CKAN API

### Endpoint

```
GET https://dadosabertos.aneel.gov.br/api/3/action
```

### Description

Legacy CKAN (Comprehensive Knowledge Archive Network) API - still active for some datasets.

### Key Actions

| Action | Endpoint | Description |
|--------|----------|-------------|
| `package_list` | `/package_list` | List all dataset IDs |
| `package_show` | `/package_show?id={id}` | Get dataset metadata |
| `package_search` | `/package_search?q={query}` | Search datasets |
| `resource_show` | `/resource_show?id={id}` | Get resource metadata |
| `datastore_search` | `/datastore_search?resource_id={id}` | Query data directly |

### Example: package_search

```http
GET /api/3/action/package_search?q=geracao+distribuida&rows=10
Host: dadosabertos.aneel.gov.br
Accept: application/json
```

Response:

```json
{
  "success": true,
  "result": {
    "count": 45,
    "results": [
      {
        "id": "12345-abcde",
        "name": "geracao-distribuida-2025",
        "title": "Geração Distribuída 2025",
        "notes": "Dados de unidades de geração distribuída",
        "metadata_created": "2025-01-15T10:00:00",
        "metadata_modified": "2025-10-14T10:00:00",
        "organization": {
          "name": "aneel",
          "title": "ANEEL"
        },
        "tags": [
          {"name": "energia"},
          {"name": "geracao-distribuida"}
        ],
        "resources": [
          {
            "id": "res-123",
            "name": "Dados CSV",
            "format": "CSV",
            "url": "https://dadosabertos.aneel.gov.br/dataset/.../geracao.csv"
          }
        ]
      }
    ]
  }
}
```

---

## 🔐 Authentication & Rate Limits

### Authentication

Most ANEEL APIs are **public** and don't require authentication.

For future authenticated endpoints:

```http
Authorization: Bearer {access_token}
X-API-Key: {api_key}
```

### Rate Limits

| API | Limit | Period | Notes |
|-----|-------|--------|-------|
| RSS Feed | 60 req | 1 hour | Use caching |
| DCAT APIs | 100 req | 1 hour | Large responses |
| Search API | 300 req | 1 hour | Lightweight |
| CKAN API | 60 req | 1 hour | Legacy system |

### Rate Limit Headers

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1729166400
```

### Best Practices

1. **Cache responses** for 1-6 hours
2. **Use ETags** and `If-None-Match` headers
3. **Implement exponential backoff** on 429 errors
4. **Batch requests** when possible
5. **Use webhooks** for real-time updates (if available)

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 304 | Not Modified | Use cached data |
| 400 | Bad Request | Fix query parameters |
| 401 | Unauthorized | Check API key |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Implement backoff |
| 500 | Server Error | Retry with exponential backoff |
| 503 | Service Unavailable | Fallback to cache |

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_QUERY",
    "message": "Invalid search query syntax",
    "details": "Unexpected token at position 15: 'AND'",
    "timestamp": "2025-10-14T10:00:00Z",
    "request_id": "abc123-def456"
  }
}
```

### Retry Strategy (Python)

```python
import time
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def get_retry_session():
    """Create session with automatic retries"""
    session = requests.Session()
    
    retry = Retry(
        total=5,
        backoff_factor=2,  # 2, 4, 8, 16, 32 seconds
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "POST"]
    )
    
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    
    return session

# Usage
session = get_retry_session()
response = session.get("https://dadosabertos-aneel.opendata.arcgis.com/api/feed/rss/2.0")
```

---

## 📦 Data Models

### ANEELDataset

Core dataset metadata model.

```python
from dataclasses import dataclass
from typing import Optional, List
from datetime import datetime

@dataclass
class ANEELDataset:
    """ANEEL dataset metadata"""
    
    # Required fields
    id: str                      # UUID or GUID
    title: str                   # Dataset title
    description: str             # Full description
    url: str                     # Access URL
    modified: datetime           # Last modification date
    format: str                  # Data format (JSON, CSV, etc.)
    category: str                # Dataset category
    
    # Optional fields
    published: Optional[datetime] = None
    keywords: Optional[List[str]] = None
    publisher: Optional[str] = "ANEEL"
    license: Optional[str] = "CC-BY-4.0"
    spatial: Optional[str] = "BR"  # ISO 3166-1 alpha-2
    temporal_start: Optional[datetime] = None
    temporal_end: Optional[datetime] = None
    update_frequency: Optional[str] = None
    
    # Computed fields
    source: str = "aneel"
    fetch_date: Optional[datetime] = None
```

**Validation Rules**:

```python
VALIDATION_RULES = {
    'id': {
        'pattern': r'^[a-f0-9]{32}$',
        'required': True
    },
    'title': {
        'min_length': 10,
        'max_length': 500,
        'required': True
    },
    'url': {
        'pattern': r'^https?://[^\s]+$',
        'required': True
    },
    'modified': {
        'type': 'datetime',
        'required': True
    },
    'category': {
        'enum': [
            'geracao_distribuida',
            'tarifas',
            'certificacoes',
            'concessoes',
            'regulacao',
            'fiscalizacao'
        ],
        'required': True
    }
}
```

### GenerationUnit

Distributed generation unit model.

```python
@dataclass
class GenerationUnit:
    """Distributed generation unit"""
    
    # Identification
    unit_id: str                 # Unique unit ID
    consumer_class: str          # Residential, Commercial, Industrial
    
    # Location
    utility_company: str         # Concessionária (e.g., "Energisa")
    municipality: str            # Município
    state: str                   # Estado (BR-MG, BR-SP, etc.)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    # Technical specs
    installed_power_kw: float    # Potência instalada (kW)
    source_type: str             # Solar, Eólica, Biomassa, etc.
    compensation_modality: str   # Autoconsumo local, remoto, etc.
    
    # Dates
    connection_date: datetime    # Data de conexão
    homologation_date: Optional[datetime] = None
    
    # Additional
    equipment_brand: Optional[str] = None
    inverter_count: Optional[int] = None
    panel_count: Optional[int] = None
```

**Regex Patterns**:

```python
PATTERNS = {
    'state': r'^BR-[A-Z]{2}$',  # BR-MG, BR-SP, etc.
    'power_kw': r'^\d+(\.\d{1,2})?$',  # 5.5, 10.25, 100.00
    'source_type': r'^(Solar|Eólica|Biomassa|Hidráulica|Gás Natural)( Fotovoltaica)?$',
    'consumer_class': r'^(Residencial|Comercial|Industrial|Rural|Poder Público)$',
    'compensation_modality': r'^(Autoconsumo Local|Autoconsumo Remoto|Geração Compartilhada|EMUC)$'
}
```

### TariffData

Electricity tariff information.

```python
@dataclass
class TariffData:
    """Electricity tariff data"""
    
    # Identification
    utility_code: str            # Código da distribuidora
    utility_name: str            # Nome da distribuidora
    
    # Tariff components (R$/kWh)
    te: float                    # Tarifa de Energia
    tusd: float                  # Tarifa de Uso do Sistema de Distribuição
    
    # Total
    total_tariff: float          # TE + TUSD
    
    # Classification
    consumer_class: str          # Classe de consumo
    subclass: Optional[str] = None  # Subclasse
    voltage_level: str           # Nível de tensão (Baixa, Média, Alta)
    modality: str                # Convencional, Horária Azul, Horária Verde
    
    # Temporal
    valid_from: datetime         # Início da vigência
    valid_until: Optional[datetime] = None
    
    # Regulatory
    resolution_number: str       # Número da resolução homologatória
    publication_date: datetime
    
    # Flags
    has_icms: bool = True
    has_pis_cofins: bool = True
```

### CertificationData

Equipment certification metadata.

```python
@dataclass
class CertificationData:
    """Equipment certification data"""
    
    # Certificate
    certificate_number: str      # Número do certificado
    certificate_type: str        # Tipo (INMETRO, ANEEL, etc.)
    
    # Equipment
    equipment_type: str          # Painel, Inversor, String Box, etc.
    manufacturer: str            # Fabricante
    model: str                   # Modelo
    
    # Technical specs
    power_rating: Optional[float] = None  # Potência nominal (W)
    efficiency: Optional[float] = None    # Eficiência (%)
    
    # Standards compliance
    standards: List[str] = None  # NBR, IEC standards
    
    # Validity
    issue_date: datetime
    expiry_date: Optional[datetime] = None
    status: str                  # Valid, Expired, Suspended
    
    # Documents
    certificate_url: Optional[str] = None
    test_report_url: Optional[str] = None
```

---

## 💡 Usage Examples

### Example 1: Fetch Latest Datasets

```python
import asyncio
import aiohttp
import feedparser

async def fetch_latest_aneel_datasets():
    """Fetch latest datasets from RSS feed"""
    
    url = "https://dadosabertos-aneel.opendata.arcgis.com/api/feed/rss/2.0"
    
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            content = await response.text()
    
    # Parse RSS
    feed = feedparser.parse(content)
    
    datasets = []
    for entry in feed.entries:
        dataset = {
            'id': entry.get('guid', ''),
            'title': entry.get('title', ''),
            'description': entry.get('summary', ''),
            'url': entry.get('link', ''),
            'published': entry.get('published', ''),
            'category': entry.get('category', 'Unknown')
        }
        datasets.append(dataset)
    
    return datasets

# Run
datasets = asyncio.run(fetch_latest_aneel_datasets())
print(f"Found {len(datasets)} datasets")
```

### Example 2: Search with Filters

```python
async def search_aneel_datasets(query: str, category: str = None):
    """Search ANEEL datasets with filters"""
    
    base_url = "https://dadosabertos-aneel.opendata.arcgis.com/api/search/v1"
    
    params = {
        'q': query,
        'limit': 50,
        'sort': 'modified',
        'order': 'desc'
    }
    
    if category:
        params['filter'] = f'category:{category}'
    
    async with aiohttp.ClientSession() as session:
        async with session.get(base_url, params=params) as response:
            return await response.json()

# Usage
results = asyncio.run(
    search_aneel_datasets("energia solar", category="geracao_distribuida")
)
print(f"Total: {results['total']} results")
```

### Example 3: Fetch DCAT Catalog

```python
async def fetch_dcat_catalog(version="2.1.1"):
    """Fetch DCAT-AP catalog"""
    
    url = f"https://dadosabertos-aneel.opendata.arcgis.com/api/feed/dcat-ap/{version}"
    
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            catalog = await response.json()
    
    datasets = catalog.get('dcat:dataset', [])
    
    # Extract key info
    processed = []
    for ds in datasets:
        processed.append({
            'id': ds.get('dct:identifier', ''),
            'title': ds.get('dct:title', {}).get('@value', ''),
            'modified': ds.get('dct:modified', ''),
            'formats': [
                dist.get('dct:format', '')
                for dist in ds.get('dcat:distribution', [])
            ]
        })
    
    return processed

# Run
catalog = asyncio.run(fetch_dcat_catalog())
```

### Example 4: Caching Strategy

```python
import hashlib
import json
from pathlib import Path
from datetime import datetime, timedelta

class ANEELCacheManager:
    """Cache manager with TTL"""
    
    def __init__(self, cache_dir: Path, ttl_hours: int = 6):
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.ttl = timedelta(hours=ttl_hours)
    
    def _cache_key(self, url: str, params: dict = None) -> str:
        """Generate cache key from URL + params"""
        key_str = url
        if params:
            key_str += json.dumps(params, sort_keys=True)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def get(self, url: str, params: dict = None):
        """Get from cache if not expired"""
        key = self._cache_key(url, params)
        cache_file = self.cache_dir / f"{key}.json"
        
        if not cache_file.exists():
            return None
        
        # Check age
        file_time = datetime.fromtimestamp(cache_file.stat().st_mtime)
        if datetime.now() - file_time > self.ttl:
            cache_file.unlink()  # Expired
            return None
        
        # Load
        with open(cache_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def set(self, url: str, data: dict, params: dict = None):
        """Save to cache"""
        key = self._cache_key(url, params)
        cache_file = self.cache_dir / f"{key}.json"
        
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

# Usage
cache = ANEELCacheManager(Path("./cache/aneel"), ttl_hours=6)

async def fetch_with_cache(url: str):
    # Try cache first
    cached = cache.get(url)
    if cached:
        print("Using cached data")
        return cached
    
    # Fetch fresh
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            data = await response.json()
    
    # Cache for next time
    cache.set(url, data)
    return data
```

---

## 📚 Additional Resources

### Official Documentation

- **ANEEL Open Data Portal**: <https://dadosabertos-aneel.opendata.arcgis.com>
- **ANEEL CKAN Portal**: <https://dadosabertos.aneel.gov.br>
- **ANEEL Main Site**: <https://www.gov.br/aneel/pt-br>
- **OGC API Standards**: <https://ogcapi.ogc.org/#standards>
- **DCAT Specification**: <https://www.w3.org/TR/vocab-dcat-3/>

### Related Systems

- **SIGA ANEEL**: <https://www2.aneel.gov.br/scg/gd/login.asp>
- **Formulários GD**: <https://www.gov.br/aneel/pt-br/centrais-de-conteudos/formularios/geracao-distribuida>

### Support

- **Email**: <opendata@aneel.gov.br>
- **Issues**: Report via portal contact form
- **Documentation**: Git repository (if available)

---

**Last Updated**: October 14, 2025  
**Maintainer**: YSH Data Pipeline Team  
**Version**: 1.0.0
