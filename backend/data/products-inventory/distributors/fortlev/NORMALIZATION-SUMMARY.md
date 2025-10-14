# Title Normalization and Medusa.js Integration - Complete Guide

## Executive Summary

Successfully normalized **217 solar kit titles** for optimal semantic search performance using Gemma3 and Medusa.js best practices.

### What Was Done

1. **Fetched Medusa.js Documentation**
   - Product/Variant/Inventory models
   - Pricing strategies (tiered, rule-based)
   - Cart and fulfillment patterns
   - JS SDK integration patterns

2. **Created Title Normalization System**
   - Standardized manufacturer names (LONGi, Growatt, Risen, etc.)
   - Generated multiple title formats for different use cases
   - Created SEO-optimized metadata
   - Generated Medusa.js-compatible SKUs and handles

3. **Developed 7 Specialized Medusa.js Agents**
   - Product Data Model Expert
   - Inventory Management Expert
   - Pricing and Rules Expert
   - Product Organization Expert
   - Fulfillment and Shipping Expert
   - Storefront Integration Expert
   - Data Import Workflow Expert

### File Outputs

```
📁 fortlev/
├── fortlev-kits-synced.json          # Original synchronized data (217 kits)
├── fortlev-kits-normalized.json      # NEW: Normalized for Medusa.js (217 kits)
├── normalize_titles.py               # NEW: Normalization script
├── MEDUSA-AGENTS.md                  # NEW: 7 specialized agents guide
└── NORMALIZATION-SUMMARY.md          # NEW: This summary document
```

---

## Normalization Results

### Statistics

- **Total Kits Processed**: 217
- **Successfully Normalized**: 217
- **Unique Panel Manufacturers**: 7+ (LONGi, Risen, Trina Solar, JinkoSolar, etc.)
- **Unique Inverter Manufacturers**: 10+ (Growatt, Deye, Fronius, SMA, etc.)
- **Power Range**: 2.44kWp to 15.0kWp+

### Title Format Examples

#### Original vs Normalized

| Original | Normalized Product Title | Variant Title |
|----------|-------------------------|---------------|
| `Kit 2.44kWp - Panel + Growatt` | `Solar Kit 2.44kWp - Panel + Growatt` | `2.44kWp System / 2.0kW Inverter` |
| `Kit 2.52kWp - Longi + Growatt` | `Solar Kit 2.52kWp - LONGi + Growatt` | `630W x4 Panels / 2.0kW Inverter` |
| `Kit 2.8kWp - Risen + Growatt` | `Solar Kit 2.8kWp - Risen + Growatt` | `700W x4 Panels / 2.0kW Inverter` |

### SKU Format

```
FLV-{power}KWP-{panel_code}{inverter_code}-{id}

Examples:
- FLV-2.44KWP-UNKGRO-001
- FLV-2.52KWP-LONGRO-002
- FLV-2.80KWP-RISGRO-003
```

### Handle Format (URL-friendly)

```
solar-kit-{power}kwp-{panel}-{inverter}

Examples:
- solar-kit-244kwp-panel-growatt
- solar-kit-252kwp-longi-growatt
- solar-kit-28kwp-risen-growatt
```

---

## Data Structure Overview

### Product Model Fields (Medusa.js)

```json
{
  "title": "Solar Kit 2.44kWp - LONGi + Growatt",
  "subtitle": null,
  "description": "Complete 2.44kWp solar energy kit...",
  "handle": "solar-kit-244kwp-longi-growatt",
  "status": "published",
  "type": "Solar Kit",
  "collection": "FortLev Solar Kits",
  "tags": ["Solar Kit", "Grid-Tie", "2.44kWp", "LONGi", "Growatt"],
  
  "variant_title": "420W x6 Panels / 2.0kW Inverter",
  "variant_sku": "FLV-2.44KWP-LONGRO-001",
  "variant_metadata": {
    "panel_manufacturer": "LONGi",
    "inverter_manufacturer": "Growatt",
    "system_power_kwp": 2.44,
    "panel_power_w": 420,
    "panel_quantity": 6,
    "inverter_power_kw": 2.0,
    "price_per_wp": 1.2,
    "estimated_monthly_generation_kwh": 328
  },
  
  "options": [
    {
      "title": "System Power",
      "values": ["2.44kWp"]
    },
    {
      "title": "Panel Configuration",
      "values": ["420W x6"]
    },
    {
      "title": "Inverter Power",
      "values": ["2.0kW"]
    }
  ],
  
  "search_title": "2.44kWp Solar Energy Kit LONGi Panel Growatt Inverter Grid-Tie System",
  "seo_title": "2.44kWp Solar Kit - LONGi Panels + Growatt Inverter | Complete Photovoltaic System",
  "seo_description": "Complete 2.44kWp solar energy kit for grid-tie residential..."
}
```

---

## Medusa.js Integration Patterns

