#!/usr/bin/env node

/**
 * 🔗 YSH Monorepo - Compatibility Report Generator
 * Analyzes impact of changes on Commerce/Infra modules
 */

const fs = require('fs');
const path = require('path');

const COMMERCE_MODULES = [
    'product',
    'inventory',
    'cart',
    'order',
    'customer',
    'payment',
    'fulfillment',
    'discount',
    'gift-card',
    'price-list',
    'sales-channel',
    'store',
    'currency',
    'region',
    'tax'
];

const INFRA_MODULES = [
    'event-bus',
    'cache',
    'file',
    'notification',
    'search',
    'stock-location'
];

function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const impacts = {
        commerce: [],
        infra: [],
        breaking: false,
        apis: [],
        migrations: false
    };

    // Check for Commerce module usage
    COMMERCE_MODULES.forEach(module => {
        if (content.includes(`@medusajs/medusa/${module}`) ||
            content.includes(`modules.${module}`) ||
            content.includes(`${module}Module`)) {
            impacts.commerce.push(module);
        }
    });

    // Check for Infra module usage
    INFRA_MODULES.forEach(module => {
        if (content.includes(`@medusajs/medusa/${module}`) ||
            content.includes(`modules.${module}`) ||
            content.includes(`${module}Module`)) {
            impacts.infra.push(module);
        }
    });

    // Check for breaking changes
    if (content.includes('BREAKING') ||
        content.includes('breaking change') ||
        content.includes('!:')) {
        impacts.breaking = true;
    }

    // Check for API changes
    const apiPatterns = [
        /export.*GET|POST|PUT|DELETE/,
        /router\./,
        /createApi/
    ];

    apiPatterns.forEach(pattern => {
        if (pattern.test(content)) {
            impacts.apis.push(filePath);
        }
    });

    // Check for migrations
    if (content.includes('migration') ||
        filePath.includes('migration') ||
        content.includes('db:generate')) {
        impacts.migrations = true;
    }

    return impacts;
}

function generateReport(changedFiles) {
    const report = {
        summary: {
            totalFiles: changedFiles.length,
            commerceModules: new Set(),
            infraModules: new Set(),
            breakingChanges: false,
            apiChanges: [],
            hasMigrations: false
        },
        details: []
    };

    changedFiles.forEach(file => {
        if (!fs.existsSync(file)) return;

        const impact = analyzeFile(file);
        report.details.push({
            file,
            ...impact
        });

        // Aggregate summary
        impact.commerce.forEach(mod => report.summary.commerceModules.add(mod));
        impact.infra.forEach(mod => report.summary.infraModules.add(mod));
        if (impact.breaking) report.summary.breakingChanges = true;
        report.summary.apiChanges.push(...impact.apis);
        if (impact.migrations) report.summary.hasMigrations = true;
    });

    return report;
}

function printReport(report) {
    console.log('🔗 YSH Compatibility Report\n');

    console.log('📊 Summary:');
    console.log(`   Files analyzed: ${report.summary.totalFiles}`);
    console.log(`   Commerce modules affected: ${Array.from(report.summary.commerceModules).join(', ') || 'None'}`);
    console.log(`   Infra modules affected: ${Array.from(report.summary.infraModules).join(', ') || 'None'}`);
    console.log(`   Breaking changes: ${report.summary.breakingChanges ? 'YES ⚠️' : 'No'}`);
    console.log(`   API changes: ${report.summary.apiChanges.length}`);
    console.log(`   Database migrations: ${report.summary.hasMigrations ? 'YES' : 'No'}\n`);

    if (report.details.length > 0) {
        console.log('📋 Details:');
        report.details.forEach(detail => {
            console.log(`\n📄 ${detail.file}:`);
            if (detail.commerce.length > 0) {
                console.log(`   Commerce: ${detail.commerce.join(', ')}`);
            }
            if (detail.infra.length > 0) {
                console.log(`   Infra: ${detail.infra.join(', ')}`);
            }
            if (detail.breaking) {
                console.log('   ⚠️  BREAKING CHANGE');
            }
            if (detail.apis.length > 0) {
                console.log('   🔌 API changes detected');
            }
            if (detail.migrations) {
                console.log('   🗄️  Migration required');
            }
        });
    }

    console.log('\n🎯 Recommendations:');
    if (report.summary.breakingChanges) {
        console.log('   ⚠️  Breaking changes detected - update documentation and migration guides');
    }
    if (report.summary.apiChanges.length > 0) {
        console.log('   🔌 API changes - update API documentation and client integrations');
    }
    if (report.summary.hasMigrations) {
        console.log('   🗄️  Database changes - test migrations in staging environment');
    }
    if (report.summary.commerceModules.size > 0 || report.summary.infraModules.size > 0) {
        console.log('   🔗 Module dependencies - verify integration tests pass');
    }
}

function main() {
    const changedFiles = process.argv.slice(2);

    if (changedFiles.length === 0) {
        console.log('Usage: node scripts/compatibility-report.js <file1> <file2> ...');
        console.log('Example: node scripts/compatibility-report.js server/src/modules/product/index.ts');
        process.exit(1);
    }

    const report = generateReport(changedFiles);
    printReport(report);
}

if (require.main === module) {
    main();
}