import { model } from "@medusajs/framework/utils";
import { SKU } from "./sku";

export enum ManufacturerTier {
    TIER_1 = "TIER_1",
    TIER_2 = "TIER_2",
    TIER_3 = "TIER_3",
    UNKNOWN = "UNKNOWN",
}

/**
 * Manufacturer Model
 * Fabricantes de equipamentos solares com classificação TIER
 */
export const Manufacturer = model.define("manufacturer", {
    id: model
        .id({
            prefix: "mfr",
        })
        .primaryKey(),
    name: model.text().searchable(),
    slug: model.text().unique(),
    tier: model.enum(ManufacturerTier).default(ManufacturerTier.UNKNOWN),
    country: model.text().nullable(),
    website: model.text().nullable(),
    logo_url: model.text().nullable(),
    description: model.text().nullable(),

    // Metadata for deduplication
    aliases: model.json().nullable(), // Array of alternative names

    // Statistics
    product_count: model.number().default(0),
    avg_rating: model.number().nullable(),

    is_active: model.boolean().default(true),

    // Relations
    skus: model.hasMany(() => SKU, {
        mappedBy: "manufacturer",
    }),

    metadata: model.json().nullable(),
}).indexes([
    {
        name: "IDX_manufacturer_slug",
        on: ["slug"],
        unique: true,
    },
    {
        name: "IDX_manufacturer_tier",
        on: ["tier"],
    },
    {
        name: "IDX_manufacturer_country",
        on: ["country"],
    },
]);
