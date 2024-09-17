import { MedusaService } from "@medusajs/utils";
import { Company } from "./models";

class CompanyModuleService extends MedusaService({
  Company,
}) {}

export default CompanyModuleService;
