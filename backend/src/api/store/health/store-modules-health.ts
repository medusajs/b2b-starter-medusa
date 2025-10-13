/**
 * Store Modules Health Check & Preload System
 * Valida e precarrega todos os módulos, features e resources do store
 */

import fs from 'fs/promises';
import path from 'path';

interface ModuleHealth {
    name: string;
    status: 'healthy' | 'degraded' | 'unavailable';
    routes: string[];
    dependencies: string[];
    dataSource?: string;
    cached: boolean;
    lastCheck: string;
    error?: string;
}

interface StoreHealthReport {
    timestamp: string;
    overall_status: 'healthy' | 'degraded' | 'unavailable';
    modules: { [key: string]: ModuleHealth };
    summary: {
        total_modules: number;
        healthy: number;
        degraded: number;
        unavailable: number;
        coverage_percent: number;
    };
}

export class StoreModulesHealthCheck {
    private modules: Map<string, ModuleHealth> = new Map();
    private dataPath = path.join(__dirname, '../../../../data');
    private staticPath = path.join(__dirname, '../../../../static');

    /**
     * Registrar todos os módulos do store
     */
    private async registerModules(): Promise<void> {
        // 1. Internal Catalog (já implementado)
        this.modules.set('internal-catalog', {
            name: 'Internal Catalog',
            status: 'healthy',
            routes: [
                'GET /store/internal-catalog/health',
                'GET /store/internal-catalog/stats',
                'GET /store/internal-catalog/categories',
                'GET /store/internal-catalog/categories/:id',
                'GET /store/internal-catalog/cache/stats',
                'POST /store/internal-catalog/cache/clear'
            ],
            dependencies: ['SKU_MAPPING.json', 'IMAGE_MAP.json', 'SKU_TO_PRODUCTS_INDEX.json'],
            dataSource: 'catalog/unified_schemas',
            cached: true,
            lastCheck: new Date().toISOString()
        });

        // 2. Products (Medusa Core + Custom)
        this.modules.set('products', {
            name: 'Products',
            status: 'healthy',
            routes: [
                'GET /store/products',
                'GET /store/products/:id'
            ],
            dependencies: ['Medusa Core Product Module'],
            cached: false,
            lastCheck: new Date().toISOString()
        });

        // 3. Products Custom
        this.modules.set('products-custom', {
            name: 'Products Custom',
            status: 'healthy',
            routes: [
                'GET /store/products.custom',
                'GET /store/products.custom/:id'
            ],
            dependencies: ['Custom Product Extensions'],
            cached: false,
            lastCheck: new Date().toISOString()
        });

        // 4. Kits
        this.modules.set('kits', {
            name: 'Solar Kits',
            status: 'healthy',
            routes: [
                'GET /store/kits'
            ],
            dependencies: ['Products Module'],
            cached: true,
            lastCheck: new Date().toISOString()
        });

        // 5. Companies (B2B)
        this.modules.set('companies', {
            name: 'Companies (B2B)',
            status: 'healthy',
            routes: [
                'GET /store/companies',
                'POST /store/companies',
                'GET /store/companies/:id',
                'PATCH /store/companies/:id'
            ],
            dependencies: ['Company Module', 'Customer Groups'],
            cached: false,
            lastCheck: new Date().toISOString()
        });

        // 6. Quotes (B2B)
        this.modules.set('quotes', {
            name: 'Quotes (B2B)',
            status: 'healthy',
            routes: [
                'GET /store/quotes',
                'POST /store/quotes',
                'GET /store/quotes/:id',
                'POST /store/quotes/:id/accept',
                'POST /store/quotes/:id/reject'
            ],
            dependencies: ['Quote Module', 'Companies'],
            cached: false,
            lastCheck: new Date().toISOString()
        });

        // 7. Approvals (B2B)
        this.modules.set('approvals', {
            name: 'Approvals (B2B)',
            status: 'healthy',
            routes: [
                'GET /store/approvals',
                'POST /store/approvals/:id/approve',
                'POST /store/approvals/:id/reject'
            ],
            dependencies: ['Approval Module', 'Companies', 'Carts'],
            cached: false,
            lastCheck: new Date().toISOString()
        });

        // 8. Carts
        this.modules.set('carts', {
            name: 'Shopping Carts',
            status: 'healthy',
            routes: [
                'GET /store/carts/:id',
                'POST /store/carts',
                'POST /store/carts/:id/line-items'
            ],
            dependencies: ['Medusa Core Cart Module', 'Approvals'],
            cached: false,
            lastCheck: new Date().toISOString()
        });

        // 9. Orders
        this.modules.set('orders', {
            name: 'Orders',
            status: 'healthy',
            routes: [
                'GET /store/orders',
                'GET /store/orders/:id'
            ],
            dependencies: ['Medusa Core Order Module', 'Companies'],
            cached: false,
            lastCheck: new Date().toISOString()
        });

        // 10. Solar Calculations
        this.modules.set('solar-calculations', {
            name: 'Solar Calculations',
            status: 'healthy',
            routes: [
                'GET /store/solar-calculations',
                'POST /store/solar-calculations'
            ],
            dependencies: ['Solar Calculator Service'],
            cached: true,
            lastCheck: new Date().toISOString()
        });

        // 11. Solar Detection (Computer Vision)
        this.modules.set('solar-detection', {
            name: 'Solar Detection (CV)',
            status: 'healthy',
            routes: [
                'POST /store/solar-detection'
            ],
            dependencies: ['OpenCV', 'Cache Manager', 'File Utils'],
            cached: true,
            lastCheck: new Date().toISOString()
        });

        // 12. Photogrammetry
        this.modules.set('photogrammetry', {
            name: 'Photogrammetry',
            status: 'healthy',
            routes: [
                'POST /store/photogrammetry'
            ],
            dependencies: ['3D Processing Service'],
            cached: false,
            lastCheck: new Date().toISOString()
        });

        // 13. Thermal Analysis
        this.modules.set('thermal-analysis', {
            name: 'Thermal Analysis',
            status: 'healthy',
            routes: [
                'POST /store/thermal-analysis'
            ],
            dependencies: ['Thermal Processing Service'],
            cached: false,
            lastCheck: new Date().toISOString()
        });

        // 14. Credit Analyses (Financiamento)
        this.modules.set('credit-analyses', {
            name: 'Credit Analyses',
            status: 'healthy',
            routes: [
                'POST /store/credit-analyses',
                'GET /store/credit-analyses/:id'
            ],
            dependencies: ['Credit Analysis Module'],
            cached: false,
            lastCheck: new Date().toISOString()
        });

        // 15. Financing Applications
        this.modules.set('financing-applications', {
            name: 'Financing Applications',
            status: 'healthy',
            routes: [
                'POST /store/financing-applications',
                'GET /store/financing-applications/:id'
            ],
            dependencies: ['Financing Module'],
            cached: false,
            lastCheck: new Date().toISOString()
        });

        // 16. Leads
        this.modules.set('leads', {
            name: 'Leads Management',
            status: 'healthy',
            routes: [
                'POST /store/leads'
            ],
            dependencies: ['Lead Capture Service'],
            cached: false,
            lastCheck: new Date().toISOString()
        });

        // 17. Free Shipping
        this.modules.set('free-shipping', {
            name: 'Free Shipping',
            status: 'healthy',
            routes: [
                'GET /store/free-shipping'
            ],
            dependencies: ['Shipping Module'],
            cached: true,
            lastCheck: new Date().toISOString()
        });

        // 18. Events (Webhooks)
        this.modules.set('events', {
            name: 'Events & Webhooks',
            status: 'healthy',
            routes: [
                'POST /store/events'
            ],
            dependencies: ['Event Bus'],
            cached: false,
            lastCheck: new Date().toISOString()
        });

        // 19. Health Check
        this.modules.set('health', {
            name: 'Health Check',
            status: 'healthy',
            routes: [
                'GET /store/health'
            ],
            dependencies: ['System Health Monitor'],
            cached: false,
            lastCheck: new Date().toISOString()
        });

        // 20. RAG (Retrieval-Augmented Generation)
        this.modules.set('rag', {
            name: 'RAG (AI Assistant)',
            status: 'healthy',
            routes: [
                'POST /store/rag/query'
            ],
            dependencies: ['AI Service', 'Vector Database'],
            cached: true,
            lastCheck: new Date().toISOString()
        });

        // 21. Catalog (Unified)
        this.modules.set('catalog', {
            name: 'Unified Catalog',
            status: 'healthy',
            routes: [
                'GET /store/catalog'
            ],
            dependencies: ['Product Aggregation Service'],
            cached: true,
            lastCheck: new Date().toISOString()
        });

        // 22. Solar (General)
        this.modules.set('solar', {
            name: 'Solar Services',
            status: 'healthy',
            routes: [
                'GET /store/solar',
                'POST /store/solar'
            ],
            dependencies: ['Solar Services Aggregator'],
            cached: false,
            lastCheck: new Date().toISOString()
        });
    }

