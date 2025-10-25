# Medusa.js Specialized Agents for Product Import

Based on official Medusa.js documentation and best practices for product management, inventory handling, and commerce patterns.

## Agent 1: Product Data Model Expert

**Specialization**: Product, ProductVariant, ProductOption, ProductOptionValue structures

**Responsibilities**:

- Create and validate product data structures
- Manage product variants with proper options
- Handle product metadata and attributes
- Ensure data model compliance

**Key Patterns from Medusa.js Docs**:

### Product Model Structure

```typescript
interface MedusaProduct {
  title: string;                    // Main product name
  subtitle?: string;                // Optional subtitle
  description?: string;             // Rich description
  handle: string;                   // URL-friendly slug
  status: "draft" | "published";    // Publication status
  type?: ProductType;               // Product type (Solar Kit)
  collection?: ProductCollection;   // Collection grouping
  tags?: ProductTag[];              // Searchable tags
  images?: ProductImage[];          // Product images
  options?: ProductOption[];        // Variant options
  variants: ProductVariant[];       // Product variants
  metadata?: Record<string, any>;   // Custom metadata
}
```

### ProductVariant Model Structure

```typescript
interface MedusaProductVariant {
  title: string;                    // Variant name
  sku?: string;                     // Stock keeping unit
  barcode?: string;                 // Barcode/UPC
  ean?: string;                     // European article number
  upc?: string;                     // Universal product code
  inventory_quantity?: number;      // Stock quantity
  allow_backorder?: boolean;        // Allow orders when out of stock
  manage_inventory: boolean;        // Track inventory
  prices: Price[];                  // Variant prices
  options?: ProductOptionValue[];   // Selected option values
  metadata?: Record<string, any>;   // Custom metadata
}
```

### ProductOption Pattern

```typescript
interface MedusaProductOption {
  title: string;                    // Option name (e.g., "System Power")
  values: ProductOptionValue[];     // Available values
}

interface MedusaProductOptionValue {
  value: string;                    // Value (e.g., "2.44kWp")
  option: ProductOption;            // Parent option
  variant: ProductVariant;          // Associated variant
}
```

**Implementation for Solar Kits**:

```typescript
{
  title: "Solar Kit 2.44kWp - LONGi + Growatt",
  handle: "solar-kit-2-44kwp-longi-growatt",
  description: "Complete 2.44kWp solar energy kit...",
  status: "published",
  type: "Solar Kit",
  collection: "FortLev Solar Kits",
  tags: ["Solar Kit", "Grid-Tie", "2.44kWp", "LONGi", "Growatt"],
  
  options: [
    {
      title: "System Power",
      values: ["2.44kWp"]
    },
    {
      title: "Panel Configuration",
      values: ["420W x6"]
    },
    {
      title: "Inverter Power",
      values: ["2.0kW"]
    }
  ],
  
  variants: [
    {
      title: "420W x6 Panels / 2.0kW Inverter",
      sku: "FLV-2.44KWP-LONGRO-001",
      manage_inventory: true,
      allow_backorder: false,
      prices: [
        {
          amount: 292356,  // in cents
          currency_code: "brl"
        }
      ],
      options: {
        "System Power": "2.44kWp",
        "Panel Configuration": "420W x6",
        "Inverter Power": "2.0kW"
      },
      metadata: {
        panel_manufacturer: "LONGi",
        inverter_manufacturer: "Growatt",
        system_power_kwp: 2.44,
        price_per_wp: 1.20
      }
    }
  ]
}
```

---

## Agent 2: Inventory Management Expert

**Specialization**: Inventory Module, Stock Locations, Inventory Levels

**Responsibilities**:

- Manage inventory items for product variants
- Track stock across multiple locations
- Handle inventory kits (multi-part products)
- Implement bundled product patterns

**Key Patterns from Medusa.js Docs**:

### Inventory Kit Structure

For solar kits that consist of multiple components (panel + inverter):

