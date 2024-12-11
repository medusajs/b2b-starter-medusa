import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { ModuleQuote, ModuleUpdateQuote } from "@starter/types";
import { updateQuotesStep } from "../steps/update-quotes";

/*
  A workflow that updates a quote. 
*/
export const updateQuotesWorkflow = createWorkflow(
  "update-quotes-workflow",
  function (input: ModuleUpdateQuote[]): WorkflowResponse<ModuleQuote[]> {
    return new WorkflowResponse(updateQuotesStep(input));
  }
);
