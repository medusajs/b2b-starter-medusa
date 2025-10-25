import { model } from "@medusajs/framework/utils";
import { FinancingProposal } from "./financing-proposal";

export const PaymentSchedule = model.define("payment_schedule", {
  id: model
    .id({
      prefix: "ps",
    })
    .primaryKey(),
  
  // Relacionamento
  financing_proposal: model.belongsTo(() => FinancingProposal, {
    mappedBy: "payment_schedules",
  }),
  
  // Parcela
  installment_number: model.number(),
  due_date: model.dateTime(),
  
  // Valores
  principal_amount: model.bigNumber(),
  interest_amount: model.bigNumber(),
  total_amount: model.bigNumber(),
  remaining_balance: model.bigNumber(),
  
  // Status
  status: model.enum(["pending", "paid", "overdue", "cancelled"]).default("pending"),
  paid_at: model.dateTime().nullable(),
  paid_amount: model.bigNumber().nullable(),
  
}).indexes([
  {
    name: "IDX_payment_schedule_proposal",
    on: ["financing_proposal_id"],
  },
  {
    name: "IDX_payment_schedule_due_date",
    on: ["due_date"],
  },
  {
    name: "IDX_payment_schedule_status",
    on: ["status"],
  },
]);