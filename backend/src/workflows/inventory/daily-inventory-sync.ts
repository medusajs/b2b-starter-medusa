import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { syncInventoryStep } from "./steps/sync-inventory-step"

type WorkflowInput = Record<string, any>

export const dailyInventorySyncWorkflow = createWorkflow(
  "daily-inventory-sync-workflow",
  function (input: WorkflowInput) {
    const result = syncInventoryStep({})
    
    return new WorkflowResponse({
      result: result,
    })
  }
)