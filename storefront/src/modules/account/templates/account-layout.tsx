import React from "react"
import { B2BCustomer } from "types/global"
import AccountNav from "../components/account-nav"
import { retrieveCompany } from "@lib/data/companies"
import { listApprovals } from "@lib/data/approvals"
import {
  ApprovalStatusType,
  ApprovalType,
  StoreApprovalsResponse,
} from "@starter/types/approval"

interface AccountLayoutProps {
  customer: B2BCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = async ({
  customer,
  children,
}) => {
  const { carts_with_approvals } = await listApprovals({
    type: ApprovalType.ADMIN,
  })

  const numPendingApprovals = carts_with_approvals.filter(
    (c) => c.has_pending_approvals
  ).length

  return (
    <div
      className="flex-1 small:py-12 bg-neutral-100"
      data-testid="account-page"
    >
      <div className="flex-1 content-container h-full max-w-7xl mx-auto flex flex-col">
        <div className="grid grid-cols-1  small:grid-cols-[240px_1fr] py-12">
          <div>
            {customer && (
              <AccountNav
                customer={customer}
                numPendingApprovals={numPendingApprovals}
              />
            )}
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
