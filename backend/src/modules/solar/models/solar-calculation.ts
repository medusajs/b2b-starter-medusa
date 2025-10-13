import { model } from "@medusajs/framework/utils";

export const SolarCalculation = model.define("solar_calculation", {
  id: model
    .id({
      prefix: "sc",
    })
    .primaryKey(),
  
  // Input data
  consumo_kwh_mes: model.number(),
  uf: model.text(),
  cep: model.text().nullable(),
  tipo_telhado: model.enum(["laje", "ceramico", "metalico", "fibrocimento", "solo"]).nullable(),
  area_disponivel_m2: model.number().nullable(),
  oversizing_target: model.number().default(130),
  
  // Calculated results
  kwp_necessario: model.number(),
  kwp_proposto: model.number(),
  numero_paineis: model.number(),
  potencia_inversor_kw: model.number(),
  area_necessaria_m2: model.number(),
  geracao_anual_kwh: model.number(),
  
  // Financial results
  capex_total_brl: model.number(),
  economia_anual_brl: model.number(),
  payback_anos: model.number(),
  tir_percentual: model.number(),
  vpl_brl: model.number(),
  
  // Environmental impact
  co2_evitado_ton_25anos: model.number(),
  
  // Metadata
  calculation_hash: model.text().unique(), // For determinism
  created_by: model.text().nullable(),
  
}).indexes([
  {
    name: "IDX_solar_calculation_hash",
    on: ["calculation_hash"],
    unique: true,
  },
  {
    name: "IDX_solar_calculation_kwp",
    on: ["kwp_proposto"],
  },
  {
    name: "IDX_solar_calculation_uf",
    on: ["uf"],
  },
]);