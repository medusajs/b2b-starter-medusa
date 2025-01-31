import { ApprovalStatusType } from "../../../../../types/approval";

export const useApprovalsTableFilters = () => {
  const filters: any[] = [
    {
      label: "Status",
      key: "status",
      type: "select",
      options: [
        { label: "Pending", value: ApprovalStatusType.PENDING },
        { label: "Approved", value: ApprovalStatusType.APPROVED },
        { label: "Rejected", value: ApprovalStatusType.REJECTED },
      ],
    },
  ];

  return filters;
};
