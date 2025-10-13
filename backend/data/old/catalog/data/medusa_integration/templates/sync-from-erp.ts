// Example Medusa workflow: sync products from ERP
// Copy to a Medusa project: src/workflows/sync-from-erp.ts

import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

const getProductsFromErpStep = createStep(
  "get-products-from-erp",
  async (_, { container }) => {
    const erpModuleService = container.resolve("erp")
    const products = await erpModuleService.getProducts()
    return new StepResponse(products)
  }
)

export const syncFromErpWorkflow = createWorkflow(
  "sync-from-erp",
  () => {
    const erpProducts = getProductsFromErpStep()

    const productsToCreate = erpProducts.transform((data: any) => {
      return data.map((erpProduct: any) => ({
        title: erpProduct.title,
        external_id: erpProduct.id,
        variants: (erpProduct.variants || []).map((v: any) => ({
          title: v.title,
          metadata: { external_id: v.id },
        })),
      }))
    })

    createProductsWorkflow.runAsStep({
      input: { products: productsToCreate },
    })

    return new WorkflowResponse({ erpProducts })
  }
)
