import { model } from "@medusajs/framework/utils";

/**
 * Distributor Model
 * Represents a supplier/distributor in the multi-distributor pricing system
 */
export const Distributor = model.define("ysh_distributor", {
    id: model
        .id({
            prefix: "dist",
        })
        .primaryKey(),

    // Basic Info
    name: model.text(),
    display_name: model.text().nullable(),
    slug: model.text(),

    // Configuration
    keywords: model.json().nullable(), // string[] for matching products
    price_markup: model.number().default(1.15), // 1.15 = 15% markup

    // Business Rules
    min_order_value: model.number().default(0),
    allowed_companies: model.json().nullable(), // string[] of company IDs
    priority: model.number().default(100), // Lower = higher priority

    // Status
    is_active: model.boolean().default(true),
    last_sync_at: model.dateTime().nullable(),

    // Logistics
    default_lead_time_days: model.number().default(7),

    // API Configuration (if needed)
    api_endpoint: model.text().nullable(),
    api_key: model.text().nullable(),

    // Metadata
    metadata: model.json().nullable(),
});
