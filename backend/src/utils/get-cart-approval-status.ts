import { ApprovalStatusType, QueryApproval } from "../types/approval";

export const getCartApprovalStatus = (cart: Record<string, any> | null) => {
  const defaultStatus = {
    isPendingApproval: false,
    isApproved: false,
    isRejected: false,
  };

  if (!cart?.approvals?.length) return defaultStatus;

  const approvals = cart.approvals as QueryApproval[];

  const isPendingApproval = approvals.some(
    (approval) => approval?.status === ApprovalStatusType.PENDING
  );

  if (isPendingApproval) {
    return { ...defaultStatus, isPendingApproval: true };
  }

  const isApproved = approvals.some(
    (approval) => approval?.status === ApprovalStatusType.APPROVED
  );

  if (isApproved) {
    return { ...defaultStatus, isApproved: true };
  }

  const isRejected = approvals.some(
    (approval) => approval?.status === ApprovalStatusType.REJECTED
  );

  return { ...defaultStatus, isRejected };
};
