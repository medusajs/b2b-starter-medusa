import { model } from "@medusajs/framework/utils";
import { Manufacturer } from "./manufacturer";
import { DistributorOffer } from "./distributor-offer";

export enum ProductCategory {
    PANELS = "panels",
    INVERTERS = "inverters",
    BATTERIES = "batteries",
    CHARGE_CONTROLLERS = "charge_controllers",
    CABLES = "cables",
    CONNECTORS = "connectors",
    STRUCTURES = "structures",
    ACCESSORIES = "accessories",
    KITS = "kits",
    MONITORING = "monitoring",
    PROTECTION = "protection",
    OTHER = "other",
}

/**
 * SKU Model
 * SKUs únicos com especificações técnicas unificadas
 */
export const SKU = model.define("sku", {
    id: model.id({ prefix: "sku" }).primaryKey(),
    sku_code: model.text().unique().searchable(),
    manufacturer_id: model.text(),
    category: model.enum(ProductCategory),
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

    // Relations
    manufacturer: model.belongsTo(() => Manufacturer, {
        mappedBy: "skus",
    }),

    offers: model.hasMany(() => DistributorOffer, {
        mappedBy: "sku",
    }),

    metadata: model.json().nullable(),
}).indexes([
    {
        name: "IDX_sku_code",
        on: ["sku_code"],
        unique: true,
    },
    {
        name: "IDX_sku_category",
        on: ["category"],
    },
    {
        name: "IDX_sku_manufacturer",
        on: ["manufacturer_id"],
    },
    {
        name: "IDX_sku_category_manufacturer",
        on: ["category", "manufacturer_id"],
    },
    {
        name: "IDX_sku_price_range",
        on: ["lowest_price", "highest_price"],
    },
]);
