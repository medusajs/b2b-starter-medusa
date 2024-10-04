import { MiddlewareRoute } from "@medusajs/medusa";
import { adminEmployeesMiddlewares } from "./companies/[id]/employees/middlewares";
import { adminCompaniesMiddlewares } from "./companies/middlewares";
import { adminQuotesMiddlewares } from "./quotes/middlewares";

export const adminMiddlewares: MiddlewareRoute[] = [
  ...adminCompaniesMiddlewares,
  ...adminEmployeesMiddlewares,
  ...adminQuotesMiddlewares,
];
