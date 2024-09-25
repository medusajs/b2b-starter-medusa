import { model } from "@medusajs/utils";
import { Employee } from "./employee";

export const Company = model.define("company", {
  id: model
    .id({
      prefix: "comp",
    })
    .primaryKey(),
  name: model.text(),
  phone: model.text(),
  email: model.text(),
  address: model.text().nullable(),
  city: model.text().nullable(),
  state: model.text().nullable(),
  zip: model.text().nullable(),
  country: model.text().nullable(),
  logo_url: model.text().nullable(),
  currency_code: model.text().nullable(),
  employees: model.hasMany(() => Employee),
});
