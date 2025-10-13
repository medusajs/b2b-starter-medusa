import { solarSizingService } from "../services/sizing-service";
import { SolarCalculationInput } from "../types/common";

describe("Solar Sizing Service - Unit Tests", () => {
  describe("✅ Deterministic Calculations", () => {
    it("should produce identical results for identical inputs", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "SP",
        oversizing_target: 130,
      };

      const result1 = solarSizingService.calculate(input);
      const result2 = solarSizingService.calculate(input);

      expect(result1).toEqual(result2);
    });

    it("should calculate correct kWp for São Paulo", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "SP", // HSP = 5.0
        oversizing_target: 130,
      };

      const result = solarSizingService.calculate(input);
      
      // Expected: 500 * 12 / (5.0 * 365 * 0.82) = 4.01 kWp
      // With 130% oversizing: 4.01 * 1.3 = 5.21 kWp
      expect(result.kwp_necessario).toBeCloseTo(4.01, 1);
      expect(result.kwp_proposto).toBeGreaterThan(5.0);
      expect(result.oversizing_ratio).toBe(1.3);
    });

    it("should calculate correct kWp for Ceará (high irradiance)", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "CE", // HSP = 5.7
        oversizing_target: 130,
      };

      const result = solarSizingService.calculate(input);
      
      // Higher irradiance = lower kWp needed
      expect(result.kwp_necessario).toBeLessThan(4.0);
      expect(result.geracao_anual_kwh).toBeGreaterThan(6000);
    });

    it("should handle different oversizing targets", () => {
      const baseInput: SolarCalculationInput = {
        consumo_kwh_mes: 400,
        uf: "MG",
      };

      const result100 = solarSizingService.calculate({ ...baseInput, oversizing_target: 100 });
      const result130 = solarSizingService.calculate({ ...baseInput, oversizing_target: 130 });
      const result160 = solarSizingService.calculate({ ...baseInput, oversizing_target: 160 });

      // Account for panel rounding - compare ratios instead of exact values
      expect(result130.kwp_proposto / result100.kwp_proposto).toBeGreaterThan(1.2);
      expect(result160.kwp_proposto / result100.kwp_proposto).toBeGreaterThan(1.5);
    });
  });

  describe("✅ Panel and Inverter Sizing", () => {
    it("should calculate correct number of 550W panels", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 275, // Should result in ~3kWp
        uf: "SP",
        oversizing_target: 100,
      };

      const result = solarSizingService.calculate(input);
      
      // Verify panel calculation logic
      expect(result.numero_paineis).toBeGreaterThanOrEqual(5);
      expect(result.kwp_proposto).toBe(result.numero_paineis * 0.55);
    });

    it("should size inverter at 85% of panel power", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "SP",
        oversizing_target: 100,
      };

      const result = solarSizingService.calculate(input);
      
      const expectedInverter = Math.ceil(result.kwp_proposto * 0.85 * 10) / 10;
      expect(result.potencia_inversor_kw).toBe(expectedInverter);
    });

    it("should calculate area at 6.5 m² per kWp", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 300,
        uf: "RJ",
      };

      const result = solarSizingService.calculate(input);
      
      const expectedArea = Math.ceil(result.kwp_proposto * 6.5);
      expect(result.area_necessaria_m2).toBe(expectedArea);
    });
  });

  describe("✅ Regional Variations", () => {
    it("should use correct HSP values for different states", () => {
      const consumo = 400;
      
      const resultNE = solarSizingService.calculate({ consumo_kwh_mes: consumo, uf: "RN" }); // HSP 5.9
      const resultS = solarSizingService.calculate({ consumo_kwh_mes: consumo, uf: "RS" }); // HSP 4.7
      
      // Northeast should need less kWp due to higher irradiance
      expect(resultNE.kwp_necessario).toBeLessThan(resultS.kwp_necessario);
      // Generation depends on final kWp after panel rounding, so compare per kWp
      const generationPerKwpNE = resultNE.geracao_anual_kwh / resultNE.kwp_proposto;
      const generationPerKwpS = resultS.geracao_anual_kwh / resultS.kwp_proposto;
      expect(generationPerKwpNE).toBeGreaterThan(generationPerKwpS);
    });

    it("should handle unknown states with default HSP", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 400,
        uf: "XX", // Unknown state
      };

      const result = solarSizingService.calculate(input);
      
      // Should use default HSP of 5.0
      expect(result.kwp_necessario).toBeGreaterThan(0);
      expect(result.geracao_anual_kwh).toBeGreaterThan(0);
    });
  });

  describe("✅ Edge Cases", () => {
    it("should handle very low consumption", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 50, // Very low
        uf: "SP",
      };

      const result = solarSizingService.calculate(input);
      
      expect(result.kwp_necessario).toBeGreaterThan(0);
      expect(result.numero_paineis).toBeGreaterThanOrEqual(1);
    });

    it("should handle very high consumption", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 5000, // Very high
        uf: "SP",
      };

      const result = solarSizingService.calculate(input);
      
      expect(result.kwp_proposto).toBeGreaterThan(50);
      expect(result.numero_paineis).toBeGreaterThan(90);
    });

    it("should maintain performance ratio consistency", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 400,
        uf: "MG",
      };

      const result = solarSizingService.calculate(input);
      
      expect(result.performance_ratio).toBe(0.82);
    });
  });

  describe("✅ Calculation Precision", () => {
    it("should round results to appropriate precision", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 333, // Odd number to test rounding
        uf: "GO",
        oversizing_target: 145,
      };

      const result = solarSizingService.calculate(input);
      
      // kWp should be rounded to 2 decimal places
      expect(result.kwp_necessario.toString()).toMatch(/^\d+\.\d{2}$/);
      expect(result.kwp_proposto.toString()).toMatch(/^\d+\.\d{2}$/);
      
      // Inverter should be rounded to 1 decimal place
      expect(result.potencia_inversor_kw.toString()).toMatch(/^\d+\.\d$/);
      
      // Integers should be whole numbers
      expect(Number.isInteger(result.numero_paineis)).toBe(true);
      expect(Number.isInteger(result.area_necessaria_m2)).toBe(true);
      expect(Number.isInteger(result.geracao_anual_kwh)).toBe(true);
    });
  });
});