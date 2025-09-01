import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ALGOLIA_MODULE } from "../../modules/algolia"

type DeleteProductStepInput = {
  productId: string
}

const deleteProductFromAlgoliaStep = createStep(
  "delete-product-from-algolia",
  async (input: DeleteProductStepInput, { container }) => {
    const algoliaService = container.resolve(ALGOLIA_MODULE)
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    logger.info(`Deleting product ${input.productId} from Algolia`)

    const existingDoc = await algoliaService.getDocument(
      process.env.ALGOLIA_PRODUCT_INDEX_NAME,
      input.productId
    )

    if (existingDoc) {
      await algoliaService.deleteDocument(
        process.env.ALGOLIA_PRODUCT_INDEX_NAME,
        input.productId
      )
    }

    return new StepResponse(
      { productId: input.productId, deleted: !!existingDoc },
      { previousDocument: existingDoc }
    )
  },
  async (data, { container }) => {
    const algoliaService = container.resolve(ALGOLIA_MODULE)
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    if (!data?.previousDocument) return

    logger.info("Rolling back Algolia product deletion")

    await algoliaService.addDocuments(
      process.env.ALGOLIA_PRODUCT_INDEX_NAME,
      [data.previousDocument]
    )
  }
)

export const deleteProductFromAlgoliaWorkflow = createWorkflow(
  "delete-product-from-algolia",
  (input: { id: string }) => {
    const { productId, deleted } = deleteProductFromAlgoliaStep({
      productId: input.id,
    })

    return new WorkflowResponse({ productId, deleted })
  }
)