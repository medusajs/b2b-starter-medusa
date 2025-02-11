import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { QUOTE_MODULE } from "../../../modules/quote";
import {
  IQuoteModuleService,
  ModuleCreateQuoteMessage,
  ModuleQuoteMessage,
} from "../../../types";

/*
  A step to create a quote's message.
  
  This is being used in the create quote message workflow.
  The first function attempts to create the message, while the second function attempts to delete
  the created message if the workflow fails.
*/
export const createQuoteMessageStep = createStep(
  "create-quote-message",
  async (
    input: ModuleCreateQuoteMessage,
    { container }
  ): Promise<StepResponse<ModuleQuoteMessage, string>> => {
    const quoteModule = container.resolve<IQuoteModuleService>(QUOTE_MODULE);

    const quoteMessage = await quoteModule.createMessages(input);

    return new StepResponse(quoteMessage, quoteMessage.id);
  },
  async (id: string, { container }) => {
    const quoteModule = container.resolve<IQuoteModuleService>(QUOTE_MODULE);

    await quoteModule.deleteMessages([id]);
  }
);
