import { Module } from "@medusajs/framework/utils";
import CompanyModuleService from "./service.ts";

export const COMPANY_MODULE = "company";

export default Module(COMPANY_MODULE, {
  service: CompanyModuleService,
});
