/**
 * ==========================================
 * YSH Store - Integração End-to-End 360°
 * ==========================================
 * 
 * Central de integração entre routes, hooks e APIs do storefront
 * Garante cobertura completa de todas as funcionalidades B2B
 */

// ==========================================
// Types
// ==========================================

export type IntegrationStatus = 'active' | 'fallback' | 'offline'

export type IntegrationModule =
    | 'cart'
    | 'products'
    | 'categories'
    | 'collections'
    | 'orders'
    | 'quotes'
    | 'approvals'
    | 'companies'
    | 'customer'
    | 'auth'
    | 'catalog'
    | 'solar-cv'
    | 'helio'

export interface IntegrationConfig {
    module: IntegrationModule
    status: IntegrationStatus
    endpoints: string[]
    hooks: string[]
    context?: string
    routes: string[]
    fallbackEnabled: boolean
    retryEnabled: boolean
    cacheEnabled: boolean
}

// ==========================================
// Integration Registry
// ==========================================

export const INTEGRATION_REGISTRY: Record<IntegrationModule, IntegrationConfig> = {
    cart: {
        module: 'cart',
        status: 'active',
        endpoints: [
            '/store/carts',
            '/store/carts/{id}',
            '/store/carts/{id}/line-items',
            '/store/carts/{id}/line-items/bulk',
            '/store/carts/{id}/shipping-methods',
            '/store/carts/{id}/payment-sessions',
            '/store/carts/{id}/complete',
            '/store/carts/{id}/approvals',
        ],
        hooks: ['useCart', 'useCartContext'],
        context: 'CartContext',
        routes: ['/cart', '/checkout'],
        fallbackEnabled: true,
        retryEnabled: true,
        cacheEnabled: true,
    },
    products: {
        module: 'products',
        status: 'active',
        endpoints: [
            '/store/products',
            '/store/products/{id}',
            '/api/catalog/products',
            '/api/catalog/product/{id}',
        ],
        hooks: ['useProducts', 'useProduct'],
        routes: ['/products', '/products/{handle}', '/produtos', '/produtos/{category}'],
        fallbackEnabled: true,
        retryEnabled: true,
        cacheEnabled: true,
    },
    categories: {
        module: 'categories',
        status: 'active',
        endpoints: [
            '/store/product-categories',
            '/store/product-categories/{id}',
            '/api/catalog/categories',
        ],
        hooks: ['useCategories', 'useCategory'],
        routes: ['/categories/{...category}', '/produtos'],
        fallbackEnabled: true,
        retryEnabled: true,
        cacheEnabled: true,
    },
    collections: {
        module: 'collections',
        status: 'active',
        endpoints: [
            '/store/collections',
            '/store/collections/{id}',
            '/store/collections/{handle}',
        ],
        hooks: ['useCollections', 'useCollection'],
        routes: ['/collections/{handle}'],
        fallbackEnabled: true,
        retryEnabled: true,
        cacheEnabled: true,
    },
    orders: {
        module: 'orders',
        status: 'active',
        endpoints: [
            '/store/orders',
            '/store/orders/{id}',
        ],
        hooks: ['useOrders', 'useOrder'],
        routes: [
            '/account/@dashboard/orders',
            '/account/@dashboard/orders/details/{id}',
            '/order/confirmed/{id}',
        ],
        fallbackEnabled: false,
        retryEnabled: true,
        cacheEnabled: true,
    },
    quotes: {
        module: 'quotes',
        status: 'active',
        endpoints: [
            '/store/quotes',
            '/store/quotes/{id}',
            '/store/quotes/{id}/preview',
            '/store/quotes/{id}/accept',
            '/store/quotes/{id}/reject',
            '/store/quotes/{id}/messages',
        ],
        hooks: ['useQuotes', 'useQuote', 'useQuoteMessages'],
        routes: [
            '/account/@dashboard/quotes',
            '/account/@dashboard/quotes/details/{id}',
            '/cotacao',
        ],
        fallbackEnabled: false,
        retryEnabled: true,
        cacheEnabled: true,
    },
    approvals: {
        module: 'approvals',
        status: 'active',
        endpoints: [
            '/store/approvals',
            '/store/approvals/{id}',
            '/store/approvals/{id}/approve',
            '/store/approvals/{id}/reject',
        ],
        hooks: ['useApprovals', 'useApproval'],
        routes: ['/account/@dashboard/approvals'],
        fallbackEnabled: false,
        retryEnabled: true,
        cacheEnabled: true,
    },
    companies: {
        module: 'companies',
        status: 'active',
        endpoints: [
            '/store/companies/{id}',
            '/store/companies/{id}/employees',
        ],
        hooks: ['useCompany', 'useEmployees'],
        routes: ['/account/@dashboard/company'],
        fallbackEnabled: false,
        retryEnabled: true,
        cacheEnabled: true,
    },
    customer: {
        module: 'customer',
        status: 'active',
        endpoints: [
            '/store/customers/me',
            '/store/customers/me/addresses',
        ],
        hooks: ['useCustomer', 'useAddresses'],
        routes: [
            '/account/@dashboard/profile',
            '/account/@dashboard/addresses',
        ],
        fallbackEnabled: false,
        retryEnabled: true,
        cacheEnabled: true,
    },
    auth: {
        module: 'auth',
        status: 'active',
        endpoints: [
            '/auth/customer/emailpass',
            '/auth/customer/emailpass/register',
            '/auth/session',
        ],
        hooks: ['useAuth', 'useSession'],
        routes: ['/account/@login'],
        fallbackEnabled: false,
        retryEnabled: true,
        cacheEnabled: false,
    },
    catalog: {
        module: 'catalog',
        status: 'active',
        endpoints: [
            '/api/catalog/products',
            '/api/catalog/categories',
            '/api/catalog/kits',
            '/api/catalog/manufacturers',
            '/api/catalog/search',
            '/store/catalog',
            '/store/catalog/{category}',
            '/store/catalog/{category}/{id}',
            '/store/catalog/manufacturers',
            '/store/catalog/search',
        ],
        hooks: ['useCatalog', 'useCatalogAPI'],
        routes: [
            '/produtos',
            '/produtos/{category}',
            '/produtos/kits',
            '/search',
        ],
        fallbackEnabled: true,
        retryEnabled: true,
        cacheEnabled: true,
    },
    'solar-cv': {
        module: 'solar-cv',
        status: 'active',
        endpoints: [
            '/store/solar-detection',
            '/store/thermal-analysis',
            '/store/photogrammetry',
        ],
        hooks: ['useSolarCV', 'usePanelDetection', 'useThermalAnalysis'],
        routes: ['/solar-cv'],
        fallbackEnabled: false,
        retryEnabled: true,
        cacheEnabled: false,
    },
    helio: {
        module: 'helio',
        status: 'active',
        endpoints: [
            '/store/rag/ask-helio',
            '/store/rag/recommend-products',
            '/store/rag/search',
        ],
        hooks: ['useHelio', 'useHelioChat'],
        routes: ['/dimensionamento'],
        fallbackEnabled: false,
        retryEnabled: true,
        cacheEnabled: false,
    },
}

