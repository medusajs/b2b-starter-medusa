import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { RemoteQueryFunction } from "@medusajs/framework/types"
import { INVOICE_MODULE } from "../../../modules/invoice"
import InvoiceService from "../../../services/invoice"

type InvoiceRequestBody = {
  order_id: string
  fulfillment_id?: string
  fulfillment_index?: number
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { order_id, fulfillment_id } = req.query

  if (!order_id) {
    return res.status(400).json({ 
      message: "order_id is required" 
    })
  }

  const invoiceService: InvoiceService = req.scope.resolve(INVOICE_MODULE)

  try {
    const invoice = await invoiceService.retrieveInvoice(
      order_id as string,
      fulfillment_id as string
    )
    
    if (!invoice) {
      return res.status(404).json({ 
        message: "Invoice not found" 
      })
    }
    
    return res.json(invoice)
  } catch (error) {
    console.error('[AdminInvoiceRoute] Error retrieving invoice:', error)
    res.status(500).json({
      message: "Failed to retrieve invoice",
      error: error.message
    })
  }
}

export const POST = async (req: MedusaRequest<InvoiceRequestBody>, res: MedusaResponse) => {
  const { order_id, fulfillment_id, fulfillment_index } = req.body

  if (!order_id) {
    return res.status(400).json({ 
      message: "order_id is required" 
    })
  }

  const invoiceService: InvoiceService = req.scope.resolve(INVOICE_MODULE)

  try {
    if (fulfillment_id) {
            // Get the order with fulfillments and items using Remote Query
      const query = req.scope.resolve<RemoteQueryFunction>(ContainerRegistrationKeys.QUERY);
      
      const {
        data: [order],
      } = await query.graph(
        {
          entity: "order",
          fields: [
            "id",
            "display_id",
            "currency_code",
            "subtotal",
            "tax_total",
            "total",
            "items.*",
            "shipping_address.*",
            "billing_address.*",
            "fulfillments.id",
            "fulfillments.items.*"
          ],
          filters: { id: order_id },
        },
        { throwIfKeyNotFound: true }
      );
      
      if (!order) {
        return res.status(404).json({ 
          message: `Order ${order_id} not found` 
        })
      }
      
      // Verify fulfillment exists in the order
      if (!order.fulfillments?.some((f: any) => f.id === fulfillment_id)) {
        return res.status(404).json({ 
          message: `Fulfillment ${fulfillment_id} not found in order ${order_id}` 
        })
      }

      const invoiceUrl = await invoiceService.generateInvoice(
        order_id,
        fulfillment_id,
        order,
        undefined,
        fulfillment_index
      )
      
      // Get the updated invoice details
      const invoice = await invoiceService.retrieveInvoice(
        order_id,
        fulfillment_id
      )
      
      return res.json(invoice)
    } else {
      // Generate order invoice - get order data first
      const query = req.scope.resolve<RemoteQueryFunction>(ContainerRegistrationKeys.QUERY);
      
      const {
        data: [order],
      } = await query.graph(
        {
          entity: "order",
          fields: [
            "id",
            "display_id",
            "currency_code",
            "subtotal",
            "tax_total",
            "total",
            "items.*",
            "shipping_address.*",
            "billing_address.*"
          ],
          filters: { id: order_id },
        },
        { throwIfKeyNotFound: true }
      );
      
      if (!order) {
        return res.status(404).json({ 
          message: `Order ${order_id} not found` 
        })
      }
      
      const invoiceUrl = await invoiceService.generateInvoice(order_id, undefined, order, undefined)
      
      // Get the updated invoice details
      const invoice = await invoiceService.retrieveInvoice(order_id, undefined)
      
      return res.json(invoice)
    }
  } catch (error) {
    console.error('[AdminInvoiceRoute] Error generating invoice:', error)
    res.status(500).json({
      message: "Failed to generate invoice",
      error: error.message
    })
  }
}
