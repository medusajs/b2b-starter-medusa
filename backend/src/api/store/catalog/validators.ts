import { z } from "zod";

/**
 * Validators para APIs do catálogo unificado
 */

export const StoreGetCatalogSKUsParams = z.object({
    category: z
        .enum([
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
            "other",
        ])
        .optional(),
    manufacturer_id: z.string().optional(),
    min_price: z.coerce.number().positive().optional(),
    max_price: z.coerce.number().positive().optional(),
    search: z.string().optional(),
    limit: z.coerce.number().positive().default(20),
    offset: z.coerce.number().nonnegative().default(0),
});

export type StoreGetCatalogSKUsParamsType = z.infer<
    typeof StoreGetCatalogSKUsParams
>;

export const StoreGetCatalogKitsParams = z.object({
    category: z
        .enum([
            "grid-tie",
            "off-grid",
            "hybrid",
            "backup",
            "commercial",
            "residential",
        ])
        .optional(),
    target_consumer_class: z
        .enum(["residential", "commercial", "industrial", "rural", "public"])
        .optional(),
    min_capacity_kwp: z.coerce.number().positive().optional(),
    max_capacity_kwp: z.coerce.number().positive().optional(),
    min_consumption: z.coerce.number().positive().optional(),
    max_consumption: z.coerce.number().positive().optional(),
    limit: z.coerce.number().positive().default(20),
    offset: z.coerce.number().nonnegative().default(0),
});

export type StoreGetCatalogKitsParamsType = z.infer<
    typeof StoreGetCatalogKitsParams
>;
