import { MedusaService } from "@medusajs/utils";
import { Company, Employee } from "./models";

class CompanyModuleService extends MedusaService({
  Company,
  Employee,
}) {}

export default CompanyModuleService;
