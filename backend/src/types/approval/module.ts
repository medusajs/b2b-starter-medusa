/* Entity: Approval Settings */

export type ModuleApprovalSettings = {
  id: string;
  company_id: string;
  requires_admin_approval: boolean;
  requires_sales_manager_approval: boolean;

  // Monetary thresholds
  admin_approval_threshold: number | null;
  sales_manager_approval_threshold: number | null;

  // Multiple approvers
  requires_multiple_approvers: boolean;
  min_approvers_count: number;

  // Escalation
  escalation_enabled: boolean;
  escalation_timeout_hours: number;
  escalation_role: string | null;

  // Priority & auto-approval
  priority_threshold: number | null;
  auto_approve_below_threshold: boolean;
  auto_approve_threshold: number | null;

  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ModuleCreateApprovalSettings = {
  company_id: string;
  requires_admin_approval: boolean;
  requires_sales_manager_approval: boolean;
  admin_approval_threshold?: number;
  sales_manager_approval_threshold?: number;
  requires_multiple_approvers?: boolean;
  min_approvers_count?: number;
  escalation_enabled?: boolean;
  escalation_timeout_hours?: number;
  escalation_role?: string;
  priority_threshold?: number;
  auto_approve_below_threshold?: boolean;
  auto_approve_threshold?: number;
};

export type ModuleUpdateApprovalSettings = {
  id: string;
  requires_admin_approval?: boolean;
  requires_sales_manager_approval?: boolean;
  admin_approval_threshold?: number;
  sales_manager_approval_threshold?: number;
  requires_multiple_approvers?: boolean;
  min_approvers_count?: number;
  escalation_enabled?: boolean;
  escalation_timeout_hours?: number;
  escalation_role?: string;
  priority_threshold?: number;
  auto_approve_below_threshold?: boolean;
  auto_approve_threshold?: number;
};

/* Entity: Approval */
export enum ApprovalType {
  ADMIN = "admin",
  SALES_MANAGER = "sales_manager",
}

export enum ApprovalStatusType {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export type ModuleApproval = {
  id: string;
  cart_id: string;
  type: ApprovalType;
  status: ApprovalStatusType;
  created_by: string;
  handled_by: string | null;

  // Audit metadata
  rejection_reason: string | null;
  approval_comment: string | null;
  handled_at: string | null;
  client_ip_hash: string | null;
  user_agent_hash: string | null;

  // Business context
  cart_total_snapshot: number | null;
  priority: number;
  escalated: boolean;
  escalated_at: string | null;
  escalated_from: string | null;

  // Idempotency
  idempotency_key: string | null;

  created_at: string;
  updated_at: string;
};

export type ModuleCreateApproval = {
  cart_id: string;
  type: ApprovalType;
  created_by: string;
  cart_total_snapshot?: number;
  priority?: number;
  idempotency_key?: string;
  client_ip_hash?: string;
  user_agent_hash?: string;
};

export type ModuleUpdateApproval = {
  id: string;
  status?: ApprovalStatusType;
  handled_by?: string;
  rejection_reason?: string;
  approval_comment?: string;
  handled_at?: string;
  escalated?: boolean;
  escalated_at?: string;
  escalated_from?: string;
};

/* Entity: Approval Status */
export type ModuleApprovalStatus = {
  id: string;
  cart_id: string;
  status: ApprovalStatusType;
};

export type ModuleCreateApprovalStatus = {
  cart_id: string;
  status: ApprovalStatusType;
};

export type ModuleUpdateApprovalStatus = {
  id: string;
  status: ApprovalStatusType;
};
