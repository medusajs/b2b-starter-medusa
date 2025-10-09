import { model } from "@medusajs/framework/utils";

/**
 * SKU Model
 * SKUs únicos com especificações técnicas unificadas
 */
export const SKU = model.define("sku", {
    id: model.id({ prefix: "sku" }).primaryKey(),
    sku_code: model.text().unique().searchable(),
    manufacturer_id: model.text(),
    category: model.enum([
        "panels",
        "inverters",
        "batteries",
        "charge_controllers",
        "cables",
        "connectors",
        "structures",
        "accessories",
        "kits",
        "monitoring",
        "protection",
        "other"
    ]),
    model_number: model.text().searchable(),
    name: model.text().searchable(),
    description: model.text().searchable().nullable(),

    // Especificações técnicas (JSON por categoria)
    technical_specs: model.json(),

    // Compatibilidade
    compatibility_tags: model.json().nullable(), // string[]

    // Pricing summary (calculado a partir de offers)
    lowest_price: model.number().nullable(),
    highest_price: model.number().nullable(),
    average_price: model.number().nullable(),
    median_price: model.number().nullable(),
    price_variation_pct: model.number().nullable(),

    // Metadata
    image_urls: model.json().nullable(), // string[]
    datasheet_url: model.text().nullable(),
    certification_labels: model.json().nullable(), // string[]
    warranty_years: model.number().nullable(),

    // SEO
    search_keywords: model.json().nullable(), // string[]

    // Stats
    total_offers: model.number().default(0),
    is_active: model.boolean().default(true),

    metadata: model.json().nullable(),
});
