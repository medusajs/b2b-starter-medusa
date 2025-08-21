import InvoiceGenerator from "../interfaces/invoice-generator"
import PDFDocument from "pdfkit"
import InvoiceService from "./invoice"
import { formatAmount } from "../utils/format-amount"

class FulfillmentInvoiceGenerator implements InvoiceGenerator {
  generateInvoice(doc: PDFDocument, order: any, fulfillment: any, fulfillmentIndex?: number): void {
    // First Page
    doc.font('Helvetica-Bold')
    doc.fontSize(25).text('Batteries-N-Things Inc', { align: 'center' })

    // Use the passed fulfillment index for sequential invoice numbering
    const invoiceNumber = fulfillmentIndex !== undefined ? fulfillmentIndex + 1 : 1
    
    doc.font('Helvetica-Bold')
    doc.fontSize(18).text(`Invoice #: ${invoiceNumber}`, { align: 'center' })
    doc.font('Helvetica')
    doc.moveDown()

    doc.font('Helvetica')
    doc.fontSize(10)
    doc.text('5-2800 John Street', { align: 'left' })
    doc.text('Markham ON L3R0E2', { align: 'left' })
    doc.text('(416)-368-0023', { align: 'left' })
    doc.text('info@bntbng.com', { align: 'left' })
    doc.text('GST Registration Number: 894119742RT0001', { align: 'left' })
    doc.moveDown()

    // Add invoice details section
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    
    // Invoice Date with bold label
    doc.font('Helvetica-Bold')
    doc.text('Invoice Date:', { align: 'left', continued: true })
    doc.font('Helvetica')
    doc.text(` ${currentDate}`, { align: 'left' })

    // Due Date with bold label
    doc.font('Helvetica-Bold')
    doc.text('Due Date:', { align: 'left', continued: true })
    doc.font('Helvetica')
    doc.text(` ${currentDate}`, { align: 'left' })

    // Terms with bold label
    doc.font('Helvetica-Bold')
    doc.text('Terms:', { align: 'left', continued: true })
    doc.font('Helvetica')
    doc.text(' Due on receipt', { align: 'left' })
    
    doc.moveDown()
    
    // Save current Y position to align all address sections
    const addressStartY = doc.y

    // Billing Address Section - Left side
    if (order.billing_address) {
      doc.font('Helvetica-Bold')
      doc.text('Bill To:', 50, addressStartY)
      doc.font('Helvetica')
      
      const billingAddress = order.billing_address
      let currentY = doc.y
      const lineHeight = 12 // Minimal line height for addresses
      
      if (billingAddress.first_name && billingAddress.last_name) {
        doc.text(`${billingAddress.first_name} ${billingAddress.last_name}`, 50, currentY)
        currentY += lineHeight
      }
      if (billingAddress.company) {
        doc.text(billingAddress.company, 50, currentY)
        currentY += lineHeight
      }
      if (billingAddress.address_1) {
        doc.text(billingAddress.address_1, 50, currentY)
        currentY += lineHeight
      }
      if (billingAddress.address_2) {
        doc.text(billingAddress.address_2, 50, currentY)
        currentY += lineHeight
      }
      doc.text([
        billingAddress.city,
        billingAddress.province,
        billingAddress.postal_code
      ].filter(Boolean).join(', '), 50, currentY)
      currentY += lineHeight
      
      if (billingAddress.country_code) {
        doc.text(billingAddress.country_code.toUpperCase(), 50, currentY)
      }
    }

    // Shipping Address Section - Middle column
    if (order.shipping_address) {
      doc.font('Helvetica-Bold')
      doc.text('Ship To:', 300, addressStartY)
      doc.font('Helvetica')
      
      const address = order.shipping_address
      let currentY = doc.y
      const lineHeight = 12 // Minimal line height for addresses
      
      if (address.first_name && address.last_name) {
        doc.text(`${address.first_name} ${address.last_name}`, 300, currentY)
        currentY += lineHeight
      }
      if (address.company) {
        doc.text(address.company, 300, currentY)
        currentY += lineHeight
      }
      if (address.address_1) {
        doc.text(address.address_1, 300, currentY)
        currentY += lineHeight
      }
      if (address.address_2) {
        doc.text(address.address_2, 300, currentY)
        currentY += lineHeight
      }
      doc.text([
        address.city,
        address.province,
        address.postal_code
      ].filter(Boolean).join(', '), 300, currentY)
      currentY += lineHeight
      
      if (address.country_code) {
        doc.text(address.country_code.toUpperCase(), 300, currentY)
      }
    }

    // Shipping Method Section - Right column
    if (fulfillment.shipping_details) {
      const shippingMethodX = 500
      doc.font('Helvetica-Bold')
      doc.text('Shipping Method:', shippingMethodX, addressStartY)
      doc.font('Helvetica')
      doc.text(fulfillment.shipping_details.option_name || 'Standard Shipping', shippingMethodX, doc.y)
      
      if (fulfillment.tracking_numbers?.length) {
        doc.text(`Tracking Number: ${fulfillment.tracking_numbers.join(', ')}`, shippingMethodX, doc.y + 12)
      }
    }

    // Move cursor to just below the addresses with minimal spacing
    doc.y = addressStartY + 85 // Approximate height for 6 lines of address at 12pt + labels

    // Current Fulfillment Items Table
    this.addCurrentFulfillmentTable(doc, order, fulfillment)
        
    // Summary
    this.addSummary(doc, order, fulfillment)
  }

