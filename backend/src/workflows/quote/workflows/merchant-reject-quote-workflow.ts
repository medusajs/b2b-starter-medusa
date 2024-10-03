import { useRemoteQueryStep } from "@medusajs/core-flows";
import { createWorkflow } from "@medusajs/workflows-sdk";
import { rejectQuoteWorkflow } from "./reject-quote-workflow";
import { updateQuotesWorkflow } from "./update-quote-workflow";

export const merchantRejectQuoteWorkflow = createWorkflow(
  "merchant-reject-quote-workflow",
  function (input: { quote_id: string }) {
    const quote = useRemoteQueryStep({
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

    rejectQuoteWorkflow.runAsStep({
      input: {
        quote_id: input.quote_id,
      },
    });
  }
);
