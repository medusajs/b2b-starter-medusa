import { Module } from "@medusajs/framework/utils";
import CompanyModuleService from "./service.ts";

export const B2B_COMPANY_MODULE = "b2bCompany";

export default Module(B2B_COMPANY_MODULE, {
  service: CompanyModuleService,
});
