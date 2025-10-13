"use server";
import "server-only";
import { z } from "zod";
import type { Product, ProductCategory, ProductImage, ProductVariant } from "@/lib/products/types";

// Zod schemas for validation
export const ProductFilterSchema = z.object({
    category: z.string().optional(),
    manufacturer: z.string().optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    inStock: z.boolean().optional(),
    search: z.string().optional(),
});

export const ProductSortSchema = z.enum([
    "name",
    "price-asc",
    "price-desc",
    "manufacturer",
    "created-desc",
    "created-asc"
]);

export type ProductFilter = z.infer<typeof ProductFilterSchema>;
export type ProductSort = z.infer<typeof ProductSortSchema>;

// Product categories mapping
export const PRODUCT_CATEGORIES = {
    ACCESSORIES: 'accessories',
    BATTERIES: 'batteries',
    CABLES: 'cables',
    CONTROLLERS: 'controllers',
    EV_CHARGERS: 'ev_chargers',
    INVERTERS: 'inverters',
    KITS: 'kits',
    OTHERS: 'others',
    PANELS: 'panels',
    POSTS: 'posts',
    STRINGBOXES: 'stringboxes',
    STRUCTURES: 'structures'
} as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[keyof typeof PRODUCT_CATEGORIES];

// Validate product category
export const isValidCategory = (category: string): category is ProductCategory => {
    return Object.values(PRODUCT_CATEGORIES).includes(category as ProductCategory);
};

// Get category display name
export const getCategoryDisplayName = (category: ProductCategory): string => {
    const displayNames: Record<ProductCategory, string> = {
        accessories: 'Acessórios',
        batteries: 'Baterias',
        cables: 'Cabos',
        controllers: 'Controladores',
        ev_chargers: 'Carregadores EV',
        inverters: 'Inversores',
        kits: 'Kits',
        others: 'Outros',
        panels: 'Painéis',
        posts: 'Postes',
        stringboxes: 'String Boxes',
        structures: 'Estruturas'
    };
    return displayNames[category] || category;
};

// Parse price string to number
export const parsePrice = (price?: string): number | undefined => {
    if (!price) return undefined;

    // Remove currency symbols and extra spaces
    const cleaned = price
        .replace(/[^\d.,]/g, '')
        .replace(/\s+/g, '')
        .trim();

    // Handle Brazilian format (comma as decimal separator)
    if (cleaned.includes(',')) {
        // Remove dots used as thousand separators
        const withoutThousands = cleaned.replace(/\./g, '');
        // Replace comma with dot for decimal
        const normalized = withoutThousands.replace(',', '.');
        const num = parseFloat(normalized);
        return isNaN(num) ? undefined : num;
    }

    // Handle standard format
    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
};

// Format price for display
export const formatPrice = (price?: number): string => {
    if (price === undefined || price === null) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(price);
};

// Extract manufacturer from product data
export const extractManufacturer = (product: Record<string, unknown>): string | undefined => {
    if (typeof product.manufacturer === 'string') {
        return product.manufacturer;
    }

    if (typeof product.manufacturer === 'object' && product.manufacturer?.name) {
        return product.manufacturer.name;
    }

    // Try to extract from name or model
    const name = product.name || product.model || '';
    const commonManufacturers = [
        'DEYE', 'Growatt', 'SMA', 'Fronius', 'ABB', 'Huawei',
        'Canadian Solar', 'Jinko', 'Trina', 'JA Solar', 'BYD',
        'WEG', 'Schneider', 'Eaton', 'Neosolar', 'OdeX'
    ];

    for (const manufacturer of commonManufacturers) {
        if (name.toUpperCase().includes(manufacturer.toUpperCase())) {
            return manufacturer;
        }
    }

    return undefined;
};

// Product normalization utilities
export function normalizeProduct(product: any): Product {
    return {
        id: product.id || product.product_id,
        name: product.name || product.product_name,
        description: product.description || "",
        price: typeof product.price === "number" ? product.price : parseFloat(product.price) || 0,
        originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
        currency: product.currency || "BRL",
        category: product.category || product.category_name,
        manufacturer: product.manufacturer || product.brand,
        sku: product.sku || product.product_sku,
        stock: typeof product.stock === "number" ? product.stock : parseInt(product.stock) || 0,
        images: normalizeProductImages(product.images || []),
        variants: normalizeProductVariants(product.variants || []),
        specifications: product.specifications || {},
        tags: Array.isArray(product.tags) ? product.tags : [],
        isActive: product.is_active !== false,
        createdAt: product.created_at ? new Date(product.created_at) : new Date(),
        updatedAt: product.updated_at ? new Date(product.updated_at) : new Date(),
    };
}

export function normalizeProductImages(images: any[]): ProductImage[] {
    return images.map(img => ({
        id: img.id || img.image_id,
        url: img.url || img.image_url,
        alt: img.alt || img.alt_text || "",
        width: img.width || 800,
        height: img.height || 600,
        size: img.size || "medium",
        isPrimary: img.is_primary || false,
        order: img.order || 0,
    }));
}

