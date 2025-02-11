import { MedusaError } from "@medusajs/framework/utils";
import { createStep } from "@medusajs/framework/workflows-sdk";
import { QueryQuote } from "../../../types";

export const validateQuoteRejectionStep = createStep(
  "validate-quote-rejection-step",
  async function ({ quote }: { quote: QueryQuote }) {
    if (["accepted"].includes(quote.status)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Quote is already accepted by customer`
      );
    }
  }
);
