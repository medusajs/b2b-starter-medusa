# Agent: Inventory Module Management

**Source**: [Medusa Inventory Module](https://docs.medusajs.com/resources/commerce-modules/inventory/index.html.md)

## Mission

- Manage inventory items for all distributor SKUs across multiple stock locations.
- Create and maintain inventory levels, reservations, and availability checks.
- Implement inventory kits for bundled products (e.g., Fotus solar kits).
- Ensure data consistency with automatic rollback mechanisms via workflows.

## Inputs

- Parsed distributor JSON files from `distributors/{odex,solfacil,fotus}/**/*.json`.
- Extracted product data:
  - **Odex**: Inverters (45), Panels (9), Structures (26), Stringboxes (13)
  - **Solfacil**: Inverters (82), Panels (6), Structures (4), Cables (36), Batteries (4), Accessories (10)
  - **Fotus**: Standard Kits (3), Hybrid Kits (1)
- Stock location IDs from Stock Location Module Agent.
- Reservation requirements from Cart/Order workflows.

## Core Steps

1. **Create Inventory Items Workflow**:

   ```typescript
   const inventoryItem = await inventoryModuleService.createInventoryItems({
     sku: "odex_inverters_ODEX-INV-SAJ-3000W",
     title: "Inversor Grid-Tie SAJ R5-3K-T2 BRL 3kW",
     requires_shipping: true,
     origin_country: "BR",
     material: "photovoltaic equipment"
   })
   ```

2. **Inventory Level Management**: For each item, create inventory levels per location:

   ```json
   {
     "inventory_item_id": "{inventory_item.id}",
     "location_id": "{warehouse_location_id}",
     "stocked_quantity": 10,
     "reserved_quantity": 0,
     "incoming_quantity": 5
   }
   ```

3. **Availability Checks**: Implement `confirmInventory` workflow to validate stock before order placement:

   ```typescript
   const isAvailable = await inventoryModuleService.confirmInventory(
     inventoryItemId,
     [locationId],
     quantity
   )
   ```

4. **Reservation Management**: When cart is created, reserve quantities:

   ```typescript
   const reservation = await inventoryModuleService.createReservationItems({
     inventory_item_id: inventoryItemId,
     location_id: locationId,
     quantity: 2,
     line_item_id: cartLineItemId,
     description: "Reserved for Cart #123"
   })
   ```

5. **Inventory Kits**: For Fotus bundled products, create inventory kits:

   ```typescript
   const kit = await inventoryModuleService.createInventoryKits({
     name: "FOTUS-KP02-1136kWp-Ceramico",
     items: [
       { inventory_item_id: "panel_id", quantity: 4 },
       { inventory_item_id: "inverter_id", quantity: 1 },
       { inventory_item_id: "structure_id", quantity: 1 }
     ]
   })
   ```

## Outputs

- `inventory_items_payload.json`: Complete inventory item records with Medusa IDs.
- `inventory_levels_by_location.json`: Stock quantities per warehouse/location.
- `inventory_reservations_report.md`: Active reservations and allocation status.
- `inventory_kits_definition.json`: Bundle configurations for kit products.

## Collaboration

- Depends on **Stock Location Agent** for warehouse/location IDs.
- Provides inventory data to **Product Variant Inventory Agent** for variant-level management.
- Integrates with **Sales Channel Agent** to determine inventory availability per channel.
- Connects to Cart/Order workflows via reservation system.

## Workflow Patterns

All operations use Medusa workflows for guaranteed consistency:

```typescript
import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

export const createInventoryItemWorkflow = createWorkflow(
  "create-inventory-item-workflow",
  () => {
    const { inventoryItem } = createInventoryItemStep()
    return new WorkflowResponse({ inventoryItem })
  }
)
```

## Key Concepts

- **Inventory Item**: Represents any stock-kept item (product variant, raw material, etc.)
- **Inventory Level**: Quantity of an inventory item at a specific location
- **Reservation**: Temporary allocation of inventory for orders or other purposes
- **Inventory Kit**: Grouped items sold as a single product (bundles)
