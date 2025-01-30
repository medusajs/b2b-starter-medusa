import { QueryCompany } from "../company/query";
import { ApprovalStatusType, ApprovalType } from "./module";
import {
  QueryApproval,
  QueryApprovalSettings,
  QueryApprovalStatus,
} from "./query";
import { HttpTypes } from "@medusajs/types";

/* Admin */
export type AdminApprovalSettings = QueryApprovalSettings;

export type AdminUpdateApprovalSettings = {
  requires_admin_approval: boolean;
  requires_sales_manager_approval: boolean;
};

export type AdminApproval = QueryApproval;

export type AdminApprovalsResponse = {
  carts_with_approvals: AdminCartWithApprovals[];
  count: number;
};

export type AdminCartWithApprovals = HttpTypes.StoreCart & {
  company: QueryCompany;
  approval_status: QueryApprovalStatus;
  approval_requests: QueryApproval[];
};

export type AdminUpdateApproval = {
  status: ApprovalStatusType;
  handled_by: string;
};

export type AdminApprovalStatus = QueryApprovalStatus;
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
  status: ApprovalStatusType;
  handled_by: string;
};
