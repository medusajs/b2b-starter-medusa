import { MiddlewareRoute } from "@medusajs/medusa";
import { storeEmployeesMiddlewares } from "./companies/[id]/employees/middlewares";
import { storeCompaniesMiddlewares } from "./companies/middlewares";
import { storeCartsMiddlewares } from "./carts/[id]/line-items/bulk/middlewares";
export const storeMiddlewares: MiddlewareRoute[] = [
  ...storeCartsMiddlewares,
  ...storeCompaniesMiddlewares,
  ...storeEmployeesMiddlewares,
];
