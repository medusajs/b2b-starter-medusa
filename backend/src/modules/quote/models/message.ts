import { model } from "@medusajs/framework/utils";
import { Quote } from "./quote";

export const Message = model.define("message", {
  id: model.id({ prefix: "mess" }).primaryKey(),
  text: model.text(),
  item_id: model.text().nullable(),
  admin_id: model.text().nullable(),
  customer_id: model.text().nullable(),
  quote: model.belongsTo(() => Quote, { mappedBy: "messages" }),
});
