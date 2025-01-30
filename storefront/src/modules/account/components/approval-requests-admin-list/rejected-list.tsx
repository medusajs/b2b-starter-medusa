import { listApprovals } from "@lib/data/approvals"
import { mapApprovalsByCartId } from "@lib/util/map-approvals-by-cart-id"
import { Text } from "@medusajs/ui"
import { ApprovalStatusType, ApprovalType } from "@starter/types/approval"
import ApprovalCard from "../approval-card"
import ResourcePagination from "../resource-pagination"

export default async function RejectedApprovalRequestsAdminList({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const pageParam = `rejectedPage`
  const currentPage = Number(searchParams[pageParam]) || 1
  const limit = 5

  let { carts_with_approvals, count } = await listApprovals({
    type: ApprovalType.ADMIN,
    status: ApprovalStatusType.REJECTED,
    offset: (currentPage - 1) * limit,
    limit,
  })

  carts_with_approvals = carts_with_approvals.filter(
    (cart) => cart?.approval_status?.status !== ApprovalStatusType.PENDING
  )

  const totalPages = Math.ceil((count || 0) / limit)

  if (carts_with_approvals.length > 0) {
    return (
      <div className="flex flex-col gap-y-4 w-full">
        <div className="flex flex-col gap-y-2">
          {carts_with_approvals.map((cartWithApprovals) => (
            <ApprovalCard
              key={cartWithApprovals.id}
              cartWithApprovals={cartWithApprovals}
              type="admin"
            />
          ))}
        </div>

        {totalPages > 1 && (
          <ResourcePagination
            totalPages={totalPages}
            currentPage={currentPage}
            pageParam={pageParam}
          />
        )}
      </div>
    )
  }

  return <Text>No requests</Text>
}
