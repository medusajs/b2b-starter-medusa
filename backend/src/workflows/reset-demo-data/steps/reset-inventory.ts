import { IInventoryService } from "@medusajs/framework/types";
import { ModuleRegistrationName } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

const DEFAULT_STOCK_QUANTITY = 100;

export const resetInventoryStep = createStep(
  "reset-inventory",
  async (_, { container }) => {
    const inventoryModuleService: IInventoryService = container.resolve(
      ModuleRegistrationName.INVENTORY
    );

    const inventoryLevels = await inventoryModuleService.listInventoryLevels(
      {},
      { select: ["id", "stocked_quantity", "inventory_item_id", "location_id"] }
    );

    if (inventoryLevels.length === 0) {
      console.log("✨ No inventory levels to reset");
      return;
    }

    const updates = inventoryLevels.map((level) => ({
      ...level,
      stocked_quantity: DEFAULT_STOCK_QUANTITY,
    }));

    await inventoryModuleService.updateInventoryLevels(updates);
    console.log(
      `✨ Reset ${updates.length} inventory levels to ${DEFAULT_STOCK_QUANTITY} units`
    );

    return new StepResponse(void 0, inventoryLevels);
  },
  async (originalLevels, { container }) => {
    // Compensation logic - not implemented as this is a destructive operation
    // that should only be run intentionally
    console.log("⚠️  Inventory levels cannot be compensated");
  }
);
