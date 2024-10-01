import { model } from "@medusajs/framework/utils";

export const Quote = model.define("quote", {
  id: model.id({ prefix: "quo" }).primaryKey(),
  status: model
    .enum(["pending_merchant", "pending_customer", "accepted", "rejected"])
    .default("pending_merchant"),
  customer_id: model.text(),
  draft_order_id: model.text(),
  order_change_id: model.text(),
  cart_id: model.text(),
});