### 1. Product Import Workflow

See `MEDUSA-AGENTS.md` → Agent 7 for complete workflow implementation.

```typescript
// Simplified import flow
const { result } = await importSolarKitsWorkflow(req.scope).run({
  input: { 
    kits: normalizedKitsData  // From fortlev-kits-normalized.json
  }
});

console.log(`✓ Imported ${result.products.length} solar kits`);
```

### 2. Inventory Kit Configuration

Each solar kit = multi-part product (panels + inverter):

```typescript
{
  variants: [{
    inventory_items: [
      {
        inventory_item_id: "panel_longi_420w",
        required_quantity: 6  // 6 panels per kit
      },
      {
        inventory_item_id: "inverter_growatt_2kw",
        required_quantity: 1  // 1 inverter per kit
      }
    ]
  }]
}
```

### 3. Tiered Pricing Example

Quantity-based discounts:

```typescript
prices: [
  { amount: 292356, currency_code: "brl" },                    // 1-4 kits: R$ 2,923.56
  { amount: 277438, currency_code: "brl", min_quantity: 5 },   // 5+ kits: 5% off
  { amount: 262521, currency_code: "brl", min_quantity: 10 }   // 10+ kits: 10% off
]
```

### 4. Storefront Search

Using Gemma3 semantic search:

```typescript
// Retrieve products with semantic search
const results = await semanticSearch({
  query: "sistema solar residencial 3kwp com inversor growatt",
  fields: [
    "search_title",
    "description", 
    "variant_metadata.panel_manufacturer",
    "variant_metadata.inverter_manufacturer"
  ],
  limit: 20
});

// Results will match:
// - "3kWp Solar Energy Kit" (power match)
// - "Growatt Inverter" (brand match)
// - "Residential" (use case match)
```

---

## Semantic Search Optimization

### Search Title Format

Designed for maximum keyword coverage:

```
{power}kWp Solar Energy Kit {panel_brand} Panel {inverter_brand} Inverter Grid-Tie System
```

**Why this format?**

- ✓ Power rating first (most common search)
- ✓ "Solar Energy Kit" includes key terms
- ✓ Brand names for brand-specific searches
- ✓ "Grid-Tie System" for technical searches
- ✓ All searchable without special parsing

### Gemma3 Embedding Strategy

Index these fields for semantic search:

1. `search_title` (primary)
2. `description` (detailed context)
3. `variant_metadata` (technical specs)
4. `tags` (categorical filters)

### Example Queries → Matches

| User Query | Matches Kit | Reason |
|------------|-------------|--------|
| "kit solar 3kwp residencial" | 2.52kWp, 2.8kWp, 3.15kWp kits | Power range + residential tag |
| "painel longi inversor growatt" | All LONGi + Growatt combinations | Exact brand match |
| "sistema fotovoltaico grid-tie" | All kits | System type match |
| "energia solar para casa pequena" | 2.44-3kWp kits | Power range for small homes |

---

## Next Steps

### Phase 1: Validate Normalized Data ✓ DONE

- [x] Run `normalize_titles.py`
- [x] Review sample outputs
- [x] Verify manufacturer normalization
- [x] Check SKU uniqueness

### Phase 2: Medusa.js Setup

1. **Configure Medusa Backend**

   ```bash
   # Create product collection
   POST /admin/collections
   {
     "title": "FortLev Solar Kits",
     "handle": "fortlev-solar-kits"
   }
   
   # Create product categories
   POST /admin/product-categories
   {
     "name": "Solar Energy Systems",
     "handle": "solar-energy-systems"
   }
   ```

2. **Create Import Workflow**
   - Use `MEDUSA-AGENTS.md` → Agent 7 as template
   - Adapt to your Medusa version
   - Test with 10 kits first
   - Execute full import (217 kits)

3. **Set Up Inventory**
   - Create inventory items for each panel model
   - Create inventory items for each inverter model
   - Link to product variants as inventory kits
   - Set initial stock quantities

### Phase 3: Semantic Search Integration

1. **Index to ChromaDB**

   ```python
   from chromadb import Client
   import json
   
   client = Client()
   collection = client.create_collection("solar_kits")
   
   with open('fortlev-kits-normalized.json') as f:
       kits = json.load(f)
   
   for kit in kits:
       collection.add(
           documents=[kit['search_title']],
           metadatas=[kit['variant_metadata']],
           ids=[kit['id']]
       )
   ```

2. **Configure Gemma3 Search**

   ```python
   import ollama
   
   def search_kits(query: str):
       # Get embedding from Gemma3
       embedding = ollama.embeddings(
           model='gemma3:4b',
           prompt=query
       )
       
       # Search ChromaDB
       results = collection.query(
           query_embeddings=[embedding['embedding']],
           n_results=10
       )
       
       return results
   ```

