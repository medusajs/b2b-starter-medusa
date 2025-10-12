#!/usr/bin/env node
/**
 * Catalog Preload Worker
 * Preloads catalog data before backend starts
 * 
 * Usage: node preload-worker.js
 */

const fs = require('fs/promises');
const path = require('path');

const UNIFIED_SCHEMAS_PATH = path.join(__dirname, '../data/catalog/unified_schemas');
const IMAGE_MAP_PATH = path.join(__dirname, '../static/images-catálogo_distribuidores/IMAGE_MAP.json');

const CATEGORIES = [
    'accessories',
    'batteries',
    'cables',
    'controllers',
    'ev_chargers',
    'inverters',
    'kits',
    'others',
    'panels',
    'posts',
    'stringboxes',
    'structures'
];

class PreloadWorker {
    constructor() {
        this.cache = new Map();
        this.imageMap = null;
        this.startTime = Date.now();
    }

    log(message) {
        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
        console.log(`[${elapsed}s] ${message}`);
    }

    async loadImageMap() {
        this.log('📸 Loading image map...');
        try {
            const content = await fs.readFile(IMAGE_MAP_PATH, 'utf-8');
            this.imageMap = JSON.parse(content);
            this.log(`✅ Loaded ${this.imageMap.total_images} images from ${this.imageMap.total_skus} SKUs`);
            return true;
        } catch (error) {
            this.log(`❌ Failed to load image map: ${error.message}`);
            return false;
        }
    }

    extractSku(product) {
        // 1. Direct sku field
        if (product.sku) return product.sku;

        // 2. Extract from id (format: "neosolar_inverters_22916" -> "22916")
        if (product.id) {
            const parts = product.id.split('_');
            const lastPart = parts[parts.length - 1];
            // Check if it's numeric
            if (/^\d+$/.test(lastPart)) {
                return lastPart;
            }
        }

        // 3. Extract from image path (format: "images/ODEX-INVERTERS/112369.jpg")
        if (product.image && typeof product.image === 'string') {
            const match = product.image.match(/\/(\d+)\.(jpg|png|webp|jpeg)/i);
            if (match) return match[1];
        }

        return null;
    }

    async loadCategory(category) {
        try {
            const filePath = path.join(UNIFIED_SCHEMAS_PATH, `${category}_unified.json`);
            const content = await fs.readFile(filePath, 'utf-8');
            const products = JSON.parse(content);

            // Count images
            let withImages = 0;
            if (this.imageMap) {
                products.forEach(p => {
                    const sku = this.extractSku(p);
                    if (sku && this.imageMap.mappings[sku]) {
                        withImages++;
                    }
                });
            }

            this.cache.set(category, products);
            return {
                category,
                count: products.length,
                withImages,
                coverage: products.length > 0 ? ((withImages / products.length) * 100).toFixed(1) : '0'
            };
        } catch (error) {
            this.log(`❌ Failed to load ${category}: ${error.message}`);
            return {
                category,
                count: 0,
                withImages: 0,
                coverage: '0',
                error: error.message
            };
        }
    }

    async preloadAll() {
        this.log('🚀 Starting catalog preload...');

        // Load image map first
        await this.loadImageMap();

        // Load all categories in parallel
        this.log(`📦 Loading ${CATEGORIES.length} categories...`);
        const results = await Promise.all(
            CATEGORIES.map(cat => this.loadCategory(cat))
        );

        // Calculate totals
        const totalProducts = results.reduce((sum, r) => sum + r.count, 0);
        const totalWithImages = results.reduce((sum, r) => sum + r.withImages, 0);
        const overallCoverage = totalProducts > 0 ? ((totalWithImages / totalProducts) * 100).toFixed(1) : '0';

        // Print results
        this.log('\n📊 Preload Results:');
        this.log('─'.repeat(80));
        results.forEach(r => {
            const status = r.error ? '❌' : '✅';
            const images = `${r.withImages}/${r.count}`;
            this.log(`${status} ${r.category.padEnd(15)} ${images.padStart(12)} (${r.coverage}% coverage)`);
        });
        this.log('─'.repeat(80));
        this.log(`📦 Total Products: ${totalProducts}`);
        this.log(`📸 With Images: ${totalWithImages} (${overallCoverage}% coverage)`);
        this.log(`⚡ Cache Entries: ${this.cache.size}`);
        this.log(`⏱️  Total Time: ${((Date.now() - this.startTime) / 1000).toFixed(2)}s`);
        this.log('─'.repeat(80));

        return {
            success: true,
            categories: results,
            totals: {
                products: totalProducts,
                withImages: totalWithImages,
                coverage: overallCoverage,
                cacheEntries: this.cache.size
            }
        };
    }

    async savePreloadReport() {
        const report = {
            timestamp: new Date().toISOString(),
            categories: Array.from(this.cache.entries()).map(([cat, products]) => ({
                category: cat,
                count: products.length,
                sample: products.slice(0, 3).map(p => ({
                    id: p.id,
                    name: p.name,
                    sku: p.sku || p.id
                }))
            })),
            imageMap: this.imageMap ? {
                total_skus: this.imageMap.total_skus,
                total_images: this.imageMap.total_images
            } : null
        };

        const reportPath = path.join(__dirname, '../data/catalog/preload-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        this.log(`💾 Saved preload report to ${reportPath}`);
    }
}

// Run worker
async function main() {
    const worker = new PreloadWorker();

    try {
        const result = await worker.preloadAll();
        await worker.savePreloadReport();

        if (result.success) {
            console.log('\n✅ Preload completed successfully!');
            console.log('🚀 Backend can now start with preloaded catalog data.');
            process.exit(0);
        } else {
            console.error('\n❌ Preload completed with errors');
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ Preload failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { PreloadWorker };
