import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

export const listAbstractWarehousesStep = createStep(
  "list-abstract-warehouses",
  async (_, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: [
        "*",
        "address.*",
        "fulfillment_sets.*",
        "fulfillment_sets.service_zones.*",
      ],
    });

    const abstractWarehouses = stockLocations.filter(
      (location) => location.metadata?.is_abstract === true
    );

    return new StepResponse(abstractWarehouses);
  }
);
