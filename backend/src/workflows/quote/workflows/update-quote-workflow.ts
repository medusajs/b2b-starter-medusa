import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { QuoteDTO } from "../../../modules/quote/types/common";
import { UpdateQuoteDTO } from "../../../modules/quote/types/mutations";
import { updateQuotesStep } from "../steps/update-quotes";

export const updateQuotesWorkflow = createWorkflow(
  "update-quotes-workflow",
  function (input: UpdateQuoteDTO[]): WorkflowResponse<QuoteDTO[]> {
    const quote = updateQuotesStep(input);

    return new WorkflowResponse(quote);
  }
);
