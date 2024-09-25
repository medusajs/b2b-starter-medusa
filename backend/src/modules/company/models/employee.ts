import { model } from "@medusajs/utils";
import { Company } from "./company";

export const Employee = model.define("employee", {
  id: model
    .id({
      prefix: "emp",
    })
    .primaryKey(),
  spending_limit: model.bigNumber().default(null),
  is_admin: model.boolean().default(false),
  company: model.belongsTo(() => Company, {
    mappedBy: "employees",
  }),
});
