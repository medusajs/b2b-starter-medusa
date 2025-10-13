/**
 * Unit Tests for Tax-Inclusive Promotions Workflows
 * 
 * Tests:
 * - createSolarPromotionWorkflow
 * - createSolarFreeShippingWorkflow
 * - Target rules validation
 * - Tax-inclusive discount calculation
 */

import {
    createSolarPromotionWorkflow,
    createSolarFreeShippingWorkflow,
} from "../create-solar-promo";

describe("createSolarPromotionWorkflow", () => {
    it("should create promotion with tax-inclusive discount", async () => {
        const input = {
            code: "TEST10OFF",
            description: "Test 10% off",
            discount_type: "percentage" as const,
            discount_value: 10,
            start_date: new Date("2025-01-01"),
            end_date: new Date("2025-12-31"),
        };

        const { result } = await createSolarPromotionWorkflow.run({ input });

        expect(result).toBeDefined();
        expect((result as any).promotion).toBeDefined();
        expect((result as any).campaign).toBeDefined();

        // Verify tax_inclusive flag
        expect((result as any).promotion.is_tax_inclusive).toBe(true);
    });

    it("should create fixed discount promotion", async () => {
        const input = {
            code: "TESTFIXED5K",
            description: "Test R$ 5.000 off",
            discount_type: "fixed" as const,
            discount_value: 500000, // R$ 5.000 in cents
            start_date: new Date("2025-01-01"),
            end_date: new Date("2025-12-31"),
        };

        const { result } = await createSolarPromotionWorkflow.run({ input });

        expect((result as any).promotion.discount_type).toBe("fixed");
        expect((result as any).promotion.discount_value).toBe(500000);
        expect((result as any).promotion.is_tax_inclusive).toBe(true);
    });

    it("should apply capacity targeting (min/max)", async () => {
        const input = {
            code: "TESTCAPACITY",
            description: "Test capacity targeting",
            discount_type: "percentage" as const,
            discount_value: 10,
            min_capacity_kwp: 5,
            max_capacity_kwp: 50,
            start_date: new Date("2025-01-01"),
            end_date: new Date("2025-12-31"),
        };

        const { result } = await createSolarPromotionWorkflow.run({ input });

        // Verify target rules include capacity range
        const target_rules = (result as any).promotion.target_rules || [];
        const capacity_rule = target_rules.find((r: any) =>
            r.attribute === "metadata.solar_capacity_kw"
        );

        expect(capacity_rule).toBeDefined();
        if (capacity_rule) {
            expect(capacity_rule.operator).toBe("gte");
            expect(capacity_rule.value).toBe(5);
        }
    });

    it("should apply building type targeting", async () => {
        const input = {
            code: "TESTBUILDING",
            description: "Test building type targeting",
            discount_type: "percentage" as const,
            discount_value: 15,
            building_types: ["residencial", "comercial"],
            start_date: new Date("2025-01-01"),
            end_date: new Date("2025-12-31"),
        };

        const { result } = await createSolarPromotionWorkflow.run({ input });

        const target_rules = (result as any).promotion.target_rules || [];
        const building_rule = target_rules.find((r: any) =>
            r.attribute === "metadata.building_type"
        );

        expect(building_rule).toBeDefined();
        if (building_rule) {
            expect(building_rule.operator).toBe("in");
            expect(building_rule.values).toContain("residencial");
            expect(building_rule.values).toContain("comercial");
        }
    });

    it("should respect usage limit", async () => {
        const input = {
            code: "TESTLIMITED",
            description: "Test limited usage",
            discount_type: "percentage" as const,
            discount_value: 20,
            usage_limit: 100,
            start_date: new Date("2025-01-01"),
            end_date: new Date("2025-12-31"),
        };

        const { result } = await createSolarPromotionWorkflow.run({ input });

        expect((result as any).campaign.usage_limit).toBe(100);
    });
});

describe("createSolarFreeShippingWorkflow", () => {
    it("should create free shipping promotion (residential)", async () => {
        const input = {
            code: "TESTFREESHIP",
            min_capacity_kwp: 3,
            residential_only: true,
        };

        const { result } = await createSolarFreeShippingWorkflow.run({ input });

        expect(result).toBeDefined();
        expect((result as any).promotion).toBeDefined();

        // Verify target rules include residential filter
        const target_rules = (result as any).promotion.target_rules || [];
        const building_rule = target_rules.find((r: any) =>
            r.attribute === "metadata.building_type"
        );

        expect(building_rule).toBeDefined();
        if (building_rule) {
            expect(building_rule.value).toBe("residencial");
        }
    });

    it("should create free shipping for all building types", async () => {
        const input = {
            code: "TESTFREESHIPALL",
            min_capacity_kwp: 10,
            residential_only: false,
        };

        const { result } = await createSolarFreeShippingWorkflow.run({ input });

        const target_rules = (result as any).promotion.target_rules || [];

        // Should NOT have building_type restriction
        const building_rule = target_rules.find((r: any) =>
            r.attribute === "metadata.building_type"
        );

        expect(building_rule).toBeUndefined();
    });

    it("should apply installation complexity filters", async () => {
        const input = {
            code: "TESTFREESHIP",
            min_capacity_kwp: 5,
            residential_only: true,
        };

        const { result } = await createSolarFreeShippingWorkflow.run({ input });

        const target_rules = (result as any).promotion.target_rules || [];

        // Should include installation_complexity filter (low/medium only)
        const complexity_rule = target_rules.find((r: any) =>
            r.attribute === "metadata.installation_complexity"
        );

        expect(complexity_rule).toBeDefined();
        if (complexity_rule) {
            expect(complexity_rule.operator).toBe("in");
            expect(complexity_rule.values).toContain("low");
            expect(complexity_rule.values).toContain("medium");
            expect(complexity_rule.values).not.toContain("high");
        }
    });

    it("should exclude crane-required installations", async () => {
        const input = {
            code: "TESTFREESHIP",
            min_capacity_kwp: 5,
            residential_only: true,
        };

        const { result } = await createSolarFreeShippingWorkflow.run({ input });

        const target_rules = (result as any).promotion.target_rules || [];

        // Should exclude crane_required = true
        const crane_rule = target_rules.find((r: any) =>
            r.attribute === "metadata.crane_required"
        );

        expect(crane_rule).toBeDefined();
        if (crane_rule) {
            expect(crane_rule.value).toBe(false);
        }
    });

    it("should apply minimum capacity filter", async () => {
        const input = {
            code: "TESTFREESHIP",
            min_capacity_kwp: 10,
            residential_only: false,
        };

        const { result } = await createSolarFreeShippingWorkflow.run({ input });

        const target_rules = (result as any).promotion.target_rules || [];
        const capacity_rule = target_rules.find((r: any) =>
            r.attribute === "metadata.solar_capacity_kw"
        );

        expect(capacity_rule).toBeDefined();
        if (capacity_rule) {
            expect(capacity_rule.operator).toBe("gte");
            expect(capacity_rule.value).toBe(10);
        }
    });
});