```typescript
// Step 1: Create inventory items for each component
const inventoryItems = await createInventoryItemsWorkflow.runAsStep({
  input: {
    items: [
      {
        sku: "PANEL-LONGI-420W",
        title: "LONGi 420W Solar Panel",
        location_levels: [
          {
            stocked_quantity: 100,
            location_id: "warehouse_brazil_id"
          }
        ]
      },
      {
        sku: "INV-GROWATT-2KW",
        title: "Growatt 2kW Inverter",
        location_levels: [
          {
            stocked_quantity: 50,
            location_id: "warehouse_brazil_id"
          }
        ]
      }
    ]
  }
});

// Step 2: Link inventory items to product variant
const product = await createProductsWorkflow.runAsStep({
  input: {
    products: [{
      title: "Solar Kit 2.44kWp",
      variants: [{
        title: "420W x6 Panels / 2.0kW Inverter",
        inventory_items: [
          {
            inventory_item_id: panelInventoryId,
            required_quantity: 6  // 6 panels per kit
          },
          {
            inventory_item_id: inverterInventoryId,
            required_quantity: 1  // 1 inverter per kit
          }
        ]
      }]
    }]
  }
});
```

### Inventory Management Configuration

```typescript
{
  manage_inventory: true,        // Enable inventory tracking
  allow_backorder: false,        // Prevent orders when out of stock
  inventory_quantity: 10,        // Available quantity
  
  // Inventory kit components
  inventory_items: [
    {
      inventory_item_id: "inv_panel_id",
      required_quantity: 6
    },
    {
      inventory_item_id: "inv_inverter_id",
      required_quantity: 1
    }
  ]
}
```

**Implementation Notes**:

- Each solar kit variant should have `manage_inventory: true`
- Use inventory kits to track panel and inverter stock separately
- When a kit is sold, Medusa automatically decrements both panel and inverter inventory
- Set `required_quantity` based on kit composition (e.g., 6 panels per kit)

---

## Agent 3: Pricing and Rules Expert

**Specialization**: Pricing Module, Price Rules, Tiered Pricing

**Responsibilities**:

- Create price sets with rules and tiers
- Implement quantity-based pricing
- Handle customer group pricing
- Manage regional pricing

**Key Patterns from Medusa.js Docs**:

### Tiered Pricing (Quantity Discounts)

```typescript
prices: [
  // Default price
  {
    amount: 292356,  // R$ 2,923.56 in cents
    currency_code: "brl",
  },
  // Bulk discount: 5-9 kits
  {
    amount: 277438,  // 5% discount
    currency_code: "brl",
    min_quantity: 5,
    max_quantity: 9,
  },
  // Large bulk discount: 10+ kits
  {
    amount: 262521,  // 10% discount
    currency_code: "brl",
    min_quantity: 10,
  }
]
```

### Rule-Based Pricing (Customer Groups)

```typescript
prices: [
  // Retail price
  {
    amount: 292356,
    currency_code: "brl",
    rules: {}
  },
  // Wholesale customer price
  {
    amount: 234685,  // 20% discount
    currency_code: "brl",
    rules: {
      "customer.groups.id": {
        operator: "eq",
        value: "cusgrp_wholesale123"
      }
    }
  },
  // VIP customer price
  {
    amount: 263420,  // 10% discount
    currency_code: "brl",
    rules: {
      "customer.groups.id": {
        operator: "eq",
        value: "cusgrp_vip456"
      }
    }
  }
]
```

### Combined Tiered + Rule-Based Pricing

```typescript
prices: [
  // Base retail price
  {
    amount: 292356,
    currency_code: "brl"
  },
  // Wholesale + bulk discount
  {
    amount: 219926,  // 25% off
    currency_code: "brl",
    min_quantity: 10,
    rules: {
      "customer.groups.id": {
        operator: "in",
        value: ["cusgrp_wholesale123"]
      }
    }
  }
]
```

**Price Calculation Context**:
Medusa automatically applies the best matching price based on:

1. Cart quantity (for tiered pricing)
2. Customer group (for rule-based pricing)
3. Region/location (for regional pricing)
4. Any custom rules defined

---

## Agent 4: Product Organization Expert

**Specialization**: Collections, Categories, Tags, Types

**Responsibilities**:

- Organize products into collections
- Create hierarchical categories
- Manage product tags
- Define product types

**Key Patterns from Medusa.js Docs**:

### Product Collections

```typescript
{
  name: "FortLev Solar Kits",
  handle: "fortlev-solar-kits",
  metadata: {
    distributor: "fortlev",
    product_type: "solar_kits"
  }
}
```

### Product Categories (Hierarchical)

