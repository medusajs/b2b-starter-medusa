import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { syncProductsToAlgoliaWorkflow } from "../workflows/sync-products-to-algolia"

export default async function handleProductSync({
  event,
  container,
}: SubscriberArgs<any>) {
  await syncProductsToAlgoliaWorkflow(container).run()
}

export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated",
    "product.deleted",
  ],
}