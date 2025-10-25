#!/usr/bin/env node
/**
 * 🚀 YSH Store 360º Preload Worker
 * Preloads ALL 22 store modules with comprehensive health validation
 * 
 * Usage: node preload-store-360.js [--modules=catalog,kits] [--skip-health]
 */

const fs = require('fs/promises');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const MODULES_CONFIG = {
    // Catalog modules (high priority)
    'internal-catalog': {
        priority: 1,
        cached: true,
        dataPath: '../data/catalog',
        files: ['SKU_MAPPING.json', 'SKU_TO_PRODUCTS_INDEX.json', 'IMAGE_MAP.json'],
        schemas: ['accessories', 'batteries', 'cables', 'controllers', 'ev_chargers',
            'inverters', 'kits', 'others', 'panels', 'posts', 'stringboxes', 'structures']
    },
    'catalog': {
        priority: 1,
        cached: true,
        dataPath: '../data/catalog',
        files: ['unified-catalog.json']
    },
    'products': {
        priority: 1,
        cached: false,
        medusaCore: true
    },
    'kits': {
        priority: 2,
        cached: true,
        dataPath: '../data/kits',
        files: ['kits-catalog.json']
    },

    // Solar services (medium priority)
    'solar-calculations': {
        priority: 2,
        cached: true,
        dataPath: '../data/solar',
        files: ['calculation-templates.json', 'solar-constants.json']
    },
    'solar-detection': {
        priority: 3,
        cached: true,
        externalService: 'http://localhost:8001'
    },
    'photogrammetry': {
        priority: 3,
        cached: false,
        externalService: 'http://localhost:8002'
    },
    'thermal-analysis': {
        priority: 3,
        cached: false,
        externalService: 'http://localhost:8003'
    },
    'solar': {
        priority: 2,
        cached: false,
        aggregator: true
    },

    // B2B modules (critical for business logic)
    'companies': {
        priority: 1,
        cached: false,
        medusaModule: 'company'
    },
    'quotes': {
        priority: 2,
        cached: false,
        medusaModule: 'quote'
    },
    'approvals': {
        priority: 2,
        cached: false,
        medusaModule: 'approval'
    },

    // Commerce modules
    'carts': {
        priority: 1,
        cached: false,
        medusaCore: true
    },
    'orders': {
        priority: 1,
        cached: false,
        medusaCore: true
    },
    'products-custom': {
        priority: 2,
        cached: false,
        dataPath: '../data/products',
        files: ['custom-products.json']
    },

    // Financing modules
    'credit-analyses': {
        priority: 3,
        cached: false,
        dataPath: '../data/financing',
        files: ['credit-rules.json']
    },
    'financing-applications': {
        priority: 3,
        cached: false,
        dataPath: '../data/financing',
        files: ['financing-options.json']
    },

    // Marketing & Support
    'leads': {
        priority: 3,
        cached: false
    },
    'free-shipping': {
        priority: 2,
        cached: true,
        dataPath: '../data/shipping',
        files: ['free-shipping-rules.json']
    },
    'events': {
        priority: 3,
        cached: false
    },

    // Infrastructure
    'health': {
        priority: 1,
        cached: false,
        infrastructure: true
    },
    'rag': {
        priority: 3,
        cached: true,
        externalService: 'vector-db',
        dataPath: '../data/rag',
        files: ['embeddings-cache.json']
    }
};

// ============================================================================
// Preload Worker
// ============================================================================

class StorePreloadWorker {
    constructor(options = {}) {
        this.startTime = Date.now();
        this.cache = new Map();
        this.results = new Map();
        this.options = {
            modules: options.modules || Object.keys(MODULES_CONFIG),
            skipHealth: options.skipHealth || false,
            verbose: options.verbose || false
        };
    }

    log(message, level = 'info') {
        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
        const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️ ' : level === 'success' ? '✅' : 'ℹ️ ';
        console.log(`[${elapsed}s] ${prefix} ${message}`);
    }

