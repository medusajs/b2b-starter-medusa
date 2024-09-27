import { defineMiddlewares } from "@medusajs/medusa";
import { adminQuotesMiddlewares } from "./admin/quotes/middlewares";
import { employeesMiddlewares } from "./admin/companies/[id]/employees/middlewares";
import { companiesMiddlewares } from "./admin/companies/middlewares";
import { quotesMiddlewares } from "./customers/quotes/middlewares";

export default defineMiddlewares({
  routes: [
    ...companiesMiddlewares,
    ...employeesMiddlewares,
    ...quotesMiddlewares,
    ...adminQuotesMiddlewares,
  ],
});
