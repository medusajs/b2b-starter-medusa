import { model } from "@medusajs/utils";

export const Quote = model.define("quote", {
  id: model.id({ prefix: "quo" }).primaryKey(),
  draft_order_id: model.text(),
  cart_id: model.text(),
});
