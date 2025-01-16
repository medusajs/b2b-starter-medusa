import { model } from "@medusajs/framework/utils";
import { ApprovalType, ApprovalStatus } from "@starter/types/approval";

export const Approval = model.define("approval", {
  id: model
    .id({
      prefix: "appr",
    })
    .primaryKey(),
  cart_id: model.text(),
  type: model.enum(ApprovalType),
  status: model.enum(ApprovalStatus),
  created_by: model.text(),
  handled_by: model.text().nullable(),
});
