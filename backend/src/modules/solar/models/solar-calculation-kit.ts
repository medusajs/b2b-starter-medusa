import { model } from "@medusajs/framework/utils";

export const SolarCalculationKit = model.define("solar_calculation_kit", {
  id: model
    .id({
      prefix: "sck",
    })
    .primaryKey(),
  
  // Relationship
  solar_calculation_id: model.text(),
  
  // Kit data
  kit_id: model.text(),
  nome: model.text(),
  potencia_kwp: model.number(),
  match_score: model.number(),
  preco_brl: model.number(),
  
  // Components (JSON)
  componentes: model.json(),
  disponibilidade: model.json(),
  
  // Ranking
  ranking_position: model.number().default(1),
  
}).indexes([
  {
    name: "IDX_solar_kit_calculation",
    on: ["solar_calculation_id"],
  },
  {
    name: "IDX_solar_kit_score",
    on: ["match_score"],
  },
  {
    name: "IDX_solar_kit_kwp",
    on: ["potencia_kwp"],
  },
]);