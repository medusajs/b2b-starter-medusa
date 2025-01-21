/* Entity: Approval Settings */

export type ModuleApprovalSettings = {
  id: string
  company_id: string
  requires_admin_approval: boolean
  requires_sales_manager_approval: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type ModuleCreateApprovalSettings = {
  company_id: string
  requires_admin_approval: boolean
  requires_sales_manager_approval: boolean
}

export type ModuleUpdateApprovalSettings = {
  id: string
  requires_admin_approval?: boolean
  requires_sales_manager_approval?: boolean
}

/* Entity: Approval */
export enum ApprovalType {
  ADMIN = "admin",
  SALES_MANAGER = "sales_manager",
}

export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export type ModuleApproval = {
  id: string
  cart_id: string
  type: ApprovalType
  status: ApprovalStatus
  created_by: string
  handled_by: string
}

export type ModuleCreateApproval = {
  cart_id: string
  type: ApprovalType
  created_by: string
}

export type ModuleUpdateApproval = {
  id: string
  status: ApprovalStatus
  handled_by: string
}
