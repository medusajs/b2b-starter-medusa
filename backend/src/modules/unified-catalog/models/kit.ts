import { model } from "@medusajs/framework/utils";

/**
 * Kit Model
 * Kits solares pré-configurados com componentes linkados
 */
export const Kit = model.define("kit", {
    id: model.id({ prefix: "kit" }).primaryKey(),
    kit_code: model.text().unique().searchable(),
    name: model.text().searchable(),
    category: model.enum([
        "grid-tie",
        "off-grid",
        "hybrid",
        "backup",
        "commercial",
        "residential"
    ]),

    // System specs
    system_capacity_kwp: model.number(),
    voltage: model.text().nullable(), // "127V", "220V", "380V"
    phase: model.text().nullable(), // "monofásico", "bifásico", "trifásico"

    // Components (JSON array)
    components: model.json(), // Array de { type, sku_id, quantity, confidence }

    // Pricing
    total_components_price: model.number().nullable(),
    kit_price: model.number().nullable(),
    discount_amount: model.number().nullable(),
    discount_pct: model.number().nullable(),

    // Kit offers (JSON array)
    kit_offers: model.json().nullable(), // Array de { distributor, price, stock }

    // Metadata
    description: model.text().nullable(),
    image_url: model.text().nullable(),
    installation_complexity: model.enum(["easy", "medium", "hard"]).default("medium"),
    estimated_installation_hours: model.number().nullable(),

    // Target customer
    target_consumer_class: model.enum([
        "residential",
        "commercial",
        "industrial",
        "rural",
        "public"
    ]).nullable(),
    monthly_consumption_kwh_min: model.number().nullable(),
    monthly_consumption_kwh_max: model.number().nullable(),

    // Stats
    mapping_confidence_avg: model.number().nullable(), // 0-100
    is_active: model.boolean().default(true),

    metadata: model.json().nullable(),
});
