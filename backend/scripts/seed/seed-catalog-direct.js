/**
 * Direct seed script for unified catalog
 * Seeds data directly via SQL without Medusa service layer
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function seedCatalog() {
    const client = new Client({
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        database: process.env.POSTGRES_DB || 'medusa_db',
        user: process.env.POSTGRES_USER || 'medusa_user',
        password: process.env.POSTGRES_PASSWORD || 'medusa_password',
    });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL');

        // Load JSON data
        const dataPath = path.join(__dirname, 'data', 'catalog', 'unified_schemas');
        const manufacturers = JSON.parse(fs.readFileSync(path.join(dataPath, 'manufacturers.json'), 'utf8'));
        const skus = JSON.parse(fs.readFileSync(path.join(dataPath, 'skus_unified.json'), 'utf8'));
        const kits = JSON.parse(fs.readFileSync(path.join(dataPath, 'kits_normalized.json'), 'utf8'));

        console.log(`\n📦 Loaded data:`);
        console.log(`   - ${manufacturers.length} manufacturers`);
        console.log(`   - ${skus.length} SKUs`);
        console.log(`   - ${kits.length} kits`);

        // Clear existing data
        console.log('\n🧹 Clearing existing data...');
        await client.query('TRUNCATE TABLE unified_catalog_kit CASCADE');
        await client.query('TRUNCATE TABLE unified_catalog_distributor_offer CASCADE');
        await client.query('TRUNCATE TABLE unified_catalog_sku CASCADE');
        await client.query('TRUNCATE TABLE unified_catalog_manufacturer CASCADE');

        // Seed manufacturers
        console.log('\n👷 Seeding manufacturers...');
        let manufacturerCount = 0;
        const manufacturerMap = {};

        for (const mfr of manufacturers) {
            const id = `mfr_${Date.now()}_${manufacturerCount}`;
            manufacturerMap[mfr.slug] = id;

            await client.query(
                `INSERT INTO unified_catalog_manufacturer 
                (id, name, slug, tier, country, product_count, aliases, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
                [
                    id,
                    mfr.name,
                    mfr.slug,
                    mfr.tier,
                    mfr.country,
                    mfr.product_count,
                    JSON.stringify(mfr.aliases || [])
                ]
            );
            manufacturerCount++;
        }
        console.log(`   ✅ ${manufacturerCount} manufacturers seeded`);

        // Seed SKUs and offers
        console.log('\n📱 Seeding SKUs and offers...');
        let skuCount = 0;
        let offerCount = 0;

        for (const sku of skus) {
            const skuId = `sku_${Date.now()}_${skuCount}`;
            const manufacturerId = manufacturerMap[sku.manufacturer] || manufacturerMap['unknown'];

            // Insert SKU
            await client.query(
                `INSERT INTO unified_catalog_sku 
                (id, sku_code, manufacturer_id, category, name, description, technical_specs, 
                 lowest_price, highest_price, average_price, total_offers, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
                [
                    skuId,
                    sku.sku_code,
                    manufacturerId,
                    sku.category,
                    sku.name || sku.sku_code,
                    sku.description || null,
                    JSON.stringify(sku.technical_specs || {}),
                    sku.lowest_price || null,
                    sku.highest_price || null,
                    sku.average_price || null,
                    sku.total_offers || 0
                ]
            );
            skuCount++;

            // Insert offers if exists
            if (sku.offers && Array.isArray(sku.offers)) {
                for (const offer of sku.offers) {
                    const offerId = `offer_${Date.now()}_${offerCount}`;

                    await client.query(
                        `INSERT INTO unified_catalog_distributor_offer 
                        (id, sku_id, distributor_name, price, original_price, stock_status, 
                         stock_quantity, lead_time_days, shipping_cost, last_updated_at, created_at, updated_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())`,
                        [
                            offerId,
                            skuId,
                            offer.distributor,
                            offer.price,
                            offer.original_price || offer.price,
                            offer.stock_status || 'unknown',
                            offer.stock_quantity || null,
                            offer.lead_time_days || null,
                            offer.shipping_cost || null
                        ]
                    );
                    offerCount++;
                }
            }
        }
        console.log(`   ✅ ${skuCount} SKUs seeded`);
        console.log(`   ✅ ${offerCount} offers seeded`);

        // Seed kits
        console.log('\n🎁 Seeding kits...');
        let kitCount = 0;

        for (const kit of kits) {
            const kitId = `kit_${Date.now()}_${kitCount}`;

            await client.query(
                `INSERT INTO unified_catalog_kit 
                (id, kit_code, name, description, system_capacity_kwp, components, 
                 kit_price, discount_pct, target_consumer_class, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
                [
                    kitId,
                    kit.kit_code,
                    kit.name || kit.kit_code,
                    kit.description || null,
                    kit.system_capacity_kwp,
                    JSON.stringify(kit.components || []),
                    kit.kit_price || null,
                    kit.discount_pct || null,
                    kit.target_consumer_class || 'residential'
                ]
            );
            kitCount++;
        }
        console.log(`   ✅ ${kitCount} kits seeded`);

        // Summary
        console.log('\n📊 Seed Summary:');
        console.log('═══════════════════════════════════════');
        console.log(`   Manufacturers: ${manufacturerCount}`);
        console.log(`   SKUs:          ${skuCount}`);
        console.log(`   Offers:        ${offerCount}`);
        console.log(`   Kits:          ${kitCount}`);
        console.log('═══════════════════════════════════════');
        console.log('✅ Seed completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding catalog:', error);
        throw error;
    } finally {
        await client.end();
    }
}

seedCatalog()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
