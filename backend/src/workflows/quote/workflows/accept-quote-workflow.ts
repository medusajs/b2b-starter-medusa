import {
  completeOrderWorkflow,
  confirmOrderEditRequestWorkflow,
  useRemoteQueryStep,
} from "@medusajs/core-flows";
import { createWorkflow } from "@medusajs/workflows-sdk";

export const acceptQuoteWorkflow = createWorkflow(
  "accept-quote-workflow",
  function (input: { quote_id: string }) {
    const quote = useRemoteQueryStep({
      entry_point: "quote",
      fields: ["id", "draft_order_id"],
      variables: { id: input.quote_id },
      list: false,
      throw_if_key_not_found: true,
    });

    confirmOrderEditRequestWorkflow.runAsStep({
      input: {
        order_id: quote.draft_order_id,
        // TODO: Add customer here
        confirmed_by: "",
      },
    });

    completeOrderWorkflow.runAsStep({
      input: {
        orderIds: [quote.draft_order_id],
      },
    });
  }
);
