# Agent: Stock Location Management

**Source**: [Medusa Stock Location Module](https://docs.medusajs.com/resources/commerce-modules/stock-location/index.html.md)

## Mission

- Create and manage warehouse and fulfillment center locations across Brazil.
- Maintain address information for each stock location.
- Link locations to sales channels and inventory levels.
- Support multi-warehouse inventory distribution for YSH solar equipment.

## Inputs

- YSH warehouse locations and distribution centers:
  - **São Paulo DC**: Main distribution center
  - **Rio de Janeiro Warehouse**: Secondary fulfillment
  - **Minas Gerais Hub**: Regional distribution
  - **Supplier Drop-ship Locations**: Odex, Solfacil, Fotus facilities
- Address data for each location (street, city, state, postal code).
- Operational capacity and handling specifications per location.

## Core Steps

1. **Create Stock Locations Workflow**:

   ```typescript
   const stockLocations = await stockLocationModuleService.createStockLocations([
     {
       name: "YSH São Paulo Distribution Center",
       address: {
         address_1: "Rua Exemplo, 123",
         city: "São Paulo",
         province: "SP",
         postal_code: "01234-567",
         country_code: "BR"
       },
       metadata: {
         capacity_units: 10000,
         handling_types: ["solar_panels", "inverters", "structures"]
       }
     },
     {
       name: "YSH Rio de Janeiro Warehouse",
       address: {
         address_1: "Av. Atlântica, 456",
         city: "Rio de Janeiro",
         province: "RJ",
         postal_code: "22070-001",
         country_code: "BR"
       },
       metadata: {
         capacity_units: 5000,
         handling_types: ["all_solar_equipment"]
       }
     }
   ])
   ```

2. **Supplier Drop-ship Locations**: Create virtual locations for supplier-direct fulfillment:

   ```typescript
   const dropshipLocations = await stockLocationModuleService.createStockLocations([
     {
       name: "Odex Supplier Warehouse",
       address: {
         address_1: "Supplier Address",
         city: "São Paulo",
         province: "SP",
         country_code: "BR"
       },
       metadata: {
         is_dropship: true,
         supplier: "odex",
         lead_time_days: 3
       }
     }
   ])
   ```

3. **Location-Channel Linking**: Associate locations with sales channels:

   ```json
   {
     "stock_location_id": "sp_dc_location_id",
     "sales_channel_ids": ["b2b_channel_id", "b2c_channel_id"],
     "priority": 1,
     "fulfillment_options": ["pickup", "delivery", "express_shipping"]
   }
   ```

4. **Inventory Level Assignment**: Each location receives inventory allocations:

   ```typescript
   // Handled by Inventory Module Agent, but location IDs come from here
   const inventoryLevel = {
     inventory_item_id: "odex_inverter_item_id",
     location_id: "sp_dc_location_id",
     stocked_quantity: 25,
     reserved_quantity: 3,
     incoming_quantity: 10
   }
   ```

5. **Address Management**: Update location addresses as operations evolve:

   ```typescript
   const updatedLocation = await stockLocationModuleService.updateStockLocations(
     locationId,
     {
       address: {
         address_1: "New Address Line 1",
         address_2: "Suite 200",
         postal_code: "01234-890"
       }
     }
   )
   ```

6. **Location Capacity Planning**: Use semantic search to analyze distributor data for optimal location assignment:
   - High-volume items (Odex inverters: 45 SKUs) → Primary DC allocation
   - Specialized equipment (Fotus kits: 4 total) → Single fulfillment center
   - Regional distribution (Solfacil panels: 6 types) → Multi-location strategy

## Outputs

- `stock_locations_config.json`: Complete location records with Medusa IDs and addresses.
- `location_channel_matrix.json`: Mapping of locations to sales channels with priorities.
- `location_capacity_report.md`: Inventory capacity and current utilization per location.
- `fulfillment_strategy.md`: Recommendations for inventory distribution across locations.

## Collaboration

- Provides location IDs to **Inventory Module Agent** for inventory level creation.
- Links with **Sales Channel Agent** to define channel-specific inventory visibility.
- Supports **Product Variant Inventory Agent** with location-based availability data.
- Integrates with Order/Fulfillment workflows for shipping origin determination.

## Workflow Patterns

```typescript
import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

export const createStockLocationWorkflow = createWorkflow(
  "create-stock-location",
  () => {
    const { stockLocation } = createStockLocationStep()
    return new WorkflowResponse({ stockLocation })
  }
)
```

## Use Cases

- **Multi-Warehouse Fulfillment**: Route orders to nearest warehouse with stock availability.
- **Drop-shipping**: Create virtual locations for supplier-direct fulfillment.
- **Regional Distribution**: Optimize inventory placement based on demand patterns.
- **Cross-Docking**: Manage temporary locations for in-transit inventory.

## Key Concepts

- **Stock Location**: Physical or virtual place where inventory is stored (warehouse, store, supplier).
- **Location Address**: Full address details for shipping and logistics.
- **Location-Sales Channel Link**: Determines which locations serve which sales channels.
- **Inventory Level**: Quantity of specific item at specific location (managed by Inventory Module).

## Brazilian Market Considerations

- **Regional Coverage**: Major urban centers (SP, RJ, MG) require dedicated warehouses.
- **Supplier Integration**: Direct-ship from Odex, Solfacil, Fotus reduces holding costs.
- **CEP Validation**: Ensure Brazilian postal code format compliance.
- **State Tax Implications**: Location addresses affect ICMS calculations.
