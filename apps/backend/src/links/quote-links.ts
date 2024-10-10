import { Modules } from "@medusajs/framework/utils";
import { MedusaModule } from "@medusajs/modules-sdk";
import { QUOTE_MODULE } from "../modules/quote";

MedusaModule.setCustomLink(() => {
  return {
    isLink: true,
    isReadOnlyLink: true,
    extends: [
      {
        serviceName: QUOTE_MODULE,
        relationship: {
          serviceName: Modules.ORDER,
          entity: "Order",
          primaryKey: "id",
          foreignKey: "draft_order_id",
          alias: "draft_order",
          args: {
            methodSuffix: "Orders",
          },
        },
      },
      {
        serviceName: QUOTE_MODULE,
        relationship: {
          serviceName: Modules.CART,
          entity: "Cart",
          primaryKey: "id",
          foreignKey: "cart_id",
          alias: "cart",
          args: {
            methodSuffix: "Carts",
          },
        },
      },
      {
        serviceName: QUOTE_MODULE,
        relationship: {
          serviceName: Modules.ORDER,
          entity: "OrderChange",
          primaryKey: "id",
          foreignKey: "order_change_id",
          alias: "order_change",
          args: {
            methodSuffix: "OrderChanges",
          },
        },
      },
      {
        serviceName: QUOTE_MODULE,
        relationship: {
          serviceName: Modules.USER,
          entity: "User",
          primaryKey: "id",
          foreignKey: "admin_id",
          alias: "admin",
          args: {
            methodSuffix: "Users",
          },
        },
      },
      {
        serviceName: QUOTE_MODULE,
        relationship: {
          serviceName: Modules.CUSTOMER,
          entity: "Customer",
          primaryKey: "id",
          foreignKey: "customer_id",
          alias: "customer",
          args: {
            methodSuffix: "Customers",
          },
        },
      },
    ],
  };
});
