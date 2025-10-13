/**
 * Unit Tests for Solar Feasibility Validation Workflow
 * 
 * Tests:
 * - validateSolarFeasibilityWorkflow
 * - Blocking errors (irradiation, area, capacity)
 * - Warnings (marginal conditions)
 * - Installation complexity calculation
 */

import { validateSolarFeasibilityWorkflow } from "../validate-solar-feasibility";

describe("validateSolarFeasibilityWorkflow - Blocking Errors", () => {
  it("should block project with low irradiation", async () => {
    const input = {
      cart_id: "cart_test_123",
      metadata: {
        tipo_produto: "sistema_solar",
        solar_irradiation_kwh_m2_day: 3.0, // < 3.5 (minimum)
        roof_area_m2: 50,
        solar_capacity_kw: 5.5,
        roof_type: "ceramica",
        building_type: "residencial",
      },
    };

    const { result } = await validateSolarFeasibilityWorkflow.run({ input });

    expect(result).toBeDefined();
    expect((result as any).is_feasible).toBe(false);
    expect((result as any).blocking_errors).toContain(
      "Irradiação solar muito baixa (< 3.5 kWh/m²/dia). ROI inviável."
    );
  });

  it("should block project with insufficient roof area", async () => {
    const input = {
      cart_id: "cart_test_123",
      metadata: {
        tipo_produto: "sistema_solar",
        solar_irradiation_kwh_m2_day: 5.5,
        roof_area_m2: 20, // Insuficiente para 5.5 kWp (~7m²/kWp = 38.5m² necessário)
        solar_capacity_kw: 5.5,
        roof_type: "ceramica",
        building_type: "residencial",
      },
    };

    const { result } = await validateSolarFeasibilityWorkflow.run({ input });

    expect((result as any).is_feasible).toBe(false);
    expect((result as any).blocking_errors.some((err: string) =>
      err.includes("Área de telhado insuficiente")
    )).toBe(true);
  });

  it("should block project with very low capacity", async () => {
    const input = {
      cart_id: "cart_test_123",
      metadata: {
        tipo_produto: "sistema_solar",
        solar_irradiation_kwh_m2_day: 5.5,
        roof_area_m2: 50,
        solar_capacity_kw: 1.2, // < 1.5 kWp (minimum)
        roof_type: "ceramica",
        building_type: "residencial",
      },
    };

    const { result } = await validateSolarFeasibilityWorkflow.run({ input });

    expect((result as any).is_feasible).toBe(false);
    expect((result as any).blocking_errors.some((err: string) =>
      err.includes("Capacidade muito baixa")
    )).toBe(true);
  });
});

describe("validateSolarFeasibilityWorkflow - Viable Projects", () => {
  it("should validate viable residential project", async () => {
    const input = {
      cart_id: "cart_test_123",
      metadata: {
        tipo_produto: "sistema_solar",
        solar_irradiation_kwh_m2_day: 5.5,
        roof_area_m2: 50,
        solar_capacity_kw: 5.5,
        roof_type: "ceramica",
        building_type: "residencial",
      },
    };

    const { result } = await validateSolarFeasibilityWorkflow.run({ input });

    expect((result as any).is_feasible).toBe(true);
    expect((result as any).blocking_errors).toHaveLength(0);
    expect((result as any).validation_details.irradiation_check.passed).toBe(true);
    expect((result as any).validation_details.roof_area_check.passed).toBe(true);
    expect((result as any).validation_details.capacity_check.passed).toBe(true);
  });

  it("should validate viable commercial project", async () => {
    const input = {
      cart_id: "cart_test_123",
      metadata: {
        tipo_produto: "sistema_solar",
        solar_irradiation_kwh_m2_day: 6.0,
        roof_area_m2: 250,
        solar_capacity_kw: 30,
        roof_type: "metalico",
        building_type: "comercial",
      },
    };

    const { result } = await validateSolarFeasibilityWorkflow.run({ input });

    expect((result as any).is_feasible).toBe(true);
    expect((result as any).blocking_errors).toHaveLength(0);
    expect((result as any).validation_details.installation_complexity).toBe("medium");
  });

  it("should validate viable industrial project", async () => {
    const input = {
      cart_id: "cart_test_123",
      metadata: {
        tipo_produto: "sistema_solar",
        solar_irradiation_kwh_m2_day: 5.8,
        roof_area_m2: 500,
        solar_capacity_kw: 60,
        roof_type: "laje",
        building_type: "industrial",
      },
    };

    const { result } = await validateSolarFeasibilityWorkflow.run({ input });

    expect((result as any).is_feasible).toBe(true);
    expect((result as any).validation_details.installation_complexity).toBe("high");
    expect((result as any).validation_details.crane_required).toBe(true);
  });
});

