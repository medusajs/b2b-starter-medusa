import { MiddlewareRoute } from "@medusajs/medusa";
import { storeCartsMiddlewares } from "./carts/[id]/line-items/bulk/middlewares";
import { storeEmployeesMiddlewares } from "./companies/[id]/employees/middlewares";
import { storeCompaniesMiddlewares } from "./companies/middlewares";
import { storeQuotesMiddlewares } from "./quotes/middlewares";

export const storeMiddlewares: MiddlewareRoute[] = [
  ...storeCartsMiddlewares,
  ...storeCompaniesMiddlewares,
  ...storeEmployeesMiddlewares,
  ...storeQuotesMiddlewares,
];
