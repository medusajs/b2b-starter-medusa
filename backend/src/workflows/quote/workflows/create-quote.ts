import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { QuoteDTO } from "../../../modules/quote/types/common";
import { CreateQuoteDTO } from "../../../modules/quote/types/mutations";
import { createQuotesStep } from "../steps/create-quotes";

/*
  A workflow that creates a quote entity that manages the quote lifecycle.
*/
export const createQuotesWorkflow = createWorkflow(
  "create-quotes-workflow",
  function (input: CreateQuoteDTO[]): WorkflowResponse<QuoteDTO[]> {
    return new WorkflowResponse(createQuotesStep(input));
  }
);
