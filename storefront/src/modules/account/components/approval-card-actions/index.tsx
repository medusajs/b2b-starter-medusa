"use client"

import { CheckMini, XMarkMini } from "@medusajs/icons"
import Button from "../../../common/components/button"
import { updateApproval } from "@lib/data/approvals"
import { ApprovalStatus } from "@starter/types/approval"
import { useState } from "react"

const ApprovalCardActions = ({ approvalId }: { approvalId?: string }) => {
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  if (!approvalId) return null

  const handleApprove = async () => {
    setApproving(true)
    await updateApproval(approvalId, ApprovalStatus.APPROVED)
    setApproving(false)
  }

  const handleReject = async () => {
    setRejecting(true)
    await updateApproval(approvalId, ApprovalStatus.REJECTED)
    setRejecting(false)
  }

  return (
    <div className="flex gap-x-2">
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
    </div>
  )
}

export default ApprovalCardActions
