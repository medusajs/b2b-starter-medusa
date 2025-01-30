import { B2BCart } from "@starter/types"
import {
  ApprovalStatusType,
  ModuleApproval,
  ModuleApprovalSettings,
} from "./module"

export type QueryApprovalSettings = ModuleApprovalSettings

export type QueryApproval = ModuleApproval & {
  cart?: B2BCart
}

export type QueryApprovalStatus = {
  id: string
  cart_id: string
  status: ApprovalStatusType
}
