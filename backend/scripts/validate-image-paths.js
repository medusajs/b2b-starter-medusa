/**
 * Image Path Validation Script
 * Verifies that all image paths in export files point to existing images
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FALLBACK_EXPORTS_PATH = path.join(__dirname, '../data/catalog/fallback_exports');
const STATIC_IMAGES_PATH = path.join(__dirname, '../static/images-catálogo_distribuidores');

const CATEGORIES = [
    'panels', 'inverters', 'batteries', 'kits', 'cables',
    'controllers', 'structures', 'accessories', 'ev_chargers',
    'posts', 'stringboxes', 'others'
];

/**
 * Check if image file exists
 */
function imageExists(imagePath) {
    if (!imagePath || imagePath === '') return false;

    // Remove leading slash and /static/ prefix
    const cleanPath = imagePath
        .replace(/^\/+/, '')
        .replace(/^static\//, '');

    const fullPath = path.join(__dirname, '../static', cleanPath);
    return fs.existsSync(fullPath);
}

/**
 * Validate category image paths
 */
function validateCategory(category) {
    const jsonPath = path.join(FALLBACK_EXPORTS_PATH, `${category}.json`);

    if (!fs.existsSync(jsonPath)) {
        console.log(`⚠️  Category file not found: ${category}`);
        return null;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const products = data.products || [];

    let validImages = 0;
    let missingImages = 0;
    let noImagePath = 0;
    const missingPaths = [];

    for (const product of products) {
        if (!product.image_path || product.image_path === '') {
            noImagePath++;
            continue;
        }

        if (imageExists(product.image_path)) {
            validImages++;
        } else {
            missingImages++;
            missingPaths.push({
                id: product.id,
                sku: product.sku,
                name: product.name,
                path: product.image_path
            });
        }
    }

    return {
        category,
        total: products.length,
        validImages,
        missingImages,
        noImagePath,
        coverage: ((validImages / products.length) * 100).toFixed(2),
        missingPaths: missingPaths.slice(0, 10) // First 10 missing
    };
}

/**
 * Main validation
 */
async function main() {
    console.log('🔍 Validating image paths in fallback exports...\n');

    const results = [];
    let totalProducts = 0;
    let totalValid = 0;
    let totalMissing = 0;
    let totalNoPath = 0;

    // Validate each category
    for (const category of CATEGORIES) {
        const result = validateCategory(category);

        if (result) {
            results.push(result);
            totalProducts += result.total;
            totalValid += result.validImages;
            totalMissing += result.missingImages;
            totalNoPath += result.noImagePath;

            console.log(`✅ ${category.toUpperCase()}`);
            console.log(`   Total: ${result.total}`);
            console.log(`   Valid Images: ${result.validImages} (${result.coverage}%)`);
            console.log(`   Missing Images: ${result.missingImages}`);
            console.log(`   No Image Path: ${result.noImagePath}`);

            if (result.missingPaths.length > 0) {
                console.log(`   Missing paths (first 5):`);
                result.missingPaths.slice(0, 5).forEach(p => {
                    console.log(`     - ${p.sku}: ${p.path}`);
                });
            }
            console.log('');
        }
    }

    // Summary
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Valid Images: ${totalValid} (${((totalValid / totalProducts) * 100).toFixed(2)}%)`);
    console.log(`Missing Images: ${totalMissing}`);
    console.log(`No Image Path: ${totalNoPath}`);
    console.log('');

    // Category breakdown
    console.log('📈 CATEGORY BREAKDOWN');
    console.log('='.repeat(50));
    console.log('Category          | Total | Valid | Missing | Coverage');
    console.log('-'.repeat(50));

    results
        .sort((a, b) => parseFloat(b.coverage) - parseFloat(a.coverage))
        .forEach(r => {
            const catPadded = r.category.padEnd(17);
            const totalPadded = String(r.total).padStart(5);
            const validPadded = String(r.validImages).padStart(5);
            const missingPadded = String(r.missingImages).padStart(7);
            const coveragePadded = (r.coverage + '%').padStart(8);

            console.log(`${catPadded} | ${totalPadded} | ${validPadded} | ${missingPadded} | ${coveragePadded}`);
        });

    console.log('');

    // Report file
    const reportPath = path.join(FALLBACK_EXPORTS_PATH, 'image_validation_report.json');
    const report = {
        validated_at: new Date().toISOString(),
        summary: {
            total_products: totalProducts,
            valid_images: totalValid,
            missing_images: totalMissing,
            no_image_path: totalNoPath,
            coverage_percent: ((totalValid / totalProducts) * 100).toFixed(2)
        },
        categories: results
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`💾 Validation report saved to: ${reportPath}`);

    // Exit code based on results
    if (totalMissing > totalProducts * 0.3) {
        console.log('\n⚠️  WARNING: More than 30% of images are missing!');
        process.exit(1);
    } else if (totalMissing > 0) {
        console.log(`\n⚠️  ${totalMissing} images are missing but coverage is acceptable.`);
    } else {
        console.log('\n✅ All images validated successfully!');
    }
}

// Run
main().catch(console.error);
