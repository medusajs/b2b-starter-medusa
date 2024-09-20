import { MedusaService } from "@medusajs/utils";
import { Company, CompanyCustomer } from "./models";

class CompanyModuleService extends MedusaService({
  Company,
  CompanyCustomer,
}) {}

export default CompanyModuleService;
