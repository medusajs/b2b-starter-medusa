import { ProductDTO } from "@medusajs/framework/types";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ALGOLIA_MODULE } from "../../../modules/algolia";
import AlgoliaModuleService from "../../../modules/algolia/service";

export type SyncProductsStepInput = {
  products: ProductDTO[];
};

export const syncProductsStep = createStep(
  "sync-products",
  async ({ products }: SyncProductsStepInput, { container }) => {
    const algoliaModuleService: AlgoliaModuleService =
      container.resolve(ALGOLIA_MODULE);

    const existingProducts = (
      await algoliaModuleService.retrieveFromIndex(
        products.map((product) => product.id),
        "product"
      )
    ).results.filter(Boolean);
    const newProducts = products.filter(
      (product) => !existingProducts.some((p) => p.objectID === product.id)
    );
    await algoliaModuleService.indexData(
      products as unknown as Record<string, unknown>[],
      "product"
    );

    return new StepResponse(undefined, {
      newProducts: newProducts.map((product) => product.id),
      existingProducts,
    });
  },
  async (input, { container }) => {
    if (!input) {
      return;
    }

    const algoliaModuleService: AlgoliaModuleService =
      container.resolve(ALGOLIA_MODULE);

    if (input.newProducts) {
      await algoliaModuleService.deleteFromIndex(input.newProducts, "product");
    }

    if (input.existingProducts) {
      await algoliaModuleService.indexData(input.existingProducts, "product");
    }
  }
);
