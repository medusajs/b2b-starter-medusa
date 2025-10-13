# Module Links

A module link forms an association between two data models of different modules, while maintaining module isolation.

For example:

```ts
import HelloModule from "../modules/hello";
import ProductModule from "@medusajs/product";
import { defineLink } from "@medusajs/framework/utils";

export default defineLink(
  ProductModule.linkable.product,
  HelloModule.linkable.myCustom
);
```

This defines a link between the Product Module's `product` data model and the Hello Module (custom module)'s `myCustom` data model.

Learn more about links in [this documentation](https://docs.medusajs.com/v2/advanced-development/modules/module-links)

## 📦 Unified Catalog Links

### `sku-product.ts`

**Purpose**: Sincronizar catálogo unificado com produtos Medusa

Links the **SKU** (Unified Catalog Module) with **Product** (Medusa Core).

**Use Cases**:

- Associar SKUs deduplicados com produtos no catálogo Medusa
- Query cross-module para obter pricing e inventory
- Sincronizar preços do SKU com Product variants
- Workflow: Promover SKU para venda criando link com Product

**Query Example**:

```typescript
const { data } = await query.graph({
  entity: "sku",
  fields: ["*", "products.*"],
  filters: { sku_code: "DEYE-INV-SUN5K-240V-5000W" },
});
```