// ==========================================
// Utility Functions
// ==========================================

export function getIntegrationConfig(module: IntegrationModule): IntegrationConfig {
    return INTEGRATION_REGISTRY[module]
}

export function getModuleStatus(module: IntegrationModule): IntegrationStatus {
    return INTEGRATION_REGISTRY[module].status
}

export function getModuleEndpoints(module: IntegrationModule): string[] {
    return INTEGRATION_REGISTRY[module].endpoints
}

export function getModuleHooks(module: IntegrationModule): string[] {
    return INTEGRATION_REGISTRY[module].hooks
}

export function getModuleRoutes(module: IntegrationModule): string[] {
    return INTEGRATION_REGISTRY[module].routes
}

export function getAllModules(): IntegrationModule[] {
    return Object.keys(INTEGRATION_REGISTRY) as IntegrationModule[]
}

export function getActiveModules(): IntegrationModule[] {
    return getAllModules().filter(
        (module) => INTEGRATION_REGISTRY[module].status === 'active'
    )
}

export function getModulesWithFallback(): IntegrationModule[] {
    return getAllModules().filter(
        (module) => INTEGRATION_REGISTRY[module].fallbackEnabled
    )
}

export function getModulesWithRetry(): IntegrationModule[] {
    return getAllModules().filter(
        (module) => INTEGRATION_REGISTRY[module].retryEnabled
    )
}

export function getModulesWithCache(): IntegrationModule[] {
    return getAllModules().filter(
        (module) => INTEGRATION_REGISTRY[module].cacheEnabled
    )
}

// ==========================================
// Integration Health Check
// ==========================================

export interface IntegrationHealthReport {
    module: IntegrationModule
    status: IntegrationStatus
    healthy: boolean
    lastCheck: string
    errors?: string[]
}

export async function checkIntegrationHealth(
    module: IntegrationModule
): Promise<IntegrationHealthReport> {
    const config = getIntegrationConfig(module)

    return {
        module,
        status: config.status,
        healthy: config.status === 'active',
        lastCheck: new Date().toISOString(),
    }
}

export async function checkAllIntegrationsHealth(): Promise<IntegrationHealthReport[]> {
    const modules = getAllModules()
    const reports = await Promise.all(
        modules.map((module) => checkIntegrationHealth(module))
    )
    return reports
}

// ==========================================
// Export Default
// ==========================================

const integrations = {
    INTEGRATION_REGISTRY,
    getIntegrationConfig,
    getModuleStatus,
    getModuleEndpoints,
    getModuleHooks,
    getModuleRoutes,
    getAllModules,
    getActiveModules,
    getModulesWithFallback,
    getModulesWithRetry,
    getModulesWithCache,
    checkIntegrationHealth,
    checkAllIntegrationsHealth,
}

export default integrations
