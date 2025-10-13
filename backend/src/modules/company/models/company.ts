import { model } from "@medusajs/framework/utils";
import { Employee } from "./employee";

export const Company = model.define("company", {
  id: model
    .id({
      prefix: "comp",
    })
    .primaryKey(),
  name: model.text(),
  email: model.text(),
  cnpj: model.text().unique(),
  email_domain: model.text(),
  phone: model.text().nullable(),
  address: model.text().nullable(),
  city: model.text().nullable(),
  state: model.text().nullable(),
  zip: model.text().nullable(),
  country: model.text().default("BR"),
  logo_url: model.text().nullable(),
  currency_code: model.text().default("BRL"),
  spending_limit_reset_frequency: model
    .enum(["never", "daily", "weekly", "monthly", "yearly"])
    .default("monthly"),
  customer_group_id: model.text().nullable(),
  is_active: model.boolean().default(true),
  employees: model.hasMany(() => Employee),
}).indexes([
  {
    name: "IDX_company_cnpj",
    on: ["cnpj"],
    unique: true,
  },
  {
    name: "IDX_company_email_domain",
    on: ["email_domain"],
  },
  {
    name: "IDX_company_customer_group",
    on: ["customer_group_id"],
  },
]);
