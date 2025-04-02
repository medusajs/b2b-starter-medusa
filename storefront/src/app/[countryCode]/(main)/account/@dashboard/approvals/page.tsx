import ApprovedApprovalRequestsAdminList from "@/modules/account/components/approval-requests-admin-list/approved-list"
import PendingApprovalRequestsAdminList from "@/modules/account/components/approval-requests-admin-list/pending-list"
import RejectedApprovalRequestsAdminList from "@/modules/account/components/approval-requests-admin-list/rejected-list"
import { Heading } from "@medusajs/ui"
import { Metadata } from "next"
import { Suspense } from "react"

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
      <Suspense fallback={<div>Loading...</div>}>
        <PendingApprovalRequestsAdminList searchParams={urlSearchParams} />
      </Suspense>

      <Heading level="h2" className="text-neutral-700">
        Approved
      </Heading>
      <Suspense fallback={<div>Loading...</div>}>
        <ApprovedApprovalRequestsAdminList searchParams={urlSearchParams} />
      </Suspense>

      <Heading level="h2" className="text-neutral-700">
        Rejected
      </Heading>
      <Suspense fallback={<div>Loading...</div>}>
        <RejectedApprovalRequestsAdminList searchParams={urlSearchParams} />
      </Suspense>
    </div>
  )
}
