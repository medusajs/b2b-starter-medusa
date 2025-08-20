import PDFDocument from "pdfkit"

interface InvoiceGenerator {
  generateInvoice(doc: PDFDocument, order: any, fulfillment?: any, fulfillmentIndex?: number): void
}

export default InvoiceGenerator
