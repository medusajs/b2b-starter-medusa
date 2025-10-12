import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * GET /store/orders/:id/fulfillment
 * 
 * Retorna fulfillment com product tracking e shipping status (PLG: real-time transparency)
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { id: order_id } = req.params

    try {
        const query = req.scope.resolve("query")

        // Fetch fulfillment with shipments
        const { data: [fulfillment] } = await query.graph({
            entity: "order_fulfillment",
            fields: ["*", "shipments.*"],
            filters: { order_id }
        })

        if (!fulfillment) {
            return res.status(404).json({
                error: "Fulfillment not found for this order",
                order_id
            })
        }

        // Extract product IDs from picked_items
        const pickedItems = fulfillment.picked_items || []
        const productIds = pickedItems.map((item: any) => item.product_id).filter(Boolean)

        let itemsWithProducts = pickedItems

        // Fetch product details via Query
        if (productIds.length > 0) {
            try {
                const { data: products } = await query.graph({
                    entity: "product",
                    fields: [
                        "id",
                        "title",
                        "thumbnail",
                        "description",
                        "variants.*"
                    ],
                    filters: { id: productIds }
                })

                // Enrich items with product data (PLG: product tracking)
                itemsWithProducts = pickedItems.map((item: any) => ({
                    ...item,
                    product: products?.find((p: any) => p.id === item.product_id) || null
                }))
            } catch (error) {
                console.warn("Failed to fetch products:", error.message)
            }
        }

        // Get shipment details
        const shipmentData = fulfillment.shipments || []

        return res.json({
            fulfillment_id: fulfillment.id,
            order_id: fulfillment.order_id,
            status: fulfillment.status,
            warehouse: {
                id: fulfillment.warehouse_id,
                name: fulfillment.warehouse_name
            },
            picking: {
                started_at: fulfillment.picking_started_at,
                completed_at: fulfillment.picking_completed_at,
                picked_by: fulfillment.picked_by
            },
            packing: {
                started_at: fulfillment.packing_started_at,
                completed_at: fulfillment.packing_completed_at,
                packed_by: fulfillment.packed_by,
                number_of_packages: fulfillment.number_of_packages,
                package_dimensions: fulfillment.package_dimensions
            },
            // PLG: Product tracking
            picked_items: itemsWithProducts,
            // PLG: Shipping transparency
            shipments: shipmentData.map(shipment => ({
                shipment_id: shipment.id,
                tracking_code: shipment.tracking_code,
                tracking_url: shipment.tracking_url,
                carrier: shipment.carrier,
                service_type: shipment.service_type,
                status: shipment.shipment_status,
                shipped_at: shipment.shipped_at,
                estimated_delivery_date: shipment.estimated_delivery_date,
                actual_delivery_date: shipment.actual_delivery_date,
                // PLG: Real-time tracking events
                tracking_events: shipment.tracking_events || [],
                shipping_address: shipment.shipping_address
            }))
        })
    } catch (error) {
        console.error("Failed to fetch order fulfillment:", error)
        return res.status(500).json({
            error: "Failed to fetch order fulfillment",
            message: error.message
        })
    }
}
