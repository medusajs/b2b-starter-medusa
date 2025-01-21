import { B2BCart } from "@starter/types"
import { ModuleApproval, ModuleApprovalSettings } from "./module"

export type QueryApprovalSettings = ModuleApprovalSettings

export type QueryApproval = ModuleApproval & {
  cart?: B2BCart
}
