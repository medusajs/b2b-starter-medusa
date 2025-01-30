import { MedusaService } from "@medusajs/framework/utils";
import { Approval, ApprovalSettings, ApprovalStatus } from "./models";
import { ApprovalStatusType } from "@starter/types";

class ApprovalModuleService extends MedusaService({
  Approval,
  ApprovalSettings,
  ApprovalStatus,
}) {
  async hasPendingApprovals(cartId: string) {
    const approvals = await this.listAndCountApprovals({
      cart_id: cartId,
      status: ApprovalStatusType.PENDING,
    });

    return approvals.length > 0;
  }
}

export default ApprovalModuleService;
