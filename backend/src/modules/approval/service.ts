import { MedusaService } from "@medusajs/framework/utils";
import { ApprovalSettings } from "./models";

class ApprovalModuleService extends MedusaService({
  ApprovalSettings,
}) {}

export default ApprovalModuleService;
