import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { defineMiddlewares } from "@medusajs/medusa";
import { adminMiddlewares } from "./admin/middlewares";
import { storeMiddlewares } from "./store/middlewares";

export default defineMiddlewares({
  routes: [
    ...adminMiddlewares,
    ...storeMiddlewares,
    {
      matcher: "/store/customers/me",
      middlewares: [
        (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          req.allowed = [
            "id",
            "email",
            "first_name",
            "last_name",
            "orders",
            "addresses",
            "company",
            "customer_id",
            "address_1",
            "address_2",
            "city",
            "province",
            "postal_code",
            "country_code",
            "phone",
            "metadata",
            "is_default_shipping",
            "is_default_billing",
            "created_at",
            "updated_at",
            "employee",
          ];

          next();
        },
      ],
    },
  ],
});
