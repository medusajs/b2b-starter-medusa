"use server";
import "server-only";

// Product-related type definitions
export interface ProductImage {
    id: string;
    url: string;
    alt: string;
    width: number;
    height: number;
    size: string;
    isPrimary: boolean;
    order: number;
}

export interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    attributes: Record<string, unknown>;
    isActive: boolean;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    currency: string;
    category: string;
    manufacturer: string;
    sku: string;
    stock: number;
    images: ProductImage[];
    variants: ProductVariant[];
    specifications: Record<string, unknown>;
    tags: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductCategory {
    id: string;
    name: string;
    count: number;
}

// Image-related types
export interface ImageMetadata {
    width: number;
    height: number;
    size: string;
    format: string;
    url: string;
}

export interface ImageProcessingOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface ImageUploadResult {
    success: boolean;
    url?: string;
    metadata?: ImageMetadata;
    error?: string;
}

// API response types
export interface ProductsApiResponse {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ProductApiResponse {
    product: Product;
}

export interface CategoriesApiResponse {
    categories: ProductCategory[];
}

export interface ImagesApiResponse {
    images: ProductImage[];
}

// Filter and search types
export interface ProductFilters {
    category?: string;
    manufacturer?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    search?: string;
}

export type ProductSortOption = 'name' | 'price-asc' | 'price-desc' | 'manufacturer' | 'created-desc' | 'created-asc';

export interface ProductSearchOptions {
    filters?: ProductFilters;
    sort?: ProductSortOption;
    page?: number;
    limit?: number;
}

// Validation types
export interface ValidationResult {
    success: boolean;
    errors?: string[];
    warnings?: string[];
}

// Bulk operation types
export interface BulkPriceUpdate {
    percentage: number;
    productIds?: string[];
    category?: string;
}

export interface BulkStockUpdate {
    adjustment: number;
    productIds?: string[];
    category?: string;
}

export interface BulkOperationResult {
    success: boolean;
    updatedCount: number;
    errors?: string[];
}

// Cache types
export interface ProductCacheEntry {
    product: Product;
    timestamp: number;
    ttl: number;
}

export interface ImageCacheEntry {
    image: ProductImage;
    timestamp: number;
    ttl: number;
}

// CDN types
export interface CDNConfig {
    baseUrl: string;
    bucket?: string;
    region?: string;
    accessKey?: string;
    secretKey?: string;
}

export interface CDNUploadOptions {
    public: boolean;
    metadata?: Record<string, string>;
    cacheControl?: string;
}

// Error types
export class ProductError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500
    ) {
        super(message);
        this.name = 'ProductError';
    }
}

export class ImageError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500
    ) {
        super(message);
        this.name = 'ImageError';
    }
}

// Utility types
export type ProductSummary = Pick<Product, 'id' | 'name' | 'price' | 'category' | 'manufacturer'> & {
    stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
    hasImages: boolean;
    variantCount: number;
};

export type ProductPriceRange = {
    min: number;
    max: number;
};

export type ProductStockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';