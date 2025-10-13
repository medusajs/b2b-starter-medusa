import { model } from "@medusajs/framework/utils";

export const FinancingProposal = model.define("financing_proposal", {
  id: model
    .id({
      prefix: "fp",
    })
    .primaryKey(),
  
  // Relacionamentos
  customer_id: model.text(),
  quote_id: model.text().nullable(),
  credit_analysis_id: model.text().nullable(),
  
  // Tipo de financiamento
  modality: model.enum(["CDC", "LEASING", "EAAS"]),
  
  // Valores
  requested_amount: model.bigNumber(),
  approved_amount: model.bigNumber().nullable(),
  down_payment_amount: model.bigNumber().default(0),
  financed_amount: model.bigNumber().nullable(),
  
  // Condições
  requested_term_months: model.number(),
  approved_term_months: model.number().nullable(),
  interest_rate_monthly: model.number().nullable(),
  interest_rate_annual: model.number().nullable(),
  cet_rate: model.number().nullable(), // Custo Efetivo Total
  
  // Sistema de amortização
  amortization_system: model.enum(["PRICE", "SAC"]).default("PRICE"),
  
  // Estados
  status: model.enum([
    "pending",
    "approved", 
    "contracted",
    "cancelled"
  ]).default("pending"),
  
  // Datas
  approved_at: model.dateTime().nullable(),
  contracted_at: model.dateTime().nullable(),
  cancelled_at: model.dateTime().nullable(),
  expires_at: model.dateTime().nullable(),
  
  // Contrato
  contract_number: model.text().nullable(),
  contract_url: model.text().nullable(),
  
  // Metadados
  approval_conditions: model.json().nullable(),
  rejection_reason: model.text().nullable(),
  notes: model.text().nullable(),
  
}).indexes([
  {
    name: "IDX_financing_customer",
    on: ["customer_id"],
  },
  {
    name: "IDX_financing_status",
    on: ["status"],
  },
  {
    name: "IDX_financing_quote",
    on: ["quote_id"],
  },
  {
    name: "IDX_financing_contract",
    on: ["contract_number"],
    unique: true,
    where: "contract_number IS NOT NULL",
  },
]);