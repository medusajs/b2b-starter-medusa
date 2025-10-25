import { SolarCalculationInput, SolarDimensionamento } from "../types/common";

export class SolarSizingService {
  private readonly PERFORMANCE_RATIO = 0.82;
  private readonly PAINEL_POTENCIA_W = 550;
  
  private readonly IRRADIANCIA_POR_ESTADO: Record<string, number> = {
    'AC': 4.5, 'AL': 5.5, 'AP': 4.8, 'AM': 4.6, 'BA': 5.8,
    'CE': 5.7, 'DF': 5.4, 'ES': 5.2, 'GO': 5.5, 'MA': 5.4,
    'MT': 5.6, 'MS': 5.3, 'MG': 5.4, 'PA': 4.7, 'PB': 5.8,
    'PR': 4.9, 'PE': 5.7, 'PI': 5.6, 'RJ': 5.0, 'RN': 5.9,
    'RS': 4.7, 'RO': 4.8, 'RR': 4.9, 'SC': 4.6, 'SP': 5.0,
    'SE': 5.6, 'TO': 5.5
  };

  calculate(input: SolarCalculationInput): SolarDimensionamento {
    const hsp = this.IRRADIANCIA_POR_ESTADO[input.uf] || 5.0;
    const consumo_anual = input.consumo_kwh_mes * 12;
    const oversizing = (input.oversizing_target || 130) / 100;
    
    // kWp = Consumo / (HSP * 365 * PR)
    const kwp_necessario = consumo_anual / (hsp * 365 * this.PERFORMANCE_RATIO);
    const kwp_proposto = kwp_necessario * oversizing;
    
    // Painéis
    const numero_paineis = Math.ceil(kwp_proposto / (this.PAINEL_POTENCIA_W / 1000));
    const kwp_ajustado = numero_paineis * (this.PAINEL_POTENCIA_W / 1000);
    
    // Inversor (85% da potência dos painéis)
    const potencia_inversor_kw = Math.ceil(kwp_ajustado * 0.85 * 10) / 10;
    
    // Área (6.5 m² por kWp)
    const area_necessaria_m2 = Math.ceil(kwp_ajustado * 6.5);
    
    // Geração anual
    const geracao_anual_kwh = Math.round(kwp_ajustado * hsp * 365 * this.PERFORMANCE_RATIO);
    
    return {
      kwp_necessario: Math.round(kwp_necessario * 100) / 100,
      kwp_proposto: Math.round(kwp_ajustado * 100) / 100,
      numero_paineis,
      potencia_inversor_kw,
      area_necessaria_m2,
      geracao_anual_kwh,
      performance_ratio: this.PERFORMANCE_RATIO,
      oversizing_ratio: oversizing,
    };
  }
}

export const solarSizingService = new SolarSizingService();