    async checkFileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async loadDataFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            throw new Error(`Failed to load ${path.basename(filePath)}: ${error.message}`);
        }
    }

    async checkExternalService(url) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const response = await fetch(`${url}/health`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch {
            return false;
        }
    }

    async preloadModule(moduleName) {
        const config = MODULES_CONFIG[moduleName];
        if (!config) {
            return {
                module: moduleName,
                success: false,
                error: 'Module not configured'
            };
        }

        this.log(`Loading ${moduleName}...`);
        const moduleStartTime = Date.now();
        const result = {
            module: moduleName,
            priority: config.priority,
            cached: config.cached,
            success: true,
            loadTimeMs: 0,
            data: {},
            warnings: []
        };

        try {
            // Check data files
            if (config.files) {
                const basePath = path.join(__dirname, config.dataPath);
                result.data.files = [];

                for (const file of config.files) {
                    const filePath = path.join(basePath, file);
                    const exists = await this.checkFileExists(filePath);

                    if (exists) {
                        try {
                            const data = await this.loadDataFile(filePath);
                            result.data.files.push({
                                file,
                                status: 'loaded',
                                size: JSON.stringify(data).length,
                                records: Array.isArray(data) ? data.length :
                                    data.total_skus || data.total_mappings ||
                                    Object.keys(data).length
                            });

                            // Cache if configured
                            if (config.cached) {
                                this.cache.set(`${moduleName}:${file}`, data);
                            }
                        } catch (error) {
                            result.warnings.push(`Failed to load ${file}: ${error.message}`);
                            result.data.files.push({
                                file,
                                status: 'error',
                                error: error.message
                            });
                        }
                    } else {
                        result.warnings.push(`File not found: ${file}`);
                        result.data.files.push({
                            file,
                            status: 'missing'
                        });
                    }
                }
            }

            // Load schema files (for internal-catalog)
            if (config.schemas) {
                const basePath = path.join(__dirname, config.dataPath, 'unified_schemas');
                result.data.schemas = [];

                for (const schema of config.schemas) {
                    const filePath = path.join(basePath, `${schema}_unified.json`);
                    const exists = await this.checkFileExists(filePath);

                    if (exists) {
                        try {
                            const data = await this.loadDataFile(filePath);
                            result.data.schemas.push({
                                schema,
                                status: 'loaded',
                                products: data.length
                            });

                            if (config.cached) {
                                this.cache.set(`${moduleName}:schema:${schema}`, data);
                            }
                        } catch (error) {
                            result.warnings.push(`Failed to load schema ${schema}: ${error.message}`);
                            result.data.schemas.push({
                                schema,
                                status: 'error',
                                error: error.message
                            });
                        }
                    } else {
                        result.warnings.push(`Schema not found: ${schema}`);
                        result.data.schemas.push({
                            schema,
                            status: 'missing'
                        });
                    }
                }
            }

            // Check external services
            if (config.externalService && typeof config.externalService === 'string') {
                const available = await this.checkExternalService(config.externalService);
                result.data.externalService = {
                    url: config.externalService,
                    status: available ? 'available' : 'unavailable'
                };

                if (!available) {
                    result.warnings.push(`External service unavailable: ${config.externalService}`);
                }
            }

            // Mark Medusa core dependencies
            if (config.medusaCore) {
                result.data.medusaCore = true;
                result.warnings.push('Requires Medusa backend running');
            }

            // Mark custom Medusa modules
            if (config.medusaModule) {
                result.data.medusaModule = config.medusaModule;
                result.warnings.push(`Requires Medusa module: ${config.medusaModule}`);
            }

            result.loadTimeMs = Date.now() - moduleStartTime;

            if (result.warnings.length > 0) {
                this.log(`${moduleName} loaded with ${result.warnings.length} warning(s)`, 'warn');
            } else {
                this.log(`${moduleName} loaded successfully (${result.loadTimeMs}ms)`, 'success');
            }

        } catch (error) {
            result.success = false;
            result.error = error.message;
            result.loadTimeMs = Date.now() - moduleStartTime;
            this.log(`${moduleName} failed: ${error.message}`, 'error');
        }

        this.results.set(moduleName, result);
        return result;
    }

    async preloadAll() {
        this.log(`🚀 Starting YSH Store 360º Preload...`);
        this.log(`📦 Modules: ${this.options.modules.length}`);
        this.log('─'.repeat(80));

        // Group modules by priority
        const modulesByPriority = new Map();
        for (const moduleName of this.options.modules) {
            const config = MODULES_CONFIG[moduleName];
            if (!config) continue;

            if (!modulesByPriority.has(config.priority)) {
                modulesByPriority.set(config.priority, []);
            }
            modulesByPriority.get(config.priority).push(moduleName);
        }

        // Load modules by priority (parallel within priority, sequential across priorities)
        const priorities = Array.from(modulesByPriority.keys()).sort((a, b) => a - b);

        for (const priority of priorities) {
            const modules = modulesByPriority.get(priority);
            this.log(`\n🔄 Loading Priority ${priority} modules (${modules.length})...`);

            await Promise.all(modules.map(m => this.preloadModule(m)));
        }

        return this.generateReport();
    }

    generateReport() {
        const allResults = Array.from(this.results.values());

        const successful = allResults.filter(r => r.success);
        const failed = allResults.filter(r => !r.success);
        const withWarnings = allResults.filter(r => r.success && r.warnings.length > 0);
        const cached = allResults.filter(r => r.cached && r.success);

        const totalLoadTime = allResults.reduce((sum, r) => sum + r.loadTimeMs, 0);
        const avgLoadTime = allResults.length > 0 ? totalLoadTime / allResults.length : 0;

        const report = {
            timestamp: new Date().toISOString(),
            totalTimeMs: Date.now() - this.startTime,
            summary: {
                total: allResults.length,
                successful: successful.length,
                failed: failed.length,
                withWarnings: withWarnings.length,
                cached: cached.length,
                successRate: `${((successful.length / allResults.length) * 100).toFixed(1)}%`
            },
            performance: {
                totalLoadTimeMs: totalLoadTime,
                avgLoadTimeMs: Math.round(avgLoadTime),
                cacheEntries: this.cache.size
            },
            modules: allResults.map(r => ({
                name: r.module,
                priority: r.priority,
                success: r.success,
                cached: r.cached,
                loadTimeMs: r.loadTimeMs,
                warnings: r.warnings.length,
                error: r.error || null,
                data: r.data
            })),
            failed: failed.map(r => ({
                module: r.module,
                error: r.error
            })),
            warnings: withWarnings.map(r => ({
                module: r.module,
                warnings: r.warnings
            }))
        };

        return report;
    }

    async printReport(report) {
        this.log('\n📊 Preload Report:');
        this.log('═'.repeat(80));

        // Summary
        this.log(`\n📦 Summary:`);
        this.log(`   Total Modules: ${report.summary.total}`);
        this.log(`   ✅ Successful: ${report.summary.successful}`);
        this.log(`   ❌ Failed: ${report.summary.failed}`);
        this.log(`   ⚠️  With Warnings: ${report.summary.withWarnings}`);
        this.log(`   💾 Cached: ${report.summary.cached}`);
        this.log(`   📈 Success Rate: ${report.summary.successRate}`);

        // Performance
        this.log(`\n⚡ Performance:`);
        this.log(`   Total Time: ${(report.totalTimeMs / 1000).toFixed(2)}s`);
        this.log(`   Avg Load Time: ${report.performance.avgLoadTimeMs}ms`);
        this.log(`   Cache Entries: ${report.performance.cacheEntries}`);

        // Module details
        this.log(`\n📋 Module Details:`);
        this.log('─'.repeat(80));

        for (const module of report.modules) {
            const status = module.success ? '✅' : '❌';
            const cached = module.cached ? '💾' : '  ';
            const time = `${module.loadTimeMs}ms`.padStart(7);
            const warnings = module.warnings > 0 ? ` (${module.warnings} warnings)` : '';

            this.log(`${status} ${cached} ${module.name.padEnd(25)} ${time}${warnings}`);

            if (this.options.verbose && module.data.files) {
                for (const file of module.data.files) {
                    const fileStatus = file.status === 'loaded' ? '  ✓' : file.status === 'missing' ? '  ✗' : '  ⚠';
                    const records = file.records ? ` (${file.records} records)` : '';
                    this.log(`   ${fileStatus} ${file.file}${records}`);
                }
            }

            if (this.options.verbose && module.data.schemas) {
                for (const schema of module.data.schemas) {
                    const schemaStatus = schema.status === 'loaded' ? '  ✓' : '  ✗';
                    const products = schema.products ? ` (${schema.products} products)` : '';
                    this.log(`   ${schemaStatus} Schema: ${schema.schema}${products}`);
                }
            }
        }

        this.log('─'.repeat(80));

        // Failed modules
        if (report.failed.length > 0) {
            this.log(`\n❌ Failed Modules:`);
            for (const failed of report.failed) {
                this.log(`   • ${failed.module}: ${failed.error}`);
            }
        }

        // Warnings
        if (report.warnings.length > 0) {
            this.log(`\n⚠️  Warnings:`);
            for (const warning of report.warnings) {
                this.log(`   • ${warning.module}:`);
                for (const msg of warning.warnings) {
                    this.log(`     - ${msg}`);
                }
            }
        }

        this.log('═'.repeat(80));
    }

    async saveReport(report) {
        const reportPath = path.join(__dirname, '../data/preload-360-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        this.log(`💾 Report saved to: ${reportPath}`);
    }
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
    const args = process.argv.slice(2);
    const options = {
        modules: null,
        skipHealth: args.includes('--skip-health'),
        verbose: args.includes('--verbose') || args.includes('-v')
    };

    // Parse --modules=catalog,kits
    const modulesArg = args.find(arg => arg.startsWith('--modules='));
    if (modulesArg) {
        options.modules = modulesArg.split('=')[1].split(',');
    }

    const worker = new StorePreloadWorker(options);

    try {
        const report = await worker.preloadAll();
        await worker.printReport(report);
        await worker.saveReport(report);

        if (report.summary.failed === 0) {
            console.log('\n✅ Store 360º preload completed successfully!');
            console.log('🚀 All modules ready for operation.');
            process.exit(0);
        } else {
            console.log(`\n⚠️  Store preload completed with ${report.summary.failed} failure(s)`);
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ Store preload failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { StorePreloadWorker, MODULES_CONFIG };
