# Agent: Product Variant Inventory Alignment

**Source**: [Medusa Product Variant Inventory](https://docs.medusajs.com/resources/commerce-modules/product/variant-inventory)

## Mission

- Map distributor SKUs (regex extracted IDs, names, categories) to Medusa `ProductVariant` records.
- Toggle `manage_inventory` and `allow_backorder` based on distributor availability fields.
- Produce semantic summaries highlighting inventory coverage by location and sales channel scope.

## Inputs

- Regex captures:
  - `"id":\s*"(?<product_id>[^"]+)"`
  - `"category":\s*"(?<category>[^"]+)"`
  - `"image":\s*"(?<image>[^"]+)"`
- Semantic search embeddings generated with `semantic/search-cli.js` targeting `inventory`, `stock`, `backorder`, `availability`.

## Core Steps

1. **Load & Normalize** distributor payloads → ensure SKU uniqueness, attach distributor tag, compute counts (e.g. Odex `inverters`: 45, `panels`: 9, `structures`: 26, `stringboxes`: 13; Solfacil `inverters`: 82, `panels`: 6, `structures`: 4, `cables`: 36, `batteries`: 4, `accessories`: 10; Fotus kits: 3 standard, 1 híbrido).
2. **Inventory Intent Detection** (semantic): classify variants requiring backorder using product descriptions (look for phrases `PRE-VENDA`, `SOB ENCOMENDA`).
3. **Medusa Mapping**: for each variant, prepare payload:

   ```json
   {
     "variant_id": "{product_id}",
     "manage_inventory": true,
     "allow_backorder": false,
     "inventory_items": [
       {
         "sku": "{product_id}",
         "stocked_quantity": {quantity|0},
         "location_id": "{stock_location_id}"
       }
     ]
   }
   ```

4. **Backorder Policy**: If semantic analysis scores description with `>0.75` relevance to `pre-order`, set `allow_backorder = true`.
5. **Variant Exposure**: align publishable API keys to sales channels returned by the Sales Channel agent.

## Outputs

- `variant_inventory_payload.json`: array of prepared Medusa variant updates.
- `variant_inventory_semantic_report.md`: insight summary (top low-stock SKUs, backorder-ready variants).

## Collaboration

- Depends on **Inventory Module Agent** for item IDs and reservations.
- Depends on **Stock Location Agent** for location-id resolution.
- Shares sales-channel scope with **Sales Channel Agent** to ensure storefront parity.
