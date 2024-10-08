import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { QuoteDTO } from "../../../modules/quote/types/common";
import { UpdateQuoteDTO } from "../../../modules/quote/types/mutations";
import { updateQuotesStep } from "../steps/update-quotes";

/*
  A workflow that updates a quote. 
*/
export const updateQuotesWorkflow = createWorkflow(
  "update-quotes-workflow",
  function (input: UpdateQuoteDTO[]): WorkflowResponse<QuoteDTO[]> {
    return new WorkflowResponse(updateQuotesStep(input));
  }
);
