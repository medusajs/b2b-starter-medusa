import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { clearDatabaseStep } from "../steps/clear-database";
import { seedDatabaseStep } from "../steps/seed-database";

export const clearDataWorkflow = createWorkflow(
  "clear-data",
  function () {
    clearDatabaseStep();
    seedDatabaseStep();

    return new WorkflowResponse({});
  }
);
