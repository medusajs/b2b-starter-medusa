import { defineMiddlewares } from "@medusajs/medusa";
import { adminQuotesMiddlewares } from "./admin/quotes/middlewares";
import { employeesMiddlewares } from "./companies/[id]/employees/middlewares";
import { companiesMiddlewares } from "./companies/middlewares";
import { storeQuotesMiddlewares } from "./store/quotes/middlewares";

export default defineMiddlewares({
  routes: [
    ...companiesMiddlewares,
    ...employeesMiddlewares,
    ...storeQuotesMiddlewares,
    ...adminQuotesMiddlewares,
  ],
});
