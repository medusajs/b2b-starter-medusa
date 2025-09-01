import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { ALGOLIA_MODULE } from "../../modules/algolia"

type SyncProductStepInput = {
  product: any
}

const syncProductStep = createStep(
  "sync-product-to-algolia",
  async (input: SyncProductStepInput, { container }) => {
    const algoliaService = container.resolve(ALGOLIA_MODULE)
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    logger.info(`Syncing product ${input.product.id} to Algolia`)

    const document = {
      objectID: input.product.id,
      id: input.product.id,
      title: input.product.title,
      handle: input.product.handle,
      description: input.product.description,
      subtitle: input.product.subtitle,
      material: input.product.material,
      weight: input.product.weight,
      length: input.product.length,
      height: input.product.height,
      width: input.product.width,
      origin_country: input.product.origin_country,
      hs_code: input.product.hs_code,
      mid_code: input.product.mid_code,
      status: input.product.status,
      created_at: input.product.created_at,
      updated_at: input.product.updated_at,
      deleted_at: input.product.deleted_at,
      thumbnail: input.product.thumbnail,
      metadata: input.product.metadata,
      collection_id: input.product.collection_id,
      collection_title: input.product.collection?.title,
      collection_handle: input.product.collection?.handle,
      type_id: input.product.type_id,
      type_value: input.product.type?.value,
      tags: input.product.tags?.map((tag: any) => ({
        id: tag.id,
        value: tag.value,
      })),
      images: input.product.images?.map((image: any) => ({
        id: image.id,
        url: image.url,
        metadata: image.metadata,
      })),
      options: input.product.options?.map((option: any) => ({
        id: option.id,
        title: option.title,
        values: option.values?.map((value: any) => value.value),
      })),
      variants: input.product.variants?.map((variant: any) => ({
        id: variant.id,
        title: variant.title,
        sku: variant.sku,
        barcode: variant.barcode,
        ean: variant.ean,
        upc: variant.upc,
        inventory_quantity: variant.inventory_quantity,
        allow_backorder: variant.allow_backorder,
        manage_inventory: variant.manage_inventory,
        hs_code: variant.hs_code,
        origin_country: variant.origin_country,
        mid_code: variant.mid_code,
        material: variant.material,
        weight: variant.weight,
        length: variant.length,
        height: variant.height,
        width: variant.width,
        metadata: variant.metadata,
        prices: variant.prices?.map((price: any) => ({
          id: price.id,
          currency_code: price.currency_code,
          amount: price.amount,
          min_quantity: price.min_quantity,
          max_quantity: price.max_quantity,
        })),
        calculated_price: variant.calculated_price,
        options: variant.options?.map((option: any) => ({
          option_id: option.option_id,
          value: option.value,
        })),
      })),
      categories: input.product.categories?.map((category: any) => ({
        id: category.id,
        name: category.name,
        handle: category.handle,
        parent_category_id: category.parent_category_id,
      })),
    }

    const existingDoc = await algoliaService.getDocument(
      process.env.ALGOLIA_PRODUCT_INDEX_NAME,
      input.product.id
    )

    if (existingDoc) {
      await algoliaService.updateDocument(
        process.env.ALGOLIA_PRODUCT_INDEX_NAME,
        document
      )
    } else {
      await algoliaService.addDocuments(
        process.env.ALGOLIA_PRODUCT_INDEX_NAME,
        [document]
      )
    }

    return new StepResponse(
      { productId: input.product.id },
      { previousDocument: existingDoc, document }
    )
  },
  async (data, { container }) => {
    const algoliaService = container.resolve(ALGOLIA_MODULE)
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    if (!data) return

    logger.info("Rolling back Algolia product sync")

    if (data.previousDocument) {
      await algoliaService.updateDocument(
        process.env.ALGOLIA_PRODUCT_INDEX_NAME,
        data.previousDocument
      )
    } else if (data.document) {
      await algoliaService.deleteDocument(
        process.env.ALGOLIA_PRODUCT_INDEX_NAME,
        data.document.objectID
      )
    }
  }
)

export const syncProductToAlgoliaWorkflow = createWorkflow(
  "sync-product-to-algolia",
  (input: { id: string }) => {
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: [
        "*",
        "collection.*",
        "type.*",
        "tags.*",
        "images.*",
        "options.*",
        "options.values.*",
        "variants.*",
        "variants.prices.*",
        "variants.options.*",
        "categories.*",
      ],
      filters: { id: input.id },
    })

    const { productId } = syncProductStep({ 
      product: products[0] 
    })

    return new WorkflowResponse({ productId })
  }
)