// Example skeleton for a Medusa ERP module service
// Copy into a Medusa project: src/modules/erp/service.ts

type Options = {
  apiKey?: string
  baseUrl?: string
}

export default class ErpModuleService {
  private options: Options
  private client: any

  constructor(container: any, options: Options) {
    this.options = options
    // Initialize a HTTP client to the ERP here (axios, fetch, etc.)
    // this.client = new ErpHttpClient(options)
  }

  async getProducts() {
    // Example: fetch products list from ERP
    // return this.client.get('/products')
    return []
  }

  async getErpPrice(variantExternalId: string, currencyCode: string) {
    // Fetch price for a variant
    return null
  }

  async getQty(variantExternalId: string) {
    // Fetch inventory data for the variant
    return { qty_available: 0, allow_out_of_stock_order: false }
  }

  async createOrder(order: any) {
    // Create the order in the ERP and return external id
    return null
  }

  async deleteOrder(erpOrderId: string) {
    // Delete/rollback order in ERP
  }

  async canCompanyPurchaseProduct(productExternalId: string, companyName?: string) {
    // Business logic: check if the company is allowed to buy the product
    return true
  }
}
