import { IOrderModuleService } from "@medusajs/framework/types";
import { ModuleRegistrationName } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

export const deleteOrdersStep = createStep(
  "delete-orders",
  async (_, { container }) => {
    const orderModuleService: IOrderModuleService = container.resolve(
      ModuleRegistrationName.ORDER
    );

    const orders = await orderModuleService.listOrders({}, { select: ["id"] });
    const orderIds = orders.map((order) => order.id);

    if (orderIds.length > 0) {
      await orderModuleService.deleteOrders(orderIds);
      console.log(`✨ Deleted ${orderIds.length} orders`);
    } else {
      console.log("✨ No orders to delete");
    }

    return new StepResponse(void 0, orderIds);
  },
  async (orderIds, { container }) => {
    // Compensation logic - not implemented as this is a destructive operation
    // that should only be run intentionally
    console.log("⚠️  Order deletion cannot be compensated");
  }
);
