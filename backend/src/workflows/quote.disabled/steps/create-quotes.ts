import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { QUOTE_MODULE } from "../../../modules/quote";
import {
  IQuoteModuleService,
  ModuleCreateQuote,
  ModuleQuote,
} from "../../../types";

/*
  A step to create a quote.
  
  This is being used in the create quote workflow.
  The first function attempts to create the quote, while the second function attempts to delete
  the created quote if the workflow fails.
*/
export const createQuotesStep = createStep(
  "create-quotes",
  async (
    input: ModuleCreateQuote[],
    { container }
  ): Promise<StepResponse<ModuleQuote[], string[]>> => {
    const quoteModule = container.resolve<IQuoteModuleService>(QUOTE_MODULE);

    const quotes = await quoteModule.createQuotes(input);

    return new StepResponse(
      quotes,
      quotes.map((quote) => quote.id)
    );
  },
  async (quoteIds: string[], { container }) => {
    const quoteModule = container.resolve<IQuoteModuleService>(QUOTE_MODULE);

    await quoteModule.deleteQuotes(quoteIds);
  }
);
