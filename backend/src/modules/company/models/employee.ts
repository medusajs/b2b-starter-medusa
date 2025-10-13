import { model } from "@medusajs/framework/utils";
import { Company } from "./company";

export const Employee = model.define("employee", {
  id: model
    .id({
      prefix: "emp",
    })
    .primaryKey(),
  customer_id: model.text().unique(),
  spending_limit: model.bigNumber().default(0),
  is_admin: model.boolean().default(false),
  role: model.enum(["admin", "manager", "buyer", "viewer"]).default("buyer"),
  is_active: model.boolean().default(true),
  company: model.belongsTo(() => Company, {
    mappedBy: "employees",
  }),
}).indexes([
  {
    name: "IDX_employee_customer",
    on: ["customer_id"],
    unique: true,
  },
  {
    name: "IDX_employee_company_role",
    on: ["company_id", "role"],
  },
]);
