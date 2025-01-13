import { ApprovalStatus, ApprovalType } from "./module";
import { QueryApproval, QueryApprovalSettings } from "./query";

/* Admin */
export type AdminApprovalSettings = QueryApprovalSettings;

export type AdminUpdateApprovalSettings = {
  requires_admin_approval: boolean;
  requires_sales_manager_approval: boolean;
};

export type AdminApproval = QueryApproval;

export type AdminUpdateApproval = {
  status: ApprovalStatus;
  handled_by: string;
};

/* Store */
export type StoreApprovalSettings = QueryApprovalSettings;

export type StoreUpdateApprovalSettings = {
  requires_admin_approval: boolean;
  requires_sales_manager_approval: boolean;
};

export type StoreApproval = QueryApproval;

export type StoreCreateApproval = {
  cart_id: string;
  type: ApprovalType;
  created_by: string;
};

export type StoreUpdateApproval = {
  status: ApprovalStatus;
  handled_by: string;
};
