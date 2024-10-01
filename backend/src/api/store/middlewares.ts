import { MiddlewareRoute } from "@medusajs/medusa";
import { storeEmployeesMiddlewares } from "./companies/[id]/employees/middlewares";
import { storeCompaniesMiddlewares } from "./companies/middlewares";

export const storeMiddlewares: MiddlewareRoute[] = [
  ...storeCompaniesMiddlewares,
  ...storeEmployeesMiddlewares,
];
