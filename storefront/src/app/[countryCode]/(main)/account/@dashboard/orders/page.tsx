import { listApprovals } from "@/lib/data/approvals"
import { retrieveCompany } from "@/lib/data/companies"
import { retrieveCustomer } from "@/lib/data/customer"
import { listOrders } from "@/lib/data/orders"
import OrderOverview from "@/modules/account/components/order-overview"
import PendingCustomerApprovals from "@/modules/account/components/pending-customer-approvals"
import { ApprovalStatusType } from "@/types/approval"
import { Heading } from "@medusajs/ui"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export default async function Orders() {
  const customer = await retrieveCustomer()
  const orders = await listOrders()

  const { approval_settings } =
    (await retrieveCompany(customer?.employee?.company_id!)) || {}

  const approval_required =
    approval_settings?.requires_admin_approval ||
    approval_settings?.requires_sales_manager_approval

  const { carts_with_approvals } = await listApprovals({
    status: ApprovalStatusType.PENDING,
  })

  return (
    <div
      className="w-full flex flex-col gap-y-4"
      data-testid="orders-page-wrapper"
    >
      <div className="mb-4">
        <Heading>Orders</Heading>
      </div>
      {approval_required && (
        <div>
          <Heading level="h2" className="text-neutral-700 mb-4">
            Pending Approvals
          </Heading>

          <PendingCustomerApprovals cartsWithApprovals={carts_with_approvals} />
        </div>
      )}
      <div>
        <Heading level="h2" className="text-neutral-700 mb-4">
          Completed Orders
        </Heading>

        <OrderOverview orders={orders} />
      </div>
    </div>
  )
}
