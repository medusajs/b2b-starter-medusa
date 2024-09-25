import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { QuoteDTO } from "src/modules/quote/types/common";
import { QUOTE_MODULE } from "../../../modules/quote";
import { CreateQuoteDTO } from "../../../modules/quote/types/mutations";

export const createQuotesStep = createStep(
  "create-quotes",
  async (
    input: CreateQuoteDTO[],
    { container }
  ): Promise<StepResponse<QuoteDTO[], string[]>> => {
    // TODO: type this service
    const quoteModuleService: any = container.resolve(QUOTE_MODULE);

    const quotes = await quoteModuleService.createQuotes(input);

    return new StepResponse(
      quotes,
      quotes.map((quote) => quote.id)
    );
  },
  async (quoteIds: string[], { container }) => {
    // TODO: type this service
    const quoteModuleService: any = container.resolve(QUOTE_MODULE);

    await quoteModuleService.deleteQuotes(quoteIds);
  }
);
