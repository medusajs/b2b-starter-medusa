#!/usr/bin/env node
/**
 * 🔍 YSH Store 360º Validation Script
 * Validates all 22 store modules without requiring live backend
 * 
 * Usage: node validate-store-360.js [--module=internal-catalog] [--verbose]
 */

const fs = require('fs/promises');
const path = require('path');

// ============================================================================
// Module Validation Rules
// ============================================================================

const VALIDATION_RULES = {
    'internal-catalog': {
        endpoints: [
            { method: 'GET', path: '/store/internal-catalog/health', expected: { status: 'healthy' } },
            { method: 'GET', path: '/store/internal-catalog/stats', expectedKeys: ['total_products', 'categories'] },
            { method: 'GET', path: '/store/internal-catalog/categories', expectedArray: true },
            { method: 'GET', path: '/store/internal-catalog/sku/:sku', requiresParam: 'sku' },
            { method: 'GET', path: '/store/internal-catalog/search', requiresQuery: 'q' },
            { method: 'POST', path: '/store/internal-catalog/batch-search', requiresBody: true }
        ],
        dataFiles: [
            '../data/catalog/data/SKU_MAPPING.json',
            '../data/catalog/data/SKU_TO_PRODUCTS_INDEX.json',
            '../static/images-catálogo_distribuidores/IMAGE_MAP.json'
        ],
        cached: true
    },

    'catalog': {
        endpoints: [
            { method: 'GET', path: '/store/catalog', expectedArray: true }
        ],
        dataFiles: ['../data/catalog/unified-catalog.json'],
        cached: true
    },

    'products': {
        endpoints: [
            { method: 'GET', path: '/store/products', expectedArray: true },
            { method: 'GET', path: '/store/products/:id', requiresParam: 'id' }
        ],
        medusaCore: true
    },

    'products-custom': {
        endpoints: [
            { method: 'GET', path: '/store/products-custom', expectedArray: true },
            { method: 'POST', path: '/store/products-custom', requiresBody: true }
        ],
        dataFiles: ['../data/products/custom-products.json']
    },

    'kits': {
        endpoints: [
            { method: 'GET', path: '/store/kits', expectedArray: true }
        ],
        dataFiles: ['../data/kits/kits-catalog.json'],
        cached: true,
        dependencies: ['products']
    },

    'companies': {
        endpoints: [
            { method: 'GET', path: '/store/companies', expectedArray: true },
            { method: 'POST', path: '/store/companies', requiresBody: true },
            { method: 'GET', path: '/store/companies/:id', requiresParam: 'id' },
            { method: 'PATCH', path: '/store/companies/:id', requiresParam: 'id', requiresBody: true }
        ],
        medusaModule: 'company',
        dependencies: ['customer-groups']
    },

    'quotes': {
        endpoints: [
            { method: 'GET', path: '/store/quotes', expectedArray: true },
            { method: 'POST', path: '/store/quotes', requiresBody: true },
            { method: 'GET', path: '/store/quotes/:id', requiresParam: 'id' },
            { method: 'POST', path: '/store/quotes/:id/accept', requiresParam: 'id' },
            { method: 'POST', path: '/store/quotes/:id/reject', requiresParam: 'id' }
        ],
        medusaModule: 'quote',
        dependencies: ['companies', 'carts']
    },

    'approvals': {
        endpoints: [
            { method: 'GET', path: '/store/approvals', expectedArray: true },
            { method: 'POST', path: '/store/approvals/:id/approve', requiresParam: 'id' },
            { method: 'POST', path: '/store/approvals/:id/reject', requiresParam: 'id' }
        ],
        medusaModule: 'approval',
        dependencies: ['companies', 'carts']
    },

    'carts': {
        endpoints: [
            { method: 'GET', path: '/store/carts/:id', requiresParam: 'id' },
            { method: 'POST', path: '/store/carts', requiresBody: true },
            { method: 'POST', path: '/store/carts/:id/complete', requiresParam: 'id' }
        ],
        medusaCore: true,
        dependencies: ['approvals']
    },

    'orders': {
        endpoints: [
            { method: 'GET', path: '/store/orders', expectedArray: true },
            { method: 'GET', path: '/store/orders/:id', requiresParam: 'id' }
        ],
        medusaCore: true,
        dependencies: ['companies']
    },

    'solar-calculations': {
        endpoints: [
            { method: 'GET', path: '/store/solar-calculations/templates', expectedArray: true },
            { method: 'POST', path: '/store/solar-calculations', requiresBody: true }
        ],
        dataFiles: ['../data/solar/calculation-templates.json', '../data/solar/solar-constants.json'],
        cached: true
    },

    'solar-detection': {
        endpoints: [
            { method: 'POST', path: '/store/solar-detection', requiresBody: true }
        ],
        externalService: 'http://localhost:8001',
        cached: true
    },

    'photogrammetry': {
        endpoints: [
            { method: 'POST', path: '/store/photogrammetry', requiresBody: true }
        ],
        externalService: 'http://localhost:8002'
    },

    'thermal-analysis': {
        endpoints: [
            { method: 'POST', path: '/store/thermal-analysis', requiresBody: true }
        ],
        externalService: 'http://localhost:8003'
    },

    'solar': {
        endpoints: [
            { method: 'GET', path: '/store/solar/services', expectedArray: true },
            { method: 'POST', path: '/store/solar/analyze', requiresBody: true }
        ],
        aggregator: true,
        dependencies: ['solar-detection', 'photogrammetry', 'thermal-analysis']
    },

    'credit-analyses': {
        endpoints: [
            { method: 'POST', path: '/store/credit-analyses', requiresBody: true },
            { method: 'GET', path: '/store/credit-analyses/:id', requiresParam: 'id' }
        ],
        dataFiles: ['../data/financing/credit-rules.json']
    },

    'financing-applications': {
        endpoints: [
            { method: 'POST', path: '/store/financing-applications', requiresBody: true },
            { method: 'GET', path: '/store/financing-applications/:id', requiresParam: 'id' }
        ],
        dataFiles: ['../data/financing/financing-options.json'],
        dependencies: ['credit-analyses']
    },

    'leads': {
        endpoints: [
            { method: 'POST', path: '/store/leads', requiresBody: true }
        ]
    },

    'free-shipping': {
        endpoints: [
            { method: 'GET', path: '/store/free-shipping/check', requiresQuery: 'postal_code' }
        ],
        dataFiles: ['../data/shipping/free-shipping-rules.json'],
        cached: true
    },

    'events': {
        endpoints: [
            { method: 'POST', path: '/store/events', requiresBody: true }
        ]
    },

    'health': {
        endpoints: [
            { method: 'GET', path: '/store/health', expected: { overall_status: ['healthy', 'degraded', 'unavailable'] } }
        ],
        infrastructure: true
    },

    'rag': {
        endpoints: [
            { method: 'POST', path: '/store/rag/query', requiresBody: true }
        ],
        externalService: 'vector-db',
        dataFiles: ['../data/rag/embeddings-cache.json'],
        cached: true
    }
};

