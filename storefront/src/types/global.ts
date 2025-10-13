import { HttpTypes } from "@medusajs/framework/types"
import { QueryCompany, QueryEmployee } from "./company/query"
import { QueryApproval, QueryApprovalStatus } from "./approval/query"

export enum SpendingLimitResetFrequency {
  never = "never",
  daily = "daily",
  weekly = "weekly",
  monthly = "monthly",
  yearly = "yearly",
}

export interface B2BCart extends HttpTypes.StoreCart {
  completed_at?: string
  company: QueryCompany
  customer?: HttpTypes.StoreCustomer
  approvals?: QueryApproval[]
  approval_status?: QueryApprovalStatus
}

export interface B2BOrder extends HttpTypes.StoreOrder {
  company: QueryCompany
}

export interface B2BCustomer extends HttpTypes.StoreCustomer {
  employee: QueryEmployee | null
  orders?: HttpTypes.StoreOrder[]
  cart?: B2BCart[]
}

export type FilterType = string | string[] | { [key: string]: any }
