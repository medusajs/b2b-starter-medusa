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
import { storeProductsEnhancedMiddlewares } from "./products-enhanced/middlewares";
import { storeKitsMiddlewares } from "./kits/middlewares";
import { storeProductsBySkuMiddlewares } from "./products/by-sku/middlewares";

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
  // Rate-limited APIs
  ...storeInternalCatalogMiddlewares,
  ...storeProductsEnhancedMiddlewares,
  ...storeKitsMiddlewares,
  ...storeProductsBySkuMiddlewares,
];
