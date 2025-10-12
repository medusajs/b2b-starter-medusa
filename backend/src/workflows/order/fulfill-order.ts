/**
 * 📦 Order Fulfillment Workflows
 * Workflows completos do ciclo de vida de pedidos
 * 
 * Workflows:
 * 1. fulfillOrderWorkflow - Separação e preparação
 * 2. shipOrderWorkflow - Envio e rastreamento
 * 3. completeOrderWorkflow - Entrega confirmada
 * 4. cancelOrderWorkflow - Cancelamento e estorno
 */

import { createWorkflow, WorkflowResponse, createStep, StepResponse } from "@medusajs/workflows-sdk"
import { useRemoteQueryStep } from "@medusajs/medusa/core-flows"
import { OrderFulfillment, OrderShipment } from "../../entities/order-fulfillment.entity"

// ============================================================================
// Types
// ============================================================================

interface OrderData {
    id: string
    customer_id: string
    status: string
    items: any[]
    shipping_address: any
    payment_status: string
    fulfillment_status: string
}

interface FulfillmentData {
    fulfillment_id: string
    order_id: string
    items: any[]
    status: "pending" | "fulfilled" | "shipped" | "delivered"
    warehouse_location?: string
    picked_at?: Date
    packed_at?: Date
}

interface ShipmentData {
    shipment_id: string
    tracking_code: string
    carrier: string
    estimated_delivery: Date
    shipped_at: Date
}

// ============================================================================
// Workflow 1: Fulfill Order
// ============================================================================

export const pickOrderItemsStep = createStep(
    "pick-order-items",
    async (input: { order_id: string; items: any[] }, { container }) => {
        const entityManager = container.resolve("entityManager") as any

        console.log(`📦 Picking items for order: ${input.order_id}`)

        // Create OrderFulfillment entity
        const fulfillment = new OrderFulfillment()
        fulfillment.order_id = input.order_id
        fulfillment.status = 'picking'
        fulfillment.warehouse_id = 'warehouse_cd_sp_001'
        fulfillment.warehouse_name = 'CD São Paulo 001'
        fulfillment.picking_started_at = new Date()
        fulfillment.picked_by = 'system' // In production, use actual user ID

        // Store picked items with details (CRITICAL for PLG: product exposure)
        const pickedItems = input.items.map(item => ({
            product_id: item.product_id || item.id,
            variant_id: item.variant_id,
            title: item.title,
            quantity: item.quantity,
            sku: item.sku,
            location: `${fulfillment.warehouse_id}_A${Math.floor(Math.random() * 99)}`
        }))

        fulfillment.picked_items = pickedItems as any
        fulfillment.picking_completed_at = new Date()
        fulfillment.status = 'packing'

        await entityManager.persistAndFlush(fulfillment)

        // Simular picking de itens
        for (const item of input.items) {
            console.log(`   ✓ Picked: ${item.title} (qty: ${item.quantity})`)
        }

        console.log(`   🎯 Fulfillment created: ${fulfillment.id} with ${pickedItems.length} items for PLG tracking`)

        return new StepResponse({
            fulfillment_id: fulfillment.id,
            order_id: input.order_id,
            items: input.items,
            status: "fulfilled",
            warehouse_location: "CD_SP_001",
            picked_at: new Date()
        } as FulfillmentData)
    },
    async (output, { container }) => {
        console.log(`🔄 Rollback: Returning items to stock for ${output.fulfillment_id}`)

        const entityManager = container.resolve("entityManager") as any
        const fulfillment = await entityManager.findOne(OrderFulfillment, output.fulfillment_id)

        if (fulfillment) {
            fulfillment.status = 'cancelled'
            await entityManager.flush()
        }
    }
)

export const packOrderItemsStep = createStep(
    "pack-order-items",
    async (input: { fulfillment: FulfillmentData }) => {
        console.log(`📦 Packing order: ${input.fulfillment.order_id}`)

        // TODO: Gerar etiqueta de envio
        // TODO: Registrar dimensões e peso
        // TODO: Tirar foto da embalagem

        return new StepResponse({
            ...input.fulfillment,
            packed_at: new Date(),
            status: "fulfilled"
        } as FulfillmentData)
    }
)

export const notifyWarehouseStep = createStep(
    "notify-warehouse",
    async (input: { fulfillment: FulfillmentData }) => {
        console.log(`📢 Notifying warehouse about fulfillment: ${input.fulfillment.fulfillment_id}`)

        // TODO: Enviar notificação para equipe do CD
        // TODO: Adicionar à fila de expedição

        return new StepResponse({ notified: true })
    }
)

