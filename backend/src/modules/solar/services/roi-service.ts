import { SolarCalculationInput, SolarDimensionamento, SolarFinanceiro } from "../types/common";

export class SolarROIService {
  private readonly VIDA_UTIL_ANOS = 25;
  private readonly DEGRADACAO_ANUAL = 0.005;
  private readonly TAXA_DESCONTO = 0.08;
  
  private readonly TARIFAS_POR_ESTADO: Record<string, number> = {
    'AC': 0.85, 'AL': 0.75, 'AP': 0.70, 'AM': 0.82, 'BA': 0.73,
    'CE': 0.78, 'DF': 0.68, 'ES': 0.77, 'GO': 0.72, 'MA': 0.80,
    'MT': 0.76, 'MS': 0.74, 'MG': 0.80, 'PA': 0.85, 'PB': 0.76,
    'PR': 0.78, 'PE': 0.81, 'PI': 0.79, 'RJ': 0.88, 'RN': 0.77,
    'RS': 0.79, 'RO': 0.83, 'RR': 0.72, 'SC': 0.75, 'SP': 0.82,
    'SE': 0.75, 'TO': 0.77
  };

  calculate(
    input: SolarCalculationInput,
    dimensionamento: SolarDimensionamento,
    capex_total: number
  ): SolarFinanceiro {
    const tarifa = input.tarifa_energia_kwh || this.TARIFAS_POR_ESTADO[input.uf] || 0.80;
    const economia_anual = dimensionamento.geracao_anual_kwh * tarifa;
    
    // Payback simples
    const payback_anos = economia_anual > 0 ? capex_total / economia_anual : Infinity;
    
    // VPL com degradação
    let vpl = -capex_total;
    for (let ano = 1; ano <= this.VIDA_UTIL_ANOS; ano++) {
      const degradacao = Math.pow(1 - this.DEGRADACAO_ANUAL, ano - 1);
      const fluxo = dimensionamento.geracao_anual_kwh * degradacao * tarifa;
      vpl += fluxo / Math.pow(1 + this.TAXA_DESCONTO, ano);
    }
    
    // TIR simplificada
    const economia_total = this.calcularEconomiaTotal(dimensionamento.geracao_anual_kwh, tarifa);
    const tir = economia_total > capex_total ? ((economia_total / capex_total) ** (1 / this.VIDA_UTIL_ANOS) - 1) * 100 : 0;
    
    return {
      capex_total_brl: Math.round(capex_total * 100) / 100,
      economia_anual_brl: Math.round(economia_anual * 100) / 100,
      payback_anos: payback_anos === Infinity ? Infinity : Math.round(payback_anos * 10) / 10,
      tir_percentual: Math.round(tir * 10) / 10,
      vpl_brl: Math.round(vpl * 100) / 100,
    };
  }

  private calcularEconomiaTotal(geracao_anual: number, tarifa: number): number {
    let total = 0;
    for (let ano = 1; ano <= this.VIDA_UTIL_ANOS; ano++) {
      const degradacao = Math.pow(1 - this.DEGRADACAO_ANUAL, ano - 1);
      total += geracao_anual * degradacao * tarifa;
    }
    return total;
  }
}

export const solarROIService = new SolarROIService();