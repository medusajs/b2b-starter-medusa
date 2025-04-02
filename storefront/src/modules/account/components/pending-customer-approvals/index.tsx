import ApprovalCard from "@/modules/account/components/approval-card"
import { Text } from "@medusajs/ui"

const PendingCustomerApprovals = ({
  cartsWithApprovals,
}: {
  cartsWithApprovals: any[]
}) => {
  if (cartsWithApprovals.length) {
    return (
      <div className="flex flex-col gap-y-2 w-full">
        {cartsWithApprovals.map((cart) => (
          <ApprovalCard
            key={cart.id}
            cartWithApprovals={cart}
            type="customer"
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className="w-full flex flex-col items-center gap-y-4"
      data-testid="no-approvals-container"
    >
      <Text className="text-large-semi">Nothing to see here</Text>
      <Text className="text-base-regular">
        You don&apos;t have any approvals yet.
      </Text>
    </div>
  )
}

export default PendingCustomerApprovals
