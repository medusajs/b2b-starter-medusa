import { IInventoryService } from "@medusajs/framework/types";
import { ModuleRegistrationName } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

export const deleteReservationsStep = createStep(
  "delete-reservations",
  async (_, { container }) => {
    const inventoryModuleService: IInventoryService = container.resolve(
      ModuleRegistrationName.INVENTORY
    );

    const reservations = await inventoryModuleService.listReservationItems(
      {},
      { select: ["id"] }
    );
    const reservationIds = reservations.map((reservation) => reservation.id);

    if (reservationIds.length > 0) {
      await inventoryModuleService.deleteReservationItems(reservationIds);
      console.log(`✨ Deleted ${reservationIds.length} inventory reservations`);
    } else {
      console.log("✨ No inventory reservations to delete");
    }

    return new StepResponse(void 0);
  }
);
