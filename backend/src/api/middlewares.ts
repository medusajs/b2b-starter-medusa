import { defineMiddlewares } from "@medusajs/medusa";
import { storeMiddlewares } from "./store/middlewares";
import { adminMiddlewares } from "./admin/middlewares";
import { quotesMiddlewares } from "./customers/quotes/middlewares";

export default defineMiddlewares({
  routes: [...adminMiddlewares, ...storeMiddlewares, ...quotesMiddlewares],
});
