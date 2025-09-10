import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { TextCell } from "../../../../components/common/table/table-cells/text-cell";
import { AmountCell } from "../../../../components/common/table/table-cells/amount-cell";
import { Button, IconButton } from "@medusajs/ui";
import { useNavigate } from "react-router-dom";
import { useSendReminder } from "../../../../hooks/api/payments";
import { ChevronDownMini, ChevronRightMini } from "@medusajs/icons";

const columnHelper = createColumnHelper<any>();

export const usePaymentsTableColumns = (expandedRows: Set<string>, toggleRow: (customerId: string) => void) => {
  const navigate = useNavigate();
  const sendReminderMutation = useSendReminder();

  return useMemo(
    () => [
      columnHelper.accessor("customer_name", {
        header: "Customer",
        cell: ({ getValue, row }) => {
          const customer = row.original;
          const isExpanded = expandedRows.has(customer.customer_id);
          const hasOrders = customer.orders && customer.orders.length > 0;
          
          return (
            <div className="flex items-center gap-2">
              {hasOrders && (
                <IconButton
                  variant="transparent"
                  size="small"
                  onClick={() => toggleRow(customer.customer_id)}
                >
                  {isExpanded ? (
                    <ChevronDownMini className="h-4 w-4" />
                  ) : (
                    <ChevronRightMini className="h-4 w-4" />
                  )}
                </IconButton>
              )}
              <TextCell text={getValue()} />
            </div>
          );
        },
      }),
      columnHelper.accessor("company_name", {
        header: "Company",
        cell: ({ getValue }) => <TextCell text={getValue()} />,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: ({ getValue }) => <TextCell text={getValue()} />,
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
          const customer = row.original;
          const isOutstanding = customer.outstanding_amount > 0;
          
          return (
            <div className="flex items-center gap-2">
              {isOutstanding && (
                 <Button
                   variant="secondary"
                   size="small"
                   isLoading={sendReminderMutation.isPending}
                   onClick={() => {
                     // Send reminder for all outstanding orders of this customer
                     customer.orders
                       .filter((order: any) => order.outstanding_amount > 0)
                       .forEach((order: any) => {
                         sendReminderMutation.mutate(order.order_id);
                       });
                   }}
                 >
                   Send All
                 </Button>
              )}
            </div>
          );
        },
      }),
    ],
    [navigate, sendReminderMutation, expandedRows, toggleRow]
  );
};