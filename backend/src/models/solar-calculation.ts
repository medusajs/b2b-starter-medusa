import { model } from "@medusajs/framework/utils"

/**
 * Solar Calculation Model
 * Modelo para persistir cálculos solares dos usuários
 */
export const SolarCalculation = model.define("solar_calculation", {
  id: model.id().primaryKey(),
  
  // Relacionamento com customer
  customer_id: model.text().nullable(),
  
  // Nome/descrição opcional do cálculo
  name: model.text().nullable(),
  
  // Input do cálculo (JSON)
  input: model.json(),
  
  // Output do cálculo (JSON)
  output: model.json(),
  
  // Hash único para evitar duplicatas
  calculation_hash: model.text().nullable().index(),
  
  // Metadados
  is_favorite: model.boolean().default(false),
  notes: model.text().nullable(),
  
  // Timestamps
  created_at: model.dateTime().default("now"),
  updated_at: model.dateTime().default("now"),
})

export default SolarCalculation
