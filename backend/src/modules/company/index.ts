import { Module } from "@medusajs/utils";
import CompanyModuleService from "./service";

export const COMPANY_MODULE = "companyModuleService";

export default Module(COMPANY_MODULE, {
  service: CompanyModuleService,
});
