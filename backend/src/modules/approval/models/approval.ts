import { model } from "@medusajs/framework/utils";
import { ApprovalType, ApprovalStatus } from "../../../types/approval/module";

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
  handled_by: model.text(),
});
