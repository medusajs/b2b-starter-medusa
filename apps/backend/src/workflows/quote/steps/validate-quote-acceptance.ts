import { MedusaError } from "@medusajs/framework/utils";
import { createStep } from "@medusajs/framework/workflows-sdk";
import { QueryQuote } from "@starter/types";

export const validateQuoteAcceptanceStep = createStep(
  "validate-quote-acceptance-step",
  async function ({ quote }: { quote: QueryQuote }) {
    if (!["pending_customer"].includes(quote.status)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot accept quote when quote status is ${quote.status}`
      );
    }
  }
);
