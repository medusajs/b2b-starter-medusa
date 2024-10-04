import { IOrderModuleService } from "@medusajs/framework/types";
import {
  convertItemResponseToUpdateRequest,
  getSelectsAndRelationsFromObjectArray,
  Modules,
} from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

export const updateOrderStep = createStep(
  "update-order",
  async (
    data: { id: string; is_draft_order: boolean; status: string },
    { container }
  ) => {
    const { id, ...rest } = data;
    const orderModule: IOrderModuleService = container.resolve(Modules.ORDER);

    const { selects, relations } = getSelectsAndRelationsFromObjectArray([
      data,
    ]);

    const dataBeforeUpdate = await orderModule.listOrders(
      { id: data.id },
      { relations, select: selects }
    );

    const updatedQuotes = await orderModule.updateOrders(id, rest as any);

    return new StepResponse(updatedQuotes, {
      dataBeforeUpdate,
      selects,
      relations,
    });
  },
  async (revertInput, { container }) => {
    if (!revertInput) {
      return;
    }

    const { dataBeforeUpdate, selects, relations } = revertInput;
    const orderModule: any = container.resolve(Modules.ORDER);

    await orderModule.updateOrder(
      dataBeforeUpdate.map((data) =>
        convertItemResponseToUpdateRequest(data, selects, relations)
      )
    );
  }
);
