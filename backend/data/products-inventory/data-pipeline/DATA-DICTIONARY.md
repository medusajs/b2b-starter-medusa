# 📚 YSH Data Pipeline - Complete Data Dictionary

**Date**: October 14, 2025  
**Version**: 1.0.0  
**Purpose**: Comprehensive reference for all data structures, validations, and transformations

---

## 📋 Table of Contents

1. [Core Data Models](#core-data-models)
2. [ANEEL Data Structures](#aneel-data-structures)
3. [Product Data Models](#product-data-models)
4. [Technical Validation Models](#technical-validation-models)
5. [Enrichment & AI Metadata](#enrichment--ai-metadata)
6. [Regex Patterns Library](#regex-patterns-library)
7. [Validation Rules](#validation-rules)
8. [Data Transformations](#data-transformations)
9. [Storage Schemas](#storage-schemas)
10. [API Response Formats](#api-response-formats)

---

## 🎯 Core Data Models

### ANEELDataset

**Purpose**: Metadata for ANEEL open data datasets

**Source**: RSS Feed, DCAT Catalogs, Search API

**Storage**: DynamoDB (`ysh-pipeline-cache`), S3 (`ysh-pipeline-data/`)

```python
@dataclass
class ANEELDataset:
    """ANEEL dataset metadata"""
    
    # === REQUIRED FIELDS ===
    
    id: str
    # Description: Unique dataset identifier (GUID)
    # Format: 32-character hexadecimal (no dashes)
    # Example: "b7ad164d258245e79c1b8e0593d65cc0"
    # Regex: ^[a-f0-9]{32}$
    # Source: RSS <guid>, DCAT dct:identifier
    
    title: str
    # Description: Human-readable dataset title
    # Format: String, 10-500 characters
    # Example: "Energisa Minas Rio 6585 - Geração Distribuída"
    # Regex: ^.{10,500}$
    # Source: RSS <title>, DCAT dct:title
    
    description: str
    # Description: Detailed dataset description
    # Format: Plain text or HTML, 20-5000 characters
    # Example: "Unidades de geração distribuída conectadas..."
    # Validation: Strip HTML tags, min 20 chars
    # Source: RSS <description>, DCAT dct:description
    
    url: str
    # Description: Dataset access URL
    # Format: Valid HTTPS URL
    # Example: "https://dadosabertos-aneel.opendata.arcgis.com/datasets/..."
    # Regex: ^https?://[^\s]+$
    # Source: RSS <link>, DCAT dcat:accessURL
    
    modified: datetime
    # Description: Last modification timestamp
    # Format: ISO 8601 datetime with timezone
    # Example: "2025-10-14T10:00:00Z"
    # Regex: ^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$
    # Source: RSS <updated>, DCAT dct:modified
    
    format: str
    # Description: Data format(s) available
    # Format: Comma-separated list
    # Example: "JSON, CSV, GeoJSON"
    # Enum: JSON | CSV | GeoJSON | XML | SHP | KML
    # Source: DCAT dcat:distribution/dct:format
    
    category: str
    # Description: Dataset category (normalized)
    # Format: Snake_case string
    # Example: "geracao_distribuida"
    # Enum: See CATEGORY_TAXONOMY below
    # Source: Derived from title/keywords via AI
    
    # === OPTIONAL FIELDS ===
    
    published: Optional[datetime] = None
    # Description: Original publication date
    # Format: ISO 8601 datetime
    # Source: RSS <published>, DCAT dct:issued
    
    keywords: Optional[List[str]] = None
    # Description: Search keywords/tags
    # Format: List of lowercase strings
    # Example: ["energia", "solar", "fotovoltaica"]
    # Source: DCAT dcat:keyword
    
    publisher: str = "ANEEL"
    # Description: Publishing organization
    # Default: "ANEEL"
    # Source: DCAT dct:publisher/foaf:name
    
    license: str = "CC-BY-4.0"
    # Description: Data license
    # Format: SPDX identifier
    # Example: "CC-BY-4.0", "ODbL-1.0"
    # Source: DCAT dct:license
    
    spatial: Optional[str] = "BR"
    # Description: Geographic coverage
    # Format: ISO 3166-1 alpha-2 or alpha-3
    # Example: "BR", "BR-MG", "BR-SP"
    # Regex: ^BR(-[A-Z]{2})?$
    # Source: DCAT dct:spatial
    
    temporal_start: Optional[datetime] = None
    # Description: Temporal coverage start
    # Format: ISO 8601 date
    # Example: "2016-12-31"
    # Source: DCAT dct:temporal/dcat:startDate
    
    temporal_end: Optional[datetime] = None
    # Description: Temporal coverage end
    # Format: ISO 8601 date
    # Example: "2025-10-14"
    # Source: DCAT dct:temporal/dcat:endDate
    
    update_frequency: Optional[str] = None
    # Description: Update frequency (EU vocabulary)
    # Format: EU Frequency vocabulary URI
    # Example: "MONTHLY", "DAILY", "ANNUAL"
    # Enum: DAILY | WEEKLY | MONTHLY | QUARTERLY | ANNUAL | IRREGULAR
    # Source: DCAT dct:accrualPeriodicity
    
    # === COMPUTED FIELDS ===
    
    source: str = "aneel"
    # Description: Data source identifier
    # Fixed: "aneel"
    # Used for: Multi-source aggregation
    
    fetch_date: Optional[datetime] = None
    # Description: When this metadata was fetched
    # Format: ISO 8601 datetime
    # Generated: At fetch time
```

**Category Taxonomy**:

```python
CATEGORY_TAXONOMY = {
    'geracao_distribuida': {
        'pt': 'Geração Distribuída',
        'en': 'Distributed Generation',
        'keywords': ['geracao', 'distribuida', 'gdmini', 'microgeracao'],
        'regex': r'(?i)gera[çc][aã]o\s+distribu[ií]da|gdmini|micro\s*gera[çc][aã]o'
    },
    'tarifas': {
        'pt': 'Tarifas de Energia',
        'en': 'Energy Tariffs',
        'keywords': ['tarifa', 'te', 'tusd', 'preco', 'custo'],
        'regex': r'(?i)tarifa|te\b|tusd\b|pre[çc]o\s+(energia|kwh)'
    },
    'certificacoes': {
        'pt': 'Certificações de Equipamentos',
        'en': 'Equipment Certifications',
        'keywords': ['certificacao', 'inmetro', 'homologacao', 'conformidade'],
        'regex': r'(?i)certifica[çc][aã]o|inmetro|homologa[çc][aã]o|conformidade'
    },
    'concessoes': {
        'pt': 'Concessões e Permissões',
        'en': 'Concessions and Permits',
        'keywords': ['concessao', 'permissao', 'distribuidora', 'concessionaria'],
        'regex': r'(?i)concess[aã]o|permiss[aã]o|distribuidora|concession[aá]ria'
    },
    'regulacao': {
        'pt': 'Regulação e Normas',
        'en': 'Regulation and Standards',
        'keywords': ['resolucao', 'normativa', 'regulacao', 'lei', 'decreto'],
        'regex': r'(?i)resolu[çc][aã]o|normativa|regula[çc][aã]o|lei\s+\d+|decreto'
    },
    'fiscalizacao': {
        'pt': 'Fiscalização',
        'en': 'Oversight and Compliance',
        'keywords': ['fiscalizacao', 'auditoria', 'infracao', 'multa'],
        'regex': r'(?i)fiscaliza[çc][aã]o|auditoria|infra[çc][aã]o|multa'
    },
    'mercado': {
        'pt': 'Mercado de Energia',
        'en': 'Energy Market',
        'keywords': ['mercado', 'comercializacao', 'leilao', 'contrato'],
        'regex': r'(?i)mercado|comercializa[çc][aã]o|leil[aã]o|contrato'
    },
    'transmissao': {
        'pt': 'Transmissão',
        'en': 'Transmission',
        'keywords': ['transmissao', 'linha', 'subestacao', 'rede basica'],
        'regex': r'(?i)transmiss[aã]o|linha\s+de\s+transmiss[aã]o|subesta[çc][aã]o|rede\s+b[aá]sica'
    },
    'qualidade': {
        'pt': 'Qualidade do Serviço',
        'en': 'Service Quality',
        'keywords': ['qualidade', 'dic', 'fic', 'drc', 'interrupcao'],
        'regex': r'(?i)qualidade|dic\b|fic\b|drc\b|interrup[çc][aã]o|continuidade'
    }
}
```

---

### GenerationUnit

**Purpose**: Individual distributed generation unit

**Source**: ANEEL datasets, utility portals

**Storage**: PostgreSQL (`generation_units` table), DynamoDB

```python
@dataclass
class GenerationUnit:
    """Distributed generation unit"""
    
    # === IDENTIFICATION ===
    
    unit_id: str
    # Description: Unique unit identifier
    # Format: Alphanumeric, 6-20 characters
    # Example: "GD-MG-12345", "001234567"
    # Regex: ^[A-Z0-9-]{6,20}$
    # Source: ANEEL dataset OBJECTID or custom ID
    
    consumer_class: str
    # Description: Consumer classification
    # Format: Enum string
    # Example: "Residencial", "Comercial"
    # Enum: Residencial | Comercial | Industrial | Rural | Poder Público | Iluminação Pública
    # Source: Dataset field CONSUMER_CLASS or CLASS
    
    # === LOCATION ===
    
    utility_company: str
    # Description: Utility/distributor company
    # Format: Company name
    # Example: "Energisa Minas Gerais", "CPFL Paulista"
    # Validation: Must match known utilities (see UTILITY_CODES)
    # Source: Dataset field UTILITY or DISTRIBUIDORA
    
    municipality: str
    # Description: Municipality name
    # Format: Title case string
    # Example: "Belo Horizonte", "São Paulo"
    # Regex: ^[A-ZÀÁÂÃÇÉÊÍÓÔÕÚ][a-zàáâãçéêíóôõú\s]+$
    # Source: Dataset field MUNICIPALITY or MUNICIPIO
    
    state: str
    # Description: Brazilian state code
    # Format: BR-XX (ISO 3166-2:BR)
    # Example: "BR-MG", "BR-SP", "BR-RJ"
    # Regex: ^BR-[A-Z]{2}$
    # Enum: See BRAZILIAN_STATES
    # Source: Dataset field STATE or UF
    
    latitude: Optional[float] = None
    # Description: Latitude coordinate
    # Format: Decimal degrees, -33.7 to 5.3 (Brazil bounds)
    # Example: -23.5505
    # Validation: -33.75 <= lat <= 5.27
    # Source: Dataset geometry or geocoding
    
    longitude: Optional[float] = None
    # Description: Longitude coordinate
    # Format: Decimal degrees, -73.9 to -34.7 (Brazil bounds)
    # Example: -46.6333
    # Validation: -73.99 <= lon <= -34.79
    # Source: Dataset geometry or geocoding
    
    # === TECHNICAL SPECIFICATIONS ===
    
    installed_power_kw: float
    # Description: Installed power capacity
    # Format: Decimal, kilowatts (kW)
    # Example: 5.5, 10.25, 100.00
    # Validation: 0.001 <= power <= 5000.0 (GD limits)
    # Regex: ^\d+(\.\d{1,3})?$
    # Source: Dataset field POWER_KW or POTENCIA_INSTALADA
    
    source_type: str
    # Description: Energy source type
    # Format: Enum string
    # Example: "Solar Fotovoltaica", "Eólica"
    # Enum: See SOURCE_TYPES
    # Source: Dataset field SOURCE_TYPE or FONTE
    
    compensation_modality: str
    # Description: Energy compensation model
    # Format: Enum string
    # Example: "Autoconsumo Local", "Geração Compartilhada"
    # Enum: Autoconsumo Local | Autoconsumo Remoto | Geração Compartilhada | EMUC
    # Source: Dataset field MODALITY or MODALIDADE
    
    # === DATES ===
    
    connection_date: datetime
    # Description: Grid connection date
    # Format: ISO 8601 date
    # Example: "2023-05-15"
    # Validation: >= 2012-04-17 (REN 482/2012)
    # Source: Dataset field CONNECTION_DATE or DATA_CONEXAO
    
    homologation_date: Optional[datetime] = None
    # Description: Project homologation date
    # Format: ISO 8601 date
    # Source: Dataset field HOMOLOGATION_DATE
    
    # === EQUIPMENT DETAILS ===
    
    equipment_brand: Optional[str] = None
    # Description: Primary equipment manufacturer
    # Format: String
    # Example: "Canadian Solar", "Growatt"
    # Source: Dataset or AI extraction from description
    
    inverter_count: Optional[int] = None
    # Description: Number of inverters
    # Format: Integer, 1-100
    # Validation: >= 1
    # Source: Dataset or AI extraction
    
    panel_count: Optional[int] = None
    # Description: Number of solar panels
    # Format: Integer, 1-10000
    # Validation: >= 1
    # Source: Dataset or calculated from power
    
    # === COMPUTED FIELDS ===
    
    annual_generation_kwh: Optional[float] = None
    # Description: Estimated annual generation
    # Format: kWh/year
    # Calculation: power_kw * HSP * 365 * 0.8
    # Example: 8760.0 (for 5.5 kW in MG)
    
    co2_offset_tons_year: Optional[float] = None
    # Description: Annual CO2 offset
    # Format: Tons CO2/year
    # Calculation: annual_generation_kwh * 0.0915 / 1000
    # Example: 0.802 tons/year
```

**Source Types**:

```python
SOURCE_TYPES = {
    'solar_fotovoltaica': {
        'name': 'Solar Fotovoltaica',
        'code': 'UFV',
        'renewable': True,
        'typical_capacity_kw': (1.0, 5000.0),
        'keywords': ['solar', 'fotovoltaic', 'pv', 'painel'],
        'regex': r'(?i)solar\s+fotovoltai[cv]'
    },
    'eolica': {
        'name': 'Eólica',
        'code': 'EOL',
        'renewable': True,
        'typical_capacity_kw': (5.0, 5000.0),
        'keywords': ['eolica', 'vento', 'wind'],
        'regex': r'(?i)e[oó]lica|vento|wind'
    },
    'biomassa': {
        'name': 'Biomassa',
        'code': 'BIO',
        'renewable': True,
        'typical_capacity_kw': (10.0, 5000.0),
        'keywords': ['biomassa', 'biogas', 'biocombustivel'],
        'regex': r'(?i)biomassa|biog[aá]s|biocombust'
    },
    'hidraulica': {
        'name': 'Hidráulica',
        'code': 'CGH',
        'renewable': True,
        'typical_capacity_kw': (10.0, 5000.0),
        'keywords': ['hidraulica', 'hidrica', 'cgh', 'pch'],
        'regex': r'(?i)hidr[aá]ulica|h[ií]drica|cgh|pch'
    },
    'gas_natural': {
        'name': 'Gás Natural',
        'code': 'GAS',
        'renewable': False,
        'typical_capacity_kw': (50.0, 5000.0),
        'keywords': ['gas', 'natural'],
        'regex': r'(?i)g[aá]s\s+natural'
    }
}
```

**Brazilian States**:

```python
BRAZILIAN_STATES = {
    'AC': {'name': 'Acre', 'region': 'Norte', 'code': 'BR-AC'},
    'AL': {'name': 'Alagoas', 'region': 'Nordeste', 'code': 'BR-AL'},
    'AP': {'name': 'Amapá', 'region': 'Norte', 'code': 'BR-AP'},
    'AM': {'name': 'Amazonas', 'region': 'Norte', 'code': 'BR-AM'},
    'BA': {'name': 'Bahia', 'region': 'Nordeste', 'code': 'BR-BA'},
    'CE': {'name': 'Ceará', 'region': 'Nordeste', 'code': 'BR-CE'},
    'DF': {'name': 'Distrito Federal', 'region': 'Centro-Oeste', 'code': 'BR-DF'},
    'ES': {'name': 'Espírito Santo', 'region': 'Sudeste', 'code': 'BR-ES'},
    'GO': {'name': 'Goiás', 'region': 'Centro-Oeste', 'code': 'BR-GO'},
    'MA': {'name': 'Maranhão', 'region': 'Nordeste', 'code': 'BR-MA'},
    'MT': {'name': 'Mato Grosso', 'region': 'Centro-Oeste', 'code': 'BR-MT'},
    'MS': {'name': 'Mato Grosso do Sul', 'region': 'Centro-Oeste', 'code': 'BR-MS'},
    'MG': {'name': 'Minas Gerais', 'region': 'Sudeste', 'code': 'BR-MG'},
    'PA': {'name': 'Pará', 'region': 'Norte', 'code': 'BR-PA'},
    'PB': {'name': 'Paraíba', 'region': 'Nordeste', 'code': 'BR-PB'},
    'PR': {'name': 'Paraná', 'region': 'Sul', 'code': 'BR-PR'},
    'PE': {'name': 'Pernambuco', 'region': 'Nordeste', 'code': 'BR-PE'},
    'PI': {'name': 'Piauí', 'region': 'Nordeste', 'code': 'BR-PI'},
    'RJ': {'name': 'Rio de Janeiro', 'region': 'Sudeste', 'code': 'BR-RJ'},
    'RN': {'name': 'Rio Grande do Norte', 'region': 'Nordeste', 'code': 'BR-RN'},
    'RS': {'name': 'Rio Grande do Sul', 'region': 'Sul', 'code': 'BR-RS'},
    'RO': {'name': 'Rondônia', 'region': 'Norte', 'code': 'BR-RO'},
    'RR': {'name': 'Roraima', 'region': 'Norte', 'code': 'BR-RR'},
    'SC': {'name': 'Santa Catarina', 'region': 'Sul', 'code': 'BR-SC'},
    'SP': {'name': 'São Paulo', 'region': 'Sudeste', 'code': 'BR-SP'},
    'SE': {'name': 'Sergipe', 'region': 'Nordeste', 'code': 'BR-SE'},
    'TO': {'name': 'Tocantins', 'region': 'Norte', 'code': 'BR-TO'}
}
```

---

### TariffData

**Purpose**: Electricity tariff information by utility and class

**Source**: ANEEL datasets, utility portals, regulatory resolutions

**Storage**: PostgreSQL (`tariffs` table), Redis cache

```python
@dataclass
class TariffData:
    """Electricity tariff data"""
    
    # === IDENTIFICATION ===
    
    tariff_id: str
    # Description: Unique tariff identifier
    # Format: {utility_code}_{class}_{subclass}_{date}
    # Example: "6585_RESIDENCIAL_B1_20250101"
    # Generated: Composite key
    
    utility_code: str
    # Description: ANEEL utility code
    # Format: 4-digit numeric string
    # Example: "6585" (Energisa MG), "0266" (CPFL Paulista)
    # Regex: ^\d{4}$
    # Source: ANEEL official list
    
    utility_name: str
    # Description: Utility company name
    # Format: String
    # Example: "Energisa Minas Gerais"
    # Source: ANEEL official list
    
    # === TARIFF COMPONENTS (R$/kWh) ===
    
    te: float
    # Description: Tarifa de Energia (Energy Tariff)
    # Format: Decimal, R$/kWh
    # Example: 0.32145
    # Validation: 0.01 <= te <= 2.0
    # Regex: ^\d+\.\d{5}$
    # Source: ANEEL resolution or utility
    
    tusd: float
    # Description: Tarifa de Uso do Sistema de Distribuição
    # Format: Decimal, R$/kWh
    # Example: 0.28734
    # Validation: 0.01 <= tusd <= 2.0
    # Source: ANEEL resolution or utility
    
    total_tariff: float
    # Description: Total tariff (TE + TUSD)
    # Format: Decimal, R$/kWh
    # Calculation: te + tusd
    # Example: 0.60879
    
    # === CLASSIFICATION ===
    
    consumer_class: str
    # Description: Consumer class
    # Format: Enum string
    # Example: "RESIDENCIAL", "COMERCIAL"
    # Enum: RESIDENCIAL | INDUSTRIAL | COMERCIAL | RURAL | PODER_PUBLICO | ILUMINACAO_PUBLICA
    # Source: ANEEL classification
    
    subclass: Optional[str] = None
    # Description: Consumer subclass
    # Format: String (B1, B2, B3, A1, A2, etc.)
    # Example: "B1" (residential low voltage)
    # Enum: B1 | B2 | B3 | B4 | A1 | A2 | A3 | A3a | A4 | AS
    # Source: ANEEL classification
    
    voltage_level: str
    # Description: Voltage level
    # Format: Enum string
    # Example: "Baixa Tensão" (< 2.3 kV)
    # Enum: Baixa Tensão | Média Tensão | Alta Tensão
    # Source: Derived from subclass
    
    modality: str
    # Description: Tariff modality
    # Format: Enum string
    # Example: "Convencional", "Horária Azul"
    # Enum: Convencional | Horária Verde | Horária Azul | Branca
    # Source: ANEEL resolution
    
    # === TEMPORAL ===
    
    valid_from: datetime
    # Description: Tariff validity start date
    # Format: ISO 8601 date
    # Example: "2025-01-01"
    # Validation: Must be < valid_until
    # Source: ANEEL resolution
    
    valid_until: Optional[datetime] = None
    # Description: Tariff validity end date
    # Format: ISO 8601 date
    # Example: "2025-12-31"
    # Source: Next resolution or null (current)
    
    # === REGULATORY ===
    
    resolution_number: str
    # Description: ANEEL homologatory resolution number
    # Format: REH nº X,XXX/YYYY
    # Example: "REH nº 3.059/2023"
    # Regex: ^REH\s+n[º°]\s+[\d\.,]+/\d{4}$
    # Source: ANEEL resolution
    
    publication_date: datetime
    # Description: Resolution publication date
    # Format: ISO 8601 date
    # Source: DOU (Diário Oficial da União)
    
    # === TAX FLAGS ===
    
    has_icms: bool = True
    # Description: Includes ICMS (state tax)
    # Default: True (usually included)
    # Varies: By state and consumer class
    
    has_pis_cofins: bool = True
    # Description: Includes PIS/COFINS (federal taxes)
    # Default: True (usually included)
    
    # === ADDITIONAL ===
    
    notes: Optional[str] = None
    # Description: Additional notes or conditions
    # Format: Text
    # Example: "Tarifa social aplicável"
```

**Utility Codes (Major)**:

```python
UTILITY_CODES = {
    '0266': {'name': 'CPFL Paulista', 'state': 'BR-SP', 'region': 'Sudeste'},
    '0477': {'name': 'Light SESA', 'state': 'BR-RJ', 'region': 'Sudeste'},
    '6585': {'name': 'Energisa Minas Gerais', 'state': 'BR-MG', 'region': 'Sudeste'},
    '0543': {'name': 'Enel São Paulo', 'state': 'BR-SP', 'region': 'Sudeste'},
    '0547': {'name': 'Enel Rio', 'state': 'BR-RJ', 'region': 'Sudeste'},
    '0548': {'name': 'Enel Ceará', 'state': 'BR-CE', 'region': 'Nordeste'},
    '0062': {'name': 'Cemig Distribuição', 'state': 'BR-MG', 'region': 'Sudeste'},
    '0074': {'name': 'Copel Distribuição', 'state': 'BR-PR', 'region': 'Sul'},
    '0084': {'name': 'Celesc Distribuição', 'state': 'BR-SC', 'region': 'Sul'},
    '0095': {'name': 'RGE Sul', 'state': 'BR-RS', 'region': 'Sul'},
    '0078': {'name': 'Coelba', 'state': 'BR-BA', 'region': 'Nordeste'},
    '0082': {'name': 'Cosern', 'state': 'BR-RN', 'region': 'Nordeste'},
    '0086': {'name': 'Celpe', 'state': 'BR-PE', 'region': 'Nordeste'}
    # ... 60+ utilities total
}
```

---

### CertificationData

**Purpose**: Equipment certification metadata

**Source**: ANEEL datasets, INMETRO database

**Storage**: PostgreSQL (`certifications` table)

```python
@dataclass
class CertificationData:
    """Equipment certification data"""
    
    # === CERTIFICATE ===
    
    certificate_id: str
    # Description: Unique certificate identifier
    # Format: System-generated UUID or official number
    # Example: "CERT-INV-2025-001234"
    # Regex: ^CERT-[A-Z]+-\d{4}-\d{6}$
    
    certificate_number: str
    # Description: Official certificate number
    # Format: Varies by certifying body
    # Example: "INMETRO-OCP-0015/2025"
    # Source: Certificate document
    
    certificate_type: str
    # Description: Certification type/body
    # Format: Enum string
    # Example: "INMETRO", "ANEEL", "IEC"
    # Enum: INMETRO | ANEEL | IEC | UL | TUV | CE
    # Source: Certificate document
    
    # === EQUIPMENT ===
    
    equipment_type: str
    # Description: Type of equipment
    # Format: Enum string
    # Example: "Inversor", "Módulo Fotovoltaico"
    # Enum: See EQUIPMENT_TYPES
    # Source: Certificate or dataset
    
    manufacturer: str
    # Description: Equipment manufacturer
    # Format: Company name
    # Example: "Canadian Solar Inc.", "Growatt"
    # Validation: Must match known manufacturers
    # Source: Certificate document
    
    model: str
    # Description: Equipment model number
    # Format: Alphanumeric string
    # Example: "CS3W-440P", "MIN 3000TL-XH"
    # Regex: ^[A-Z0-9-]+$
    # Source: Certificate document
    
    # === TECHNICAL SPECIFICATIONS ===
    
    power_rating: Optional[float] = None
    # Description: Nominal power rating
    # Format: Watts (W) for panels, VA for inverters
    # Example: 440.0 (panel), 3000.0 (inverter)
    # Validation: > 0
    # Source: Certificate datasheet
    
    efficiency: Optional[float] = None
    # Description: Equipment efficiency
    # Format: Percentage (0-100)
    # Example: 21.2 (panel), 97.5 (inverter)
    # Validation: 0 < efficiency <= 100
    # Source: Certificate datasheet
    
    voltage_mppt_min: Optional[float] = None
    # Description: Minimum MPPT voltage (inverters)
    # Format: Volts (V)
    # Example: 180.0
    # Source: Inverter datasheet
    
    voltage_mppt_max: Optional[float] = None
    # Description: Maximum MPPT voltage (inverters)
    # Format: Volts (V)
    # Example: 850.0
    # Source: Inverter datasheet
    
    # === STANDARDS COMPLIANCE ===
    
    standards: List[str] = None
    # Description: Applicable technical standards
    # Format: List of standard codes
    # Example: ["NBR 16690:2019", "IEC 61215", "IEC 61730"]
    # Source: Certificate document
    
    # === VALIDITY ===
    
    issue_date: datetime
    # Description: Certificate issue date
    # Format: ISO 8601 date
    # Source: Certificate document
    
    expiry_date: Optional[datetime] = None
    # Description: Certificate expiry date
    # Format: ISO 8601 date
    # Calculation: Usually issue_date + 5 years
    # Source: Certificate document
    
    status: str
    # Description: Current certificate status
    # Format: Enum string
    # Example: "Valid", "Expired"
    # Enum: Valid | Expired | Suspended | Revoked
    # Computed: Based on current date vs expiry
    
    # === DOCUMENTS ===
    
    certificate_url: Optional[str] = None
    # Description: Link to certificate PDF
    # Format: HTTPS URL
    # Source: ANEEL/INMETRO portal
    
    test_report_url: Optional[str] = None
    # Description: Link to test report
    # Format: HTTPS URL
    # Source: Certification body
```

**Equipment Types**:

```python
EQUIPMENT_TYPES = {
    'modulo_fotovoltaico': {
        'name': 'Módulo Fotovoltaico',
        'en': 'PV Module',
        'standards': ['NBR 16274', 'IEC 61215', 'IEC 61730'],
        'typical_power_w': (300, 700),
        'typical_efficiency': (15, 23),
        'keywords': ['painel', 'modulo', 'panel', 'pv'],
        'regex': r'(?i)m[oó]dulo\s+fotovoltai[cv]|painel\s+solar'
    },
    'inversor': {
        'name': 'Inversor',
        'en': 'Inverter',
        'standards': ['NBR 16149', 'NBR 16150', 'IEC 62109'],
        'typical_power_w': (1000, 100000),
        'typical_efficiency': (94, 99),
        'keywords': ['inversor', 'inverter'],
        'regex': r'(?i)inversor|inverter'
    },
    'stringbox': {
        'name': 'String Box',
        'en': 'String Box',
        'standards': ['NBR 16690'],
        'keywords': ['stringbox', 'caixa de juncao'],
        'regex': r'(?i)string\s*box|caixa\s+de\s+jun[çc][aã]o'
    },
    'estrutura': {
        'name': 'Estrutura de Fixação',
        'en': 'Mounting Structure',
        'standards': ['NBR 16274'],
        'keywords': ['estrutura', 'suporte', 'mounting'],
        'regex': r'(?i)estrutura|suporte|mounting'
    },
    'bateria': {
        'name': 'Bateria',
        'en': 'Battery',
        'standards': ['NBR 16274', 'IEC 62619'],
        'keywords': ['bateria', 'battery', 'armazenamento'],
        'regex': r'(?i)bateria|battery'
    }
}
```

---

## 🏗️ Product Data Models

### SolarKit

**Purpose**: Complete solar system kit

**Source**: Distributor catalogs (Fortlev, Fotus, etc.)

**Storage**: Medusa products table, PostgreSQL

```python
@dataclass
class SolarKit:
    """Complete solar system kit"""
    
    # === IDENTIFICATION ===
    
    kit_id: str
    # Description: YSH internal kit ID
    # Format: SKU-like code
    # Example: "KIT-ONGRID-5.5KW-001"
    # Regex: ^KIT-[A-Z]+-[\d\.]+KW-\d{3}$
    
    sku: str
    # Description: Stock keeping unit
    # Format: Alphanumeric
    # Example: "FTV-ONGRID-5500-BASIC"
    # Source: Generated or from distributor
    
    name: str
    # Description: Kit name/title
    # Format: String
    # Example: "Kit Solar On-Grid 5,5 kWp - Padrão"
    # Source: Distributor or generated
    
    # === CLASSIFICATION ===
    
    system_type: str
    # Description: System type
    # Format: Enum
    # Example: "on-grid", "off-grid", "hybrid"
    # Enum: on-grid | off-grid | hybrid
    
    power_kwp: float
    # Description: System power (peak kilowatts)
    # Format: Decimal kWp
    # Example: 5.5, 10.25, 13.2
    # Validation: 1.0 <= power <= 100.0
    
    voltage_phase: str
    # Description: System voltage/phase
    # Format: Enum
    # Example: "220V Monofásico", "380V Trifásico"
    # Enum: 110V Mono | 127V Mono | 220V Mono | 220V Bi | 380V Tri
    
    # === COMPONENTS ===
    
    panels: List[KitComponent]
    # Description: Solar panels in kit
    # Format: List of components
    # Validation: Must have at least 1 panel
    
    inverters: List[KitComponent]
    # Description: Inverters in kit
    # Validation: Must have at least 1 inverter
    
    accessories: List[KitComponent]
    # Description: Additional accessories
    # Example: String boxes, cables, connectors
    
    # === PRICING ===
    
    price_brl: float
    # Description: Kit price in BRL
    # Format: Decimal
    # Validation: > 0
    
    distributor_code: str
    # Description: Source distributor
    # Example: "fortlev", "fotus", "neosolar"
    
    # === TECHNICAL ===
    
    estimated_generation_kwh_month: float
    # Description: Monthly generation estimate
    # Calculation: Based on HSP and location
    
    # === METADATA ===
    
    created_at: datetime
    updated_at: datetime
    active: bool = True
```

---

*[Continued in next message due to length...]*

**Next sections to create**:

- Technical Validation Models (INMETRO, ANEEL, PVLIB)
- Enrichment & AI Metadata
- Complete Regex Patterns Library
- Validation Rules Engine
- Data Transformations
- Storage Schemas (DynamoDB, PostgreSQL, S3)
- API Response Formats

Continue?