describe("validateSolarFeasibilityWorkflow - Warnings", () => {
  it("should warn about low irradiation (marginal)", async () => {
    const input = {
      cart_id: "cart_test_123",
      metadata: {
        tipo_produto: "sistema_solar",
        solar_irradiation_kwh_m2_day: 3.8, // 3.5-4.0 (marginal)
        roof_area_m2: 50,
        solar_capacity_kw: 5.5,
        roof_type: "ceramica",
        building_type: "residencial",
      },
    };

    const { result } = await validateSolarFeasibilityWorkflow.run({ input });

    expect((result as any).is_feasible).toBe(true);
    expect((result as any).warnings.some((w: string) =>
      w.includes("Irradiação solar abaixo da média")
    )).toBe(true);
  });

  it("should warn about tight roof area", async () => {
    const input = {
      cart_id: "cart_test_123",
      metadata: {
        tipo_produto: "sistema_solar",
        solar_irradiation_kwh_m2_day: 5.5,
        roof_area_m2: 40, // ~7m²/kWp * 5.5 = 38.5m² (< 20% margem)
        solar_capacity_kw: 5.5,
        roof_type: "ceramica",
        building_type: "residencial",
      },
    };

    const { result } = await validateSolarFeasibilityWorkflow.run({ input });

    expect((result as any).is_feasible).toBe(true);
    expect((result as any).warnings.some((w: string) =>
      w.includes("Área de telhado justa")
    )).toBe(true);
  });

  it("should warn about crane requirement", async () => {
    const input = {
      cart_id: "cart_test_123",
      metadata: {
        tipo_produto: "sistema_solar",
        solar_irradiation_kwh_m2_day: 5.5,
        roof_area_m2: 300,
        solar_capacity_kw: 35, // > 30 kWp + laje = crane required
        roof_type: "laje",
        building_type: "comercial",
      },
    };

    const { result } = await validateSolarFeasibilityWorkflow.run({ input });

    expect((result as any).is_feasible).toBe(true);
    expect((result as any).warnings.some((w: string) =>
      w.includes("Equipamento especial necessário")
    )).toBe(true);
    expect((result as any).validation_details.crane_required).toBe(true);
  });
});

describe("validateSolarFeasibilityWorkflow - Installation Complexity", () => {
  it("should calculate low complexity (residential, ceramic, ≤10kWp)", async () => {
    const input = {
      cart_id: "cart_test_123",
      metadata: {
        tipo_produto: "sistema_solar",
        solar_irradiation_kwh_m2_day: 5.5,
        roof_area_m2: 50,
        solar_capacity_kw: 8,
        roof_type: "ceramica",
        building_type: "residencial",
      },
    };

    const { result } = await validateSolarFeasibilityWorkflow.run({ input });

    expect((result as any).validation_details.installation_complexity).toBe("low");
    expect((result as any).validation_details.crane_required).toBe(false);
  });

  it("should calculate medium complexity (residential laje, ≤10kWp)", async () => {
    const input = {
      cart_id: "cart_test_123",
      metadata: {
        tipo_produto: "sistema_solar",
        solar_irradiation_kwh_m2_day: 5.5,
        roof_area_m2: 70,
        solar_capacity_kw: 10,
        roof_type: "laje",
        building_type: "residencial",
      },
    };

    const { result } = await validateSolarFeasibilityWorkflow.run({ input });

    expect((result as any).validation_details.installation_complexity).toBe("medium");
  });

  it("should calculate high complexity (laje + >30kWp)", async () => {
    const input = {
      cart_id: "cart_test_123",
      metadata: {
        tipo_produto: "sistema_solar",
        solar_irradiation_kwh_m2_day: 5.5,
        roof_area_m2: 250,
        solar_capacity_kw: 35,
        roof_type: "laje",
        building_type: "comercial",
      },
    };

    const { result } = await validateSolarFeasibilityWorkflow.run({ input });

    expect((result as any).validation_details.installation_complexity).toBe("high");
    expect((result as any).validation_details.crane_required).toBe(true);
  });

  it("should calculate very high complexity (industrial + >50kWp)", async () => {
    const input = {
      cart_id: "cart_test_123",
      metadata: {
        tipo_produto: "sistema_solar",
        solar_irradiation_kwh_m2_day: 5.5,
        roof_area_m2: 500,
        solar_capacity_kw: 70,
        roof_type: "metalico",
        building_type: "industrial",
      },
    };

    const { result } = await validateSolarFeasibilityWorkflow.run({ input });

    expect((result as any).validation_details.installation_complexity).toBe("very_high");
    expect((result as any).validation_details.crane_required).toBe(true);
  });
});

describe("validateSolarFeasibilityWorkflow - Edge Cases", () => {
  it("should skip validation for non-solar products", async () => {
    const input = {
      cart_id: "cart_test_123",
      metadata: {
        tipo_produto: "inversor", // Not "sistema_solar"
      },
    };

    const { result } = await validateSolarFeasibilityWorkflow.run({ input });

    // Should skip validation and return default viable
    expect((result as any).is_feasible).toBe(true);
    expect((result as any).blocking_errors).toHaveLength(0);
  });

  it("should handle missing metadata gracefully", async () => {
    const input = {
      cart_id: "cart_test_123",
      metadata: {
        tipo_produto: "sistema_solar",
        // Missing solar_irradiation_kwh_m2_day, roof_area_m2, etc.
      },
    };

    const { result } = await validateSolarFeasibilityWorkflow.run({ input });

    // Should have blocking errors for missing data
    expect((result as any).is_feasible).toBe(false);
    expect((result as any).blocking_errors.length).toBeGreaterThan(0);
  });

  it("should handle extreme values", async () => {
    const input = {
      cart_id: "cart_test_123",
      metadata: {
        tipo_produto: "sistema_solar",
        solar_irradiation_kwh_m2_day: 8.5, // Extremely high (desert)
        roof_area_m2: 1000, // Very large
        solar_capacity_kw: 200, // Very large industrial
        roof_type: "laje",
        building_type: "industrial",
      },
    };

    const { result } = await validateSolarFeasibilityWorkflow.run({ input });

    expect((result as any).is_feasible).toBe(true);
    expect((result as any).validation_details.installation_complexity).toBe("very_high");
  });
});
