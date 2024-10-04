import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { QuoteCommentDTO } from "../../../modules/quote/types/common";
import { CreateQuoteCommentDTO } from "../../../modules/quote/types/mutations";
import { createQuoteCommentStep } from "../steps/create-quote-comment";

export const createQuoteCommentWorkflow = createWorkflow(
  "create-quote-comment-workflow",
  function (input: CreateQuoteCommentDTO): WorkflowResponse<QuoteCommentDTO[]> {
    const quoteComment = createQuoteCommentStep(input);

    return new WorkflowResponse(quoteComment);
  }
);
