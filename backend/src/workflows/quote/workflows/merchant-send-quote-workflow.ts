import { useRemoteQueryStep } from "@medusajs/core-flows";
import { createWorkflow } from "@medusajs/workflows-sdk";
import { updateQuotesWorkflow } from "./update-quote-workflow";

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
