import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { QuoteDTO } from "../../../modules/quote/types/common";
import { CreateQuoteDTO } from "../../../modules/quote/types/mutations";
import { createQuotesStep } from "../steps/create-quotes";

export const createQuotesWorkflow = createWorkflow(
  "create-quotes-workflow",
  function (input: CreateQuoteDTO[]): WorkflowResponse<QuoteDTO[]> {
    const quote = createQuotesStep(input);

    return new WorkflowResponse(quote);
  }
);
