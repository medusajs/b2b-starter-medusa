import { MedusaService, Module } from "@medusajs/framework/utils";
import { FulfillmentShippingPrice } from "./models";

class FulfillmentShippingService extends MedusaService({
  FulfillmentShippingPrice,
}) {}

export const FULFILLMENT_SHIPPING_MODULE = "fulfillmentShipping";

export default Module(FULFILLMENT_SHIPPING_MODULE, {
  service: FulfillmentShippingService,
}); 