// src/lib/http.ts

/**
 * 🌐 YSH HTTP Client - Data Layer
 * Centralized API client with authentication, adapters, and error handling
 */

import { httpClient, HttpClientConfig, FetchResult } from '../../../packages/shared/src/http-client';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = (globalThis as any).process?.env?.NEXT_PUBLIC_API_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY = (globalThis as any).process?.env?.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

// Default config for all requests
const DEFAULT_CONFIG: HttpClientConfig = {
    timeoutMs: 30000,
    retries: 3,
    headers: {
        ...(PUBLISHABLE_KEY && { 'x-publishable-api-key': PUBLISHABLE_KEY }),
    },
};

// ============================================================================
// Request Interceptors
// ============================================================================

function createAuthenticatedConfig(config?: HttpClientConfig): HttpClientConfig {
    return {
        ...DEFAULT_CONFIG,
        ...config,
        headers: {
            ...DEFAULT_CONFIG.headers,
            ...config?.headers,
        },
    };
}

// ============================================================================
// Response Adapters - Normalize Legacy API Responses
// ============================================================================

/**
 * Product Adapter - Normalize old product format to new interface
 */
export function adaptProduct(legacyProduct: any) {
    return {
        id: legacyProduct.id,
        title: legacyProduct.title || legacyProduct.name,
        description: legacyProduct.description,
        handle: legacyProduct.handle,
        status: legacyProduct.status,
        thumbnail: legacyProduct.thumbnail,
        images: legacyProduct.images || [],
        variants: legacyProduct.variants?.map(adaptProductVariant) || [],
        categories: legacyProduct.categories || [],
        tags: legacyProduct.tags || [],
        metadata: legacyProduct.metadata || {},
        created_at: legacyProduct.created_at,
        updated_at: legacyProduct.updated_at,
    };
}

/**
 * Product Variant Adapter
 */
export function adaptProductVariant(legacyVariant: any) {
    return {
        id: legacyVariant.id,
        title: legacyVariant.title,
        sku: legacyVariant.sku,
        prices: legacyVariant.prices?.map(adaptPrice) || [],
        inventory_quantity: legacyVariant.inventory_quantity,
        allow_backorder: legacyVariant.allow_backorder,
        manage_inventory: legacyVariant.manage_inventory,
        metadata: legacyVariant.metadata || {},
    };
}

/**
 * Price Adapter
 */
export function adaptPrice(legacyPrice: any) {
    return {
        id: legacyPrice.id,
        currency_code: legacyPrice.currency_code,
        amount: legacyPrice.amount,
        price_list_id: legacyPrice.price_list_id,
        min_quantity: legacyPrice.min_quantity,
        max_quantity: legacyPrice.max_quantity,
    };
}

/**
 * Cart Adapter
 */
export function adaptCart(legacyCart: any) {
    return {
        id: legacyCart.id,
        type: legacyCart.type,
        region_id: legacyCart.region_id,
        customer_id: legacyCart.customer_id,
        items: legacyCart.items?.map(adaptCartItem) || [],
        subtotal: legacyCart.subtotal,
        tax_total: legacyCart.tax_total,
        total: legacyCart.total,
        shipping_total: legacyCart.shipping_total,
        discount_total: legacyCart.discount_total,
        metadata: legacyCart.metadata || {},
    };
}

/**
 * Cart Item Adapter
 */
export function adaptCartItem(legacyItem: any) {
    return {
        id: legacyItem.id,
        cart_id: legacyItem.cart_id,
        variant_id: legacyItem.variant_id,
        quantity: legacyItem.quantity,
        unit_price: legacyItem.unit_price,
        total_price: legacyItem.total_price,
        variant: legacyItem.variant ? adaptProductVariant(legacyItem.variant) : null,
        metadata: legacyItem.metadata || {},
    };
}

// ============================================================================
// API Client Methods
// ============================================================================

export class YSHApiClient {
    private static instance: YSHApiClient;

    static getInstance(): YSHApiClient {
        if (!YSHApiClient.instance) {
            YSHApiClient.instance = new YSHApiClient();
        }
        return YSHApiClient.instance;
    }

    // ============================================================================
    // Products
    // ============================================================================

    async getProducts(params?: {
        limit?: number;
        offset?: number;
        category_id?: string;
        tags?: string[];
        search?: string;
    }): Promise<FetchResult<any[]>> {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.set('limit', params.limit.toString());
        if (params?.offset) queryParams.set('offset', params.offset.toString());
        if (params?.category_id) queryParams.set('category_id', params.category_id);
        if (params?.tags?.length) queryParams.set('tags', params.tags.join(','));
        if (params?.search) queryParams.set('q', params.search);

        const result = await httpClient.get<any>(
            `/store/products?${queryParams.toString()}`,
            createAuthenticatedConfig()
        );

        if (result.data?.products) {
            result.data.products = result.data.products.map(adaptProduct);
        }

        return result;
    }

    async getProduct(id: string): Promise<FetchResult<any>> {
        const result = await httpClient.get<any>(
            `/store/products/${id}`,
            createAuthenticatedConfig()
        );

        if (result.data?.product) {
            result.data.product = adaptProduct(result.data.product);
        }

        return result;
    }

    // ============================================================================
    // Cart
    // ============================================================================

    async createCart(regionId?: string): Promise<FetchResult<any>> {
        const result = await httpClient.post<any>(
            '/store/carts',
            regionId ? { region_id: regionId } : {},
            createAuthenticatedConfig()
        );

        if (result.data?.cart) {
            result.data.cart = adaptCart(result.data.cart);
        }

        return result;
    }

    async getCart(cartId: string): Promise<FetchResult<any>> {
        const result = await httpClient.get<any>(
            `/store/carts/${cartId}`,
            createAuthenticatedConfig()
        );

        if (result.data?.cart) {
            result.data.cart = adaptCart(result.data.cart);
        }

        return result;
    }

    async addToCart(cartId: string, variantId: string, quantity: number): Promise<FetchResult<any>> {
        const result = await httpClient.post<any>(
            `/store/carts/${cartId}/line-items`,
            { variant_id: variantId, quantity },
            createAuthenticatedConfig()
        );

        if (result.data?.cart) {
            result.data.cart = adaptCart(result.data.cart);
        }

        return result;
    }

    // ============================================================================
    // B2B Features
    // ============================================================================

    async getCompanies(): Promise<FetchResult<any[]>> {
        return httpClient.get<any[]>(
            '/store/companies',
            createAuthenticatedConfig()
        );
    }

    async getQuotes(): Promise<FetchResult<any[]>> {
        return httpClient.get<any[]>(
            '/store/quotes',
            createAuthenticatedConfig()
        );
    }

    async getApprovals(): Promise<FetchResult<any[]>> {
        return httpClient.get<any[]>(
            '/store/approvals',
            createAuthenticatedConfig()
        );
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const yshApi = YSHApiClient.getInstance();

// ============================================================================
// Legacy Compatibility - Direct fetcher replacement
// ============================================================================

/**
 * Legacy fetcher replacement - maintains same interface
 * but uses new HTTP client with adapters underneath
 */
export async function fetcher(path: string, init?: RequestInit): Promise<any> {
    try {
        const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
        const result = await httpClient.get<any>(url, {
            ...createAuthenticatedConfig(),
            ...init,
        });
        return result.data;
    } catch (error: any) {
        throw new Error(`API ${path} -> ${error.status || 500}: ${error.message}`);
    }
}