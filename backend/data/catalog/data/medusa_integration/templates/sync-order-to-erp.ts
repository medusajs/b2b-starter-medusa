// Example Medusa workflow: sync order to ERP with compensation
// Copy to a Medusa project: src/workflows/sync-order-to-erp.ts

import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { updateOrderWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows"

export const syncOrderToErpStep = createStep(
  "sync-order-to-erp",
  async ({ order }: { order: any }, { container }: any) => {
    const erpModuleService = container.resolve("erp")
    const erpOrderId = await erpModuleService.createOrder(order)
    return new StepResponse(erpOrderId, erpOrderId)
  },
  async (erpOrderId: string, { container }: any) => {
    if (!erpOrderId) return
    const erpModuleService = container.resolve("erp")
    await erpModuleService.deleteOrder(erpOrderId)
  }
)

export const syncOrderToErpWorkflow = createWorkflow(
  "sync-order-to-erp",
  ({ order_id }: { order_id: string }) => {
    // @ts-ignore
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: ["*", "shipping_address.*", "billing_address.*", "items.*"],
      filters: { id: order_id },
      options: { throwIfKeyNotFound: true },
    })

    const erpOrderId = syncOrderToErpStep({ order: orders[0] })

    updateOrderWorkflow.runAsStep({
      input: {
        id: order_id,
        user_id: "",
        metadata: { external_id: erpOrderId },
      },
    })

    return new WorkflowResponse(erpOrderId)
  }
)
