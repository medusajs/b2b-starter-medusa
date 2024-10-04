import { model } from "@medusajs/framework/utils";
import { Quote } from "./quote";

export const Comment = model.define("comment", {
  id: model.id({ prefix: "quo" }).primaryKey(),
  text: model.text(),
  item_id: model.text().nullable(),
  admin_id: model.text().nullable(),
  customer_id: model.text().nullable(),
  quote: model.belongsTo(() => Quote, { mappedBy: "comments" }),
});
