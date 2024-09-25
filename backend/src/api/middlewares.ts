import { defineMiddlewares } from "@medusajs/medusa";
import { companiesMiddlewares } from "./companies/middlewares";
import { employeesMiddlewares } from "./companies/[id]/employees/middlewares";

export default defineMiddlewares({
  routes: [...companiesMiddlewares, ...employeesMiddlewares],
});
