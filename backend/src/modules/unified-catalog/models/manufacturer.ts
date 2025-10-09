import { model } from "@medusajs/framework/utils";

/**
 * Manufacturer Model
 * Fabricantes de equipamentos solares com classificação TIER
 */
export const Manufacturer = model.define("manufacturer", {
    id: model.id({ prefix: "mfr" }).primaryKey(),
    name: model.text().searchable(),
    slug: model.text().unique(),
    tier: model.enum(["TIER_1", "TIER_2", "TIER_3", "UNKNOWN"]).default("UNKNOWN"),
    country: model.text().nullable(),
    logo_url: model.text().nullable(),
    website: model.text().nullable(),
    description: model.text().nullable(),
    product_count: model.number().default(0),
    aliases: model.json().nullable(), // string[]
    metadata: model.json().nullable(),
});
