import { model } from "@medusajs/framework/utils";

export const FulfillmentShippingPrice = model.define("fulfillment_shipping_price", {
  id: model.id({ prefix: "fsp" }).primaryKey(),
  fulfillment_id: model.text().unique(),
  price: model.bigNumber().default(0), // store in smallest currency unit
}); 