import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { ALGOLIA_MODULE } from "../../modules/algolia"

type SyncProductsStepInput = {
  products: any[]
}

const syncProductsStep = createStep(
  "sync-products-to-algolia",
  async (input: SyncProductsStepInput, { container }) => {
    const algoliaService = container.resolve(ALGOLIA_MODULE)
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    logger.info(`Syncing ${input.products.length} products to Algolia`)

    const documents = input.products.map((product) => ({
      objectID: product.id,
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      subtitle: product.subtitle,
      material: product.material,
      weight: product.weight,
      length: product.length,
      height: product.height,
      width: product.width,
      origin_country: product.origin_country,
      hs_code: product.hs_code,
      mid_code: product.mid_code,
      status: product.status,
      created_at: product.created_at,
      updated_at: product.updated_at,
      deleted_at: product.deleted_at,
      thumbnail: product.thumbnail,
      metadata: product.metadata,
      collection_id: product.collection_id,
      collection_title: product.collection?.title,
      collection_handle: product.collection?.handle,
      type_id: product.type_id,
      type_value: product.type?.value,
      tags: product.tags?.map((tag: any) => ({
        id: tag.id,
        value: tag.value,
      })),
      images: product.images?.map((image: any) => ({
        id: image.id,
        url: image.url,
        metadata: image.metadata,
      })),
      options: product.options?.map((option: any) => ({
        id: option.id,
        title: option.title,
        values: option.values?.map((value: any) => value.value),
      })),
      variants: product.variants?.map((variant: any) => ({
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
      categories: product.categories?.map((category: any) => ({
        id: category.id,
        name: category.name,
        handle: category.handle,
        parent_category_id: category.parent_category_id,
      })),
    }))

    await algoliaService.replaceAllDocuments(
      process.env.ALGOLIA_PRODUCT_INDEX_NAME,
      documents
    )

    return new StepResponse(
      { syncedCount: documents.length },
      { documents }
    )
  },
  async (data, { container }) => {
    const algoliaService = container.resolve(ALGOLIA_MODULE)
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    logger.info("Rolling back Algolia sync")

    if (data?.documents) {
      await algoliaService.replaceAllDocuments(
        process.env.ALGOLIA_PRODUCT_INDEX_NAME,
        data.documents
      )
    }
  }
)

export const syncProductsToAlgoliaWorkflow = createWorkflow(
  "sync-products-to-algolia",
  () => {
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
    })

    const { syncedCount } = syncProductsStep({ products })

    return new WorkflowResponse({
      syncedCount,
    })
  }
)