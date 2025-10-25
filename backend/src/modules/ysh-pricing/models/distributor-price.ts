import { model } from "@medusajs/framework/utils";

/**
 * DistributorPrice Model
 * Stores pricing information for each variant from each distributor
 */
export const DistributorPrice = model.define("ysh_distributor_price", {
    id: model
        .id({
            prefix: "dprc",
        })
        .primaryKey(),

    // Relationships
    distributor_id: model.text(),
    variant_id: model.text(), // Medusa product variant ID
    variant_external_id: model.text().nullable(), // SKU or external reference

    // Pricing
    base_price: model.number(), // Original price from distributor
    final_price: model.number(), // After markup
    currency_code: model.text().default("BRL"),

    // Inventory
    availability: model
        .enum(["in_stock", "low_stock", "out_of_stock", "backorder"])
        .default("in_stock"),
    qty_available: model.number().default(0),
    qty_reserved: model.number().default(0),
    allow_backorder: model.boolean().default(false),

    // Logistics
    lead_time_days: model.number().nullable(),
    min_quantity: model.number().default(1),

    // Stock Location
    warehouse_location: model.text().nullable(),
    restock_date: model.dateTime().nullable(),

    // Sync Info
    last_updated_at: model.dateTime(),
    is_stale: model.boolean().default(false), // True if not updated in last sync

    // Metadata
    metadata: model.json().nullable(),
})
    .indexes([
        {
            on: ["variant_id", "distributor_id"],
            unique: true,
        },
        {
            on: ["variant_external_id"],
        },
    ]);