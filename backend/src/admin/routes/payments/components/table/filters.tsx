import { useMemo } from "react";

export const usePaymentsTableFilters = () => {

  return useMemo(
    () => [
      {
        key: "customer_name",
        label: "Customer",
        type: "text" as const,
      },
      {
        key: "company_name", 
        label: "Company",
        type: "text" as const,
      },
      {
        key: "email",
        label: "Email",
        type: "text" as const,
      },
      {
        key: "order_number",
        label: "Order Number",
        type: "text" as const,
      },
      {
        key: "outstanding_amount",
        label: "Outstanding Amount",
        type: "number" as const,
      },
    ],
    []
  );
};
