import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import {
  syncProductsStep,
  SyncProductsStepInput,
} from "../steps/sync-products";

type SyncProductsWorkflowInput = {
  filters?: Record<string, unknown>;
  limit?: number;
  offset?: number;
};

export const syncProductsWorkflow = createWorkflow(
  "sync-products",
  ({ filters, limit, offset }: SyncProductsWorkflowInput) => {
    const { data, metadata } = useQueryGraphStep({
      entity: "product",
      fields: [
        "id",
        "title",
        "description",
        "handle",
        "thumbnail",
        "categories.*",
        "tags.*",
        "variants.*",
        "company.id",
        "collection.*",
      ],
      pagination: {
        take: limit,
        skip: offset,
      },
      filters: {
        status: "published",
        ...filters,
      },
    });

    syncProductsStep({
      products: data,
    } as SyncProductsStepInput);

    return new WorkflowResponse({
      products: data,
      metadata,
    });
  }
);
