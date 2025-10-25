# Agent: Sales Channel Management

**Source**: [Medusa Sales Channel Module](https://docs.medusajs.com/resources/commerce-modules/sales-channel/index.html.md)

## Mission

- Define and manage sales channels for B2B, B2C, mobile app, and marketplace distribution.
- Control product availability and inventory visibility per channel.
- Scope carts and orders to appropriate sales channels.
- Link sales channels to stock locations for channel-specific inventory.

## Inputs

- Business requirements for channel segmentation:
  - **B2B Channel**: Wholesale distributors, contractors, installers
  - **B2C Channel**: Direct consumer sales via web store
  - **Mobile App Channel**: iOS/Android application sales
  - **Marketplace Channel**: External platform integrations
- Product availability matrix from distributor inventory.
- Stock location assignments for each channel.

## Core Steps

1. **Create Sales Channels Workflow**:

   ```typescript
   const salesChannels = await salesChannelModuleService.createSalesChannels([
     {
       name: "B2B Wholesale",
       description: "Professional installers and contractors",
       is_disabled: false
     },
     {
       name: "B2C Web Store",
       description: "Direct consumer sales",
       is_disabled: false
     },
     {
       name: "Mobile App",
       description: "iOS and Android applications",
       is_disabled: false
     }
   ])
   ```

2. **Product-Channel Linking**: Assign products to specific channels based on distributor rules:

   ```json
   {
     "product_id": "odex_inverters_ODEX-INV-SAJ-3000W",
     "sales_channel_ids": ["b2b_channel_id", "b2c_channel_id"],
     "availability": {
       "b2b": { "pricing_tier": "wholesale", "min_quantity": 1 },
       "b2c": { "pricing_tier": "retail", "min_quantity": 1 }
     }
   }
   ```

3. **Cart Scoping**: Ensure carts are scoped to single sales channel:

   ```typescript
   const cart = await cartModuleService.createCarts({
     sales_channel_id: "b2b_channel_id",
     region_id: "brazil_region_id",
     customer_id: customer.id
   })
   ```

4. **Publishable API Keys**: Generate channel-specific API keys for storefront access:

   ```typescript
   const publishableKey = await apiKeyModuleService.createPublishableApiKeys({
     title: "B2B Web Store Key",
     sales_channel_ids: ["b2b_channel_id"]
   })
   ```

5. **Inventory-Channel Mapping**: Link sales channels to stock locations for availability:

   ```typescript
   // Sales channel shows inventory only from assigned locations
   const channelLocations = await salesChannelModuleService.updateSalesChannels(
     channelId,
     {
       stock_locations: ["warehouse_sp_id", "warehouse_rj_id"]
     }
   )
   ```

6. **Channel-Based Product Filtering**: Implement semantic search to categorize products by channel suitability:
   - **B2B-only**: High-volume items, professional equipment, bulk kits
   - **B2C-preferred**: Small residential systems, consumer-friendly packaging
   - **Multi-channel**: Standard inverters, panels, accessories

## Outputs

- `sales_channels_config.json`: Complete channel definitions with IDs.
- `product_channel_assignments.json`: Product-to-channel mappings with availability rules.
- `publishable_api_keys.json`: Generated API keys per channel with access scopes.
- `channel_inventory_matrix.md`: Inventory visibility report per channel/location.

## Collaboration

- Depends on **Stock Location Agent** for location-channel linkage.
- Provides channel context to **Product Variant Inventory Agent** for availability scoping.
- Integrates with **Inventory Module Agent** to determine channel-specific stock levels.
- Supports Cart/Order workflows with channel validation.

## Workflow Patterns

```typescript
import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

export const createSalesChannelWorkflow = createWorkflow(
  "create-sales-channel",
  () => {
    const { salesChannels } = createSalesChannelStep()
    return new WorkflowResponse({ salesChannels })
  }
)
```

## Use Cases

- **B2B Ecommerce**: Separate pricing, minimum orders, credit terms for wholesale.
- **Omnichannel Retail**: Sync inventory across web, mobile, and physical locations.
- **Product Segmentation**: Show premium products only in B2B channel.
- **Regional Distribution**: Different channels for different geographic markets.

## Key Concepts

- **Sales Channel**: Logical grouping representing a selling venue (online store, app, marketplace).
- **Channel Scoping**: Carts and orders belong to exactly one sales channel.
- **Product Availability**: Products can be available in multiple channels with different rules.
- **Publishable API Key**: Frontend authentication token scoped to specific sales channel(s).
