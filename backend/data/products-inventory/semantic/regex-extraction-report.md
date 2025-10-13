# Regex Extraction Report - YSH Distributor Inventory

**Generated**: 2025-10-13 (Updated with complete patterns and integration guidance)

## Extraction Patterns

**Core Regex Patterns**:

- Product ID: `"id":\s*"(?<product_id>[^"]+)"`
- Category: `"category":\s*"(?<category>[^"]+)"`
- Price: `"price":\s*"?(?<price>[^",]+)"?`
- Image: `"image":\s*"(?<image>[^"]+)"`
- Availability: `"availability":\s*"(?<availability>[^"]+)"`
- Manufacturer: `"manufacturer":\s*"(?<manufacturer>[^"]+)"`
- Name: `"name":\s*"(?<name>[^"]+)"`
- Description: `"description":\s*"(?<description>[^"]+)"`

## ODEX Inventory

**Total Products**: 54

- Inverters: 45
- Panels: 9

**Sample IDs**:

- odex_inverters_ODEX-INV-SAJ-3000W
- odex_inverters_ODEX-INV-SAJ-4200W
- odex_inverters_ODEX-INV-SAJ-5000W

**Manufacturers**: SAJ, Canadian Solar, JA Solar, Jinko Solar

## SOLFACIL Inventory

**Total Products**: 88

- Inverters: 82
- Panels: 6

**Sample IDs**:

- solfacil_inverters_1
- solfacil_inverters_2
- solfacil_inverters_3

**Manufacturers**: ENPHASE, GOODWE, DEYE, FRONIUS, GROWATT

## FOTUS Inventory

**Total Products**: 4

- Standard Kits: 3
- Hybrid Kits: 1

**Sample IDs**:

- FOTUS-KP02-1136kWp-Ceramico
- FOTUS-KP02-1136kWp-Fibrocimento
- FOTUS-KP02-1136kWp-Laje

**Kit Types**: Complete solar systems with panels, inverters, structures

## FORTLEV Inventory

**Total Products**: 280

- **Inverters (Grid-Tie)**: 153 SKUs
- **Hybrid Inverters**: 11 SKUs
- **Microinverters**: 5 SKUs
- **Panels**: 4 SKUs
- **Structures**: 54 SKUs
- **String Boxes**: 11 SKUs
- **Conduits**: 16 SKUs
- **Batteries**: 4 SKUs
- **EV Chargers**: 3 SKUs
- **Transformers**: 3 SKUs
- **Boxes**: 5 SKUs
- **Security**: 2 SKUs
- **Accessories**: 2 SKUs
- **Miscellaneous**: 7 SKUs

**Sample Product IDs**:

- `fortlev_inverters_IIN00384`
- `fortlev_panels_IMO00135`
- `fortlev_structures_IEF00243`
- `fortlev_hybrid_inverters_IIN00386`
- `fortlev_batteries_IBT00004`

**Manufacturers Detected**:

- HUAWEI (50+ SKUs): Premium grid-tie and hybrid inverters
- Growatt (40+ SKUs): MIN/MID/MAC series, wide range
- Solis (20+ SKUs): S5/S6 series, commercial focus
- Sungrow (15+ SKUs): High efficiency premium
- Fronius (10+ SKUs): European premium brand
- FoxESS: Hybrid inverters, batteries, microinverters
- Enphase: Microinverters and monitoring
- Longi, BYD, DMEGC, Risen: Solar panels
- Clamper, FLS: Structures and mounting

**Categories**:

- inverters
- hybrid_inverters
- microinverters
- panels
- structures
- stringboxes
- conduits
- batteries
- ev_chargers
- transformers
- boxes
- security
- accessories
- miscellaneous

**Product Code Patterns**:

- `IIN` - Inversores (Inverters)
- `IMO` - Módulos (Panels/Modules)
- `IEF/ILS` - Estruturas (Structures)
- `ISB` - String Boxes
- `IBT` - Baterias (Batteries)
- `ICV` - Carregadores Veiculares (EV Chargers)
- `IDT` - Dutos (Conduits)
- `ITF` - Transformadores (Transformers)
- `ICP` - Caixas de Passagem (Junction Boxes)
- `ITR` - Acessórios (Accessories)
- `IMS` - Segurança (Security)

**Availability Pattern**: `"Disponível"` (available) - all products

**Price Range**:

- Inverters: R$ 1.273 - R$ 49.856
- Panels: R$ 567 - R$ 966
- Structures: R$ 0,26 - R$ 509
- Batteries: R$ 6.716 - R$ 16.666

**Image Pattern**: AWS S3 hosted - `https://prod-platform-api.s3.amazonaws.com/components/{component_id}/{image_file}`

## Availability Patterns

- **Odex**: "disponivel" (available)
- **Solfacil**: "Disponível" (available)
- **Fotus**: Product availability implied by kit configuration
- **FortLev**: "Disponível" (available) - all products in stock

## Price Format

- All prices in Brazilian Real (BRL): R$ X.XXX,XX
- Regex extraction requires comma-to-dot conversion for numeric processing
- Normalized format: `{ "price": XXXX.XX, "currency": "BRL" }`

## Image Paths

- **Odex**: `/catalog/images/ODEX-{CATEGORY}/{SKU}.jpg`
- **Solfacil**: `/catalog/images/SOLFACIL-{CATEGORY}/{IMAGE_ID}.jpeg`
- **Fotus**: `catalog\images_processed\FOTUS-KITS\{size}\{SKU}.webp`
- **FortLev**: `https://prod-platform-api.s3.amazonaws.com/components/{component_id}/{image_file}`

## Cross-Distributor Summary

### Total Inventory

| Distributor | Total Products | Inverters | Panels | Other Categories |
|-------------|---------------|-----------|--------|------------------|
| **Odex** | 54 | 45 | 9 | - |
| **Solfacil** | 88 | 82 | 6 | - |
| **Fotus** | 4 | - | - | 4 kits |
| **FortLev** | 280 | 169* | 4 | 107** |
| **TOTAL** | **426** | **296** | **19** | **111** |

*Includes grid-tie (153), hybrid (11), and microinverters (5)
**Includes structures, batteries, EV chargers, string boxes, conduits, etc.

### Market Coverage

**Inverter Manufacturers**:

- Premium Tier: HUAWEI, Fronius, Sungrow
- Mid-Range: Growatt, Solis, FoxESS
- Specialized: Enphase (micro), SAJ, DEYE, GOODWE

**Panel Manufacturers**:

- Tier 1: Longi, Canadian Solar, JA Solar
- Tier 2: BYD, DMEGC, Risen, Jinko

**Infrastructure**:

- FortLev dominates with complete BOS (Balance of System)
- 54 structure components
- 16 conduit options
- 11 string boxes

### Price Competitiveness

**Inverters (3kW residential)**:

- Odex: R$ 1.599 (SAJ)
- Solfacil: R$ 2.250 (GOODWE)
- FortLev: R$ 3.294 (HUAWEI) - premium positioning

**Panels (550-630W)**:

- Odex: Not available in this range
- Solfacil: Pricing varies by model
- FortLev: R$ 567-695 (DMEGC/Longi)
