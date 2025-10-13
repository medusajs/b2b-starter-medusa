export interface SolarCalculationInput {
  consumo_kwh_mes: number;
  uf: string;
  cep?: string;
  tipo_telhado?: "laje" | "ceramico" | "metalico" | "fibrocimento" | "solo";
  area_disponivel_m2?: number;
  oversizing_target?: 100 | 114 | 130 | 145 | 160;
  tarifa_energia_kwh?: number;
  created_by?: string;
}

export interface SolarDimensionamento {
  kwp_necessario: number;
  kwp_proposto: number;
  numero_paineis: number;
  potencia_inversor_kw: number;
  area_necessaria_m2: number;
  geracao_anual_kwh: number;
  performance_ratio: number;
  oversizing_ratio: number;
}

export interface SolarFinanceiro {
  capex_total_brl: number;
  economia_anual_brl: number;
  payback_anos: number;
  tir_percentual: number;
  vpl_brl: number;
}

export interface SolarKit {
  kit_id: string;
  nome: string;
  potencia_kwp: number;
  match_score: number;
  preco_brl: number;
  componentes: {
    paineis: Array<{
      marca: string;
      modelo?: string;
      potencia_w: number;
      quantidade: number;
    }>;
    inversores: Array<{
      marca: string;
      modelo?: string;
      potencia_kw: number;
      quantidade: number;
    }>;
  };
  disponibilidade: {
    em_estoque: boolean;
    prazo_entrega_dias?: number;
  };
}

export interface SolarCalculationResult {
  dimensionamento: SolarDimensionamento;
  financeiro: SolarFinanceiro;
  kits_recomendados: SolarKit[];
  co2_evitado_ton_25anos: number;
  calculation_hash: string;
}