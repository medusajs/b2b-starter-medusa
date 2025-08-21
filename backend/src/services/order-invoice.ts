import InvoiceGenerator from "../interfaces/invoice-generator"
import PDFDocument from "pdfkit"

class OrderInvoiceGenerator implements InvoiceGenerator {
  generateInvoice(doc: PDFDocument, order: any, fulfillment?: any, fulfillmentIndex?: number): void {
    // Placeholder implementation for order invoices
    doc.fontSize(25).text('Order Invoice', { align: 'center' })
    doc.moveDown()
    doc.fontSize(12).text(`Order #: ${order.display_id}`)
    doc.text(`Customer: ${order.customer.first_name} ${order.customer.last_name}`)
    doc.text('This is a placeholder for order invoice generation.')
  }
}

export default OrderInvoiceGenerator
