import { QueryApprovalSettings } from "./query";

/* Admin */
export type AdminApprovalSettings = QueryApprovalSettings;

export type AdminUpdateApprovalSettings = {
  requires_admin_approval: boolean;
  requires_sales_manager_approval: boolean;
};

/* Store */
export type StoreApprovalSettings = QueryApprovalSettings;

export type StoreUpdateApprovalSettings = {
  requires_admin_approval: boolean;
  requires_sales_manager_approval: boolean;
};
