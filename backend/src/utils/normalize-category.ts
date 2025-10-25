import { ProductCategory } from "../modules/unified-catalog/models";

/**
 * Mapeamento de categorias heterogêneas para ProductCategory padrão
 */
const CATEGORY_ALIASES: Record<string, ProductCategory> = {
    // Panels / Painéis
    "painel": ProductCategory.PANELS,
    "paineis": ProductCategory.PANELS,
    "painel solar": ProductCategory.PANELS,
    "paineis solares": ProductCategory.PANELS,
    "solar panel": ProductCategory.PANELS,
    "solar panels": ProductCategory.PANELS,
    "módulo": ProductCategory.PANELS,
    "modulo": ProductCategory.PANELS,
    "módulos": ProductCategory.PANELS,
    "modulos": ProductCategory.PANELS,
    "pv module": ProductCategory.PANELS,
    "pv modules": ProductCategory.PANELS,

    // Inverters / Inversores
    "inversor": ProductCategory.INVERTERS,
    "inversores": ProductCategory.INVERTERS,
    "inverter": ProductCategory.INVERTERS,
    "inverters": ProductCategory.INVERTERS,
    "inv": ProductCategory.INVERTERS,
    "string inverter": ProductCategory.INVERTERS,
    "microinverter": ProductCategory.INVERTERS,
    "microinversor": ProductCategory.INVERTERS,

    // Batteries / Baterias
    "bateria": ProductCategory.BATTERIES,
    "baterias": ProductCategory.BATTERIES,
    "battery": ProductCategory.BATTERIES,
    "batteries": ProductCategory.BATTERIES,
    "acumulador": ProductCategory.BATTERIES,
    "acumuladores": ProductCategory.BATTERIES,
    "storage": ProductCategory.BATTERIES,
    "energy storage": ProductCategory.BATTERIES,

    // Charge Controllers / Controladores de Carga
    "controlador": ProductCategory.CHARGE_CONTROLLERS,
    "controladores": ProductCategory.CHARGE_CONTROLLERS,
    "controlador de carga": ProductCategory.CHARGE_CONTROLLERS,
    "charge controller": ProductCategory.CHARGE_CONTROLLERS,
    "mppt": ProductCategory.CHARGE_CONTROLLERS,
    "pwm": ProductCategory.CHARGE_CONTROLLERS,

    // Cables / Cabos
    "cabo": ProductCategory.CABLES,
    "cabos": ProductCategory.CABLES,
    "cable": ProductCategory.CABLES,
    "cables": ProductCategory.CABLES,
    "fio": ProductCategory.CABLES,
    "fios": ProductCategory.CABLES,
    "cabeamento": ProductCategory.CABLES,

    // Connectors / Conectores
    "conector": ProductCategory.CONNECTORS,
    "conectores": ProductCategory.CONNECTORS,
    "connector": ProductCategory.CONNECTORS,
    "connectors": ProductCategory.CONNECTORS,
    "mc4": ProductCategory.CONNECTORS,

    // Structures / Estruturas
    "estrutura": ProductCategory.STRUCTURES,
    "estruturas": ProductCategory.STRUCTURES,
    "structure": ProductCategory.STRUCTURES,
    "structures": ProductCategory.STRUCTURES,
    "suporte": ProductCategory.STRUCTURES,
    "suportes": ProductCategory.STRUCTURES,
    "fixação": ProductCategory.STRUCTURES,
    "fixacao": ProductCategory.STRUCTURES,
    "mounting": ProductCategory.STRUCTURES,
    "racking": ProductCategory.STRUCTURES,

    // Monitoring / Monitoramento
    "monitor": ProductCategory.MONITORING,
    "monitoramento": ProductCategory.MONITORING,
    "monitoring": ProductCategory.MONITORING,
    "datalogger": ProductCategory.MONITORING,
    "medidor": ProductCategory.MONITORING,

    // Protection / Proteção
    "proteção": ProductCategory.PROTECTION,
    "protecao": ProductCategory.PROTECTION,
    "protection": ProductCategory.PROTECTION,
    "disjuntor": ProductCategory.PROTECTION,
    "fusível": ProductCategory.PROTECTION,
    "fusivel": ProductCategory.PROTECTION,
    "dps": ProductCategory.PROTECTION,
    "surge protector": ProductCategory.PROTECTION,

    // Kits
    "kit": ProductCategory.KITS,
    "kits": ProductCategory.KITS,
    "conjunto": ProductCategory.KITS,
    "sistema": ProductCategory.KITS,
    "system": ProductCategory.KITS,

    // Accessories / Acessórios
    "acessório": ProductCategory.ACCESSORIES,
    "acessorio": ProductCategory.ACCESSORIES,
    "acessórios": ProductCategory.ACCESSORIES,
    "acessorios": ProductCategory.ACCESSORIES,
    "accessory": ProductCategory.ACCESSORIES,
    "accessories": ProductCategory.ACCESSORIES,
};

/**
 * Normaliza uma categoria para o padrão ProductCategory
 * 
 * @param category - Categoria heterogênea (pode vir de diferentes fontes)
 * @returns ProductCategory normalizada ou ProductCategory.OTHER se não encontrada
 * 
 * @example
 * normalizeCategory("INVERSOR") // ProductCategory.INVERTERS
 * normalizeCategory("painéis solares") // ProductCategory.PANELS
 * normalizeCategory("Cabo MC4") // ProductCategory.CABLES
 */
export function normalizeCategory(category: string | null | undefined): ProductCategory {
    if (!category) {
        return ProductCategory.OTHER;
    }

    // Normalize input: lowercase, trim, remove special chars
    const normalized = category
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, " ") // Remove special chars
        .replace(/\s+/g, " "); // Normalize spaces

    // Check direct match in aliases
    if (CATEGORY_ALIASES[normalized]) {
        return CATEGORY_ALIASES[normalized];
    }

    // Check if it's already a valid ProductCategory enum value
    if (Object.values(ProductCategory).includes(normalized as ProductCategory)) {
        return normalized as ProductCategory;
    }

    // Try partial match (contains)
    for (const [alias, standardCategory] of Object.entries(CATEGORY_ALIASES)) {
        if (normalized.includes(alias) || alias.includes(normalized)) {
            return standardCategory;
        }
    }

    return ProductCategory.OTHER;
}

/**
 * Normaliza múltiplas categorias em batch
 * 
 * @param categories - Array de categorias heterogêneas
 * @returns Array de ProductCategory normalizadas
 */
export function normalizeCategories(categories: (string | null | undefined)[]): ProductCategory[] {
    return categories.map(cat => normalizeCategory(cat));
}

/**
 * Verifica se uma categoria é válida (não é OTHER)
 * 
 * @param category - Categoria a ser validada
 * @returns true se a categoria foi reconhecida
 */
export function isValidCategory(category: string | null | undefined): boolean {
    return normalizeCategory(category) !== ProductCategory.OTHER;
}

/**
 * Obtém todas as categorias conhecidas (para autocomplete/sugestões)
 * 
 * @returns Array de ProductCategory válidas
 */
export function getAllCategories(): ProductCategory[] {
    return Object.values(ProductCategory).filter(cat => cat !== ProductCategory.OTHER);
}

/**
 * Obtém aliases para uma categoria (útil para busca)
 * 
 * @param category - ProductCategory padrão
 * @returns Array de aliases conhecidos
 */
export function getCategoryAliases(category: ProductCategory): string[] {
    return Object.entries(CATEGORY_ALIASES)
        .filter(([_, cat]) => cat === category)
        .map(([alias]) => alias);
}
