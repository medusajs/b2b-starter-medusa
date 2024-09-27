import { MiddlewareRoute } from "@medusajs/medusa";
import { adminEmployeesMiddlewares } from "./companies/[id]/employees/middlewares";
import { adminCompaniesMiddlewares } from "./companies/middlewares";

export const adminMiddlewares: MiddlewareRoute[] = [
  ...adminCompaniesMiddlewares,
  ...adminEmployeesMiddlewares,
];
