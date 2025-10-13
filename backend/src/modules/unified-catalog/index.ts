import { Module } from "@medusajs/framework/utils";
import UnifiedCatalogModuleService from "./service";

export const UNIFIED_CATALOG_MODULE = "unifiedCatalog";

export default Module(UNIFIED_CATALOG_MODULE, {
    service: UnifiedCatalogModuleService,
});

// Export models for linkable usage
export * from "./models";
export * from "./types";
