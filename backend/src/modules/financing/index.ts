import { Module } from "@medusajs/framework/utils";
import FinancingModuleService from "./service";

export const FINANCING_MODULE = "financing";

export default Module(FINANCING_MODULE, {
  service: FinancingModuleService,
});

export * from "./types/common";
export * from "./types/mutations";
export * from "./models";
export * from "./workflows";