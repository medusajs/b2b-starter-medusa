import { model } from "@medusajs/framework/utils";
import { Quote } from "./quote";

export const Comment = model.define("comment", {
  id: model.id({ prefix: "quo" }).primaryKey(),
  text: model.text(),
  item_id: model.text().nullable(),
  user_id: model.text(),
  quote: model.belongsTo(() => Quote, { mappedBy: "comments" }),
});
