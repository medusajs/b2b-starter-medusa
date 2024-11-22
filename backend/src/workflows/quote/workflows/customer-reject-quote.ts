import { useRemoteQueryStep } from "@medusajs/core-flows";
import { createWorkflow } from "@medusajs/workflows-sdk";
import { updateQuotesWorkflow } from "./update-quote";

/*
  A workflow that rejects a quote by a customer. 
  
  Once the customer rejects the quote, the decision then turns to the merchant to perform
  any further adjustments, or let it remain in a rejected state.
*/
export const customerRejectQuoteWorkflow = createWorkflow(
  "customer-reject-quote-workflow",
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
          status: "customer_rejected",
        },
      ],
    });
  }
);
