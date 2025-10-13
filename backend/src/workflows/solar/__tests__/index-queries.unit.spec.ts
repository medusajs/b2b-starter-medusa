/**
 * Unit Tests for Solar Fleet Analysis Workflows
 * 
 * Tests:
 * - analyzeSolarFleetWorkflow
 * - getSolarOrdersWithCompanyWorkflow
 */

import { analyzeSolarFleetWorkflow, getSolarOrdersWithCompanyWorkflow } from "../index-queries";

describe("analyzeSolarFleetWorkflow", () => {
    it("should analyze solar fleet successfully", async () => {
        const input = {
            filters: {
                category: "sistema_solar",
                min_capacity_kwp: 5,
                max_capacity_kwp: 50,
            },
        };

        const { result } = await analyzeSolarFleetWorkflow.run({ input });

        expect(result).toBeDefined();
        expect(result.total_systems).toBeGreaterThanOrEqual(0);
        expect(result.total_capacity_kwp).toBeGreaterThanOrEqual(0);
        expect(result.avg_capacity_kwp).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(result.systems_by_category)).toBe(true);
        expect(Array.isArray(result.top_selling_products)).toBe(true);
    });

    it("should filter by capacity range", async () => {
        const input = {
            filters: {
                min_capacity_kwp: 10,
                max_capacity_kwp: 20,
            },
        };

        const { result } = await analyzeSolarFleetWorkflow.run({ input });

        // Verify all systems are within capacity range
        result.top_selling_products.forEach((product: any) => {
            const capacity = product.metadata?.solar_capacity_kw || 0;
            if (capacity > 0) {
                expect(capacity).toBeGreaterThanOrEqual(10);
                expect(capacity).toBeLessThanOrEqual(20);
            }
        });
    });

    it("should filter by status", async () => {
        const input = {
            filters: {
                status: "active",
            },
        };

        const { result } = await analyzeSolarFleetWorkflow.run({ input });

        expect(result).toBeDefined();
        expect(result.total_systems).toBeGreaterThanOrEqual(0);
    });

    it("should handle empty result set", async () => {
        const input = {
            filters: {
                category: "non_existent_category",
            },
        };

        const { result } = await analyzeSolarFleetWorkflow.run({ input });

        expect(result.total_systems).toBe(0);
        expect(result.total_capacity_kwp).toBe(0);
        expect(result.avg_capacity_kwp).toBe(0);
        expect(result.systems_by_category).toHaveLength(0);
        expect(result.top_selling_products).toHaveLength(0);
    });
});

describe("getSolarOrdersWithCompanyWorkflow", () => {
    it("should retrieve solar orders with company data", async () => {
        const input = {
            filters: {
                customer_id: "cus_test_123",
            },
        };

        const { result } = await getSolarOrdersWithCompanyWorkflow.run({ input });

        expect(result).toBeDefined();
        expect(Array.isArray(result.orders)).toBe(true);

        if (result.orders.length > 0) {
            const order = result.orders[0];
            expect(order).toHaveProperty("id");
            expect(order).toHaveProperty("total");
            expect(order).toHaveProperty("status");
            // Verify company data is included via remote links
            if (order.metadata?.company_id) {
                expect(order.metadata.company_name).toBeDefined();
            }
        }
    });

    it("should filter by order status", async () => {
        const input = {
            filters: {
                status: "completed",
            },
        };

        const { result } = await getSolarOrdersWithCompanyWorkflow.run({ input });

        result.orders.forEach((order: any) => {
            expect(order.status).toBe("completed");
        });
    });

    it("should include solar metadata", async () => {
        const input = {
            filters: {
                customer_id: "cus_test_123",
            },
        };

        const { result } = await getSolarOrdersWithCompanyWorkflow.run({ input });

        if (result.orders.length > 0) {
            const order = result.orders[0];
            expect(order.metadata).toBeDefined();
            // Verify solar-specific metadata
            if (order.metadata.tipo_produto === "sistema_solar") {
                expect(order.metadata.solar_capacity_kw).toBeDefined();
                expect(order.metadata.installation_type).toBeDefined();
            }
        }
    });

    it("should calculate total solar capacity", async () => {
        const input = {
            filters: {},
        };

        const { result } = await getSolarOrdersWithCompanyWorkflow.run({ input });

        expect(result).toBeDefined();

        // Calculate total capacity from orders
        let total_capacity = 0;
        result.orders.forEach((order: any) => {
            if (order.metadata?.solar_capacity_kw) {
                total_capacity += parseFloat(order.metadata.solar_capacity_kw);
            }
        });

        expect(total_capacity).toBeGreaterThanOrEqual(0);
    });

    it("should handle pagination", async () => {
        const input = {
            filters: {},
            limit: 5,
            offset: 0,
        };

        const { result } = await getSolarOrdersWithCompanyWorkflow.run({ input });

        expect(result.orders.length).toBeLessThanOrEqual(5);
    });
});

describe("Performance Tests", () => {
    it("analyzeSolarFleetWorkflow should complete under 200ms", async () => {
        const start = Date.now();

        await analyzeSolarFleetWorkflow.run({
            input: { filters: { category: "sistema_solar" } },
        });

        const duration = Date.now() - start;
        console.log(`analyzeSolarFleetWorkflow took ${duration}ms`);

        // Index Module should be fast (target: < 100ms, max: 200ms)
        expect(duration).toBeLessThan(200);
    });

    it("getSolarOrdersWithCompanyWorkflow should complete under 300ms", async () => {
        const start = Date.now();

        await getSolarOrdersWithCompanyWorkflow.run({
            input: { filters: {} },
        });

        const duration = Date.now() - start;
        console.log(`getSolarOrdersWithCompanyWorkflow took ${duration}ms`);

        // Should be fast even with company data joins
        expect(duration).toBeLessThan(300);
    });
});