```typescript
// Top level: Energy Systems
{
  name: "Solar Energy Systems",
  handle: "solar-energy-systems",
  is_active: true,
  is_internal: false,
  
  category_children: [
    // Sub-category: Residential
    {
      name: "Residential Solar Kits",
      handle: "residential-solar-kits",
      description: "Complete solar kits for residential use (up to 10kWp)",
      
      category_children: [
        {
          name: "Small Systems (up to 3kWp)",
          handle: "small-residential-systems"
        },
        {
          name: "Medium Systems (3-6kWp)",
          handle: "medium-residential-systems"
        },
        {
          name: "Large Systems (6-10kWp)",
          handle: "large-residential-systems"
        }
      ]
    },
    // Sub-category: Commercial
    {
      name: "Commercial Solar Kits",
      handle: "commercial-solar-kits",
      description: "Solar kits for commercial installations (10kWp+)"
    }
  ]
}
```

### Product Tags

```typescript
tags: [
  "Solar Kit",
  "Grid-Tie",
  "Photovoltaic System",
  "2.44kWp",
  "LONGi",
  "Growatt",
  "Residential Small",
  "Full Images Available"
]
```

### Product Type

```typescript
{
  value: "Solar Kit",
  metadata: {
    category: "Energy Systems",
    subcategory: "Photovoltaic"
  }
}
```

---

## Agent 5: Fulfillment and Shipping Expert

**Specialization**: Shipping Profiles, Fulfillment, Stock Locations

**Responsibilities**:

- Configure shipping requirements
- Manage shipping profiles
- Set up fulfillment rules
- Handle special shipping cases

**Key Patterns from Medusa.js Docs**:

### Shipping Profile Assignment

```typescript
{
  title: "Solar Kit 2.44kWp",
  shipping_profile_id: "sp_heavy_freight",  // Requires freight shipping
  
  variants: [{
    title: "420W x6 Panels / 2.0kW Inverter",
    
    // Inventory item controls final shipping requirement
    inventory_items: [{
      inventory_item_id: "inv_panel_id",
      requires_shipping: true  // Override if needed
    }]
  }]
}
```

### Shipping Option with Pricing Rules

```typescript
// Free shipping for orders over R$ 10,000
{
  name: "Freight Shipping",
  price_type: "flat",
  prices: [
    {
      currency_code: "brl",
      amount: 50000,  // R$ 500 default
      rules: []
    },
    {
      currency_code: "brl",
      amount: 0,  // Free
      rules: [{
        attribute: "item_total",
        operator: "gte",
        value: 1000000  // R$ 10,000 in cents
      }]
    }
  ]
}
```

**Shipping Decision Logic**:

1. Check if product has `shipping_profile_id` → requires shipping
2. Check inventory item's `requires_shipping` → override if set
3. Apply shipping options based on cart context (location, total, etc.)

---

## Agent 6: Storefront Integration Expert

**Specialization**: JS SDK, API Routes, Cart Management

**Responsibilities**:

- Implement product listing
- Handle variant selection
- Manage cart operations
- Check inventory availability

**Key Patterns from Medusa.js Docs**:

### Retrieve Products with Inventory

```typescript
// Fetch products with inventory quantity
const { products } = await sdk.store.product.list({
  fields: "*variants.calculated_price,+variants.inventory_quantity",
  limit: 20,
  offset: 0
}, {
  // Headers for publishable API key (automatic with SDK)
});

// Check if variant is in stock
products.forEach(product => {
  product.variants?.forEach(variant => {
    const isInStock = 
      variant.manage_inventory === false || 
      variant.inventory_quantity > 0;
    
    console.log(`${variant.title}: ${isInStock ? 'In Stock' : 'Out of Stock'}`);
  });
});
```

### Select Product Variant

```typescript
// User selects options
const selectedOptions = {
  "System Power": "2.44kWp",
  "Panel Configuration": "420W x6",
  "Inverter Power": "2.0kW"
};

// Find matching variant
const selectedVariant = product.variants.find(variant =>
  variant.options?.every(optionValue =>
    optionValue.value === selectedOptions[optionValue.option_id]
  )
);
```

### Add to Cart

```typescript
// Add variant to cart
const { cart } = await sdk.store.cart.createLineItem(cartId, {
  variant_id: selectedVariant.id,
  quantity: 1
});

console.log(`Added ${selectedVariant.title} to cart`);
console.log(`Cart total: ${cart.total}`);
```

### Update Cart Item Quantity

```typescript
// Update quantity
const { cart } = await sdk.store.cart.updateLineItem(
  cartId,
  lineItemId,
  { quantity: 3 }
);
```

