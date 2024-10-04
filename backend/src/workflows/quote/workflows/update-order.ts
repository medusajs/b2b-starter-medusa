import { useRemoteQueryStep } from "@medusajs/medusa/core-flows";
import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { updateOrderStep } from "../steps/update-order";

export const updateOrderWorkflow = createWorkflow(
  "update-order-workflow",
  function (input: { id: string; is_draft_order: boolean; status: string }) {
    useRemoteQueryStep({
      entry_point: "order",
      fields: ["id"],
      variables: { id: input.id },
      list: false,
      throw_if_key_not_found: true,
    });

    updateOrderStep(input);

    return new WorkflowResponse(void 0);
  }
);
