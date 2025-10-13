import { MiddlewareRoute } from "@medusajs/medusa";
import { storeApprovalsMiddlewares } from "./approvals/middlewares";
import { storeCartsMiddlewares } from "./carts/middlewares";
import { storeCompaniesMiddlewares } from "./companies/middlewares";
import { storeFreeShippingMiddlewares } from "./free-shipping/middlewares";
import { storeQuotesMiddlewares } from "./quotes/middlewares";
import { storeCatalogMiddlewares } from "./catalog/middlewares";
import { storeSolarDetectionMiddlewares } from "./solar-detection/middlewares";
import { storeThermalAnalysisMiddlewares } from "./thermal-analysis/middlewares";
import { storePhotogrammetryMiddlewares } from "./photogrammetry/middlewares";
import { storeInternalCatalogMiddlewares } from "./internal-catalog/middlewares";
import { storeProductsEnhancedMiddlewares } from "./products_enhanced/middlewares";
import { storeKitsMiddlewares } from "./kits/middlewares";
import { storeProductsBySkuMiddlewares } from "./products/by-sku/middlewares";
import { storeSolarCalculationsMiddlewares } from "./solar_calculations/middlewares";
import { storeCreditAnalysesMiddlewares } from "./credit-analyses/middlewares";
import { storeFinancingApplicationsMiddlewares } from "./financing_applications/middlewares";
import { storeOrdersMiddlewares } from "./orders/middlewares";

export const storeMiddlewares: MiddlewareRoute[] = [
  ...storeCartsMiddlewares,
  ...storeCompaniesMiddlewares,
  ...storeQuotesMiddlewares,
  ...storeFreeShippingMiddlewares,
  ...storeApprovalsMiddlewares,
  ...storeCatalogMiddlewares,
  ...storeSolarDetectionMiddlewares,
  ...storeThermalAnalysisMiddlewares,
  ...storePhotogrammetryMiddlewares,
  // PLG Strategy 360° - Authenticated APIs
  ...storeSolarCalculationsMiddlewares,
  ...storeCreditAnalysesMiddlewares,
  ...storeFinancingApplicationsMiddlewares,
  ...storeOrdersMiddlewares,
  // Rate-limited APIs
  ...storeInternalCatalogMiddlewares,
  ...storeProductsEnhancedMiddlewares,
  ...storeKitsMiddlewares,
  ...storeProductsBySkuMiddlewares,
];
