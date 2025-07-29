import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ALGOLIA_MODULE } from "../../../modules/algolia";
import AlgoliaModuleService from "../../../modules/algolia/service";

export type DeleteProductsFromAlgoliaWorkflow = {
  ids: string[];
};

export const deleteProductsFromAlgoliaStep = createStep(
  "delete-products-from-algolia-step",
  async ({ ids }: DeleteProductsFromAlgoliaWorkflow, { container }) => {
    const algoliaModuleService =
      container.resolve<AlgoliaModuleService>(ALGOLIA_MODULE);

    const existingRecords = await algoliaModuleService.retrieveFromIndex(
      ids,
      "product"
    );
    await algoliaModuleService.deleteFromIndex(ids, "product");

    return new StepResponse(undefined, existingRecords);
  },
  async (existingRecords, { container }) => {
    if (!existingRecords) {
      return;
    }
    const algoliaModuleService = container.resolve<AlgoliaModuleService>(ALGOLIA_MODULE);

    await algoliaModuleService.indexData(
      existingRecords as unknown as Record<string, unknown>[],
      "product"
    );
  }
);
