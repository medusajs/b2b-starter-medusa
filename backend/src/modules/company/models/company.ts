import { model } from "@medusajs/utils";

export const Company = model.define("company", {
  id: model
    .id({
      prefix: "comp",
    })
    .primaryKey(),
  name: model.text(),
  phone: model.text(),
  email: model.text(),
  address: model.text(),
  city: model.text(),
  state: model.text(),
  zip: model.text(),
  country: model.text(),
  logo_url: model.text(),
});
