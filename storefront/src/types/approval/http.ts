import { ApprovalType } from "./module"
import { ApprovalStatus } from "./module"
import { QueryApproval, QueryApprovalSettings } from "./query"

/* Admin */
export type AdminApprovalSettings = QueryApprovalSettings

export type AdminUpdateApprovalSettings = {
  requires_admin_approval: boolean
  requires_sales_manager_approval: boolean
}

/* Store */
export type StoreApprovalSettings = QueryApprovalSettings

export type StoreUpdateApprovalSettings = {
  requires_admin_approval: boolean
  requires_sales_manager_approval: boolean
}
export type StoreApproval = QueryApproval

export type StoreCreateApproval = {
  type: ApprovalType
  created_by: string
}

export type StoreUpdateApproval = {
  status: ApprovalStatus
  handled_by: string
}

export type StoreApprovalResponse = {
  approval: StoreApproval
}
