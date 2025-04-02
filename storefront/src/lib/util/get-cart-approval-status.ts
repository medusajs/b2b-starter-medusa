import {
  ApprovalStatusType,
  ApprovalType,
  QueryApproval,
} from "@/types/approval"

export const getCartApprovalStatus = (cart: Record<string, any> | null) => {
  const defaultStatus = {
    isPendingAdminApproval: false,
    isPendingSalesManagerApproval: false,
    isFullyApproved: false,
    isRejected: false,
    isCompleted: false,
  }

  if (!cart?.approvals?.length) return defaultStatus

  if (cart.completed_at) {
    return { ...defaultStatus, isCompleted: true }
  }

  const approvals = cart.approvals as QueryApproval[]

  const isPendingAdminApproval = approvals.some(
    (approval) =>
      approval?.status === ApprovalStatusType.PENDING &&
      approval?.type === ApprovalType.ADMIN
  )

  if (isPendingAdminApproval) {
    return { ...defaultStatus, isPendingAdminApproval: true }
  }

  const isPendingSalesManagerApproval = approvals.some(
    (approval) =>
      approval?.status === ApprovalStatusType.PENDING &&
      approval?.type === ApprovalType.SALES_MANAGER
  )

  const isRejected = approvals.some(
    (approval) => approval?.status === ApprovalStatusType.REJECTED
  )

  if (isRejected) {
    return { ...defaultStatus, isRejected: true }
  }

  if (isPendingSalesManagerApproval) {
    return { ...defaultStatus, isPendingSalesManagerApproval: true }
  }

  const isFullyApproved = approvals.every(
    (approval) => approval?.status === ApprovalStatusType.APPROVED
  )

  if (isFullyApproved) {
    return { ...defaultStatus, isFullyApproved: true }
  }

  return defaultStatus
}
