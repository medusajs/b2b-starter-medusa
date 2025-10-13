/**
 * 📦 Pact Provider Fixtures - Quotes
 * Stable test data for contract testing
 */

export const mockQuotes = [
  {
    id: "quote_test_001",
    quote_number: "QT-2024-001",
    status: "pending",
    customer_id: "cust_test_001",
    company_id: "comp_test_001",
    items: [
      {
        id: "item_test_001",
        product_id: "prod_test_panel_001",
        variant_id: "variant_test_001",
        quantity: 10,
        unit_price: 89900,
        total: 899000,
      },
    ],
    subtotal: 899000,
    tax_total: 0,
    total: 899000,
    currency_code: "brl",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    expires_at: "2024-02-15T10:00:00Z",
    metadata: {
      notes: "Test quote for contract testing",
    },
  },
];

export const mockQuoteRequests = {
  create: {
    customer_id: "cust_test_001",
    company_id: "comp_test_001",
    items: [
      {
        product_id: "prod_test_panel_001",
        variant_id: "variant_test_001",
        quantity: 10,
      },
    ],
    metadata: {
      notes: "New quote request",
    },
  },
  update: {
    status: "approved",
    metadata: {
      approved_by: "admin_test_001",
      approved_at: "2024-01-16T10:00:00Z",
    },
  },
};
