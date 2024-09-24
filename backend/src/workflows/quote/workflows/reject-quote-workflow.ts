import {
  cancelBeginOrderEditWorkflow,
  cancelOrderWorkflow,
  useRemoteQueryStep,
} from "@medusajs/core-flows";
import { createWorkflow } from "@medusajs/workflows-sdk";

export const rejectQuoteWorkflow = createWorkflow(
  "reject-quote-workflow",
  function (input: { quote_id: string }) {
    const quote = useRemoteQueryStep({
      entry_point: "quote",
      fields: ["id", "draft_order_id"],
      variables: { id: input.quote_id },
      list: false,
      throw_if_key_not_found: true,
    });

    cancelBeginOrderEditWorkflow.runAsStep({
      input: {
        order_id: quote.draft_order_id,
      },
    });

    cancelOrderWorkflow.runAsStep({
      input: { order_id: quote.draft_order_id },
    });
  }
);