3. **Test Search Queries**
   - "kit solar 3kwp"
   - "painel longi"
   - "inversor growatt 5kw"
   - "sistema residencial pequeno"

### Phase 4: Storefront Implementation

1. **Product Listing Page**
   - Display normalized product titles
   - Show variant options (power, panels, inverter)
   - Filter by manufacturer, power range, price

2. **Product Detail Page**
   - Show full description
   - Display component specifications
   - Show combination images (if available)
   - Add to cart with variant selection

3. **Search Interface**
   - Semantic search input
   - Real-time suggestions
   - Filters (brand, power, price)
   - Sort options

---

## Quality Assurance

### Validation Checks

Run these checks on normalized data:

```python
import json

with open('fortlev-kits-normalized.json') as f:
    kits = json.load(f)

# Check 1: All kits have required fields
required_fields = ['title', 'handle', 'variant_sku', 'variant_title']
for kit in kits:
    assert all(field in kit for field in required_fields), f"Missing fields in {kit['id']}"

# Check 2: SKUs are unique
skus = [kit['variant_sku'] for kit in kits]
assert len(skus) == len(set(skus)), "Duplicate SKUs found!"

# Check 3: Handles are URL-safe
import re
for kit in kits:
    assert re.match(r'^[a-z0-9-]+$', kit['handle']), f"Invalid handle: {kit['handle']}"

# Check 4: All have search titles
for kit in kits:
    assert len(kit['search_title']) > 0, f"Empty search title: {kit['id']}"

print("✓ All validation checks passed!")
```

### Manual Review Checklist

- [ ] Sample 10 random kits
- [ ] Verify manufacturer names are consistent
- [ ] Check power ratings match original data
- [ ] Ensure descriptions are meaningful
- [ ] Validate pricing information
- [ ] Confirm image paths are correct

---

## Troubleshooting

### Common Issues

**Issue**: Manufacturer name shows "Unknown"

- **Cause**: Manufacturer not in normalization map
- **Solution**: Add to `MANUFACTURER_MAP` in `normalize_titles.py`

**Issue**: SKU conflicts

- **Cause**: Multiple kits with same power + manufacturers
- **Solution**: SKU includes unique ID suffix to prevent conflicts

**Issue**: Missing panel/inverter quantities

- **Cause**: Not extracted from original data
- **Solution**: Manually update or use defaults in variant metadata

**Issue**: Search returns irrelevant results

- **Cause**: Embedding model needs better training data
- **Solution**: Fine-tune search titles, add more keywords, adjust weights

---

## Performance Metrics

### Expected Results

- **Import Speed**: ~10-20 products/second
- **Search Latency**: <100ms (with ChromaDB)
- **Storage**: ~2MB for 217 normalized kits (JSON)
- **Embedding Size**: ~500MB (ChromaDB with Gemma3 embeddings)

### Monitoring

Track these metrics:

- Search query response time
- Product import success rate
- Inventory sync accuracy
- Cart conversion rate
- Most searched terms

---

## Resources

### Documentation References

1. **Medusa.js Official Docs**
   - Product Module: <https://docs.medusajs.com/resources/commerce-modules/product>
   - Inventory Module: <https://docs.medusajs.com/resources/commerce-modules/inventory>
   - Pricing Module: <https://docs.medusajs.com/resources/commerce-modules/pricing>

2. **Local Files**
   - `MEDUSA-AGENTS.md` - 7 specialized agent patterns
   - `normalize_titles.py` - Title normalization script
   - `fortlev-kits-normalized.json` - Final output data
   - `SYNC-README.md` - Image synchronization guide

3. **Tools**
   - Gemma3 Model: `ollama run gemma3:4b`
   - ChromaDB: Vector database for semantic search
   - Medusa JS SDK: API integration library

---

## Success Criteria

✅ **Phase 1 Complete**: Title Normalization

- [x] 217 kits normalized
- [x] Medusa.js-compatible structure
- [x] SEO-optimized titles
- [x] Semantic search ready

⏳ **Phase 2 Pending**: Medusa.js Import

- [ ] Products imported to Medusa
- [ ] Inventory configured
- [ ] Prices set up
- [ ] Images linked

⏳ **Phase 3 Pending**: Semantic Search

- [ ] ChromaDB indexed
- [ ] Gemma3 integrated
- [ ] Search tested
- [ ] Relevance tuned

⏳ **Phase 4 Pending**: Production Launch

- [ ] Storefront live
- [ ] Search functional
- [ ] Cart working
- [ ] Orders processing

---

## Contact & Support

For questions or issues with:

- **Normalization**: Check `normalize_titles.py` comments
- **Medusa.js**: Refer to `MEDUSA-AGENTS.md`
- **Search**: Review Gemma3 documentation
- **Import**: See Agent 7 workflow patterns

---

**Last Updated**: October 13, 2025  
**Version**: 1.0  
**Status**: ✅ Normalization Complete, Ready for Medusa.js Import
