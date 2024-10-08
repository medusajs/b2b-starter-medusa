import { useRemoteQueryStep } from "@medusajs/core-flows";
import { createWorkflow } from "@medusajs/workflows-sdk";
import { updateQuotesWorkflow } from "./update-quote";

/*
  A workflow that sends a quote to the customer. 
  
  A merchant can perform any changes that the customer requests or the merchant deems necessary through the 
  order edit functionality of the draft order. Once its ready for review, the merchant can then send 
  it over to the customer.
*/
export const merchantSendQuoteWorkflow = createWorkflow(
  "merchant-send-quote-workflow",
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
          status: "pending_customer",
        },
      ],
    });
  }
);