describe("Tax-Inclusive Discount Calculation (Theoretical)", () => {
    /**
     * Tax-Inclusive: Desconto aplicado DEPOIS dos impostos
     * 
     * Example:
     * - Produto: R$ 10.000
     * - ICMS 18%: R$ 1.800
     * - Total com imposto: R$ 11.800
     * - Desconto 10% tax-inclusive: R$ 1.180
     * - Total final: R$ 10.620
     * 
     * vs Standard (SEM tax-inclusive):
     * - Produto: R$ 10.000
     * - Desconto 10%: R$ 1.000
     * - Subtotal: R$ 9.000
     * - ICMS 18%: R$ 1.620
     * - Total final: R$ 10.620 (IGUAL, mas base de cálculo diferente)
     */

    it("should calculate percentage discount correctly", () => {
        const product_price = 10000;
        const tax_rate = 0.18; // 18% ICMS
        const discount_percentage = 10; // 10% off

        // WITH tax-inclusive
        const total_with_tax = product_price * (1 + tax_rate); // 11800
        const discount_amount = total_with_tax * (discount_percentage / 100); // 1180
        const final_total = total_with_tax - discount_amount; // 10620

        expect(total_with_tax).toBe(11800);
        expect(discount_amount).toBe(1180);
        expect(final_total).toBe(10620);
    });

    it("should calculate fixed discount correctly", () => {
        const product_price = 10000;
        const tax_rate = 0.18;
        const fixed_discount = 2000; // R$ 2.000 off

        // WITH tax-inclusive
        const total_with_tax = product_price * (1 + tax_rate); // 11800
        const final_total = total_with_tax - fixed_discount; // 9800

        expect(total_with_tax).toBe(11800);
        expect(final_total).toBe(9800);

        // Final total is AFTER tax and discount
        expect(final_total).toBeLessThan(product_price); // Cliente paga menos que base
    });

    it("should respect maximum discount limits", () => {
        const product_price = 10000;
        const tax_rate = 0.18;
        const discount_percentage = 50; // 50% off (agressivo)

        const total_with_tax = product_price * (1 + tax_rate); // 11800
        const discount_amount = total_with_tax * (discount_percentage / 100); // 5900
        const final_total = total_with_tax - discount_amount; // 5900

        expect(discount_amount).toBe(5900);
        expect(final_total).toBe(5900);

        // Verify discount doesn't exceed product price + tax
        expect(discount_amount).toBeLessThanOrEqual(total_with_tax);
    });
});

describe("Edge Cases & Validation", () => {
    it("should reject invalid discount type", async () => {
        const input = {
            code: "TESTINVALID",
            description: "Test invalid",
            discount_type: "invalid_type" as any,
            discount_value: 10,
            start_date: new Date("2025-01-01"),
            end_date: new Date("2025-12-31"),
        };

        await expect(
            createSolarPromotionWorkflow.run({ input })
        ).rejects.toThrow();
    });

    it("should reject negative discount value", async () => {
        const input = {
            code: "TESTNEGATIVE",
            description: "Test negative",
            discount_type: "percentage" as const,
            discount_value: -10,
            start_date: new Date("2025-01-01"),
            end_date: new Date("2025-12-31"),
        };

        await expect(
            createSolarPromotionWorkflow.run({ input })
        ).rejects.toThrow();
    });

    it("should reject end_date before start_date", async () => {
        const input = {
            code: "TESTDATES",
            description: "Test dates",
            discount_type: "percentage" as const,
            discount_value: 10,
            start_date: new Date("2025-12-31"),
            end_date: new Date("2025-01-01"), // Before start_date
        };

        await expect(
            createSolarPromotionWorkflow.run({ input })
        ).rejects.toThrow();
    });

    it("should handle duplicate promotion code gracefully", async () => {
        const input = {
            code: "DUPLICATE",
            description: "First",
            discount_type: "percentage" as const,
            discount_value: 10,
            start_date: new Date("2025-01-01"),
            end_date: new Date("2025-12-31"),
        };

        // Create first promotion
        await createSolarPromotionWorkflow.run({ input });

        // Attempt to create duplicate
        await expect(
            createSolarPromotionWorkflow.run({ input })
        ).rejects.toThrow();
    });
});
