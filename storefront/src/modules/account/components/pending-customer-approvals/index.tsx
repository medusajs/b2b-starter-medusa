import { Text } from "@medusajs/ui"
import { QueryApproval } from "@starter/types/approval"
import ApprovalCard from "../approval-card"

const PendingCustomerApprovals = ({
  approvals,
}: {
  approvals: QueryApproval[]
}) => {
  if (approvals?.length) {
    return (
      <div className="flex flex-col gap-y-2 w-full">
        {approvals.map((a) => (
          <ApprovalCard key={a.id} approval={a} />
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
