import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { QuoteCommentDTO } from "src/modules/quote/types/common";
import { QUOTE_MODULE } from "../../../modules/quote";
import { CreateQuoteCommentDTO } from "../../../modules/quote/types/mutations";

export const createQuoteCommentStep = createStep(
  "create-quote-comment",
  async (
    input: CreateQuoteCommentDTO,
    { container }
  ): Promise<StepResponse<QuoteCommentDTO[], string[]>> => {
    // TODO: type this service
    const quoteModuleService: any = container.resolve(QUOTE_MODULE);

    const quoteComment = await quoteModuleService.createComments(input);

    return new StepResponse(quoteComment, quoteComment.id);
  },
  async (id: string[], { container }) => {
    // TODO: type this service
    const quoteModuleService: any = container.resolve(QUOTE_MODULE);

    await quoteModuleService.deleteComments(id);
  }
);
