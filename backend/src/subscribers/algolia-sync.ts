import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { syncProductsToAlgoliaWorkflow } from "../workflows/algolia/sync-products"

export default async function handleAlgoliaSync({
  event,
  container,
}: SubscriberArgs<{ force?: boolean }>) {
  const logger = container.resolve("logger")
  
  logger.info("Manual Algolia sync triggered")

  await syncProductsToAlgoliaWorkflow(container).run()

  logger.info("Algolia sync completed")
}

export const config: SubscriberConfig = {
  event: "algolia.sync",
}