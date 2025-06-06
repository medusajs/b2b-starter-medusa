import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TextCell } from "../../../../components/common/table/table-cells/text-cell";
import { StatusBadge } from "@medusajs/ui";
import { FulfillmentStatusType } from "../../../../../types/approval";
import { DateCell } from "../../../../../admin/components/common/table/table-cells/date-cell";
import { AmountCell } from '../../../../components/common/table/table-cells/amount-cell';

const columnHelper = createColumnHelper<any>();

export const useFulfillmentTableColumns = () => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      columnHelper.accessor("display_id", {
        header: t("fields.id"),
        cell: ({ getValue }) => <TextCell text={`#${getValue()}`} />,
      }),
      columnHelper.accessor("updated_at", {
        header: t("Date"),
        cell: ({ getValue }) => <DateCell date={getValue()} />,
      }),
      columnHelper.accessor("customer.company_name", {
        header: t("fields.company"),
        cell: ({ getValue }) => <TextCell text={getValue()} />,
      }),
      columnHelper.accessor("sales_channel.name", {
        header: t("Sales Channel"),
        cell: ({ getValue }) => <TextCell text={getValue()} />,
      }),
      columnHelper.accessor("fulfillment_status", {
        header: t("fields.fulfillment"),
        cell: ({ getValue }) => {
          const status = getValue();
      
          const getColor = () => {
            if (status === FulfillmentStatusType.FULFILLED) return "green";
            if (status === FulfillmentStatusType.NOT_FULFILLED) return "red";
            return "orange";
          };
      
          const getLabel = () => {
            // Formats the status text to Title Case
            return status
              .split("_")
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(" ");
          };
      
          return (
            <StatusBadge color={getColor()}>
              {getLabel()}
            </StatusBadge>
          );
        },
      }),
      
      
      columnHelper.accessor("summary.original_order_total", {
        header: t("fields.total"),
        cell: ({ getValue }) => <AmountCell amount={getValue()} currencyCode="CAD" />,
      }),
    ],
    [t]
  );
};
