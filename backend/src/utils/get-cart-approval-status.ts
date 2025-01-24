import { ApprovalStatus } from "@starter/types/approval";

export const getCartApprovalStatus = (cart: Record<string, any> | null) => {
  if (!cart || !cart.approvals)
    return { isPendingApproval: false, isApproved: false, isRejected: false };

  const isApproved =
    cart?.approvals?.some(
      (approval) => approval.status === ApprovalStatus.APPROVED
    ) || false;

  const isPendingApproval =
    (cart?.approvals?.some(
      (approval) => approval.status === ApprovalStatus.PENDING
    ) &&
      !isApproved) ||
    false;

  const isRejected =
    (cart?.approvals?.some(
      (approval) => approval.status === ApprovalStatus.REJECTED
    ) &&
      !isPendingApproval &&
      !isApproved) ||
    false;

  return { isPendingApproval, isApproved, isRejected };
};
