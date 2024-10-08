import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { QuoteMessageDTO } from "../../../modules/quote/types/common";
import { CreateQuoteMessageDTO } from "../../../modules/quote/types/mutations";
import { createQuoteMessageStep } from "../steps/create-quote-message";

/*
  A workflow that creates messages within a quote. Messages are used as a communication trail
  between the merchant and the customer. The message can also hold an item_id for either of the
  actors to have a conversation around or negotiate upon.
*/
export const createQuoteMessageWorkflow = createWorkflow(
  "create-quote-message-workflow",
  function (input: CreateQuoteMessageDTO): WorkflowResponse<QuoteMessageDTO> {
    return new WorkflowResponse(createQuoteMessageStep(input));
  }
);