  private addCurrentFulfillmentTable(doc: PDFDocument, order: any, fulfillment: any): void {
    const itemX = 50
    const quantityX = 250
    const priceX = 350
    const totalX = 480

    // Add a line above the table headers with minimal spacing
    doc.moveTo(50, doc.y).lineTo(540, doc.y).stroke()
    doc.moveDown(0.2)

    // Save the Y position for all headers
    const headerY = doc.y
    doc.font('Helvetica-Bold')
    doc.fontSize(10)
    doc.text('Item', itemX, headerY, { width: 190 })
    doc.text('Quantity', quantityX, headerY, { width: 80 })
    doc.text('Unit Price', priceX, headerY, { width: 80, align: 'right' })
    doc.text('Total', totalX, headerY, { width: 80, align: 'right' })
    
    // Move cursor below all headers
    doc.y = headerY + doc.currentLineHeight()
    
    // Add a line below the table headers with minimal spacing
    doc.moveDown(0.2)
    doc.moveTo(50, doc.y).lineTo(540, doc.y).stroke()
    doc.moveDown(0.2)
    doc.font('Helvetica')

    // Items in current fulfillment
    fulfillment.items.forEach(fulfillmentItem => {
      const orderItem = order.items.find(item => item.id === fulfillmentItem.item_id)
      if (!orderItem) return

      const y = doc.y
      doc.text(orderItem.title || 'Unnamed item', itemX, y, {
        width: 190,
        align: 'left'
      })
      doc.text(fulfillmentItem.quantity.toString(), quantityX, y, { width: 80 })
      doc.text(formatAmount((orderItem.unit_price || 0), order.region), priceX, y, { width: 80, align: 'right' })
      
      const lineTotal = (orderItem.unit_price || 0) * fulfillmentItem.quantity
      doc.text(formatAmount(lineTotal, order.region), totalX, y, { width: 80, align: 'right' })
      
      // Add 0.5 spacing between rows
      doc.moveDown(2.0)
    })
  }

