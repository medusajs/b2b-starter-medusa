/**
 * 🧪 Pact Test Fixtures - Quotes
 * Deterministic test data for contract verification
 */

export const QUOTE_FIXTURES = {
  quote_123: {
    id: "quote_123",
    status: "pending",
    customer_id: "cust_test_001",
    cart_id: "cart_test_001",
    items: [
      {
        id: "item_001",
        product_id: "prod_panel_550w",
        variant_id: "var_panel_550w_mono",
        quantity: 10,
        unit_price: 85000,
        total: 850000,
      },
    ],
    subtotal: 850000,
    tax_total: 0,
    total: 850000,
    currency_code: "brl",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
};
