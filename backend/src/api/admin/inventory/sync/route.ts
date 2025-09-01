import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { dailyInventorySyncWorkflow } from "../../../../workflows/inventory/daily-inventory-sync"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const logger = req.scope.resolve("logger")

  try {
    logger.info("Manually triggering daily inventory sync...")
    
    const result = await dailyInventorySyncWorkflow(req.scope).run({})
    
    res.json({
      success: true,
      message: "Inventory sync triggered successfully",
      result: result.result
    })
  } catch (error: any) {
    logger.error("Failed to trigger inventory sync:", error)
    res.status(500).json({
      success: false,
      message: "Failed to trigger inventory sync",
      error: error.message
    })
  }
}