import { defineMiddlewares } from "@medusajs/medusa";
import { adminQuotesMiddlewares } from "./admin/quotes/middlewares";
import { adminEmployeesMiddlewares } from "./admin/companies/[id]/employees/middlewares";
import { companiesMiddlewares } from "./admin/companies/middlewares";
import { quotesMiddlewares } from "./customers/quotes/middlewares";

export default defineMiddlewares({
  routes: [
    ...companiesMiddlewares,
    ...adminEmployeesMiddlewares,
    ...quotesMiddlewares,
    ...adminQuotesMiddlewares,
  ],
});
