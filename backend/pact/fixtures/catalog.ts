/**
 * 📦 Pact Provider Fixtures - Catalog
 * Stable test data for contract testing
 */

export const mockCatalogProducts = [
  {
    id: "prod_test_panel_001",
    sku: "PANEL-TEST-550W",
    title: "Test Solar Panel 550W Monocrystalline",
    handle: "test-solar-panel-550w",
    status: "published",
    thumbnail: "https://example.com/panel-550w.jpg",
    variants: [
      {
        id: "variant_test_001",
        sku: "PANEL-TEST-550W-V1",
        title: "Default",
        inventory_quantity: 100,
        prices: [
          {
            amount: 89900,
            currency_code: "brl",
          },
        ],
      },
    ],
    metadata: {
      category: "paineis",
      manufacturer: "Test Manufacturer",
      power_watts: 550,
      efficiency: 21.5,
      warranty_years: 25,
    },
  },
  {
    id: "prod_test_inverter_001",
    sku: "INV-TEST-5KW",
    title: "Test Inverter 5kW On-Grid",
    handle: "test-inverter-5kw",
    status: "published",
    thumbnail: "https://example.com/inverter-5kw.jpg",
    variants: [
      {
        id: "variant_test_002",
        sku: "INV-TEST-5KW-V1",
        title: "Default",
        inventory_quantity: 50,
        prices: [
          {
            amount: 450000,
            currency_code: "brl",
          },
        ],
      },
    ],
    metadata: {
      category: "inversores",
      manufacturer: "Test Manufacturer",
      power_kw: 5,
      type: "on-grid",
      mppt_channels: 2,
    },
  },
];

export const mockCatalogKits = [
  {
    id: "kit_test_001",
    sku: "KIT-TEST-5KWP",
    title: "Test Solar Kit 5kWp Complete",
    handle: "test-solar-kit-5kwp",
    status: "published",
    thumbnail: "https://example.com/kit-5kwp.jpg",
    variants: [
      {
        id: "variant_kit_001",
        sku: "KIT-TEST-5KWP-V1",
        title: "Complete Kit",
        inventory_quantity: 20,
        prices: [
          {
            amount: 1500000,
            currency_code: "brl",
          },
        ],
      },
    ],
    metadata: {
      category: "kits",
      system_type: "on-grid",
      power_kwp: 5,
      includes: ["panels", "inverter", "structure", "cables"],
    },
  },
];

export const mockManufacturers = [
  {
    id: "mfr_test_001",
    name: "Test Manufacturer",
    slug: "test-manufacturer",
    country: "BR",
    logo_url: "https://example.com/logo.png",
  },
];
