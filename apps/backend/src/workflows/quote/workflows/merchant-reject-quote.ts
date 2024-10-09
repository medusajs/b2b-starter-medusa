import { useRemoteQueryStep } from "@medusajs/core-flows";
import { createWorkflow } from "@medusajs/workflows-sdk";
import { updateQuotesWorkflow } from "./update-quote";

/*
  A workflow that rejects a quote by a merchant. 
  
  Once the merchant rejects the quote, we update the status of the quote to a rejection by merchant.
*/
export const merchantRejectQuoteWorkflow = createWorkflow(
  "merchant-reject-quote-workflow",
  function (input: { quote_id: string }) {
    useRemoteQueryStep({
      entry_point: "quote",
      fields: ["id"],
      variables: { id: input.quote_id },
      list: false,
      throw_if_key_not_found: true,
    });

    updateQuotesWorkflow.runAsStep({
      input: [
        {
          id: input.quote_id,
          status: "merchant_rejected",
        },
      ],
    });
  }
);