### Remove from Cart

```typescript
// Remove item
const { parent: cart } = await sdk.store.cart.deleteLineItem(
  cartId,
  lineItemId
);
```

---

## Agent 7: Data Import Workflow Expert

**Specialization**: Bulk Import, Workflows, Data Transformation

**Responsibilities**:

- Execute bulk product imports
- Handle data transformations
- Manage workflow execution
- Error handling and rollback

**Key Patterns from Medusa.js Docs**:

### Import Workflow Structure

```typescript
import { 
  createWorkflow, 
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";

// Custom import workflow
export const importSolarKitsWorkflow = createWorkflow(
  "import-solar-kits",
  (input: { kits: any[] }) => {
    // Transform kit data to Medusa format
    const transformedData = transform({ kits: input.kits }, (data) => {
      return {
        products: data.kits.map(kit => ({
          title: kit.title,
          handle: kit.handle,
          description: kit.description,
          status: "published",
          type: kit.type,
          collection: kit.collection,
          tags: kit.tags,
          
          variants: [{
            title: kit.variant_title,
            sku: kit.variant_sku,
            manage_inventory: true,
            allow_backorder: false,
            
            prices: [{
              amount: kit.pricing.total * 100,  // Convert to cents
              currency_code: "brl"
            }],
            
            options: kit.options,
            metadata: kit.variant_metadata
          }]
        }))
      };
    });
    
    // Execute Medusa's product creation workflow
    const { products } = createProductsWorkflow.runAsStep({
      input: transformedData
    });
    
    return new WorkflowResponse({ products });
  }
);
```

### Execute Import in API Route

```typescript
// src/api/admin/import-kits/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { importSolarKitsWorkflow } from "../../workflows/import-solar-kits";
import fs from "fs";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Read normalized kit data
    const kitsData = JSON.parse(
      fs.readFileSync('./fortlev-kits-normalized.json', 'utf-8')
    );
    
    // Execute import workflow
    const { result } = await importSolarKitsWorkflow(req.scope).run({
      input: { kits: kitsData }
    });
    
    res.json({
      success: true,
      imported: result.products.length,
      products: result.products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

**Workflow Best Practices**:

- Use `createStep` with compensation functions for rollback
- Transform data before passing to Medusa workflows
- Handle errors gracefully with try-catch
- Log progress for large imports
- Batch imports for better performance (100-500 products per batch)

---

## Implementation Checklist

### Phase 1: Data Preparation

- [ ] Run `normalize_titles.py` on `fortlev-kits-synced.json`
- [ ] Validate normalized output structure
- [ ] Review sample products for quality
- [ ] Prepare product images (upload to Medusa)

### Phase 2: Medusa Configuration

- [ ] Create product collections (`FortLev Solar Kits`)
- [ ] Set up product categories (hierarchy)
- [ ] Configure shipping profiles
- [ ] Create customer groups (if needed for pricing)

### Phase 3: Import Execution

- [ ] Create import workflow (`importSolarKitsWorkflow`)
- [ ] Create API route for import execution
- [ ] Test with small batch (10 products)
- [ ] Execute full import (217 products)
- [ ] Verify imported products in Medusa Admin

### Phase 4: Inventory Setup

- [ ] Create inventory items for panels and inverters
- [ ] Link inventory items to variants (inventory kits)
- [ ] Set initial stock quantities
- [ ] Configure stock locations

### Phase 5: Storefront Integration

- [ ] Implement product listing page
- [ ] Build variant selection UI
- [ ] Add to cart functionality
- [ ] Display inventory availability
- [ ] Test checkout flow

### Phase 6: Search Optimization

- [ ] Index products in ChromaDB/vector store
- [ ] Configure Gemma3 semantic search
- [ ] Test search queries
- [ ] Optimize search relevance

---

## Summary

This agent system provides comprehensive coverage of Medusa.js patterns for:

1. **Product Data Models** - Proper structure and validation
2. **Inventory Management** - Multi-part kits with component tracking
3. **Pricing Strategies** - Tiered and rule-based pricing
4. **Organization** - Collections, categories, tags
5. **Fulfillment** - Shipping profiles and rules
6. **Storefront APIs** - Complete cart and product operations
7. **Data Import** - Workflow-based bulk imports

All patterns follow official Medusa.js documentation and best practices for scalable e-commerce implementation.
