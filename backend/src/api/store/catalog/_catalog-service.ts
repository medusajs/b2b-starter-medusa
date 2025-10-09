/**
 * Singleton instance of UnifiedCatalogModuleService
 * Temporary workaround until module registration is fixed
 */
import UnifiedCatalogModuleService from "../../../modules/unified-catalog/service";

let catalogServiceInstance: UnifiedCatalogModuleService | null = null;

export function getCatalogService(): UnifiedCatalogModuleService {
    if (!catalogServiceInstance) {
        catalogServiceInstance = new UnifiedCatalogModuleService({}, {});
    }
    return catalogServiceInstance;
}
