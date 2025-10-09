import { model } from "@medusajs/framework/utils";

/**
 * DistributorOffer Model
 * Ofertas de distribuidores para cada SKU
 */
export const DistributorOffer = model.define("distributor_offer", {
    id: model.id({ prefix: "doffer" }).primaryKey(),
    sku_id: model.text(),
    distributor_name: model.text().searchable(),

    // Pricing
    price: model.number(),
    original_price: model.number().nullable(), // Preço antes de desconto
    discount_pct: model.number().nullable(),

    // Availability
    stock_quantity: model.number().nullable(),
    stock_status: model.enum(["in_stock", "low_stock", "out_of_stock", "unknown"]).default("unknown"),
    lead_time_days: model.number().nullable(),

    // Source tracking
    source_id: model.text(), // ID do produto no sistema do distribuidor
    source_url: model.text().nullable(),
    last_updated_at: model.dateTime(),

    // Distributor info
    distributor_rating: model.number().nullable(), // 0-5
    min_order_quantity: model.number().default(1),

    // Shipping
    shipping_cost: model.number().nullable(),
    free_shipping_threshold: model.number().nullable(),

    // Conditions
    conditions: model.text().nullable(), // "Novo", "Recondicionado", etc.

    metadata: model.json().nullable(),
});
