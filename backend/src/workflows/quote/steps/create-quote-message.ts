import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { QuoteMessageDTO } from "src/modules/quote/types/common";
import { QUOTE_MODULE } from "../../../modules/quote";
import { CreateQuoteMessageDTO } from "../../../modules/quote/types/mutations";

/*
  A step to create a quote's message.
  
  This is being used in the create quote message workflow.
  The first function attempts to create the message, while the second function attempts to delete
  the created message if the workflow fails.
*/
export const createQuoteMessageStep = createStep(
  "create-quote-message",
  async (
    input: CreateQuoteMessageDTO,
    { container }
  ): Promise<StepResponse<QuoteMessageDTO, string>> => {
    // TODO: type this service
    const quoteModuleService: any = container.resolve(QUOTE_MODULE);

    const quoteMessage = await quoteModuleService.createMessages(input);

    return new StepResponse(quoteMessage, quoteMessage.id);
  },
  async (id: string, { container }) => {
    // TODO: type this service
    const quoteModuleService: any = container.resolve(QUOTE_MODULE);

    await quoteModuleService.deleteMessages(id);
  }
);