// ============================================================================
// Validator
// ============================================================================

class StoreValidator {
    constructor(options = {}) {
        this.startTime = Date.now();
        this.options = {
            module: options.module || null,
            verbose: options.verbose || false
        };
        this.results = [];
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

    async validateDataFiles(moduleName, dataFiles) {
        const results = [];

        for (const file of dataFiles) {
            const filePath = path.join(__dirname, file);
            const exists = await this.checkFileExists(filePath);

            if (exists) {
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    const data = JSON.parse(content);

                    results.push({
                        file: path.basename(file),
                        status: 'valid',
                        size: content.length,
                        records: Array.isArray(data) ? data.length :
                            data.total_skus || data.total_mappings ||
                            Object.keys(data).length
                    });
                } catch (error) {
                    results.push({
                        file: path.basename(file),
                        status: 'invalid',
                        error: error.message
                    });
                }
            } else {
                results.push({
                    file: path.basename(file),
                    status: 'missing'
                });
            }
        }

        return results;
    }

    async validateEndpoints(moduleName, endpoints) {
        const results = [];

        for (const endpoint of endpoints) {
            const validation = {
                method: endpoint.method,
                path: endpoint.path,
                status: 'configured',
                checks: []
            };

            // Check if path has required parameters
            if (endpoint.requiresParam) {
                validation.checks.push({
                    type: 'param',
                    param: endpoint.requiresParam,
                    status: 'required'
                });
            }

            // Check if requires query params
            if (endpoint.requiresQuery) {
                validation.checks.push({
                    type: 'query',
                    param: endpoint.requiresQuery,
                    status: 'required'
                });
            }

            // Check if requires body
            if (endpoint.requiresBody) {
                validation.checks.push({
                    type: 'body',
                    status: 'required'
                });
            }

            // Check expected response structure
            if (endpoint.expectedArray) {
                validation.checks.push({
                    type: 'response',
                    format: 'array',
                    status: 'expected'
                });
            }

            if (endpoint.expectedKeys) {
                validation.checks.push({
                    type: 'response',
                    format: 'object',
                    keys: endpoint.expectedKeys,
                    status: 'expected'
                });
            }

            if (endpoint.expected) {
                validation.checks.push({
                    type: 'response',
                    format: 'specific',
                    expected: endpoint.expected,
                    status: 'expected'
                });
            }

            results.push(validation);
        }

        return results;
    }

