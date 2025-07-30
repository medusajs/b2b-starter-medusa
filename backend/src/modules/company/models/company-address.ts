import { model } from "@medusajs/framework/utils";
import { Company } from "./company";

export const CompanyAddress = model.define("company_address", {
  id: model
    .id({
      prefix: "caddr",
    })
    .primaryKey(),
  label: model.text(),
  address_1: model.text(),
  address_2: model.text().nullable(),
  city: model.text(),
  province: model.text().nullable(),
  postal_code: model.text(),
  country_code: model.text(),
  phone: model.text().nullable(),
  is_default: model.boolean().default(false),
  company: model.belongsTo(() => Company, {
    mappedBy: "addresses",
  }),
});
