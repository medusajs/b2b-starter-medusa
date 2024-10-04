import {
  confirmOrderEditRequestWorkflow,
  requestOrderEditRequestWorkflow,
  useRemoteQueryStep,
} from "@medusajs/core-flows";
import { OrderStatus } from "@medusajs/framework/utils";
import { createWorkflow } from "@medusajs/workflows-sdk";
import { updateOrderWorkflow } from "./update-order";
import { updateQuotesWorkflow } from "./update-quote-workflow";

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

    updateQuotesWorkflow.runAsStep({
      input: [
        {
          id: input.quote_id,
          status: "accepted",
        },
      ],
    });

    requestOrderEditRequestWorkflow.runAsStep({
      input: {
        order_id: quote.draft_order_id,
      },
    });

    confirmOrderEditRequestWorkflow.runAsStep({
      input: {
        order_id: quote.draft_order_id,
        // TODO: Add customer here
        confirmed_by: "",
      },
    });

    updateOrderWorkflow.runAsStep({
      input: {
        id: quote.draft_order_id,
        is_draft_order: false,
        status: OrderStatus.COMPLETED,
      },
    });
  }
);
