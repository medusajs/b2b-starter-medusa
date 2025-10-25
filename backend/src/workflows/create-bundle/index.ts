import {
  createWorkflow,
  WorkflowData,
  createStep,
  StepResponse,
  transform,
} from "@medusajs/workflows-sdk"
import { createProductsStep } from "@medusajs/product"
import { createRemoteLinkStep } from "@medusajs/remote-links"
import BundledProductModuleService from "../../modules/bundle/service"
import ProductModule from "@medusajs/product"
import BundleModule from "../../modules/bundle"

interface CreateBundleWorkflowInput {
  title: string
  items: {
    product_id: string
    quantity: number
  }[]
}

// Step to create Bundle records
const createBundlesStep = createStep(
  "create-bundles-step",
  async (input: { title: string }[], { container }) => {
    const bundleService: BundledProductModuleService = container.resolve(
      "bundleModuleService"
    )
    const bundles = await bundleService.create(input)
    return new StepResponse(bundles)
  }
)

import { updateProductsStep } from "@medusajs/product"

// Step to create BundleItem records
const createBundleItemsStep = createStep(
  "create-bundle-items-step",
  async (
    input: { bundle_id: string; quantity: number }[],
    { container }
  ) => {
    const bundleService: BundledProductModuleService = container.resolve(
      "bundleModuleService"
    )
    const items = await bundleService.createBundleItems(input)
    return new StepResponse(items)
  }
)

export const createBundleWorkflow = createWorkflow(
  "create-bundle-workflow",
  (input: WorkflowData<CreateBundleWorkflowInput>) => {
    // 1. Create Product Shell
    const [product] = createProductsStep([{ title: input.title }])

    // 2. Create Bundle
    const [bundle] = createBundlesStep([{ title: input.title }])

    // 3. Update product with bundle_id
    updateProductsStep([
      {
        id: product.id,
        metadata: {
          bundle_id: bundle.id,
        },
      },
    ])

    // 2. Create Bundle
    const [bundle] = createBundlesStep([{ title: input.title }])

    // 3. Prepare and Create BundleItems
    const itemsToCreate = transform(
      { bundle, items: input.items },
      (data) => {
        return data.items.map((item) => ({
          bundle_id: data.bundle.id,
          quantity: item.quantity,
        }))
      }
    )
    const bundleItems = createBundleItemsStep(itemsToCreate)

    // 4. Link Bundle to Product Shell
    const bundleProductLink = transform({ bundle, product }, (data) => {
      return {
        [BundleModule.linkable.bundle.id]: { bundle_id: data.bundle.id },
        [ProductModule.linkable.product.id]: { product_id: data.product.id },
      }
    })
    createRemoteLinkStep(bundleProductLink)

    // 5. Link BundleItems to their respective Products
    const itemProductLinks = transform(
      { bundleItems, items: input.items },
      (data) => {
        return data.bundleItems.map((bundleItem, i) => ({
          [BundleModule.linkable.bundle_item]: {
            bundle_item_id: bundleItem.id,
          },
          [ProductModule.linkable.product]: {
            product_id: data.items[i].product_id,
          },
        }))
      }
    )
    createRemoteLinkStep(itemProductLinks)

    return bundle
  }
)