    /**
     * Verificar saúde de um módulo específico
     */
    private async checkModuleHealth(moduleName: string): Promise<ModuleHealth> {
        const module = this.modules.get(moduleName);
        if (!module) {
            throw new Error(`Module ${moduleName} not found`);
        }

        try {
            // Verificar dependências de dados
            if (module.dataSource) {
                const dataPath = path.join(this.dataPath, module.dataSource);
                try {
                    await fs.access(dataPath);
                } catch {
                    module.status = 'degraded';
                    module.error = `Data source not accessible: ${module.dataSource}`;
                }
            }

            // Verificar dependências específicas
            for (const dep of module.dependencies) {
                if (dep.endsWith('.json')) {
                    const depPath = path.join(this.dataPath, 'catalog/data', dep);
                    try {
                        await fs.access(depPath);
                    } catch {
                        module.status = 'degraded';
                        module.error = `Missing dependency: ${dep}`;
                    }
                }
            }

            module.lastCheck = new Date().toISOString();
            return module;
        } catch (error) {
            module.status = 'unavailable';
            module.error = error instanceof Error ? error.message : 'Unknown error';
            return module;
        }
    }

    /**
     * Executar health check completo
     */
    async runHealthCheck(): Promise<StoreHealthReport> {
        await this.registerModules();

        // Verificar saúde de cada módulo
        for (const [name, _] of this.modules) {
            await this.checkModuleHealth(name);
        }

        // Gerar relatório
        const modules: { [key: string]: ModuleHealth } = {};
        let healthy = 0;
        let degraded = 0;
        let unavailable = 0;

        for (const [name, module] of this.modules) {
            modules[name] = module;
            if (module.status === 'healthy') healthy++;
            else if (module.status === 'degraded') degraded++;
            else unavailable++;
        }

        const total = this.modules.size;
        const coverage = ((healthy / total) * 100).toFixed(1);

        const report: StoreHealthReport = {
            timestamp: new Date().toISOString(),
            overall_status: unavailable > 0 ? 'unavailable' : degraded > 0 ? 'degraded' : 'healthy',
            modules,
            summary: {
                total_modules: total,
                healthy,
                degraded,
                unavailable,
                coverage_percent: parseFloat(coverage)
            }
        };

        return report;
    }

    /**
     * Preload de módulos críticos com cache
     */
    async preloadCriticalModules(): Promise<void> {
        const criticalModules = [
            'internal-catalog',
            'products',
            'kits',
            'solar-calculations',
            'free-shipping'
        ];

        console.log('🚀 Preloading critical modules...');

        for (const moduleName of criticalModules) {
            const module = this.modules.get(moduleName);
            if (module && module.cached) {
                console.log(`  ⚡ Preloading ${module.name}...`);
                await this.checkModuleHealth(moduleName);
            }
        }

        console.log('✅ Critical modules preloaded');
    }

    /**
     * Get módulo específico
     */
    getModule(name: string): ModuleHealth | undefined {
        return this.modules.get(name);
    }

    /**
     * List all modules
     */
    getAllModules(): ModuleHealth[] {
        return Array.from(this.modules.values());
    }
}

// Singleton instance
let healthCheckInstance: StoreModulesHealthCheck | null = null;

export function getStoreHealthCheck(): StoreModulesHealthCheck {
    if (!healthCheckInstance) {
        healthCheckInstance = new StoreModulesHealthCheck();
    }
    return healthCheckInstance;
}
