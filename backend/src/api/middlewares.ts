import { defineMiddlewares } from "@medusajs/medusa";
import { companiesMiddlewares } from "./companies/middlewares";
import { employeesMiddlewares } from "./companies/[id]/employees/middlewares";
import { quotesMiddlewares } from "./customers/quotes/middlewares";

export default defineMiddlewares({
  routes: [
    ...companiesMiddlewares,
    ...employeesMiddlewares,
    ...quotesMiddlewares,
  ],
});
