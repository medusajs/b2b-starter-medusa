import SolarModuleService from "../service";
import { SolarCalculationInput } from "../types/common";

describe("Solar Module - Integration Tests", () => {
  let solarService: SolarModuleService;
  let mockContainer: any;

  beforeEach(() => {
    mockContainer = {
      resolve: jest.fn(),
    };

    solarService = new SolarModuleService(mockContainer);
    
    // Mock database operations
    solarService.create = jest.fn();
    solarService.retrieve = jest.fn();
    solarService.list = jest.fn();
  });

  describe("✅ Complete Solar Calculation Flow", () => {
    it("should perform complete calculation and return deterministic results", async () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "SP",
        tipo_telhado: "ceramico",
        oversizing_target: 130,
        created_by: "user_123",
      };

      // Mock no existing calculation
      solarService.retrieve = jest.fn().mockResolvedValue(null);
      solarService.create = jest.fn().mockResolvedValue({ id: "sc_123" });

      const result = await solarService.calculateSolar(input);

      expect(result).toBeDefined();
      expect(result.dimensionamento.kwp_proposto).toBeGreaterThan(0);
      expect(result.financeiro.payback_anos).toBeGreaterThan(0);
      expect(result.kits_recomendados).toHaveLength(1);
      expect(result.calculation_hash).toBeDefined();
    });

    it("should return cached result for identical inputs", async () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 400,
        uf: "MG",
        oversizing_target: 130,
      };

      const cachedResult = {
        dimensionamento: {
          kwp_necessario: 3.5,
          kwp_proposto: 4.55,
          numero_paineis: 9,
          potencia_inversor_kw: 3.9,
          area_necessaria_m2: 30,
          geracao_anual_kwh: 6800,
          performance_ratio: 0.82,
          oversizing_ratio: 1.3,
        },
        financeiro: {
          capex_total_brl: 15925.00,
          economia_anual_brl: 5440.00,
          payback_anos: 2.9,
          tir_percentual: 18.5,
          vpl_brl: 45230.50,
        },
        kits_recomendados: [],
        co2_evitado_ton_25anos: 13.87,
        calculation_hash: "abc123def456",
      };

      // Mock existing calculation found
      solarService.retrieve = jest.fn().mockResolvedValue({
        id: "sc_existing",
        kwp_necessario: 3.5,
        kwp_proposto: 4.55,
        numero_paineis: 9,
        potencia_inversor_kw: 3.9,
        area_necessaria_m2: 30,
        geracao_anual_kwh: 6800,
        capex_total_brl: 15925.00,
        economia_anual_brl: 5440.00,
        payback_anos: 2.9,
        tir_percentual: 18.5,
        vpl_brl: 45230.50,
        co2_evitado_ton_25anos: 13.87,
        calculation_hash: "abc123def456",
        oversizing_target: 130,
      });

      solarService.list = jest.fn().mockResolvedValue([]);

      const result = await solarService.calculateSolar(input);

      expect(result.calculation_hash).toBe("abc123def456");
      expect(result.dimensionamento.kwp_proposto).toBe(4.55);
      expect(solarService.create).not.toHaveBeenCalled(); // Should not create new
    });

    it("should persist calculation and kits to database", async () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 600,
        uf: "RJ",
        created_by: "user_456",
      };

      solarService.retrieve = jest.fn().mockResolvedValue(null);
      solarService.create = jest.fn()
        .mockResolvedValueOnce({ id: "sc_new123" }) // Main calculation
        .mockResolvedValueOnce({ id: "sck_kit1" }); // Kit 1

      const result = await solarService.calculateSolar(input);

      // Should create main calculation
      expect(solarService.create).toHaveBeenCalledWith("SolarCalculation", 
        expect.objectContaining({
          consumo_kwh_mes: 600,
          uf: "RJ",
          created_by: "user_456",
          calculation_hash: expect.any(String),
        })
      );

      // Should create kit record
      expect(solarService.create).toHaveBeenCalledWith("SolarCalculationKit",
        expect.objectContaining({
          solar_calculation_id: "sc_new123",
          kit_id: expect.any(String),
          ranking_position: 1,
        })
      );
    });
  });

  describe("✅ Hash Generation and Determinism", () => {
    it("should generate identical hashes for identical inputs", async () => {
      const input1: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "SP",
        tipo_telhado: "ceramico",
        oversizing_target: 130,
      };

      const input2: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "SP",
        tipo_telhado: "ceramico",
        oversizing_target: 130,
      };

      solarService.retrieve = jest.fn().mockResolvedValue(null);
      solarService.create = jest.fn().mockResolvedValue({ id: "sc_test" });

      const result1 = await solarService.calculateSolar(input1);
      const result2 = await solarService.calculateSolar(input2);

      expect(result1.calculation_hash).toBe(result2.calculation_hash);
    });

    it("should generate different hashes for different inputs", async () => {
      const input1: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "SP",
      };

      const input2: SolarCalculationInput = {
        consumo_kwh_mes: 600, // Different consumption
        uf: "SP",
      };

      solarService.retrieve = jest.fn().mockResolvedValue(null);
      solarService.create = jest.fn().mockResolvedValue({ id: "sc_test" });

      const result1 = await solarService.calculateSolar(input1);
      const result2 = await solarService.calculateSolar(input2);

      expect(result1.calculation_hash).not.toBe(result2.calculation_hash);
    });
  });

  describe("✅ Kit Matching Integration", () => {
    it("should return mock kit when no real kits available", async () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 300,
        uf: "GO",
      };

      solarService.retrieve = jest.fn().mockResolvedValue(null);
      solarService.create = jest.fn().mockResolvedValue({ id: "sc_test" });

      const result = await solarService.calculateSolar(input);

      expect(result.kits_recomendados).toHaveLength(1);
      expect(result.kits_recomendados[0].kit_id).toContain("MOCK");
      expect(result.kits_recomendados[0].componentes.paineis).toBeDefined();
      expect(result.kits_recomendados[0].componentes.inversores).toBeDefined();
    });

    it("should match kit power to calculated kWp", async () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 800, // High consumption
        uf: "CE",
      };

      solarService.retrieve = jest.fn().mockResolvedValue(null);
      solarService.create = jest.fn().mockResolvedValue({ id: "sc_test" });

      const result = await solarService.calculateSolar(input);

      const kit = result.kits_recomendados[0];
      const calculatedKwp = result.dimensionamento.kwp_proposto;

      // Kit power should be close to calculated kWp
      expect(kit.potencia_kwp).toBeCloseTo(calculatedKwp, 0.5);
    });
  });

  describe("✅ Statistics and History", () => {
    it("should calculate statistics from stored calculations", async () => {
      const mockCalculations = [
        { kwp_proposto: 5.0, payback_anos: 3.2, uf: "SP" },
        { kwp_proposto: 7.5, payback_anos: 2.8, uf: "RJ" },
        { kwp_proposto: 4.2, payback_anos: 4.1, uf: "SP" },
      ];

      solarService.list = jest.fn().mockResolvedValue(mockCalculations);

      const stats = await solarService.getCalculationStats();

      expect(stats.total_calculations).toBe(3);
      expect(stats.avg_kwp).toBeCloseTo(5.57, 1); // (5.0 + 7.5 + 4.2) / 3
      expect(stats.avg_payback).toBeCloseTo(3.4, 1); // (3.2 + 2.8 + 4.1) / 3
      expect(stats.by_state.SP).toBe(2);
      expect(stats.by_state.RJ).toBe(1);
    });

    it("should filter calculation history by criteria", async () => {
      const filters = {
        uf: "MG",
        kwp_min: 3.0,
        kwp_max: 8.0,
        created_by: "user_123",
      };

      solarService.list = jest.fn().mockResolvedValue([]);

      await solarService.getCalculationHistory(filters);

      expect(solarService.list).toHaveBeenCalledWith("SolarCalculation", {
        where: {
          uf: "MG",
          kwp_proposto: { $gte: 3.0, $lte: 8.0 },
          created_by: "user_123",
        },
        order: { created_at: "DESC" },
        take: 50,
      });
    });
  });

  describe("✅ Error Handling", () => {
    it("should continue calculation even if persistence fails", async () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 400,
        uf: "PR",
      };

      solarService.retrieve = jest.fn().mockResolvedValue(null);
      solarService.create = jest.fn().mockRejectedValue(new Error("Database error"));

      // Should not throw error
      const result = await solarService.calculateSolar(input);

      expect(result).toBeDefined();
      expect(result.dimensionamento.kwp_proposto).toBeGreaterThan(0);
    });

    it("should handle retrieval errors gracefully", async () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "SC",
      };

      solarService.retrieve = jest.fn().mockRejectedValue(new Error("Query error"));
      solarService.create = jest.fn().mockResolvedValue({ id: "sc_test" });

      const result = await solarService.calculateSolar(input);

      expect(result).toBeDefined();
      expect(result.calculation_hash).toBeDefined();
    });
  });

  describe("✅ Business Logic Validation", () => {
    it("should validate oversizing limits", async () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 500,
        uf: "BA",
        oversizing_target: 160, // Maximum allowed
      };

      solarService.retrieve = jest.fn().mockResolvedValue(null);
      solarService.create = jest.fn().mockResolvedValue({ id: "sc_test" });

      const result = await solarService.calculateSolar(input);

      expect(result.dimensionamento.oversizing_ratio).toBe(1.6);
      expect(result.dimensionamento.kwp_proposto).toBeGreaterThan(
        result.dimensionamento.kwp_necessario * 1.5
      );
    });

    it("should calculate environmental impact correctly", async () => {
      const input: SolarCalculationInput = {
        consumo_kwh_mes: 600,
        uf: "PE",
      };

      solarService.retrieve = jest.fn().mockResolvedValue(null);
      solarService.create = jest.fn().mockResolvedValue({ id: "sc_test" });

      const result = await solarService.calculateSolar(input);

      // CO2 avoided should be positive and reasonable
      expect(result.co2_evitado_ton_25anos).toBeGreaterThan(0);
      expect(result.co2_evitado_ton_25anos).toBeLessThan(100); // Sanity check
    });
  });
});