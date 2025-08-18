import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import DespatchLabFulfillmentService from "./service";

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [DespatchLabFulfillmentService],
});