  private addSummary(doc: PDFDocument, order: any, fulfillment: any): void {
    const summaryX = 350
    const totalX = 480
    
    doc.moveDown()
    doc.font('Helvetica-Bold')
    
    // Calculate subtotal and tax for fulfilled items
    let subtotal = 0

    order.items.forEach(item => {
      const fulfilledQuantity = fulfillment.items.find(fi => fi.item_id === item.id)?.quantity || 0
      if (fulfilledQuantity > 0) {
        const itemSubtotal = (item.unit_price || 0) * fulfilledQuantity
        subtotal += itemSubtotal
      }
    })

    // Get shipping price from the fulfillment
    const shippingPrice = fulfillment.shipping_details?.price || 0
    
    // Use the order's existing tax calculation - calculate proportional tax for this fulfillment
    let taxRate = 0
    let taxTotal = 0
    
    console.log(`[FulfillmentInvoiceGenerator] Order tax_total: ${order.tax_total}, subtotal: ${order.subtotal}`)
    
    if (order.tax_total && order.subtotal) {
      // Calculate the effective tax rate from the order's total tax
      const orderTaxRate = (order.tax_total / order.subtotal) * 100
      console.log(`[FulfillmentInvoiceGenerator] Order tax rate: ${orderTaxRate}%`)
      
      // Apply the same tax rate to this fulfillment's subtotal + shipping
      taxTotal = (subtotal + shippingPrice) * (orderTaxRate / 100)
      taxRate = orderTaxRate
      console.log(`[FulfillmentInvoiceGenerator] Fulfillment taxTotal: ${taxTotal}`)
    }

    // Calculate total (ensure numeric addition)
    const total = Number(subtotal) + Number(shippingPrice) + Number(taxTotal)
    console.log(`[FulfillmentInvoiceGenerator] subtotal: ${subtotal}, shippingPrice: ${shippingPrice}, taxTotal: ${taxTotal}, total: ${total}`)
    console.log(`[FulfillmentInvoiceGenerator] Total in dollars: ${total / 100}`)

    // Save starting Y position for each row
    let currentY = doc.y

    // First row - Subtotal
    doc.text('Subtotal:', summaryX, currentY)
    doc.text(formatAmount(subtotal, order.region), totalX, currentY, { align: 'right', width: 80 })
    doc.moveDown(0.5)
    currentY = doc.y

    // Second row - Shipping
    doc.text('Shipping:', summaryX, currentY)
    doc.text(formatAmount(shippingPrice, order.region), totalX, currentY, { align: 'right', width: 80 })
    doc.moveDown(0.5)
    currentY = doc.y

    // Third row - GST
    doc.text(`GST @ ${taxRate}%:`, summaryX, currentY)
    doc.text(formatAmount(taxTotal, order.region), totalX, currentY, { align: 'right', width: 80 })
    doc.moveDown(0.5)
    currentY = doc.y

    // Fourth row - Total
    doc.text('Total:', summaryX, currentY)
    doc.text(formatAmount(total, order.region), totalX, currentY, { align: 'right', width: 80 })
    
    // Add extra space before notes
    doc.moveDown(2)
    
    // Add notes below the totals
    doc.font('Helvetica')
    doc.text('Thank you for your business.', 50)
    doc.text('All sales are final.', 50)
    doc.text("Manufacturer's warranty.", 50)
    doc.text('Any discrepancy is to be notified no later than', 50)
    doc.text('48 hours after receipt of the invoice.', 50)
    
    // Add Tax Summary section
    doc.moveDown(2)
    doc.font('Helvetica-Bold')
    doc.text('TAX SUMMARY', 50)
    doc.moveDown()
    
    // Tax Summary Table Headers
    const rateX = 50
    const taxX = 200
    const netX = 350
    
    // Add table headers with same Y position
    const headerY = doc.y
    doc.font('Helvetica-Bold')
    doc.text('RATE', rateX, headerY)
    doc.text('TAX', taxX, headerY)
    doc.text('NET', netX, headerY)
    
    // Add a line below headers
    doc.moveTo(50, headerY + 15).lineTo(450, headerY + 15).stroke()
    
    // Add tax row with same Y position
    const rowY = headerY + 25
    doc.font('Helvetica')
    doc.text(`GST @ ${taxRate}%`, rateX, rowY)
    doc.text(formatAmount(taxTotal, order.region), taxX, rowY)
    doc.text(formatAmount(subtotal + shippingPrice, order.region), netX, rowY)
  }
}

export default FulfillmentInvoiceGenerator
