import { ApprovalStatus } from "@starter/types/approval"
import { B2BCart } from "@starter/types/global"

export const getCartApprovalStatus = (cart: B2BCart | null) => {
  if (!cart)
    return { isPendingApproval: false, isApproved: false, isRejected: false }

  const isApproved =
    cart?.approvals?.some(
      (approval) => approval.status === ApprovalStatus.APPROVED
    ) || false

  const isPendingApproval =
    (cart?.approvals?.some(
      (approval) => approval.status === ApprovalStatus.PENDING
    ) &&
      !isApproved) ||
    false

  const isRejected =
    (cart?.approvals?.some(
      (approval) => approval.status === ApprovalStatus.REJECTED
    ) &&
      !isPendingApproval &&
      !isApproved) ||
    false

  return { isPendingApproval, isApproved, isRejected }
}
