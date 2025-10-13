import { model } from "@medusajs/framework/utils";
import { SKU } from "./sku";

export enum StockStatus {
    IN_STOCK = "in_stock",
    LOW_STOCK = "low_stock",
    OUT_OF_STOCK = "out_of_stock",
    UNKNOWN = "unknown",
}

/**
 * DistributorOffer Model
 * Ofertas de distribuidores para cada SKU
 */
export const DistributorOffer = model.define("distributor_offer", {
    id: model.id({ prefix: "doffer" }).primaryKey(),
    sku_id: model.text(),
    distributor_name: model.text().searchable(),
    distributor_slug: model.text(), // Normalized distributor identifier

    // Pricing
    price: model.number(),
    original_price: model.number().nullable(), // Preço antes de desconto
    discount_pct: model.number().nullable(),

    // Availability
    stock_quantity: model.number().nullable(),
    stock_status: model.enum(StockStatus).default(StockStatus.UNKNOWN),
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

    // Relations
    sku: model.belongsTo(() => SKU, {
        mappedBy: "offers",
    }),

    metadata: model.json().nullable(),
}).indexes([
    {
        name: "IDX_offer_sku",
        on: ["sku_id"],
    },
    {
        name: "IDX_offer_distributor",
        on: ["distributor_slug"],
    },
    {
        name: "IDX_offer_sku_distributor",
        on: ["sku_id", "distributor_slug"],
        unique: true, // One offer per SKU per distributor
    },
    {
        name: "IDX_offer_price",
        on: ["price"],
    },
    {
        name: "IDX_offer_stock_status",
        on: ["stock_status"],
    },
]);
