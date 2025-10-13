import { SolarCalculationInput, SolarKit } from "../../types/common";

export const testInputs: Record<string, SolarCalculationInput> = {
  residential_sp: {
    consumo_kwh_mes: 500,
    uf: "SP",
    tipo_telhado: "ceramico",
    oversizing_target: 130,
    created_by: "test_user",
  },

  commercial_rj: {
    consumo_kwh_mes: 2000,
    uf: "RJ",
    tipo_telhado: "laje",
    area_disponivel_m2: 200,
    oversizing_target: 145,
    tarifa_energia_kwh: 0.95,
  },

  rural_ce: {
    consumo_kwh_mes: 150,
    uf: "CE",
    tipo_telhado: "metalico",
    oversizing_target: 100,
    tarifa_energia_kwh: 0.70,
  },
};

export const expectedResults = {
  residential_sp: {
    kwp_range: [5.0, 7.0],
    payback_range: [2.5, 4.5],
    panels_range: [9, 13],
  },

  commercial_rj: {
    kwp_range: [18.0, 25.0],
    payback_range: [2.0, 3.5],
    panels_range: [32, 45],
  },

  rural_ce: {
    kwp_range: [1.5, 2.5],
    payback_range: [3.0, 5.0],
    panels_range: [3, 5],
  },
};

export const mockKits: SolarKit[] = [
  {
    kit_id: "KIT-5KWP-CERAMICO",
    nome: "Kit Solar 5.5kWp Cerâmico",
    potencia_kwp: 5.5,
    match_score: 95,
    preco_brl: 19250.00,
    componentes: {
      paineis: [{
        marca: "ASTRONERGY",
        modelo: "ASTRO 6 CHEETAH HC 144M",
        potencia_w: 550,
        quantidade: 10,
      }],
      inversores: [{
        marca: "TSUNESS",
        modelo: "HY-G 5K",
        potencia_kw: 5.0,
        quantidade: 1,
      }],
    },
    disponibilidade: {
      em_estoque: true,
      prazo_entrega_dias: 5,
    },
  },
];