import { retrieveCustomer } from "@/lib/data/customer"
import { listApprovals } from "@/lib/data/approvals"
import PendingCustomerApprovals from "@/modules/account/components/pending-customer-approvals"
import { ApprovalStatusType } from "@/types/approval"
import { Heading } from "@medusajs/ui"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Approvals",
  description: "Overview of your pending approvals.",
}

export default async function Approvals() {
  try {
    const customer = await retrieveCustomer()
    
    if (!customer) {
      redirect("/account/login")
    }

    const { carts_with_approvals } = await listApprovals({
      status: ApprovalStatusType.PENDING,
    }).catch(() => ({ carts_with_approvals: [] }))

    return (
      <div className="w-full flex flex-col gap-y-4">
        <Heading>Approvals</Heading>

        <Heading level="h2" className="text-neutral-700">
          Pending Approvals
        </Heading>
        <PendingCustomerApprovals cartsWithApprovals={carts_with_approvals} />
      </div>
    )
  } catch (error) {
    console.error("Error in approvals page:", error)
    redirect("/account/login")
  }
}
