"use client"

import { updateApproval } from "@lib/data/approvals"
import {
  ArrowRightMini,
  CheckMini,
  LockClosedSolidMini,
  XMarkMini,
} from "@medusajs/icons"
import { B2BCart } from "@starter/types"
import { ApprovalStatusType, ApprovalType } from "@starter/types/approval"
import { useState } from "react"
import Button from "../../../common/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const ApprovalCardActions = ({
  cartWithApprovals,
}: {
  cartWithApprovals: B2BCart
}) => {
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  if (!cartWithApprovals?.approvals) return null

  const pendingAdminApproval =
    cartWithApprovals.approval_status?.status === ApprovalStatusType.PENDING
      ? cartWithApprovals.approvals?.find(
          (a) =>
            a?.type === ApprovalType.ADMIN &&
            a?.status === ApprovalStatusType.PENDING
        )
      : null

  const handleApprove = async () => {
    if (!pendingAdminApproval) return
    setApproving(true)
    await updateApproval(pendingAdminApproval.id, ApprovalStatusType.APPROVED)
    setApproving(false)
  }

  const handleReject = async () => {
    if (!pendingAdminApproval) return
    setRejecting(true)
    await updateApproval(pendingAdminApproval.id, ApprovalStatusType.REJECTED)
    setRejecting(false)
  }

  const handlePlaceOrder = async () => {
    document.location.href = `/checkout?cart_id=${cartWithApprovals.id}&step=payment`
  }

  return (
    <div className="flex gap-x-2">
      {pendingAdminApproval ? (
        <>
          <Button
            variant="secondary"
            onClick={handleReject}
            disabled={approving}
            isLoading={rejecting}
          >
            <XMarkMini className="inline-block" />
            Reject
          </Button>
          <Button
            variant="primary"
            onClick={handleApprove}
            disabled={rejecting}
            isLoading={approving}
          >
            <CheckMini className="inline-block" />
            Approve
          </Button>
        </>
      ) : cartWithApprovals.approval_status?.status ===
        ApprovalStatusType.PENDING ? (
        <Button variant="primary" disabled>
          <LockClosedSolidMini className="inline-block" />
          Awaiting External Approval
        </Button>
      ) : cartWithApprovals.approval_status?.status ===
        ApprovalStatusType.APPROVED ? (
        !cartWithApprovals.completed_at ? (
          <LocalizedClientLink
            href={`/checkout?cart_id=${cartWithApprovals.id}&step=payment`}
          >
            <Button variant="primary" size="small" className="px-3">
              Place Order
              <ArrowRightMini className="inline-block" />
            </Button>
          </LocalizedClientLink>
        ) : (
          <span className="flex items-center gap-x-1 text-sm text-grey-500">
            Order Completed
            <CheckMini className="inline-block" />
          </span>
        )
      ) : null}
    </div>
  )
}

export default ApprovalCardActions
