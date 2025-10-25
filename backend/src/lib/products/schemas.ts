"use server";
import "server-only";
import { z } from "zod";

// Base schemas
export const ProductImageSchema = z.object({
    id: z.string(),
    url: z.string().url(),
    alt: z.string(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    size: z.string(),
    isPrimary: z.boolean(),
    order: z.number().int().min(0),
});

export const ProductVariantSchema = z.object({
    id: z.string(),
    name: z.string(),
    sku: z.string(),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    attributes: z.record(z.unknown()),
    isActive: z.boolean(),
});

export const ProductSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Nome do produto é obrigatório"),
    description: z.string(),
    price: z.number().positive("Preço deve ser maior que zero"),
    originalPrice: z.number().positive().optional(),
    currency: z.string().default("BRL"),
    category: z.string().min(1, "Categoria é obrigatória"),
    manufacturer: z.string().min(1, "Fabricante é obrigatório"),
    sku: z.string(),
    stock: z.number().int().min(0),
    images: z.array(ProductImageSchema),
    variants: z.array(ProductVariantSchema),
    specifications: z.record(z.unknown()),
    tags: z.array(z.string()),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// API request/response schemas
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

export const PaginationSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
});

export const ProductSearchRequestSchema = z.object({
    filters: ProductFilterSchema.optional(),
    sort: ProductSortSchema.optional(),
    pagination: PaginationSchema.optional(),
});

export const ProductsApiResponseSchema = z.object({
    products: z.array(ProductSchema),
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    totalPages: z.number().int().min(0),
});

export const ProductApiResponseSchema = z.object({
    product: ProductSchema,
});

// Image processing schemas
export const ImageProcessingOptionsSchema = z.object({
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    quality: z.number().int().min(1).max(100).optional(),
    format: z.enum(['webp', 'jpeg', 'png']).optional(),
    fit: z.enum(['cover', 'contain', 'fill', 'inside', 'outside']).optional(),
});

export const ImageMetadataSchema = z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    size: z.string(),
    format: z.string(),
    url: z.string().url(),
});

export const ImageUploadResultSchema = z.object({
    success: z.boolean(),
    url: z.string().url().optional(),
    metadata: ImageMetadataSchema.optional(),
    error: z.string().optional(),
});

// Bulk operation schemas
export const BulkPriceUpdateSchema = z.object({
    percentage: z.number(),
    productIds: z.array(z.string()).optional(),
    category: z.string().optional(),
});

export const BulkStockUpdateSchema = z.object({
    adjustment: z.number().int(),
    productIds: z.array(z.string()).optional(),
    category: z.string().optional(),
});

export const BulkOperationResultSchema = z.object({
    success: z.boolean(),
    updatedCount: z.number().int().min(0),
    errors: z.array(z.string()).optional(),
});

// Validation result schema
export const ValidationResultSchema = z.object({
    success: z.boolean(),
    errors: z.array(z.string()).optional(),
    warnings: z.array(z.string()).optional(),
});

// CDN configuration schema
export const CDNConfigSchema = z.object({
    baseUrl: z.string().url(),
    bucket: z.string().optional(),
    region: z.string().optional(),
    accessKey: z.string().optional(),
    secretKey: z.string().optional(),
});

// Category schema
export const ProductCategorySchema = z.object({
    id: z.string(),
    name: z.string(),
    count: z.number().int().min(0),
});

export const CategoriesApiResponseSchema = z.object({
    categories: z.array(ProductCategorySchema),
});

// Product creation/update schemas
export const CreateProductSchema = z.object({
    name: z.string().min(1, "Nome do produto é obrigatório"),
    description: z.string().optional(),
    price: z.number().positive("Preço deve ser maior que zero"),
    originalPrice: z.number().positive().optional(),
    currency: z.string().default("BRL"),
    category: z.string().min(1, "Categoria é obrigatória"),
    manufacturer: z.string().min(1, "Fabricante é obrigatório"),
    sku: z.string().optional(),
    stock: z.number().int().min(0).default(0),
    images: z.array(ProductImageSchema).optional(),
    variants: z.array(ProductVariantSchema).optional(),
    specifications: z.record(z.unknown()).optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().default(true),
});

export const UpdateProductSchema = CreateProductSchema.partial();

// Search and filter helper schemas
export const ProductSearchOptionsSchema = z.object({
    filters: ProductFilterSchema.optional(),
    sort: ProductSortSchema.optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional(),
});

// Utility functions for validation
export function validateProductData(data: unknown): z.SafeParseReturnType<unknown, z.infer<typeof CreateProductSchema>> {
    return CreateProductSchema.safeParse(data);
}

export function validateProductUpdate(data: unknown): z.SafeParseReturnType<unknown, z.infer<typeof UpdateProductSchema>> {
    return UpdateProductSchema.safeParse(data);
}

export function validateProductFilters(data: unknown): z.SafeParseReturnType<unknown, z.infer<typeof ProductFilterSchema>> {
    return ProductFilterSchema.safeParse(data);
}

export function validatePagination(data: unknown): z.SafeParseReturnType<unknown, z.infer<typeof PaginationSchema>> {
    return PaginationSchema.safeParse(data);
}

export function validateImageProcessingOptions(data: unknown): z.SafeParseReturnType<unknown, z.infer<typeof ImageProcessingOptionsSchema>> {
    return ImageProcessingOptionsSchema.safeParse(data);
}

export function validateBulkPriceUpdate(data: unknown): z.SafeParseReturnType<unknown, z.infer<typeof BulkPriceUpdateSchema>> {
    return BulkPriceUpdateSchema.safeParse(data);
}

export function validateBulkStockUpdate(data: unknown): z.SafeParseReturnType<unknown, z.infer<typeof BulkStockUpdateSchema>> {
    return BulkStockUpdateSchema.safeParse(data);
}

// Type exports
export type ProductImage = z.infer<typeof ProductImageSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductFilter = z.infer<typeof ProductFilterSchema>;
export type ProductSort = z.infer<typeof ProductSortSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type ProductSearchRequest = z.infer<typeof ProductSearchRequestSchema>;
export type ProductsApiResponse = z.infer<typeof ProductsApiResponseSchema>;
export type ProductApiResponse = z.infer<typeof ProductApiResponseSchema>;
export type ImageProcessingOptions = z.infer<typeof ImageProcessingOptionsSchema>;
export type ImageMetadata = z.infer<typeof ImageMetadataSchema>;
export type ImageUploadResult = z.infer<typeof ImageUploadResultSchema>;
export type BulkPriceUpdate = z.infer<typeof BulkPriceUpdateSchema>;
export type BulkStockUpdate = z.infer<typeof BulkStockUpdateSchema>;
export type BulkOperationResult = z.infer<typeof BulkOperationResultSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
export type CDNConfig = z.infer<typeof CDNConfigSchema>;
export type ProductCategory = z.infer<typeof ProductCategorySchema>;
export type CategoriesApiResponse = z.infer<typeof CategoriesApiResponseSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export type ProductSearchOptions = z.infer<typeof ProductSearchOptionsSchema>;