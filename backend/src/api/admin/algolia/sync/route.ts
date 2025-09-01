import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { IEventBusModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const eventBus = req.scope.resolve<IEventBusModuleService>(
    Modules.EVENT_BUS
  )

  await eventBus.emit("algolia.sync", {
    force: req.body?.force || false,
  })

  res.json({
    message: "Algolia sync initiated",
  })
}