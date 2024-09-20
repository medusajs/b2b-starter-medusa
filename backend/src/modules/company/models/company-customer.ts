import { model } from "@medusajs/utils";
import { Company } from "./company";

export const CompanyCustomer = model.define("company_customer", {
  id: model
    .id({
      prefix: "compcust",
    })
    .primaryKey(),
  spending_limit: model.bigNumber().default(null),
  is_admin: model.boolean().default(false),
  company: model.belongsTo(() => Company, {
    mappedBy: "customers",
  }),
});
