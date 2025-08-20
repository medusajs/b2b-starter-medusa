export interface InvoiceResponse {
  invoice_url: string
  generated_at: string
}

export interface GenerateInvoiceRequest {
  order_id: string
  fulfillment_id?: string
}

export interface RetrieveInvoiceRequest {
  order_id: string
  fulfillment_id?: string
}

export interface InvoiceErrorResponse {
  message: string
  error?: string
}