export const fulfillOrderWorkflow = createWorkflow(
    "fulfill-order",
    function (input: { order_id: string }): WorkflowResponse<FulfillmentData> {
        // Fetch order data
        const order = useRemoteQueryStep({
            entry_point: "order",
            fields: ["id", "items.*", "customer_id", "status"],
            variables: { id: input.order_id },
            list: false,
            throw_if_key_not_found: true
        })

        // Step 1: Pick items from warehouse
        const pickResult = pickOrderItemsStep({
            order_id: input.order_id,
            items: order.items
        })

        // Step 2: Pack items
        const packResult = packOrderItemsStep({
            fulfillment: pickResult
        })

        // Step 3: Notify warehouse team
        notifyWarehouseStep({ fulfillment: packResult })

        return new WorkflowResponse(packResult)
    }
)

// ============================================================================
// Workflow 2: Ship Order
// ============================================================================

export const createShipmentStep = createStep(
    "create-shipment",
    async (input: { order_id: string; fulfillment_id: string; carrier: string; shipping_address?: any }, { container }) => {
        const entityManager = container.resolve("entityManager") as any

        console.log(`🚚 Creating shipment for order: ${input.order_id}`)

        // Create OrderShipment entity
        const shipment = new OrderShipment()
        shipment.fulfillment_id = input.fulfillment_id
        shipment.carrier = input.carrier
        shipment.carrier_code = input.carrier === 'Correios' ? 'COR' : 'JDL'
        shipment.service_type = 'SEDEX' // Default to express
        shipment.tracking_code = `BR${Math.random().toString(36).substr(2, 11).toUpperCase()}`
        shipment.tracking_url = `https://rastreamento.correios.com.br/app/index.php?objetos=${shipment.tracking_code}`
        shipment.shipment_status = 'pending'
        shipment.shipped_at = new Date()

        const estimatedDelivery = new Date()
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 7)
        shipment.estimated_delivery_date = estimatedDelivery

        // Store shipping address
        shipment.shipping_address = input.shipping_address || {} as any

        // Initialize tracking events (CRITICAL for PLG: real-time updates)
        shipment.tracking_events = [{
            timestamp: new Date().toISOString(),
            status: 'shipment_created',
            location: 'CD São Paulo',
            description: 'Pedido postado'
        }] as any

        shipment.shipping_cost = 0 // Will be updated by carrier API
        shipment.currency_code = 'BRL'

        await entityManager.persistAndFlush(shipment)

        // Update fulfillment status
        const fulfillment = await entityManager.findOne(OrderFulfillment, input.fulfillment_id)
        if (fulfillment) {
            fulfillment.status = 'shipped'
            await entityManager.flush()
        }

        console.log(`   Shipment ID: ${shipment.id}`)
        console.log(`   Tracking: ${shipment.tracking_code}`)
        console.log(`   Carrier: ${input.carrier}`)
        console.log(`   Estimated Delivery: ${estimatedDelivery.toLocaleDateString()}`)
        console.log(`   📍 Tracking URL available for PLG customer experience`)

        return new StepResponse({
            shipment_id: shipment.id,
            tracking_code: shipment.tracking_code,
            carrier: input.carrier,
            estimated_delivery: estimatedDelivery,
            shipped_at: new Date()
        } as ShipmentData)
    },
    async (output, { container }) => {
        console.log(`🔄 Rollback: Canceling shipment ${output.shipment_id}`)

        const entityManager = container.resolve("entityManager") as any
        const shipment = await entityManager.findOne(OrderShipment, output.shipment_id)

        if (shipment) {
            shipment.shipment_status = 'cancelled'
            await entityManager.flush()
        }
    }
)

export const notifyCustomerShipmentStep = createStep(
    "notify-customer-shipment",
    async (input: { order_id: string; shipment: ShipmentData; customer_email: string }) => {
        console.log(`📧 Notifying customer about shipment`)
        console.log(`   Email: ${input.customer_email}`)
        console.log(`   Tracking: ${input.shipment.tracking_code}`)

        // TODO: Enviar email com tracking
        // TODO: Enviar SMS

        return new StepResponse({ notified: true })
    }
)

export const updateOrderStatusStep = createStep(
    "update-order-status",
    async (input: { order_id: string; status: string }) => {
        console.log(`📝 Updating order status: ${input.order_id} → ${input.status}`)

        // TODO: Update order in database
        // UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?

        return new StepResponse({ updated: true })
    }
)

export const shipOrderWorkflow = createWorkflow(
    "ship-order",
    function (input: {
        order_id: string
        fulfillment_id: string
        carrier?: string
    }): WorkflowResponse<ShipmentData> {
        // Fetch order data
        const order = useRemoteQueryStep({
            entry_point: "order",
            fields: ["id", "customer_id", "email"],
            variables: { id: input.order_id },
            list: false,
            throw_if_key_not_found: true
        })

        // Step 1: Create shipment with carrier
        const shipment = createShipmentStep({
            order_id: input.order_id,
            fulfillment_id: input.fulfillment_id,
            carrier: input.carrier || "Correios"
        })

        // Step 2: Update order status
        updateOrderStatusStep({
            order_id: input.order_id,
            status: "shipped"
        })

        // Step 3: Notify customer
        notifyCustomerShipmentStep({
            order_id: input.order_id,
            shipment,
            customer_email: order.email
        })

        return new WorkflowResponse(shipment)
    }
)

