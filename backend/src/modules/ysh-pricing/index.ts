import { Module } from "@medusajs/framework/utils";
import YshPricingService from "./service";

export const YSH_PRICING_MODULE = "ysh-pricing";

export default Module(YSH_PRICING_MODULE, {
    service: YshPricingService,
});
