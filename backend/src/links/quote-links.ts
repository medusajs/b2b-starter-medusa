import { MedusaModule } from "@medusajs/modules-sdk";
import { Modules } from "@medusajs/utils";
console.log("applying link");
MedusaModule.setCustomLink((...args) => {
  return {
    isLink: true,
    isReadOnlyLink: true,
    extends: [
      {
        serviceName: "quote",
        relationship: {
          serviceName: Modules.ORDER,
          // entity: "Order",
          primaryKey: "id",
          foreignKey: "draft_order_id",
          alias: "draft_order",
        },
      },
      {
        serviceName: "quote",
        relationship: {
          serviceName: Modules.CART,
          // entity: "Cart",
          primaryKey: "id",
          foreignKey: "cart_id",
          alias: "cart",
        },
      },
      {
        serviceName: "quote",
        relationship: {
          serviceName: Modules.ORDER,
          // entity: "OrderChange",
          primaryKey: "id",
          foreignKey: "order_change_id",
          alias: "order_change",
        },
      },
    ],
  };
});
