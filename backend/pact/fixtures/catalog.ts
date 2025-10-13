/**
 * 🧪 Pact Test Fixtures - Catalog
 * Deterministic product catalog data for contract verification
 */

export const PRODUCT_FIXTURES = {
  prod_panel_550w: {
    id: "prod_panel_550w",
    title: "Painel Solar 550W Monocristalino",
    handle: "painel-solar-550w-mono",
    description: "Painel solar de alta eficiência 550W",
    status: "published",
    thumbnail: "https://cdn.ysh.com/panels/550w-mono.jpg",
    variants: [
      {
        id: "var_panel_550w_mono",
        title: "550W Monocristalino",
        sku: "PANEL-550W-MONO",
        prices: [
          {
            amount: 85000,
            currency_code: "brl",
          },
        ],
        inventory_quantity: 150,
      },
    ],
    categories: [
      {
        id: "cat_solar_panels",
        name: "Painéis Solares",
        handle: "paineis-solares",
      },
    ],
    metadata: {
      power_w: 550,
      efficiency: 21.5,
      manufacturer: "Canadian Solar",
      warranty_years: 25,
    },
  },
};
