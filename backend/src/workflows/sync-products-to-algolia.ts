import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { ALGOLIA_MODULE } from "../modules/algolia"

const queryProductsStep = createStep(
  "query-products-step",
  async ({ }, { container }) => {
    const productModuleService = container.resolve(Modules.PRODUCT)

    const { data: products } = await productModuleService.listProducts(
      {},
      {
        select: [
          "id",
          "title",
          "subtitle",
          "description",
          "handle",
          "is_giftcard",
          "status",
          "collection_id",
          "collection",
          "thumbnail",
          "tags",
          "categories",
          "variants",
          "metadata",
          "created_at",
          "updated_at",
        ],
        relations: [
          "collection",
          "tags",
          "categories",
          "variants",
          "variants.options",
          "variants.prices",
        ],
      }
    )

    const transformedProducts = products.map((product) => {
      const lowestPrice = product.variants?.reduce((min, variant) => {
        const price = variant.prices?.[0]?.amount || 0
        return price < min ? price : min
      }, Infinity)

      return {
        id: product.id,
        title: product.title,
        subtitle: product.subtitle,
        description: product.description,
        handle: product.handle,
        is_giftcard: product.is_giftcard,
        status: product.status,
        collection_id: product.collection_id,
        collection: product.collection?.title,
        thumbnail: product.thumbnail,
        tags: product.tags?.map((tag) => tag.value) || [],
        categories: product.categories?.map((cat) => cat.name) || [],
        variants_count: product.variants?.length || 0,
        price: lowestPrice === Infinity ? null : lowestPrice / 100,
        created_at: product.created_at,
        updated_at: product.updated_at,
      }
    })

    return new StepResponse({
      products: transformedProducts,
    })
  }
)

const indexProductsStep = createStep(
  "index-products-step",
  async ({ products }, { container }) => {
    const algoliaModuleService = container.resolve(ALGOLIA_MODULE)

    const prevIndexedProductIds = products.map((product) => product.id)

    await algoliaModuleService.indexData(products, "product")

    return new StepResponse({
      indexed_product_ids: products.map((product) => product.id),
    }, {
      prevIndexedProductIds,
    })
  },
  async ({ prevIndexedProductIds }, { container }) => {
    const algoliaModuleService = container.resolve(ALGOLIA_MODULE)
    
    if (prevIndexedProductIds?.length) {
      await algoliaModuleService.deleteFromIndex(
        prevIndexedProductIds,
        "product"
      )
    }
  }
)

export const syncProductsToAlgoliaWorkflow = createWorkflow(
  "sync-products-to-algolia",
  () => {
    const { products } = queryProductsStep()
    const { indexed_product_ids } = indexProductsStep({
      products,
    })

    return new WorkflowResponse({
      indexed_product_ids,
    })
  }
)