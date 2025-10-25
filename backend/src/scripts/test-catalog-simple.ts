import * as fs from 'fs';
import * as path from 'path';

interface CatalogProduct {
    id: string;
    sku?: string;
    name: string;
    description?: string;
    manufacturer?: string;
    price?: number;
    category: string;
    availability?: boolean;
    [key: string]: any;
}

function readCatalogFile(filePath: string): CatalogProduct[] {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(data);

        // Handle different JSON structures
        if (Array.isArray(parsed)) {
            return parsed;
        } else if (parsed.products && Array.isArray(parsed.products)) {
            return parsed.products;
        } else if (typeof parsed === 'object') {
            // Single product object
            return [parsed];
        }

        return [];
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
}

function testCatalogReading() {
    console.log('Testing catalog data reading...');

    const catalogDir = path.join(__dirname, '..', '..', '..', '..', 'data', 'catalog');

    if (!fs.existsSync(catalogDir)) {
        console.error('Catalog directory not found:', catalogDir);
        return;
    }

    const files = fs.readdirSync(catalogDir).filter(file => file.endsWith('.json'));

    console.log(`Found ${files.length} catalog files`);

    let totalProducts = 0;

    for (const file of files) {
        const filePath = path.join(catalogDir, file);
        const products = readCatalogFile(filePath);

        console.log(`${file}: ${products.length} products`);

        if (products.length > 0) {
            // Show first product as sample
            const sample = products[0];
            console.log(`  Sample: ${sample.name || 'No name'} (${sample.manufacturer || 'No manufacturer'})`);
        }

        totalProducts += products.length;
    }

    console.log(`\nTotal products across all files: ${totalProducts}`);

    // Test category extraction
    const categories = [...new Set(files.map(f => f.replace('.json', '')))];
    console.log(`Categories found: ${categories.join(', ')}`);
}

testCatalogReading();