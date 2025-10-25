import { Module } from "@medusajs/framework/utils";
import SolarModuleService from "./service";

export const SOLAR_MODULE = "solar";

export default Module(SOLAR_MODULE, {
  service: SolarModuleService,
});

export * from "./types/common";
export * from "./models";
export * from "./services/sizing-service";
export * from "./services/roi-service";
export * from "./services/kit-matcher-service";