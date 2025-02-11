import { MedusaService } from "@medusajs/framework/utils";
import { ApprovalStatusType } from "../../types";
import { Approval, ApprovalSettings, ApprovalStatus } from "./models";

class ApprovalModuleService extends MedusaService({
  Approval,
  ApprovalSettings,
  ApprovalStatus,
}) {
  async hasPendingApprovals(cartId: string) {
    const [_, count] = await this.listAndCountApprovals({
      cart_id: cartId,
      status: ApprovalStatusType.PENDING,
    });

    return count > 0;
  }
}

export default ApprovalModuleService;
