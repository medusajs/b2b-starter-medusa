import { defineMiddlewares } from "@medusajs/medusa";
import { companiesMiddlewares } from "./companies/middlewares";
import { companyCustomersMiddlewares } from "./companies/[id]/customers/middlewares";

export default defineMiddlewares({
  routes: [...companiesMiddlewares, ...companyCustomersMiddlewares],
});
