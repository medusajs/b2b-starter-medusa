import { listApprovals } from "@lib/data/approvals"
import { Text } from "@medusajs/ui"
import { ApprovalStatus } from "@starter/types/approval"
import ApprovalCard from "../approval-card"
import ResourcePagination from "../resource-pagination"

export default async function ApprovalRequestsAdminList({
  status,
  searchParams,
}: {
  status: ApprovalStatus
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const pageParam = `${status}Page`
  const currentPage = Number(searchParams[pageParam]) || 1
  const limit = 5

  const { approvals, count } = await listApprovals({
    filters: { status },
    offset: (currentPage - 1) * limit,
    limit,
  })

  const totalPages = Math.ceil((count || 0) / limit)

  if (approvals?.length) {
    return (
      <div className="flex flex-col gap-y-4 w-full">
        <div className="flex flex-col gap-y-2">
          {approvals.map((a) => (
            <ApprovalCard key={a.id} approval={a} type="admin" />
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
