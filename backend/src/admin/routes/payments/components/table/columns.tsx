import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { TextCell } from "../../../../components/common/table/table-cells/text-cell";
import { AmountCell } from "../../../../components/common/table/table-cells/amount-cell";
import { Button } from "@medusajs/ui";
import { useNavigate } from "react-router-dom";
import { useSendReminder } from "../../../../hooks/api/payments";

const columnHelper = createColumnHelper<any>();

export const usePaymentsTableColumns = () => {
  const navigate = useNavigate();
  const sendReminderMutation = useSendReminder();

  return useMemo(
    () => [
      columnHelper.accessor("customer_name", {
        header: "Customer",
        cell: ({ getValue }) => <TextCell text={getValue()} />,
      }),
      columnHelper.accessor("company_name", {
        header: "Company",
        cell: ({ getValue }) => <TextCell text={getValue()} />,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: ({ getValue }) => <TextCell text={getValue()} />,
      }),
      columnHelper.accessor("order_number", {
        header: "Order Number",
        cell: ({ getValue }) => <TextCell text={getValue()?.toString()} />,
      }),
      columnHelper.accessor("order_date", {
        header: "Order Date",
        cell: ({ getValue }) => {
          const date = new Date(getValue());
          return <TextCell text={date.toLocaleDateString()} />;
        },
      }),
      columnHelper.accessor("order_total", {
        header: "Order Total",
        cell: ({ getValue }) => <AmountCell amount={getValue()} currencyCode="CAD" />,
      }),
      columnHelper.accessor("total_paid", {
        header: "Total Paid",
        cell: ({ getValue }) => <AmountCell amount={getValue()} currencyCode="CAD" />,
      }),
      columnHelper.accessor("outstanding_amount", {
        header: "Outstanding Amount",
        cell: ({ getValue }) => {
          const amount = getValue();
          const isOutstanding = amount > 0;
          
          return (
            <AmountCell 
              amount={amount} 
              currencyCode="CAD" 
              className={isOutstanding ? "text-red-600 font-semibold" : "text-green-600"}
            />
          );
        },
      }),
      columnHelper.accessor("reminder_last_sent_at", {
        header: "Reminder Last Sent At",
        cell: ({ getValue }) => {
          const date = getValue();
          if (!date) {
            return <TextCell text="Never" />;
          }
          return <TextCell text={new Date(date).toLocaleString()} />;
        },
      }),
      columnHelper.accessor("reminder_action", {
        header: "Reminder?",
        cell: ({ row }) => {
          const isOutstanding = row.original.outstanding_amount > 0;
          
          return (
            <div className="flex items-center gap-2">
              {isOutstanding && (
                <Button
                  variant="secondary"
                  size="small"
                  isLoading={sendReminderMutation.isPending}
                  onClick={() => {
                    sendReminderMutation.mutate(row.original.order_id);
                  }}
                >
                  Send
                </Button>
              )}
            </div>
          );
        },
      }),
    ],
    [navigate, sendReminderMutation]
  );
};