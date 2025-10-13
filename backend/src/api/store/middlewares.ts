import { MiddlewareRoute } from "@medusajs/medusa";
import { storeApprovalsMiddlewares } from "./approvals/middlewares";
import { storeCartsMiddlewares } from "./carts/middlewares";
import { storeCompaniesMiddlewares } from "./companies/middlewares";
import { storeFreeShippingMiddlewares } from "./frete_gratis/middlewares";
import { storeQuotesMiddlewares } from "./quotes/middlewares";
import { storeCatalogMiddlewares } from "./catalog/middlewares";
import { storeSolarDetectionMiddlewares } from "./solar-detection/middlewares";
import { storeThermalAnalysisMiddlewares } from "./thermal-analysis/middlewares";
import { storePhotogrammetryMiddlewares } from "./photogrammetry/middlewares";
import { storeInternalCatalogMiddlewares } from "./catalogo_interno/middlewares";
import { storeProductsEnhancedMiddlewares } from "./produtos_melhorados/middlewares";
import { storeKitsMiddlewares } from "./kits/middlewares";
import { storeProductsBySkuMiddlewares } from "./products/by-sku/middlewares";
import { storeSolarCalculationsMiddlewares } from "./calculos_solares/middlewares";
import { storeCreditAnalysesMiddlewares } from "./analises_credito/middlewares";
import { storeFinancingApplicationsMiddlewares } from "./aplicacoes_financiamento/middlewares";
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
