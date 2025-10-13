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
    // Handle zero tariff case explicitly
    const tarifa = input.tarifa_energia_kwh === 0 ? 0 : 
                   (input.tarifa_energia_kwh || this.TARIFAS_POR_ESTADO[input.uf] || 0.80);
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
    
    // TIR usando método iterativo mais preciso
    const tir = this.calcularTIR(dimensionamento.geracao_anual_kwh, tarifa, capex_total);
    
    return {
      capex_total_brl: this.roundToCurrency(capex_total),
      economia_anual_brl: this.roundToCurrency(economia_anual),
      payback_anos: payback_anos === Infinity ? Infinity : this.roundToDecimal(payback_anos, 1),
      tir_percentual: this.roundToDecimal(tir, 1),
      vpl_brl: this.roundToCurrency(vpl),
    };
  }

  private calcularTIR(geracao_anual: number, tarifa: number, capex: number): number {
    if (tarifa === 0 || geracao_anual === 0) return 0;
    
    // Método de Newton-Raphson para TIR
    let tir = 0.1; // Chute inicial de 10%
    const maxIterations = 100;
    const tolerance = 0.0001;
    
    for (let i = 0; i < maxIterations; i++) {
      let vpl = -capex;
      let derivada = 0;
      
      for (let ano = 1; ano <= this.VIDA_UTIL_ANOS; ano++) {
        const degradacao = Math.pow(1 - this.DEGRADACAO_ANUAL, ano - 1);
        const fluxo = geracao_anual * degradacao * tarifa;
        const fator = Math.pow(1 + tir, ano);
        
        vpl += fluxo / fator;
        derivada -= (ano * fluxo) / (fator * (1 + tir));
      }
      
      if (Math.abs(vpl) < tolerance) break;
      if (Math.abs(derivada) < tolerance) break;
      
      tir = tir - vpl / derivada;
      
      // Limitar TIR entre -100% e 100%
      tir = Math.max(-0.99, Math.min(0.99, tir));
    }
    
    return tir * 100;
  }
  
  private roundToCurrency(value: number): number {
    // Round to 2 decimal places and ensure it always has 2 decimal places when converted to string
    const rounded = Math.round(value * 100) / 100;
    return parseFloat(rounded.toFixed(2));
  }
  
  private roundToDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}

export const solarROIService = new SolarROIService();