import { Modules } from "@medusajs/framework/utils";
import { MedusaModule } from "@medusajs/modules-sdk";

MedusaModule.setCustomLink(() => {
  return {
    isLink: true,
    isReadOnlyLink: true,
    extends: [
      {
        serviceName: "quote",
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
        serviceName: "quote",
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
        serviceName: "quote",
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
    ],
  };
});
