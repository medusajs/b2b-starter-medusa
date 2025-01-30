"use client"

import { updateApproval } from "@lib/data/approvals"
import { CheckMini, LockClosedSolidMini, XMarkMini } from "@medusajs/icons"
import { B2BCart } from "@starter/types"
import {
  ApprovalStatusType,
  ApprovalType,
  QueryApproval,
} from "@starter/types/approval"
import { useState } from "react"
import Button from "../../../common/components/button"

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
        <Button variant="primary">
          <CheckMini className="inline-block" />
          Complete Order
        </Button>
      ) : null}
    </div>
  )
}

export default ApprovalCardActions
