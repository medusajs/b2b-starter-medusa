import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { clearDatabaseStep } from "../steps/clear-database";
import { seedDatabaseStep } from "../steps/seed-database";
import { triggerAlgoliaSyncStep } from "../steps/trigger-algolia-sync";

export const clearDataWorkflow = createWorkflow("clear-data", function () {
  clearDatabaseStep();
  seedDatabaseStep();
  triggerAlgoliaSyncStep();

  return new WorkflowResponse({});
});