    async validateDependencies(moduleName, dependencies) {
        const results = [];

        for (const dep of dependencies) {
            // Check if dependency module exists in validation rules
            const depExists = VALIDATION_RULES.hasOwnProperty(dep);

            results.push({
                module: dep,
                status: depExists ? 'available' : 'unknown'
            });
        }

        return results;
    }

    async validateModule(moduleName) {
        const rules = VALIDATION_RULES[moduleName];
        if (!rules) {
            return {
                module: moduleName,
                success: false,
                error: 'No validation rules defined'
            };
        }

        this.log(`Validating ${moduleName}...`);
        const moduleStartTime = Date.now();

        const result = {
            module: moduleName,
            success: true,
            validationTimeMs: 0,
            validations: {},
            warnings: [],
            errors: []
        };

        try {
            // Validate data files
            if (rules.dataFiles) {
                const dataValidation = await this.validateDataFiles(moduleName, rules.dataFiles);
                result.validations.dataFiles = dataValidation;

                const missing = dataValidation.filter(f => f.status === 'missing');
                const invalid = dataValidation.filter(f => f.status === 'invalid');

                if (missing.length > 0) {
                    result.warnings.push(`${missing.length} data file(s) missing`);
                }
                if (invalid.length > 0) {
                    result.errors.push(`${invalid.length} data file(s) invalid`);
                }
            }

            // Validate endpoints
            if (rules.endpoints) {
                const endpointValidation = await this.validateEndpoints(moduleName, rules.endpoints);
                result.validations.endpoints = endpointValidation;
            }

            // Validate dependencies
            if (rules.dependencies) {
                const depValidation = await this.validateDependencies(moduleName, rules.dependencies);
                result.validations.dependencies = depValidation;

                const unknown = depValidation.filter(d => d.status === 'unknown');
                if (unknown.length > 0) {
                    result.warnings.push(`${unknown.length} unknown dependencies`);
                }
            }

            // Check external services
            if (rules.externalService) {
                result.validations.externalService = {
                    service: rules.externalService,
                    status: 'not_tested' // Would need live backend to test
                };
                result.warnings.push('External service not tested (requires live backend)');
            }

            // Check Medusa dependencies
            if (rules.medusaCore) {
                result.validations.medusaCore = true;
                result.warnings.push('Requires Medusa core (not tested)');
            }

            if (rules.medusaModule) {
                result.validations.medusaModule = rules.medusaModule;
                result.warnings.push(`Requires Medusa module: ${rules.medusaModule} (not tested)`);
            }

            // Mark special modules
            if (rules.cached) {
                result.validations.cached = true;
            }

            if (rules.aggregator) {
                result.validations.aggregator = true;
            }

            if (rules.infrastructure) {
                result.validations.infrastructure = true;
            }

            result.validationTimeMs = Date.now() - moduleStartTime;

            if (result.errors.length > 0) {
                result.success = false;
                this.log(`${moduleName} validation failed with ${result.errors.length} error(s)`, 'error');
            } else if (result.warnings.length > 0) {
                this.log(`${moduleName} validated with ${result.warnings.length} warning(s)`, 'warn');
            } else {
                this.log(`${moduleName} validated successfully (${result.validationTimeMs}ms)`, 'success');
            }

        } catch (error) {
            result.success = false;
            result.errors.push(error.message);
            result.validationTimeMs = Date.now() - moduleStartTime;
            this.log(`${moduleName} validation failed: ${error.message}`, 'error');
        }

        this.results.push(result);
        return result;
    }

    async validateAll() {
        this.log('🔍 Starting YSH Store 360º Validation...');

        const modules = this.options.module ?
            [this.options.module] :
            Object.keys(VALIDATION_RULES);

        this.log(`📦 Validating ${modules.length} module(s)...`);
        this.log('─'.repeat(80));

        // Validate all modules in parallel
        await Promise.all(modules.map(m => this.validateModule(m)));

        return this.generateReport();
    }

