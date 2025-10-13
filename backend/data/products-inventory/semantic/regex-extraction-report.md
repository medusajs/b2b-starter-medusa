# Regex Extraction Report - YSH Distributor Inventory

Generated: 2025-10-13 20:46:46

## Extraction Patterns

- Product ID: "id":\s*"(?<product_id>[^"]+)"
- Category: "category":\s*"(?<category>[^"]+)"
- Price: "price":\s*"?(?<price>[^",]+)"?
- Image: "image":\s*"(?<image>[^"]+)"
- Availability: "availability":\s*"(?<availability>[^"]+)"
- Manufacturer: "manufacturer":\s*"(?<manufacturer>[^"]+)"

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

## Availability Patterns

- **Odex**: "disponivel" (available)
- **Solfacil**: "Disponível" (available)
- **Fotus**: Product availability implied by kit configuration

## Price Format

- All prices in Brazilian Real (BRL): R$ X.XXX,XX
- Regex extraction requires comma-to-dot conversion for numeric processing

## Image Paths

- **Odex**: /catalog/images/ODEX-{CATEGORY}/{SKU}.jpg
- **Solfacil**: /catalog/images/SOLFACIL-{CATEGORY}/{IMAGE_ID}.jpeg
- **Fotus**: Processed images in catalog\images_processed\FOTUS-KITS\

