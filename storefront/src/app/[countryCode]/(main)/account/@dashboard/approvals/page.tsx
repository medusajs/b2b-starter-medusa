import { listApprovals } from "@lib/data/approvals"
import { Heading, Text } from "@medusajs/ui"
import ApprovalCard from "@modules/account/components/approval-card"
import ApprovalRequestsAdminList from "@modules/account/components/approval-requests-admin-list"
import { ApprovalStatus } from "@starter/types/approval"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Approvals",
  description: "Overview of your pending approvals.",
}

export default async function Approvals({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const urlSearchParams = await searchParams

  return (
    <div className="w-full flex flex-col gap-y-4">
      <Heading>Approvals</Heading>

      <Heading level="h2" className="text-neutral-700">
        Pending
      </Heading>
      <ApprovalRequestsAdminList
        status={ApprovalStatus.PENDING}
        searchParams={urlSearchParams}
      />

      <Heading level="h2" className="text-neutral-700">
        Approved
      </Heading>
      <ApprovalRequestsAdminList
        status={ApprovalStatus.APPROVED}
        searchParams={urlSearchParams}
      />

      <Heading level="h2" className="text-neutral-700">
        Rejected
      </Heading>
      <ApprovalRequestsAdminList
        status={ApprovalStatus.REJECTED}
        searchParams={urlSearchParams}
      />
    </div>
  )
}