export function normalizeProductVariants(variants: any[]): ProductVariant[] {
    return variants.map(variant => ({
        id: variant.id || variant.variant_id,
        name: variant.name || variant.variant_name,
        sku: variant.sku || variant.variant_sku,
        price: typeof variant.price === "number" ? variant.price : parseFloat(variant.price) || 0,
        stock: typeof variant.stock === "number" ? variant.stock : parseInt(variant.stock) || 0,
        attributes: variant.attributes || {},
        isActive: variant.is_active !== false,
    }));
}

// Filtering utilities
export function filterProducts(products: Product[], filters: ProductFilter): Product[] {
    return products.filter(product => {
        if (filters.category && product.category !== filters.category) return false;
        if (filters.manufacturer && product.manufacturer !== filters.manufacturer) return false;
        if (filters.minPrice !== undefined && product.price < filters.minPrice) return false;
        if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false;
        if (filters.inStock && product.stock <= 0) return false;
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            const searchableText = `${product.name} ${product.description} ${product.manufacturer}`.toLowerCase();
            if (!searchableText.includes(searchTerm)) return false;
        }
        return true;
    });
}

// Sorting utilities
export function sortProducts(products: Product[], sortBy: ProductSort): Product[] {
    return [...products].sort((a, b) => {
        switch (sortBy) {
            case "name":
                return a.name.localeCompare(b.name);
            case "price-asc":
                return a.price - b.price;
            case "price-desc":
                return b.price - a.price;
            case "manufacturer":
                return a.manufacturer.localeCompare(b.manufacturer);
            case "created-desc":
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case "created-asc":
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            default:
                return 0;
        }
    });
}

// Pagination utilities
export function paginateProducts(
    products: Product[],
    page: number = 1,
    limit: number = 20
): { products: Product[]; total: number; page: number; limit: number; totalPages: number } {
    const total = products.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
        products: products.slice(startIndex, endIndex),
        total,
        page,
        limit,
        totalPages,
    };
}

// Search utilities
export function searchProducts(products: Product[], query: string): Product[] {
    if (!query.trim()) return products;

    const searchTerm = query.toLowerCase().trim();
    return products.filter(product => {
        const searchableFields = [
            product.name,
            product.description,
            product.manufacturer,
            product.category,
            product.sku,
            ...product.tags,
        ].filter(Boolean);

        return searchableFields.some(field =>
            field.toLowerCase().includes(searchTerm)
        );
    });
}

// Category utilities
export function getUniqueCategories(products: Product[]): ProductCategory[] {
    const categories = new Set(products.map(p => p.category));
    return Array.from(categories).map(category => ({
        id: category.toLowerCase().replace(/\s+/g, "-"),
        name: category,
        count: products.filter(p => p.category === category).length,
    }));
}

export function getUniqueManufacturers(products: Product[]): string[] {
    const manufacturers = new Set(products.map(p => p.manufacturer));
    return Array.from(manufacturers).sort();
}

// Price utilities
export function getPriceRange(products: Product[]): { min: number; max: number } {
    if (products.length === 0) return { min: 0, max: 0 };

    const prices = products.map(p => p.price);
    return {
        min: Math.min(...prices),
        max: Math.max(...prices),
    };
}

// Stock utilities
export function getStockStatus(product: Product): "in-stock" | "low-stock" | "out-of-stock" {
    if (product.stock <= 0) return "out-of-stock";
    if (product.stock <= 5) return "low-stock";
    return "in-stock";
}

export function getTotalStockValue(products: Product[]): number {
    return products.reduce((total, product) => total + (product.price * product.stock), 0);
}

// Image utilities
export function getPrimaryImage(product: Product): ProductImage | undefined {
    return product.images.find(img => img.isPrimary) || product.images[0];
}

export function getImageBySize(product: Product, size: string): ProductImage | undefined {
    return product.images.find(img => img.size === size) || getPrimaryImage(product);
}

// Validation utilities
export function validateProductData(data: any): { success: boolean; errors?: string[] } {
    try {
        // Basic validation
        if (!data.name || typeof data.name !== "string") {
            return { success: false, errors: ["Product name is required and must be a string"] };
        }
        if (!data.price || typeof data.price !== "number" || data.price < 0) {
            return { success: false, errors: ["Product price is required and must be a positive number"] };
        }
        if (!data.category || typeof data.category !== "string") {
            return { success: false, errors: ["Product category is required and must be a string"] };
        }
        return { success: true };
    } catch (error) {
        return { success: false, errors: ["Invalid product data format"] };
    }
}

// Utility for creating product summaries
export function createProductSummary(product: Product): {
    id: string;
    name: string;
    price: number;
    category: string;
    manufacturer: string;
    stockStatus: string;
    hasImages: boolean;
    variantCount: number;
} {
    return {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        manufacturer: product.manufacturer,
        stockStatus: getStockStatus(product),
        hasImages: product.images.length > 0,
        variantCount: product.variants.length,
    };
}

// Bulk operations utilities
export function bulkUpdatePrices(products: Product[], percentage: number): Product[] {
    return products.map(product => ({
        ...product,
        price: Math.round(product.price * (1 + percentage / 100) * 100) / 100,
        updatedAt: new Date(),
    }));
}

export function bulkUpdateStock(products: Product[], adjustment: number): Product[] {
    return products.map(product => ({
        ...product,
        stock: Math.max(0, product.stock + adjustment),
        updatedAt: new Date(),
    }));
}
