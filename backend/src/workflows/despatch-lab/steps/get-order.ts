import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import DespatchLabFulfillmentService from "../../../modules/despatch-lab/service";
import { IDespatchLabFulfillmentService } from "../../../types";

export interface GetOrderInput {
  orderId: string;
}

export const getDespatchLabOrderStep = createStep(
  "get-despatch-lab-order",
  async (input: GetOrderInput, { container }) => {
    const despatchLabProvider = container.resolve(
      DespatchLabFulfillmentService.identifier
    ) as IDespatchLabFulfillmentService;

    const order = await despatchLabProvider.getOrder(input.orderId);

    return new StepResponse(order);
  }
);
