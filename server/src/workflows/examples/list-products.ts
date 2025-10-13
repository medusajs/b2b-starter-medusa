import { createWorkflow, StepResponse } from "@medusajs/workflows-sdk";
import type { MedusaContainer } from "@medusajs/framework";

type Input = { limit?: number; offset?: number };
type Output = { products: any[]; count: number };

export const listProductsWorkflow = createWorkflow<Input, Output>(
  "b2b:list-products",
  async (input, { container }: { container: MedusaContainer }) => {
    // Scaffold: resolve product service once available in container
    // const productModule = container.resolve(ContainerRegistrationKeys.PRODUCT_MODULE);
    const products: any[] = [];
    const count = 0;
    return new StepResponse({ products, count });
  }
);

