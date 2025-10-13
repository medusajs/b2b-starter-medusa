# Agent: FortLev Premium Inventory Integration

**Distributor**: FortLev Solar (fortlevsolar.app)
**Source Modules**: [Inventory](https://docs.medusajs.com/resources/commerce-modules/inventory/index.html.md) | [Product Variant](https://docs.medusajs.com/resources/commerce-modules/product/variant-inventory) | [Sales Channel](https://docs.medusajs.com/resources/commerce-modules/sales-channel/index.html.md)

## Mission

- Process 280 FortLev products across 14 categories into Medusa inventory system.
- Map premium tier-1 brands (HUAWEI, Fronius, Sungrow) to B2B sales channel.
- Handle complex product hierarchies (inverters, hybrid, microinverters).
- Integrate complete BOS (Balance of System) infrastructure products.
- Maintain manufacturer metadata for product filtering and search.

## Inputs

### Structured JSON Files

- `fortlev-inverters.json` - 153 grid-tie inverters
- `fortlev-hybrid_inverters.json` - 11 hybrid models
- `fortlev-microinverters.json` - 5 units
- `fortlev-panels.json` - 4 solar panels
- `fortlev-structures.json` - 54 mounting components
- `fortlev-stringboxes.json` - 11 combiner boxes
- `fortlev-conduits.json` - 16 PEAD conduits
- `fortlev-batteries.json` - 4 storage systems
- `fortlev-ev_chargers.json` - 3 EV charging stations
- `fortlev-transformers.json` - 3 isolation transformers
- Additional categories: boxes, security, accessories, miscellaneous

### Product Code Patterns

```regex
"id":\s*"fortlev_(?<category>[a-z_]+)_(?<code>I[A-Z]{2}\d+)"
```

**Code Prefixes**:

- `IIN` → Inversores (Inverters)
- `IMO` → Módulos (Panels)
- `IEF/ILS` → Estruturas (Structures)
- `ISB` → String Boxes
- `IBT` → Baterias (Batteries)
- `ICV` → Carregadores EV (EV Chargers)
- `IDT` → Dutos (Conduits)
- `ITF` → Transformadores (Transformers)

### Price Range Intelligence

| Category | Min Price | Max Price | Avg Price |
|----------|-----------|-----------|-----------|
| Inverters | R$ 1.273 | R$ 49.856 | R$ 12.500 |
| Hybrid Inverters | R$ 3.294 | R$ 13.737 | R$ 7.800 |
| Panels | R$ 567 | R$ 966 | R$ 739 |
| Batteries | R$ 6.716 | R$ 16.666 | R$ 11.250 |
| Structures | R$ 0,26 | R$ 509 | R$ 85 |

## Core Steps

### 1. Inventory Item Creation Workflow

```typescript
import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const createFortlevInventoryWorkflow = createWorkflow(
  "create-fortlev-inventory",
  () => {
    const inventoryItems = []
    
    // Load all FortLev JSON files
    const categories = [
      'inverters', 'hybrid_inverters', 'microinverters',
      'panels', 'structures', 'stringboxes', 'batteries'
    ]
    
    for (const category of categories) {
      const products = loadJson(`fortlev-${category}.json`)
      
      for (const product of products) {
        const item = {
          sku: product.id,
          title: product.name,
          requires_shipping: true,
          origin_country: "BR",
          metadata: {
            distributor: "fortlev",
            category: product.category,
            manufacturer: product.manufacturer,
            price_brl: product.pricing.price,
            image_url: product.image,
            product_code: extractCode(product.id)
          }
        }
        
        inventoryItems.push(item)
      }
    }
    
    const created = createInventoryItemsStep(inventoryItems)
    return new WorkflowResponse({ inventoryItems: created })
  }
)
```

### 2. Manufacturer-Based Segmentation

Group products by manufacturer for targeted marketing:

```typescript
const manufacturerSegments = {
  premium: ["HUAWEI", "Fronius", "Sungrow"],
  midRange: ["Growatt", "Solis", "FoxESS"],
  specialized: ["Enphase", "SAJ", "DEYE"],
  panels: ["Longi", "BYD", "DMEGC", "Risen"]
}

function assignSalesChannels(product) {
  const manufacturer = product.manufacturer.toUpperCase()
  
  if (manufacturerSegments.premium.includes(manufacturer)) {
    return ["b2b_premium", "b2c_premium"]
  } else if (manufacturerSegments.midRange.includes(manufacturer)) {
    return ["b2b_standard", "b2c_standard"]
  }
  
  return ["b2b_standard"]
}
```

### 3. Category-Specific Inventory Levels

Different stock strategies per category:

```json
{
  "inverters": {
    "stocked_quantity": 3,
    "reserved_quantity": 0,
    "incoming_quantity": 5,
    "reorder_point": 2
  },
  "panels": {
    "stocked_quantity": 50,
    "reserved_quantity": 0,
    "incoming_quantity": 100,
    "reorder_point": 20
  },
  "structures": {
    "stocked_quantity": 100,
    "reserved_quantity": 5,
    "incoming_quantity": 200,
    "reorder_point": 30
  },
  "batteries": {
    "stocked_quantity": 1,
    "reserved_quantity": 0,
    "incoming_quantity": 2,
    "reorder_point": 1
  }
}
```

### 4. Product Variant Mapping

Create product variants with power rating metadata:

```typescript
// Extract power rating from name
function extractPowerRating(name: string): { power: number, unit: string } {
  const match = name.match(/(\d+(?:\.\d+)?)\s*(KW|W)/i)
  if (match) {
    const value = parseFloat(match[1])
    const unit = match[2].toUpperCase()
    return { 
      power: unit === 'W' ? value / 1000 : value,
      unit: 'kW'
    }
  }
  return { power: 0, unit: 'kW' }
}

// Create variant with power-based options
const variant = {
  variant_id: product.id,
  title: product.name,
  sku: product.id,
  manage_inventory: true,
  allow_backorder: false,
  options: [
    {
      name: "Power",
      value: `${extractPowerRating(product.name).power}kW`
    },
    {
      name: "Voltage",
      value: extractVoltage(product.name) // "220V" or "380V"
    },
    {
      name: "MPPT",
      value: extractMPPT(product.name) // "2 MPPT", "4 MPPT"
    }
  ]
}
```

### 5. AWS S3 Image Integration

Map FortLev's S3-hosted images to Medusa media:

```typescript
async function processFortlevImages(products) {
  const imageProcessing = []
  
  for (const product of products) {
    if (product.image && product.image.includes('s3.amazonaws.com')) {
      const media = {
        url: product.image,
        type: "image/png",
        metadata: {
          component_id: extractComponentId(product.image),
          distributor: "fortlev",
          original_source: true
        }
      }
      
      imageProcessing.push({
        product_id: product.id,
        media: media
      })
    }
  }
  
  return imageProcessing
}
```

### 6. Premium Pricing Strategy

FortLev positions as premium - implement tiered pricing:

```typescript
function calculatePricingTiers(basePrice: number, category: string) {
  const markup = {
    inverters: 1.25,      // 25% markup
    hybrid_inverters: 1.30, // 30% markup (higher value)
    panels: 1.15,         // 15% markup (volume)
    batteries: 1.35,      // 35% markup (specialty)
    structures: 1.20      // 20% markup
  }
  
  return {
    b2b_wholesale: basePrice * 1.10,  // 10% over cost
    b2b_standard: basePrice * (markup[category] || 1.20),
    b2c_retail: basePrice * (markup[category] || 1.20) * 1.15
  }
}
```

## Outputs

### Inventory Payloads

- `fortlev_inventory_items.json` - 280 inventory item records
- `fortlev_inventory_levels.json` - Stock levels per location per item
- `fortlev_product_variants.json` - Product variant configurations
- `fortlev_images_mapping.json` - S3 image URLs mapped to products

### Category Reports

- `fortlev_inverters_summary.md` - 169 inverter SKUs analysis
- `fortlev_structures_catalog.md` - 54 BOS components
- `fortlev_premium_brands.md` - HUAWEI, Fronius, Sungrow portfolio

### Integration Metrics

```markdown
# FortLev Integration Metrics

## Inventory Coverage
- Total SKUs: 280
- Image Coverage: 95% (266 products)
- Price Data: 100% (all products)
- Manufacturer Data: 98% (275 identified)

## Category Distribution
- Inverters: 60% (169 SKUs)
- Infrastructure: 19% (54 structures)
- Accessories: 21% (57 various)

## Value Analysis
- Total Catalog Value: R$ 3.2M+
- Average Product Price: R$ 11.428
- Premium Products (>R$ 10k): 45 SKUs
```

## Collaboration

### With Inventory Module Agent

- Receives 280 inventory items from FortLev
- Manages stock levels across YSH warehouses
- Handles reservations for B2B bulk orders

### With Product Variant Inventory Agent

- Maps FortLev SKUs to ProductVariant records
- Applies `manage_inventory: true` for all items
- Sets `allow_backorder: false` (FortLev has stock availability)

### With Sales Channel Agent

- Routes premium brands to B2B channel
- Routes residential products (<10kW) to B2C
- Applies channel-specific pricing tiers

### With Stock Location Agent

- Distributes high-value items (inverters >20kW) to main DC
- Places BOS components across regional warehouses
- Creates drop-ship location for direct FortLev fulfillment

## Special Considerations

### HUAWEI Portfolio Management

FortLev has exclusive HUAWEI distribution - special handling:

```typescript
const huaweiProducts = products.filter(p => 
  p.manufacturer === 'Huawei'
)

// Tag as exclusive
huaweiProducts.forEach(p => {
  p.metadata.exclusive_distributor = true
  p.metadata.lead_time_days = 7  // Longer for premium
  p.metadata.warranty_years = 10
  p.metadata.support_level = 'premium'
})
```

### Infrastructure Bundling

Structures and accessories should suggest related products:

```typescript
function suggestBundleItems(structureProduct) {
  return {
    required: [
      "fortlev_accessories_IEF00073", // Parafuso M6x50
      "fortlev_accessories_ILS00008"  // Parafuso inox M6x12
    ],
    recommended: [
      "fortlev_structures_IEF00238",  // Grampo aterramento
      "fortlev_conduits_IDT00027"     // Duto 63mm
    ]
  }
}
```

### Multi-Voltage Variants

Many inverters have 220V/380V options - create variant groups:

```typescript
function groupVoltageVariants(inverters) {
  const groups = {}
  
  inverters.forEach(inv => {
    const baseModel = inv.name.replace(/220V|380V/g, '').trim()
    if (!groups[baseModel]) groups[baseModel] = []
    groups[baseModel].push(inv)
  })
  
  return groups
}
```

## Integration Checklist

- [x] Parse 9 CSV files
- [x] Extract 280 products
- [x] Categorize into 14 groups
- [x] Generate structured JSON files
- [x] Map manufacturers (98% success)
- [x] Normalize pricing to BRL decimal
- [x] Extract S3 image URLs
- [ ] Create Medusa inventory items
- [ ] Assign stock levels per location
- [ ] Configure product variants
- [ ] Set up sales channel routing
- [ ] Implement premium pricing tiers
- [ ] Test HUAWEI exclusive handling
