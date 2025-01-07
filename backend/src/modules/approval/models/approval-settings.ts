import { model } from "@medusajs/framework/utils";

export const ApprovalSettings = model.define("approval_settings", {
  id: model
    .id({
      prefix: "comp",
    })
    .primaryKey(),
  requires_admin_approval: model.boolean().default(false),
  requires_sales_manager_approval: model.boolean().default(false),
});
