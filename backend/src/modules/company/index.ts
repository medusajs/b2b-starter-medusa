import CompanyModuleService from "./service";
import { Module } from "@medusajs/utils";

export const COMPANY_MODULE = "companyModuleService";

export default Module(COMPANY_MODULE, {
  service: CompanyModuleService,
});
