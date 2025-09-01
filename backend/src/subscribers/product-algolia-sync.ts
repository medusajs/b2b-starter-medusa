import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { syncProductToAlgoliaWorkflow } from "../workflows/algolia/sync-product"
import { deleteProductFromAlgoliaWorkflow } from "../workflows/algolia/delete-product"

export async function handleProductCreated({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  
  logger.info(`Syncing new product ${event.data.id} to Algolia`)

  await syncProductToAlgoliaWorkflow(container).run({
    input: { id: event.data.id }
  })
}

export async function handleProductUpdated({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  
  logger.info(`Updating product ${event.data.id} in Algolia`)

  await syncProductToAlgoliaWorkflow(container).run({
    input: { id: event.data.id }
  })
}

export async function handleProductDeleted({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  
  logger.info(`Deleting product ${event.data.id} from Algolia`)

  await deleteProductFromAlgoliaWorkflow(container).run({
    input: { id: event.data.id }
  })
}

export const configCreated: SubscriberConfig = {
  event: "product.created",
}

export const configUpdated: SubscriberConfig = {
  event: "product.updated",
}

export const configDeleted: SubscriberConfig = {
  event: "product.deleted",
}