import { model } from "@medusajs/framework/utils";

export enum KitCategory {
    GRID_TIE = "grid-tie",
    OFF_GRID = "off-grid",
    HYBRID = "hybrid",
    BACKUP = "backup",
    COMMERCIAL = "commercial",
    RESIDENTIAL = "residential",
}

export enum ConsumerClass {
    RESIDENTIAL = "residential",
    COMMERCIAL = "commercial",
    INDUSTRIAL = "industrial",
    RURAL = "rural",
    PUBLIC = "public",
}

export enum InstallationComplexity {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard",
}

/**
 * Kit Model
 * Kits solares pré-configurados com componentes linkados
 */
export const Kit = model.define("kit", {
    id: model.id({ prefix: "kit" }).primaryKey(),
    kit_code: model.text().unique().searchable(),
    name: model.text().searchable(),
    category: model.enum(KitCategory),

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
    installation_complexity: model.enum(InstallationComplexity).default(InstallationComplexity.MEDIUM),
    estimated_installation_hours: model.number().nullable(),

    // Target customer
    target_consumer_class: model.enum(ConsumerClass).nullable(),
    monthly_consumption_kwh_min: model.number().nullable(),
    monthly_consumption_kwh_max: model.number().nullable(),

    // Stats
    mapping_confidence_avg: model.number().nullable(), // 0-100
    is_active: model.boolean().default(true),

    metadata: model.json().nullable(),
}).indexes([
    {
        name: "IDX_kit_code",
        on: ["kit_code"],
        unique: true,
    },
    {
        name: "IDX_kit_category",
        on: ["category"],
    },
    {
        name: "IDX_kit_capacity",
        on: ["system_capacity_kwp"],
    },
    {
        name: "IDX_kit_target_class",
        on: ["target_consumer_class"],
    },
    {
        name: "IDX_kit_consumption_range",
        on: ["monthly_consumption_kwh_min", "monthly_consumption_kwh_max"],
    },
]);