// ============================================================================
// Workflow 3: Complete Order
// ============================================================================

export const confirmDeliveryStep = createStep(
    "confirm-delivery",
    async (input: { order_id: string; shipment_id: string }) => {
        console.log(`✅ Confirming delivery for order: ${input.order_id}`)

        // TODO: Verificar com transportadora
        // TODO: Coletar assinatura/foto de entrega

        return new StepResponse({
            delivered: true,
            delivered_at: new Date()
        })
    }
)

export const requestFeedbackStep = createStep(
    "request-feedback",
    async (input: { order_id: string; customer_email: string }) => {
        console.log(`⭐ Requesting feedback for order: ${input.order_id}`)

        // TODO: Enviar email de NPS
        // TODO: Solicitar avaliação de produtos

        return new StepResponse({ feedback_requested: true })
    }
)

export const completeOrderWorkflow = createWorkflow(
    "complete-order",
    function (input: {
        order_id: string
        shipment_id: string
    }): WorkflowResponse<{ completed: boolean }> {
        // Fetch order data
        const order = useRemoteQueryStep({
            entry_point: "order",
            fields: ["id", "email"],
            variables: { id: input.order_id },
            list: false,
            throw_if_key_not_found: true
        })

        // Step 1: Confirm delivery
        const deliveryResult = confirmDeliveryStep({
            order_id: input.order_id,
            shipment_id: input.shipment_id
        })

        // Step 2: Update order to completed
        updateOrderStatusStep({
            order_id: input.order_id,
            status: "completed"
        })

        // Step 3: Request customer feedback
        requestFeedbackStep({
            order_id: input.order_id,
            customer_email: order.email
        })

        return new WorkflowResponse({
            completed: deliveryResult.delivered
        })
    }
)

// ============================================================================
// Workflow 4: Cancel Order
// ============================================================================

export const validateCancellationStep = createStep(
    "validate-cancellation",
    async (input: { order_id: string; reason: string }) => {
        console.log(`🔍 Validating cancellation for order: ${input.order_id}`)
        console.log(`   Reason: ${input.reason}`)

        // TODO: Verificar se pedido pode ser cancelado
        // Não pode cancelar se já foi enviado

        return new StepResponse({
            can_cancel: true,
            refund_amount: 45000,
            requires_approval: false
        })
    }
)

export const refundPaymentStep = createStep(
    "refund-payment",
    async (input: { order_id: string; amount: number }) => {
        console.log(`💰 Refunding payment: R$ ${input.amount.toFixed(2)}`)

        const refundId = `refund_${Date.now()}`

        // TODO: Processar estorno via payment provider
        // POST /api/refunds

        return new StepResponse({
            refund_id: refundId,
            amount: input.amount,
            refunded_at: new Date()
        })
    },
    async (output) => {
        console.log(`🔄 Rollback: Reversing refund ${output.refund_id}`)
        // TODO: Reverter estorno
    }
)

export const returnItemsToStockStep = createStep(
    "return-items-to-stock",
    async (input: { order_id: string; items: any[] }) => {
        console.log(`📦 Returning items to stock for order: ${input.order_id}`)

        // TODO: Atualizar estoque
        for (const item of input.items) {
            console.log(`   ✓ Returned: ${item.title} (qty: ${item.quantity})`)
        }

        return new StepResponse({ returned: true })
    }
)

export const notifyCancellationStep = createStep(
    "notify-cancellation",
    async (input: { order_id: string; customer_email: string; refund_id: string }) => {
        console.log(`📧 Notifying customer about cancellation`)

        // TODO: Enviar email de confirmação de cancelamento

        return new StepResponse({ notified: true })
    }
)

export const cancelOrderWorkflow = createWorkflow(
    "ysh-cancel-order",
    function (input: {
        order_id: string
        reason: string
        cancelled_by?: "customer" | "merchant" | "system"
    }): WorkflowResponse<{ cancelled: boolean; refund_id?: string }> {
        // Fetch order data
        const order = useRemoteQueryStep({
            entry_point: "order",
            fields: ["id", "items.*", "email", "payment_status", "total"],
            variables: { id: input.order_id },
            list: false,
            throw_if_key_not_found: true
        })

        // Step 1: Validate cancellation
        const validation = validateCancellationStep({
            order_id: input.order_id,
            reason: input.reason
        })

        // Step 2: Refund payment (if paid)
        const refund = refundPaymentStep({
            order_id: input.order_id,
            amount: validation.refund_amount
        })

        // Step 3: Return items to stock
        returnItemsToStockStep({
            order_id: input.order_id,
            items: order.items
        })

        // Step 4: Update order status
        updateOrderStatusStep({
            order_id: input.order_id,
            status: "cancelled"
        })

        // Step 5: Notify customer
        notifyCancellationStep({
            order_id: input.order_id,
            customer_email: order.email,
            refund_id: refund.refund_id
        })

        return new WorkflowResponse({
            cancelled: true,
            refund_id: refund.refund_id
        })
    }
)
