import { describe, it, expect } from "@jest/globals";
import { UnitNormalizer } from "../client/unit-normalizer";
import { Unit } from "../../../types/pvlib";

/**
 * UnitNormalizer - Unit Tests
 * 
 * Focus:
 * - Conversion accuracy
 * - Unit detection from strings
 * - Edge cases (negative values, zero, very large numbers)
 */

describe("UnitNormalizer", () => {
    describe("Irradiance Normalization", () => {
        it("should keep W/m² unchanged", () => {
            const result = UnitNormalizer.normalizeIrradiance(1000, Unit.W_PER_M2);
            expect(result).toBe(1000);
        });

        it("should convert kW/m² to W/m²", () => {
            const result = UnitNormalizer.normalizeIrradiance(1.5, Unit.KW_PER_M2);
            expect(result).toBe(1500);
        });

        it("should convert MJ/m²/day to W/m²", () => {
            const result = UnitNormalizer.normalizeIrradiance(20, Unit.MJ_PER_M2);
            // 20 MJ/m²/day = 20 * 1000000 / (24 * 3600) W/m²
            expect(result).toBeCloseTo(231.48, 2);
        });

        it("should handle zero irradiance", () => {
            const result = UnitNormalizer.normalizeIrradiance(0, Unit.W_PER_M2);
            expect(result).toBe(0);
        });
    });

    describe("Energy Normalization", () => {
        it("should keep kWh unchanged", () => {
            const result = UnitNormalizer.normalizeEnergy(100, Unit.KWH);
            expect(result).toBe(100);
        });

        it("should convert Wh to kWh", () => {
            const result = UnitNormalizer.normalizeEnergy(5000, Unit.WH);
            expect(result).toBe(5);
        });

        it("should convert MWh to kWh", () => {
            const result = UnitNormalizer.normalizeEnergy(2.5, Unit.MWH);
            expect(result).toBe(2500);
        });
    });

    describe("Temperature Normalization", () => {
        it("should keep °C unchanged", () => {
            const result = UnitNormalizer.normalizeTemperature(25, Unit.CELSIUS);
            expect(result).toBe(25);
        });

        it("should convert °F to °C", () => {
            const result = UnitNormalizer.normalizeTemperature(77, Unit.FAHRENHEIT);
            expect(result).toBe(25);
        });

        it("should convert Kelvin to °C", () => {
            const result = UnitNormalizer.normalizeTemperature(298.15, Unit.KELVIN);
            expect(result).toBeCloseTo(25, 2);
        });

        it("should handle freezing point", () => {
            const result = UnitNormalizer.normalizeTemperature(32, Unit.FAHRENHEIT);
            expect(result).toBe(0);
        });

        it("should handle negative temperatures", () => {
            const result = UnitNormalizer.normalizeTemperature(-40, Unit.FAHRENHEIT);
            expect(result).toBe(-40); // -40°F = -40°C
        });
    });

    describe("Efficiency Normalization", () => {
        it("should keep % unchanged", () => {
            const result = UnitNormalizer.normalizeEfficiency(18.5, Unit.PERCENT);
            expect(result).toBe(18.5);
        });

        it("should convert decimal to %", () => {
            const result = UnitNormalizer.normalizeEfficiency(0.185, Unit.DECIMAL);
            expect(result).toBe(18.5);
        });

        it("should handle 100% efficiency (theoretical)", () => {
            const result = UnitNormalizer.normalizeEfficiency(1.0, Unit.DECIMAL);
            expect(result).toBe(100);
        });
    });

    describe("Unit Detection", () => {
        it("should detect W/m² from various formats", () => {
            expect(UnitNormalizer.detectUnit("W/m²")).toBe(Unit.W_PER_M2);
            expect(UnitNormalizer.detectUnit("w/m2")).toBe(Unit.W_PER_M2);
            expect(UnitNormalizer.detectUnit("wm2")).toBe(Unit.W_PER_M2);
        });

        it("should detect kWh from various formats", () => {
            expect(UnitNormalizer.detectUnit("kWh")).toBe(Unit.KWH);
            expect(UnitNormalizer.detectUnit("KWH")).toBe(Unit.KWH);
            expect(UnitNormalizer.detectUnit("kilowatthour")).toBe(Unit.KWH);
        });

        it("should detect temperature units", () => {
            expect(UnitNormalizer.detectUnit("°C")).toBe(Unit.CELSIUS);
            expect(UnitNormalizer.detectUnit("celsius")).toBe(Unit.CELSIUS);
            expect(UnitNormalizer.detectUnit("F")).toBe(Unit.FAHRENHEIT);
            expect(UnitNormalizer.detectUnit("Kelvin")).toBe(Unit.KELVIN);
        });

        it("should detect efficiency units", () => {
            expect(UnitNormalizer.detectUnit("%")).toBe(Unit.PERCENT);
            expect(UnitNormalizer.detectUnit("percent")).toBe(Unit.PERCENT);
            expect(UnitNormalizer.detectUnit("decimal")).toBe(Unit.DECIMAL);
        });

        it("should throw error for unknown unit", () => {
            expect(() => UnitNormalizer.detectUnit("foobar")).toThrow();
        });
    });

    describe("Auto-Normalization", () => {
        it("should auto-normalize irradiance from string", () => {
            const result = UnitNormalizer.autoNormalizeIrradiance(1.2, "kW/m²");
            expect(result).toBe(1200);
        });

        it("should auto-normalize temperature from string", () => {
            const result = UnitNormalizer.autoNormalizeTemperature(86, "F");
            expect(result).toBe(30);
        });

        it("should auto-normalize efficiency from string", () => {
            const result = UnitNormalizer.autoNormalizeEfficiency(0.22, "decimal");
            expect(result).toBe(22);
        });
    });

    describe("Edge Cases", () => {
        it("should handle very large irradiance values", () => {
            const result = UnitNormalizer.normalizeIrradiance(999999, Unit.W_PER_M2);
            expect(result).toBe(999999);
        });

        it("should handle very small efficiency values", () => {
            const result = UnitNormalizer.normalizeEfficiency(0.001, Unit.DECIMAL);
            expect(result).toBe(0.1);
        });

        it("should handle whitespace in unit strings", () => {
            expect(UnitNormalizer.detectUnit("  kWh  ")).toBe(Unit.KWH);
        });
    });
});
