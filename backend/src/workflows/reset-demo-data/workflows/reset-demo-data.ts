import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { deleteOrdersStep } from "../steps/delete-orders";
import { deleteReservationsStep } from "../steps/delete-reservations";
import { resetInventoryStep } from "../steps/reset-inventory";

export const resetDemoDataWorkflow = createWorkflow(
  "reset-demo-data",
  function () {
    deleteOrdersStep();
    deleteReservationsStep();
    resetInventoryStep();

    return new WorkflowResponse({
      success: true,
      message: "Demo data has been reset successfully",
    });
  }
);
