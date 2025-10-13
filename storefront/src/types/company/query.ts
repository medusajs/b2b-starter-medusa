import { CustomerDTO } from "@medusajs/framework/types"
import { ModuleCompany, ModuleEmployee } from "./module"
import { QueryApproval, QueryApprovalSettings } from "../approval"
import { HttpTypes } from "@medusajs/framework/types"

export type QueryCompany = ModuleCompany & {
  employees: QueryEmployee[]
  approval_settings: QueryApprovalSettings
  cart: QueryCart[]
}

export type QueryEmployee = ModuleEmployee & {
  company: QueryCompany
  customer: CustomerDTO
}

export type QueryCart = HttpTypes.StoreCart & {
  approval: QueryApproval
}
