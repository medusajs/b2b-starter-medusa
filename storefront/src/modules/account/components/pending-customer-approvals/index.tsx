import ApprovalCard from "../approval-card"
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
      <Text className="text-large-semi">Nada para ver aqui</Text>
      <Text className="text-base-regular">
        Você ainda não tem nenhuma aprovação.
      </Text>
    </div>
  )
}

export default PendingCustomerApprovals
