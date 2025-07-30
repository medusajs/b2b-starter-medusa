import { MedusaService } from "@medusajs/framework/utils";
import { Company, Employee, CompanyAddress } from "./models";

class CompanyModuleService extends MedusaService({
  Company,
  Employee,
  CompanyAddress,
}) {}

export default CompanyModuleService;
