import { MedusaService } from "@medusajs/framework/utils";
import { SolarCalculation, SolarCalculationKit } from "./models";
import {
  SolarCalculationInput,
  SolarCalculationResult,
  SolarKit
} from "./types/common";
import { solarSizingService } from "./services/sizing-service";
import { solarROIService } from "./services/roi-service";
import { solarKitMatcherService } from "./services/kit-matcher-service";
import crypto from "crypto";

class SolarModuleService extends MedusaService({
  SolarCalculation,
  SolarCalculationKit,
}) {

  // Pure calculation with deterministic results
  async calculateSolar(input: SolarCalculationInput): Promise<SolarCalculationResult> {
    // Generate deterministic hash for caching
    const calculation_hash = this.generateCalculationHash(input);

    // Check if calculation already exists
    const existing = await this.findExistingCalculation(calculation_hash);
    if (existing) {
      return existing;
    }

    // Perform calculations using pure services
    const dimensionamento = solarSizingService.calculate(input);

    // Estimate CAPEX (R$ 3500/kWp average)
    const capex_total = dimensionamento.kwp_proposto * 3500;

    const financeiro = solarROIService.calculate(input, dimensionamento, capex_total);

    // Find matching kits
    const kits_recomendados = solarKitMatcherService.findMatchingKits({
      kwp_alvo: dimensionamento.kwp_proposto,
      kwp_tolerance: 15,
      budget_max: input.tarifa_energia_kwh ? undefined : capex_total * 1.2,
    });

    // Environmental impact (simplified)
    const co2_evitado_ton_25anos = Math.round(
      (dimensionamento.geracao_anual_kwh * 25 * 0.0817) / 1000 * 100
    ) / 100;

    const result: SolarCalculationResult = {
      dimensionamento,
      financeiro,
      kits_recomendados,
      co2_evitado_ton_25anos,
      calculation_hash,
    };

    // Persist calculation
    await this.persistCalculation(input, result);

    return result;
  }

  // Persist calculation and kits
  private async persistCalculation(
    input: SolarCalculationInput,
    result: SolarCalculationResult
  ): Promise<void> {
    try {
      // Create main calculation record
      const [calculation] = await this.createSolarCalculations([{
        consumo_kwh_mes: input.consumo_kwh_mes,
        uf: input.uf,
        cep: input.cep,
        tipo_telhado: input.tipo_telhado,
        area_disponivel_m2: input.area_disponivel_m2,
        oversizing_target: input.oversizing_target || 130,
        kwp_necessario: result.dimensionamento.kwp_necessario,
        kwp_proposto: result.dimensionamento.kwp_proposto,
        numero_paineis: result.dimensionamento.numero_paineis,
        potencia_inversor_kw: result.dimensionamento.potencia_inversor_kw,
        area_necessaria_m2: result.dimensionamento.area_necessaria_m2,
        geracao_anual_kwh: result.dimensionamento.geracao_anual_kwh,
        capex_total_brl: result.financeiro.capex_total_brl,
        economia_anual_brl: result.financeiro.economia_anual_brl,
        payback_anos: result.financeiro.payback_anos,
        tir_percentual: result.financeiro.tir_percentual,
        vpl_brl: result.financeiro.vpl_brl,
        co2_evitado_ton_25anos: result.co2_evitado_ton_25anos,
        calculation_hash: result.calculation_hash,
        created_by: input.created_by,
      }]);

      // Create kit records
      const kitData = result.kits_recomendados.map((kit, i) => ({
        solar_calculation_id: calculation.id,
        kit_id: kit.kit_id,
        nome: kit.nome,
        potencia_kwp: kit.potencia_kwp,
        match_score: kit.match_score,
        preco_brl: kit.preco_brl,
        componentes: kit.componentes,
        disponibilidade: kit.disponibilidade,
        ranking_position: i + 1,
      }));

      await this.createSolarCalculationKits(kitData);
    } catch (error) {
      console.error("Error persisting solar calculation:", error);
      // Don't throw - calculation can still be returned
    }
  }

  // Find existing calculation by hash
  private async findExistingCalculation(hash: string): Promise<SolarCalculationResult | null> {
    try {
      const calculations = await this.listSolarCalculations({ calculation_hash: hash });
      const calculation = calculations[0];

      if (!calculation) return null;

      const kits = await this.listSolarCalculationKits({
        solar_calculation_id: calculation.id,
      });

      // Sort by ranking position
      kits.sort((a, b) => a.ranking_position - b.ranking_position);

      return {
        dimensionamento: {
          kwp_necessario: calculation.kwp_necessario,
          kwp_proposto: calculation.kwp_proposto,
          numero_paineis: calculation.numero_paineis,
          potencia_inversor_kw: calculation.potencia_inversor_kw,
          area_necessaria_m2: calculation.area_necessaria_m2,
          geracao_anual_kwh: calculation.geracao_anual_kwh,
          performance_ratio: 0.82,
          oversizing_ratio: calculation.oversizing_target / 100,
        },
        financeiro: {
          capex_total_brl: calculation.capex_total_brl,
          economia_anual_brl: calculation.economia_anual_brl,
          payback_anos: calculation.payback_anos,
          tir_percentual: calculation.tir_percentual,
          vpl_brl: calculation.vpl_brl,
        },
        kits_recomendados: kits.map(kit => ({
          kit_id: kit.kit_id,
          nome: kit.nome,
          potencia_kwp: kit.potencia_kwp,
          match_score: kit.match_score,
          preco_brl: kit.preco_brl,
          componentes: kit.componentes as any,
          disponibilidade: kit.disponibilidade as any,
        })),
        co2_evitado_ton_25anos: calculation.co2_evitado_ton_25anos,
        calculation_hash: calculation.calculation_hash,
      };
    } catch (error) {
      console.error("Error finding existing calculation:", error);
      return null;
    }
  }

  // Generate deterministic hash for input
  private generateCalculationHash(input: SolarCalculationInput): string {
    const hashInput = {
      consumo_kwh_mes: input.consumo_kwh_mes,
      uf: input.uf,
      tipo_telhado: input.tipo_telhado || "ceramico",
      oversizing_target: input.oversizing_target || 130,
      tarifa_energia_kwh: input.tarifa_energia_kwh || 0,
    };

    return crypto
      .createHash("sha256")
      .update(JSON.stringify(hashInput))
      .digest("hex")
      .substring(0, 16);
  }

  // Get calculation history
  async getCalculationHistory(filters?: {
    uf?: string;
    kwp_min?: number;
    kwp_max?: number;
    created_by?: string;
  }): Promise<any[]> {
    const where: any = {};

    if (filters?.uf) where.uf = filters.uf;
    if (filters?.kwp_min) where.kwp_proposto = { $gte: filters.kwp_min };
    if (filters?.kwp_max) {
      where.kwp_proposto = {
        ...where.kwp_proposto,
        $lte: filters.kwp_max
      };
    }
    if (filters?.created_by) where.created_by = filters.created_by;

    return await this.listSolarCalculations(where);
  }

  // Get calculation statistics
  async getCalculationStats(): Promise<{
    total_calculations: number;
    avg_kwp: number;
    avg_payback: number;
    by_state: Record<string, number>;
  }> {
    const calculations = await this.listSolarCalculations({});

    const stats = {
      total_calculations: calculations.length,
      avg_kwp: 0,
      avg_payback: 0,
      by_state: {} as Record<string, number>,
    };

    if (calculations.length > 0) {
      stats.avg_kwp = calculations.reduce((sum, calc) => sum + calc.kwp_proposto, 0) / calculations.length;
      stats.avg_payback = calculations.reduce((sum, calc) => sum + calc.payback_anos, 0) / calculations.length;

      calculations.forEach(calc => {
        stats.by_state[calc.uf] = (stats.by_state[calc.uf] || 0) + 1;
      });
    }

    return {
      ...stats,
      avg_kwp: Math.round(stats.avg_kwp * 100) / 100,
      avg_payback: Math.round(stats.avg_payback * 10) / 10,
    };
  }
}

export default SolarModuleService;