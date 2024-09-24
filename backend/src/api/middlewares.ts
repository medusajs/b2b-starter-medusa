import { defineMiddlewares } from "@medusajs/medusa";
import { quotesMiddlewares } from "./customers/quotes/middlewares";

export default defineMiddlewares({
  routes: [...quotesMiddlewares],
});
