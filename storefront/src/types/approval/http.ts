import { B2BCart } from "../global"
import { ApprovalType } from "./module"
import { ApprovalStatusType } from "./module"
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
  status: ApprovalStatusType
  handled_by: string
}

export type StoreApprovalResponse = {
  approval: StoreApproval
}

export type StoreApprovalsResponse = {
  carts_with_approvals: B2BCart[]
  count: number
  limit: number
  offset: number
}
