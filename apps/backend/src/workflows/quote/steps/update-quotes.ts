import {
  convertItemResponseToUpdateRequest,
  getSelectsAndRelationsFromObjectArray,
} from "@medusajs/framework/utils";
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk";
import { QUOTE_MODULE } from "../../../modules/quote";
import { UpdateQuoteDTO } from "../../../modules/quote/types/mutations";

/*
  A step to update a quote.
  
  The first function attempts to update the quote, while the second function attempts to revert the update.
  The first function is also in charge of preparing the data to be reverted in the second function.
*/
export const updateQuotesStep = createStep(
  "update-quotes",
  async (data: UpdateQuoteDTO[], { container }) => {
    const quoteModule: any = container.resolve(QUOTE_MODULE);

    const { selects, relations } = getSelectsAndRelationsFromObjectArray(data);
    const dataBeforeUpdate = await quoteModule.listQuotes(
      { id: data.map((d) => d.id) },
      { relations, select: selects }
    );

    const updatedQuotes = await quoteModule.updateQuotes(data);

    return new StepResponse(updatedQuotes, {
      dataBeforeUpdate,
      selects,
      relations,
    });
  },
  async (revertInput, { container }) => {
    if (!revertInput) {
      return;
    }

    const { dataBeforeUpdate, selects, relations } = revertInput;
    const quoteModule: any = container.resolve(QUOTE_MODULE);

    await quoteModule.updateQuotes(
      dataBeforeUpdate.map((data) =>
        convertItemResponseToUpdateRequest(data, selects, relations)
      )
    );
  }
);
