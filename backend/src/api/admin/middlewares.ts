import { MiddlewareRoute } from "@medusajs/medusa";
import { employeesMiddlewares } from "./companies/[id]/employees/middlewares";
import { companiesMiddlewares } from "./companies/middlewares";

export const adminMiddlewares: MiddlewareRoute[] = [
  ...companiesMiddlewares,
  ...employeesMiddlewares,
];
