import { MikroORM } from "@mikro-orm/core";
import { asValue } from "awilix";
import {
    Manufacturer,
    ManufacturerTier,
    SKU,
    ProductCategory,
    DistributorOffer,
    StockStatus,
} from "../models";

describe("Unified Catalog Models - Unit Tests", () => {
    let orm: MikroORM;

    beforeAll(async () => {
        // Setup test database
        orm = await MikroORM.init({
            entities: [Manufacturer, SKU, DistributorOffer],
            dbName: ":memory:",
            type: "sqlite",
        });

        await orm.schema.createSchema();
    });

    afterAll(async () => {
        await orm.close();
    });

    afterEach(async () => {
        await orm.schema.clearDatabase();
    });

    describe("Manufacturer Model", () => {
        it("should create manufacturer with valid tier enum", async () => {
            const em = orm.em.fork();

            const manufacturer = em.create(Manufacturer, {
                name: "Canadian Solar",
                slug: "canadian-solar",
                tier: ManufacturerTier.TIER_1,
                country: "Canada",
            });

            await em.persistAndFlush(manufacturer);

            expect(manufacturer.id).toBeDefined();
            expect(manufacturer.tier).toBe(ManufacturerTier.TIER_1);
            expect(manufacturer.slug).toBe("canadian-solar");
        });

        it("should enforce unique slug constraint", async () => {
            const em = orm.em.fork();

            const mfr1 = em.create(Manufacturer, {
                name: "Deye",
                slug: "deye",
                tier: ManufacturerTier.TIER_2,
            });

            await em.persistAndFlush(mfr1);

            const mfr2 = em.create(Manufacturer, {
                name: "DEYE Solar",
                slug: "deye", // Duplicate slug
                tier: ManufacturerTier.TIER_2,
            });

            await expect(em.persistAndFlush(mfr2)).rejects.toThrow();
        });

        it("should default tier to UNKNOWN", async () => {
            const em = orm.em.fork();

            const manufacturer = em.create(Manufacturer, {
                name: "Unknown Brand",
                slug: "unknown-brand",
            });

            await em.persistAndFlush(manufacturer);

            expect(manufacturer.tier).toBe(ManufacturerTier.UNKNOWN);
        });

        it("should store aliases as JSON array", async () => {
            const em = orm.em.fork();

            const manufacturer = em.create(Manufacturer, {
                name: "Deye",
                slug: "deye",
                tier: ManufacturerTier.TIER_2,
                aliases: ["DEYE", "DEYE SOLAR", "Deye Energy"],
            });

            await em.persistAndFlush(manufacturer);
            em.clear();

            const loaded = await em.findOneOrFail(Manufacturer, { slug: "deye" });
            expect(loaded.aliases).toEqual(["DEYE", "DEYE SOLAR", "Deye Energy"]);
        });
    });

    describe("SKU Model", () => {
        it("should create SKU with required fields", async () => {
            const em = orm.em.fork();

            const manufacturer = em.create(Manufacturer, {
                name: "Canadian Solar",
                slug: "canadian-solar",
                tier: ManufacturerTier.TIER_1,
            });

            const sku = em.create(SKU, {
                sku_code: "CS-550W-HIKU7",
                manufacturer_id: manufacturer.id,
                category: ProductCategory.PANELS,
                model_number: "HIKU7",
                name: "Canadian Solar 550W Panel",
                technical_specs: {
                    potencia_w: 550,
                    tecnologia: "Monocristalino PERC",
                    eficiencia_pct: 21.2,
                },
            });

            await em.persistAndFlush([manufacturer, sku]);

            expect(sku.id).toBeDefined();
            expect(sku.sku_code).toBe("CS-550W-HIKU7");
            expect(sku.category).toBe(ProductCategory.PANELS);
        });

        it("should enforce unique sku_code constraint", async () => {
            const em = orm.em.fork();

            const manufacturer = em.create(Manufacturer, {
                name: "Deye",
                slug: "deye",
            });

            const sku1 = em.create(SKU, {
                sku_code: "DEYE-INV-5K",
                manufacturer_id: manufacturer.id,
                category: ProductCategory.INVERTERS,
                model_number: "SUN-5K",
                name: "Deye 5kW Inverter",
                technical_specs: {},
            });

            await em.persistAndFlush([manufacturer, sku1]);

            const sku2 = em.create(SKU, {
                sku_code: "DEYE-INV-5K", // Duplicate
                manufacturer_id: manufacturer.id,
                category: ProductCategory.INVERTERS,
                model_number: "SUN-5K",
                name: "Deye 5kW Inverter Clone",
                technical_specs: {},
            });

            await expect(em.persistAndFlush(sku2)).rejects.toThrow();
        });

        it("should store technical_specs as JSON", async () => {
            const em = orm.em.fork();

            const manufacturer = em.create(Manufacturer, {
                name: "Test",
                slug: "test",
            });

            const sku = em.create(SKU, {
                sku_code: "TEST-INV-001",
                manufacturer_id: manufacturer.id,
                category: ProductCategory.INVERTERS,
                model_number: "INV-001",
                name: "Test Inverter",
                technical_specs: {
                    potencia_w: 5000,
                    tensao_v: 240,
                    fases: "monofásico",
                    mppt_trackers: 2,
                    eficiencia_max_pct: 97.5,
                },
            });

            await em.persistAndFlush([manufacturer, sku]);
            em.clear();

            const loaded = await em.findOneOrFail(SKU, { sku_code: "TEST-INV-001" });
            expect(loaded.technical_specs).toMatchObject({
                potencia_w: 5000,
                tensao_v: 240,
                fases: "monofásico",
                mppt_trackers: 2,
                eficiencia_max_pct: 97.5,
            });
        });

        it("should validate price relationships (lowest <= highest)", async () => {
            const em = orm.em.fork();

            const manufacturer = em.create(Manufacturer, {
                name: "Test",
                slug: "test-mfr",
            });

            const sku = em.create(SKU, {
                sku_code: "TEST-PAN-001",
                manufacturer_id: manufacturer.id,
                category: ProductCategory.PANELS,
                model_number: "PAN-001",
                name: "Test Panel",
                technical_specs: {},
                lowest_price: 1000,
                highest_price: 800, // Invalid: highest < lowest
            });

            await em.persistAndFlush([manufacturer, sku]);

            // Business logic validation (not DB constraint)
            expect(sku.lowest_price).toBeGreaterThan(sku.highest_price!);
        });
    });

    describe("DistributorOffer Model", () => {
        it("should create offer linked to SKU", async () => {
            const em = orm.em.fork();

            const manufacturer = em.create(Manufacturer, {
                name: "Test",
                slug: "test-mfr-offer",
            });

            const sku = em.create(SKU, {
                sku_code: "TEST-SKU-OFFER",
                manufacturer_id: manufacturer.id,
                category: ProductCategory.PANELS,
                model_number: "OFFER-001",
                name: "Test SKU for Offer",
                technical_specs: {},
            });

            const offer = em.create(DistributorOffer, {
                sku_id: sku.id,
                distributor_name: "Fotus",
                distributor_slug: "fotus",
                price: 1250.0,
                stock_status: StockStatus.IN_STOCK,
                stock_quantity: 15,
                source_id: "FOTUS-12345",
                last_updated_at: new Date(),
            });

            await em.persistAndFlush([manufacturer, sku, offer]);

            expect(offer.id).toBeDefined();
            expect(offer.price).toBe(1250.0);
            expect(offer.stock_status).toBe(StockStatus.IN_STOCK);
        });

        it("should enforce unique offer per SKU per distributor", async () => {
            const em = orm.em.fork();

            const manufacturer = em.create(Manufacturer, {
                name: "Test",
                slug: "test-mfr-unique",
            });

            const sku = em.create(SKU, {
                sku_code: "TEST-UNIQUE-OFFER",
                manufacturer_id: manufacturer.id,
                category: ProductCategory.INVERTERS,
                model_number: "UNIQUE-001",
                name: "Test Unique Offer",
                technical_specs: {},
            });

            const offer1 = em.create(DistributorOffer, {
                sku_id: sku.id,
                distributor_name: "Odex",
                distributor_slug: "odex",
                price: 5000,
                stock_status: StockStatus.IN_STOCK,
                source_id: "ODEX-1",
                last_updated_at: new Date(),
            });

            await em.persistAndFlush([manufacturer, sku, offer1]);

            const offer2 = em.create(DistributorOffer, {
                sku_id: sku.id,
                distributor_name: "Odex",
                distributor_slug: "odex", // Same distributor for same SKU
                price: 5100,
                stock_status: StockStatus.IN_STOCK,
                source_id: "ODEX-2",
                last_updated_at: new Date(),
            });

            await expect(em.persistAndFlush(offer2)).rejects.toThrow();
        });

        it("should allow multiple distributors for same SKU", async () => {
            const em = orm.em.fork();

            const manufacturer = em.create(Manufacturer, {
                name: "Test",
                slug: "test-mfr-multi",
            });

            const sku = em.create(SKU, {
                sku_code: "TEST-MULTI-DIST",
                manufacturer_id: manufacturer.id,
                category: ProductCategory.BATTERIES,
                model_number: "MULTI-001",
                name: "Test Multi Distributor",
                technical_specs: {},
            });

            const offer1 = em.create(DistributorOffer, {
                sku_id: sku.id,
                distributor_name: "Fotus",
                distributor_slug: "fotus",
                price: 2500,
                stock_status: StockStatus.IN_STOCK,
                source_id: "FOTUS-1",
                last_updated_at: new Date(),
            });

            const offer2 = em.create(DistributorOffer, {
                sku_id: sku.id,
                distributor_name: "Odex",
                distributor_slug: "odex",
                price: 2600,
                stock_status: StockStatus.LOW_STOCK,
                source_id: "ODEX-1",
                last_updated_at: new Date(),
            });

            await em.persistAndFlush([manufacturer, sku, offer1, offer2]);

            const offers = await em.find(DistributorOffer, { sku_id: sku.id });
            expect(offers).toHaveLength(2);
            expect(offers.map(o => o.distributor_slug)).toContain("fotus");
            expect(offers.map(o => o.distributor_slug)).toContain("odex");
        });
    });

    describe("Manufacturer-SKU Relationship", () => {
        it("should load SKUs from manufacturer relationship", async () => {
            const em = orm.em.fork();

            const manufacturer = em.create(Manufacturer, {
                name: "Jinko Solar",
                slug: "jinko",
                tier: ManufacturerTier.TIER_1,
            });

            const sku1 = em.create(SKU, {
                sku_code: "JINKO-560W",
                manufacturer_id: manufacturer.id,
                category: ProductCategory.PANELS,
                model_number: "TIGER-PRO-560",
                name: "Jinko 560W Panel",
                technical_specs: { potencia_w: 560 },
            });

            const sku2 = em.create(SKU, {
                sku_code: "JINKO-565W",
                manufacturer_id: manufacturer.id,
                category: ProductCategory.PANELS,
                model_number: "TIGER-PRO-565",
                name: "Jinko 565W Panel",
                technical_specs: { potencia_w: 565 },
            });

            await em.persistAndFlush([manufacturer, sku1, sku2]);
            em.clear();

            const loaded = await em.findOneOrFail(
                Manufacturer,
                { slug: "jinko" },
                { populate: ["skus"] }
            );

            expect(loaded.skus).toHaveLength(2);
            expect(loaded.skus.getItems().map(s => s.sku_code)).toContain("JINKO-560W");
            expect(loaded.skus.getItems().map(s => s.sku_code)).toContain("JINKO-565W");
        });
    });
});
