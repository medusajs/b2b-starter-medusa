import { initializeContainer } from "@medusajs/framework"
import { dailyInventorySyncWorkflow } from "../workflows/inventory/daily-inventory-sync"

async function triggerInventorySync() {
  const container = await initializeContainer()
  const logger = container.resolve("logger")

  try {
    logger.info("Manually triggering inventory sync...")
    
    const result = await dailyInventorySyncWorkflow(container).run({})
    
    if (result.result?.result?.success) {
      logger.info("Inventory sync completed successfully")
    } else {
      logger.error("Inventory sync failed")
    }
    
    process.exit(0)
  } catch (error: any) {
    logger.error("Error triggering inventory sync:", error.message)
    process.exit(1)
  }
}

triggerInventorySync()