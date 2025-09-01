import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { dailyInventorySyncWorkflow } from "../workflows/inventory/daily-inventory-sync"

export default async function handleInventorySyncTrigger({
  event,
  container,
}: SubscriberArgs<{ force?: boolean }>) {
  const logger = container.resolve("logger")
  
  logger.info("Manual inventory sync triggered via event")

  try {
    const result = await dailyInventorySyncWorkflow(container).run({})
    
    if (result.result?.result?.success) {
      logger.info("Manual inventory sync completed successfully")
    } else {
      logger.error("Manual inventory sync failed")
    }
  } catch (error: any) {
    logger.error("Error in manual inventory sync:", error.message)
  }
}

export const config: SubscriberConfig = {
  event: "inventory.sync.trigger",
}