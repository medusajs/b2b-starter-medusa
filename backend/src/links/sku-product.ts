import { defineLink } from "@medusajs/framework/utils";
import UnifiedCatalogModule from "../modules/unified-catalog";
import ProductModule from "@medusajs/medusa/product";

/**
 * Link between SKU (Unified Catalog) and Product (Medusa Core)
 * 
 * Purpose: Sincronizar catálogo unificado com produtos Medusa
 * - Permite associar SKUs deduplicados com produtos no catálogo Medusa
 * - Facilita queries cross-module para obter pricing e inventory
 * - Mantém separação entre camada de deduplicação e catálogo de vendas
 * 
 * Usage:
 * - Quando um SKU é promovido para venda, criar link com Product
 * - Query: obter todos Products linkados a um SKU para comparação
 * - Workflow: sincronizar preços do SKU com Product variants
 */
export default defineLink(
    UnifiedCatalogModule.linkable.sku,
    ProductModule.linkable.product
);
