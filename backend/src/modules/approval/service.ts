import { MedusaService } from "@medusajs/framework/utils";
import { Approval, ApprovalSettings } from "./models";

class ApprovalModuleService extends MedusaService({
  Approval,
  ApprovalSettings,
}) {}

export default ApprovalModuleService;
