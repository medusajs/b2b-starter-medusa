import { MedusaContainer } from "@medusajs/framework/types"
import { dailyInventorySyncWorkflow } from "../workflows/inventory/daily-inventory-sync"

export default async function dailyInventorySyncJob(container: MedusaContainer) {
    const logger = container.resolve("logger")
    
    try {
        logger.info("Starting daily inventory sync job...")
        
        // Execute the workflow
        const workflowResult = await dailyInventorySyncWorkflow(container).run({})
        
        if (workflowResult.result?.result?.success) {
            logger.info("Daily inventory sync completed successfully")
        } else {
            logger.error("Daily inventory sync failed")
        }
        
    } catch (error: any) {
        logger.error("Error in daily inventory sync job", error.message)
    }
}

export const config = {
    name: "daily-inventory-sync",
    schedule: "0 2 * * *", // Run at 2 AM every day
};