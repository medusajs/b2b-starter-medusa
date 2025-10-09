/**
 * Direct seed script for unified catalog - Container version
 * Seeds data directly via SQL from inside the container
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function seedCatalog() {
    const client = new Client({
        host: 'postgres',
        port: 5432,
        database: 'medusa_db',
        user: 'medusa_user',
        password: 'medusa_password',
    });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL');

        // Load JSON data
        const dataPath = '/app/data/catalog/unified_schemas';
        const manufacturers = JSON.parse(fs.readFileSync(path.join(dataPath, 'manufacturers.json'), 'utf8'));
        const skus = JSON.parse(fs.readFileSync(path.join(dataPath, 'skus_unified.json'), 'utf8'));
        const kits = JSON.parse(fs.readFileSync(path.join(dataPath, 'kits_normalized.json'), 'utf8'));

        console.log(`\n📦 Loaded data:`);
        console.log(`   - ${manufacturers.length} manufacturers`);
        console.log(`   - ${skus.length} SKUs`);
        console.log(`   - ${kits.length} kits`);

        // Clear existing data
        console.log('\n🧹 Clearing existing data...');
        await client.query('TRUNCATE TABLE kit CASCADE');
        await client.query('TRUNCATE TABLE distributor_offer CASCADE');
        await client.query('TRUNCATE TABLE sku CASCADE');
        await client.query('TRUNCATE TABLE manufacturer CASCADE');

        // Seed manufacturers
        console.log('\n👷 Seeding manufacturers...');
        let manufacturerCount = 0;
        const manufacturerMap = {};

        for (const mfr of manufacturers) {
            const id = `mfr_${Date.now()}_${manufacturerCount}`;
            const slug = mfr.slug || mfr.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            manufacturerMap[slug] = id;
            manufacturerMap[mfr.name] = id; // Also map by name for fallback

            await client.query(
                `INSERT INTO manufacturer 
                (id, name, slug, tier, country, product_count, aliases, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
                [
                    id,
                    mfr.name,
                    slug,
                    mfr.tier || 'UNKNOWN',
                    mfr.country || null,
                    mfr.product_count || 0,
                    JSON.stringify(mfr.aliases || [mfr.name])
                ]
            );
            manufacturerCount++;

            // Add small delay to ensure unique timestamps
            if (manufacturerCount % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        console.log(`   ✅ ${manufacturerCount} manufacturers seeded`);

        // Seed SKUs and offers
        console.log('\n📱 Seeding SKUs and offers...');
        let skuCount = 0;
        let offerCount = 0;

        for (const sku of skus) {
            // Skip SKUs without id
            if (!sku.id) {
                console.warn(`⚠️  Skipping SKU without id:`, sku.model_number || 'unnamed');
                continue;
            }

            const skuId = `sku_${Date.now()}_${skuCount}`;
            const manufacturerId = manufacturerMap[sku.manufacturer_id] || manufacturerMap[sku.manufacturer_name] || manufacturerMap['unknown'];

            if (!manufacturerId) {
                console.warn(`⚠️  Skipping SKU ${sku.id} - manufacturer not found: ${sku.manufacturer_id}`);
                continue;
            }

            // Insert SKU
            await client.query(
                `INSERT INTO sku 
                (id, sku_code, manufacturer_id, category, name, description, technical_specs, 
                 lowest_price, highest_price, average_price, total_offers, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
                [
                    skuId,
                    sku.id, // Use 'id' field as sku_code
                    manufacturerId,
                    sku.category,
                    sku.model_number || sku.id,
                    null,
                    JSON.stringify(sku.technical_specs || {}),
                    sku.pricing_summary?.lowest_price || null,
                    sku.pricing_summary?.highest_price || null,
                    sku.pricing_summary?.avg_price || null,
                    sku.distributor_offers?.length || 0
                ]
            );
            skuCount++;

            // Insert offers if exists
            if (sku.distributor_offers && Array.isArray(sku.distributor_offers)) {
                for (const offer of sku.distributor_offers) {
                    const offerId = `offer_${Date.now()}_${offerCount}`;

                    await client.query(
                        `INSERT INTO distributor_offer 
                        (id, sku_id, distributor_name, price, stock_status, 
                         stock_quantity, lead_time_days, shipping_cost, last_updated_at, created_at, updated_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW())`,
                        [
                            offerId,
                            skuId,
                            offer.distributor,
                            offer.price,
                            offer.available ? 'in_stock' : 'out_of_stock',
                            offer.quantity || null,
                            null,
                            null
                        ]
                    );
                    offerCount++;
                }
            }

            // Add small delay every 50 SKUs
            if (skuCount % 50 === 0) {
                await new Promise(resolve => setTimeout(resolve, 10));
                console.log(`   ... ${skuCount} SKUs processed`);
            }
        }
        console.log(`   ✅ ${skuCount} SKUs seeded`);
        console.log(`   ✅ ${offerCount} offers seeded`);

        // Seed kits
        console.log('\n🎁 Seeding kits...');
        let kitCount = 0;

        for (const kit of kits) {
            if (!kit.id) {
                console.warn(`⚠️  Skipping kit without id:`, kit.name || 'unnamed');
                continue;
            }

            const kitId = `kit_${Date.now()}_${kitCount}`;

            await client.query(
                `INSERT INTO kit 
                (id, kit_code, name, description, system_capacity_kwp, components, 
                 kit_price, discount_pct, target_consumer_class, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
                [
                    kitId,
                    kit.id, // Use 'id' field as kit_code
                    kit.name || kit.id,
                    null,
                    kit.system_capacity_kwp,
                    JSON.stringify(kit.components || []),
                    kit.pricing?.total_kit_price || null,
                    kit.pricing?.discount_percentage || null,
                    kit.suitable_for?.[0] || 'residential' // Take first suitable_for value
                ]
            );
            kitCount++;

            if (kitCount % 25 === 0) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
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
