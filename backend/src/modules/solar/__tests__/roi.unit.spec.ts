import { solarROIService } from "../services/roi-service";
import { SolarCalculationInput, SolarDimensionamento } from "../types/common";

describe("Solar ROI Service - Unit Tests", () => {
  const mockDimensionamento: SolarDimensionamento = {
    kwp_necessario: 4.0,
    kwp_proposto: 5.2,
    numero_paineis: 10,
    potencia_inversor_kw: 4.4,
    area_necessaria_m2: 34,
    geracao_anual_kwh: 7800,
    performance_ratio: 0.82,
    oversizing_ratio: 1.3,
  };

  describe("✅ Deterministic Financial Calculations", () => {
    it("should produce identical results for identical inputs", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "SP",
        tarifa_energia_kwh: 0.85,
      };
      const capex = 18000;

      const result1 = solarROIService.calculate(input, mockDimensionamento, capex);
      const result2 = solarROIService.calculate(input, mockDimensionamento, capex);

      expect(result1).toEqual(result2);
    });

    it("should calculate correct payback for known scenario", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "SP",
        tarifa_energia_kwh: 0.80,
      };
      const capex = 20000;

      const result = solarROIService.calculate(input, mockDimensionamento, capex);
      
      // Expected: 7800 kWh * R$ 0.80 = R$ 6240/year
      // Payback: R$ 20000 / R$ 6240 = 3.2 years
      expect(result.economia_anual_brl).toBe(6240);
      expect(result.payback_anos).toBeCloseTo(3.2, 1);
    });

    it("should use state tariff when not provided", () => {
      const inputSP: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "SP", // Tariff: 0.82
      };
      const inputRJ: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "RJ", // Tariff: 0.88
      };
      const capex = 20000;

      const resultSP = solarROIService.calculate(inputSP, mockDimensionamento, capex);
      const resultRJ = solarROIService.calculate(inputRJ, mockDimensionamento, capex);
      
      // RJ has higher tariff, so better economics
      expect(resultRJ.economia_anual_brl).toBeGreaterThan(resultSP.economia_anual_brl);
      expect(resultRJ.payback_anos).toBeLessThan(resultSP.payback_anos);
    });
  });

  describe("✅ VPL Calculations with Degradation", () => {
    it("should calculate positive VPL for good investment", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "CE", // High irradiance state
        tarifa_energia_kwh: 0.85,
      };
      const capex = 15000; // Lower CAPEX

      const result = solarROIService.calculate(input, mockDimensionamento, capex);
      
      expect(result.vpl_brl).toBeGreaterThan(0);
      expect(result.tir_percentual).toBeGreaterThan(8); // Above discount rate
    });

    it("should calculate negative VPL for poor investment", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 200, // Low consumption
        uf: "AC", // Lower irradiance
        tarifa_energia_kwh: 0.60, // Low tariff
      };
      const capex = 25000; // High CAPEX

      const lowGeneration: SolarDimensionamento = {
        ...mockDimensionamento,
        geracao_anual_kwh: 3000, // Low generation
      };

      const result = solarROIService.calculate(input, lowGeneration, capex);
      
      expect(result.vpl_brl).toBeLessThan(0);
      expect(result.payback_anos).toBeGreaterThan(10);
    });

    it("should account for panel degradation over 25 years", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "SP",
        tarifa_energia_kwh: 0.80,
      };
      const capex = 20000;

      const result = solarROIService.calculate(input, mockDimensionamento, capex);
      
      // VPL should be less than simple 25-year multiplication due to degradation
      const simpleCalculation = (mockDimensionamento.geracao_anual_kwh * 0.80 * 25) - capex;
      expect(result.vpl_brl).toBeLessThan(simpleCalculation);
    });
  });

  describe("✅ TIR Calculations", () => {
    it("should calculate reasonable TIR for typical scenario", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "MG",
        tarifa_energia_kwh: 0.80,
      };
      const capex = 18000;

      const result = solarROIService.calculate(input, mockDimensionamento, capex);
      
      // TIR should be between 10-25% for good solar investments
      expect(result.tir_percentual).toBeGreaterThan(10);
      expect(result.tir_percentual).toBeLessThan(25);
    });

    it("should show higher TIR for better scenarios", () => {
      const goodInput: SolarCalculationInput = {
        consumo_kwh_mes: 600,
        uf: "BA", // High irradiance
        tarifa_energia_kwh: 0.90, // High tariff
      };
      const poorInput: SolarCalculationInput = {
        consumo_kwh_mes: 300,
        uf: "RS", // Lower irradiance
        tarifa_energia_kwh: 0.70, // Lower tariff
      };
      const capex = 20000;

      const goodResult = solarROIService.calculate(goodInput, mockDimensionamento, capex);
      const poorResult = solarROIService.calculate(poorInput, mockDimensionamento, capex);
      
      expect(goodResult.tir_percentual).toBeGreaterThan(poorResult.tir_percentual);
    });
  });

  describe("✅ Regional Tariff Variations", () => {
    it("should use correct tariffs for different states", () => {
      const capex = 20000;
      
      // Test high tariff state (RJ: 0.88)
      const inputRJ: SolarCalculationInput = { consumo_kwh_mes: 500, uf: "RJ" };
      const resultRJ = solarROIService.calculate(inputRJ, mockDimensionamento, capex);
      
      // Test low tariff state (DF: 0.68)
      const inputDF: SolarCalculationInput = { consumo_kwh_mes: 500, uf: "DF" };
      const resultDF = solarROIService.calculate(inputDF, mockDimensionamento, capex);
      
      expect(resultRJ.economia_anual_brl).toBeGreaterThan(resultDF.economia_anual_brl);
      expect(resultRJ.payback_anos).toBeLessThan(resultDF.payback_anos);
    });

    it("should handle unknown states with default tariff", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "XX", // Unknown state
      };
      const capex = 20000;

      const result = solarROIService.calculate(input, mockDimensionamento, capex);
      
      // Should use default tariff of 0.80
      const expectedEconomy = mockDimensionamento.geracao_anual_kwh * 0.80;
      expect(result.economia_anual_brl).toBe(expectedEconomy);
    });
  });

  describe("✅ Precision and Rounding", () => {
    it("should round financial values to appropriate precision", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 333, // Odd number for testing
        uf: "GO",
        tarifa_energia_kwh: 0.777, // Odd tariff
      };
      const capex = 17777.77;

      const result = solarROIService.calculate(input, mockDimensionamento, capex);
      
      // Currency values should be rounded to 2 decimal places
      expect(result.capex_total_brl.toString()).toMatch(/^\d+\.\d{2}$/);
      expect(result.economia_anual_brl.toString()).toMatch(/^\d+\.\d{2}$/);
      expect(result.vpl_brl.toString()).toMatch(/^-?\d+\.\d{2}$/);
      
      // Percentages and years should be rounded to 1 decimal place
      expect(result.tir_percentual.toString()).toMatch(/^\d+\.\d$/);
      expect(result.payback_anos.toString()).toMatch(/^\d+\.\d$/);
    });
  });

  describe("✅ Edge Cases", () => {
    it("should handle zero tariff gracefully", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "SP",
        tarifa_energia_kwh: 0,
      };
      const capex = 20000;

      const result = solarROIService.calculate(input, mockDimensionamento, capex);
      
      expect(result.economia_anual_brl).toBe(0);
      expect(result.payback_anos).toBe(Infinity);
      expect(result.vpl_brl).toBeLessThan(0);
    });

    it("should handle very high CAPEX", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "SP",
        tarifa_energia_kwh: 0.80,
      };
      const capex = 100000; // Very high

      const result = solarROIService.calculate(input, mockDimensionamento, capex);
      
      expect(result.payback_anos).toBeGreaterThan(15);
      expect(result.vpl_brl).toBeLessThan(0);
      expect(result.tir_percentual).toBeLessThan(5);
    });

    it("should handle very low generation", () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "SP",
        tarifa_energia_kwh: 0.80,
      };
      const capex = 20000;
      
      const lowGeneration: SolarDimensionamento = {
        ...mockDimensionamento,
        geracao_anual_kwh: 1000, // Very low
      };

      const result = solarROIService.calculate(input, lowGeneration, capex);
      
      expect(result.economia_anual_brl).toBe(800);
      expect(result.payback_anos).toBe(25); // 20000 / 800
    });
  });
});