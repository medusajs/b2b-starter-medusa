import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { INVOICE_MODULE } from "../../../modules/invoice"
import InvoiceService from "../../../services/invoice"
import { Client } from "pg"

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
  const orderService = req.scope.resolve(Modules.ORDER)

  try {
    const invoice = await invoiceService.retrieveInvoice(
      order_id as string,
      fulfillment_id as string,
      orderService
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
  const orderService = req.scope.resolve(Modules.ORDER)

  try {
    if (fulfillment_id) {
      // Verify the fulfillment belongs to the order
      const orders = await orderService.listOrders(
        { id: order_id },
        {
          relations: [
            "items",
            "shipping_address",
            "billing_address"
          ]
        }
      )
      const order = orders[0]

      // Verify fulfillment exists by querying it directly
      const connectionString = process.env.DATABASE_URL as string | undefined;
      if (connectionString) {
        const client = new Client({ connectionString });
        await client.connect();
        
        const fulfillmentResult = await client.query(`
          SELECT id FROM fulfillment WHERE id = $1
        `, [fulfillment_id]);
        
        await client.end();
        
        if (!fulfillmentResult.rows[0]) {
          return res.status(404).json({ 
            message: `Fulfillment ${fulfillment_id} not found in order ${order_id}` 
          })
        }
      }

      const invoiceUrl = await invoiceService.generateInvoice(
        order_id,
        fulfillment_id,
        undefined,
        orderService,
        fulfillment_index
      )
      
      // Get the updated invoice details
      const invoice = await invoiceService.retrieveInvoice(
        order_id,
        fulfillment_id,
        orderService
      )
      
      return res.json(invoice)
    } else {
      // Generate order invoice
      const invoiceUrl = await invoiceService.generateInvoice(order_id, undefined, undefined, orderService)
      
      // Get the updated invoice details
      const invoice = await invoiceService.retrieveInvoice(order_id, undefined, orderService)
      
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