    generateReport() {
        const successful = this.results.filter(r => r.success);
        const failed = this.results.filter(r => !r.success);
        const withWarnings = this.results.filter(r => r.success && r.warnings.length > 0);

        const totalValidationTime = this.results.reduce((sum, r) => sum + r.validationTimeMs, 0);
        const avgValidationTime = this.results.length > 0 ? totalValidationTime / this.results.length : 0;

        return {
            timestamp: new Date().toISOString(),
            totalTimeMs: Date.now() - this.startTime,
            summary: {
                total: this.results.length,
                successful: successful.length,
                failed: failed.length,
                withWarnings: withWarnings.length,
                successRate: `${((successful.length / this.results.length) * 100).toFixed(1)}%`
            },
            performance: {
                totalValidationTimeMs: totalValidationTime,
                avgValidationTimeMs: Math.round(avgValidationTime)
            },
            modules: this.results.map(r => ({
                name: r.module,
                success: r.success,
                validationTimeMs: r.validationTimeMs,
                warnings: r.warnings.length,
                errors: r.errors.length,
                validations: r.validations
            })),
            failed: failed.map(r => ({
                module: r.module,
                errors: r.errors
            })),
            warnings: withWarnings.map(r => ({
                module: r.module,
                warnings: r.warnings
            }))
        };
    }

    async printReport(report) {
        this.log('\n📊 Validation Report:');
        this.log('═'.repeat(80));

        // Summary
        this.log(`\n📦 Summary:`);
        this.log(`   Total Modules: ${report.summary.total}`);
        this.log(`   ✅ Successful: ${report.summary.successful}`);
        this.log(`   ❌ Failed: ${report.summary.failed}`);
        this.log(`   ⚠️  With Warnings: ${report.summary.withWarnings}`);
        this.log(`   📈 Success Rate: ${report.summary.successRate}`);

        // Performance
        this.log(`\n⚡ Performance:`);
        this.log(`   Total Time: ${(report.totalTimeMs / 1000).toFixed(2)}s`);
        this.log(`   Avg Validation Time: ${report.performance.avgValidationTimeMs}ms`);

        // Module details
        this.log(`\n📋 Module Details:`);
        this.log('─'.repeat(80));

        for (const module of report.modules) {
            const status = module.success ? '✅' : '❌';
            const time = `${module.validationTimeMs}ms`.padStart(7);
            const warnings = module.warnings > 0 ? ` (${module.warnings} warnings)` : '';
            const errors = module.errors > 0 ? ` (${module.errors} errors)` : '';

            this.log(`${status} ${module.name.padEnd(25)} ${time}${warnings}${errors}`);

            if (this.options.verbose && module.validations.dataFiles) {
                for (const file of module.validations.dataFiles) {
                    const fileStatus = file.status === 'valid' ? '  ✓' : file.status === 'missing' ? '  ✗' : '  ⚠';
                    const records = file.records ? ` (${file.records} records)` : '';
                    this.log(`   ${fileStatus} ${file.file}${records}`);
                }
            }

            if (this.options.verbose && module.validations.endpoints) {
                this.log(`   Endpoints: ${module.validations.endpoints.length}`);
            }
        }

        this.log('─'.repeat(80));

        // Failed modules
        if (report.failed.length > 0) {
            this.log(`\n❌ Failed Modules:`);
            for (const failed of report.failed) {
                this.log(`   • ${failed.module}:`);
                for (const error of failed.errors) {
                    this.log(`     - ${error}`);
                }
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
        const reportPath = path.join(__dirname, '../data/validation-360-report.json');
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
        module: null,
        verbose: args.includes('--verbose') || args.includes('-v')
    };

    // Parse --module=internal-catalog
    const moduleArg = args.find(arg => arg.startsWith('--module='));
    if (moduleArg) {
        options.module = moduleArg.split('=')[1];
    }

    const validator = new StoreValidator(options);

    try {
        const report = await validator.validateAll();
        await validator.printReport(report);
        await validator.saveReport(report);

        if (report.summary.failed === 0) {
            console.log('\n✅ Store 360º validation completed successfully!');
            console.log('🚀 All modules validated.');
            process.exit(0);
        } else {
            console.log(`\n⚠️  Store validation completed with ${report.summary.failed} failure(s)`);
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ Store validation failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { StoreValidator, VALIDATION_RULES };
