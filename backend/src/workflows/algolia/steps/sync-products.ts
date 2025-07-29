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

    const {
      results: [{ hits: removedProducts }],
    } = (await algoliaModuleService.getProductsNotInList(
      products.map((p) => p.id)
    )) as { results: Array<{ hits: any[] }> };

    if (removedProducts.length > 0) {
      const removedProductIds = removedProducts.map(
        (product) => product.objectID as string
      );
      await algoliaModuleService.deleteFromIndex(removedProductIds, "product");
    }

    return new StepResponse(undefined, {
      newProducts: newProducts.map((product) => product.id),
      existingProducts,
      removedProducts: removedProducts.map(
        (product) => product.objectID as string
      ),
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
