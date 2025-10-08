import { listApprovals } from "@/lib/data/approvals"
import AccountNav from "@/modules/account/components/account-nav"
import { B2BCustomer } from "@/types"
import { ApprovalStatusType, ApprovalType } from "@/types/approval"
import React from "react"

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
    status: ApprovalStatusType.PENDING,
  })

  const numPendingApprovals = carts_with_approvals?.length || 0

  return (
    <div
      className="flex-1 small:py-12 bg-gradient-to-br from-yello-yellow-50/30 via-white to-yello-orange-50/30"
      data-testid="account-page"
    >
      <div className="flex-1 content-container h-full max-w-7xl mx-auto flex flex-col">
        <div className="grid grid-cols-1  small:grid-cols-[280px_1fr] py-12 gap-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yello-yellow-100/50 p-6">
            {customer && (
              <AccountNav
                customer={customer}
                numPendingApprovals={numPendingApprovals}
              />
            )}
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yello-yellow-100/50 p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
