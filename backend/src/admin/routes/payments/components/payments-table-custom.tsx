import { useState, useMemo } from "react";
import { Button, Input, Select, Text, Table } from "@medusajs/ui";
import { usePaymentsTableQuery } from "./table/query";
import { usePaymentsTableColumns } from "./table/columns";
import { usePayments } from "../../../hooks/api/payments";
import { DataTable } from "../../../../admin/components";
import { useDataTable } from "../../../../admin/hooks";
import { TextCell } from "../../../components/common/table/table-cells/text-cell";
import { AmountCell } from "../../../components/common/table/table-cells/amount-cell";
import { useSendReminder } from "../../../hooks/api/payments";

const PAGE_SIZE = 50;

const SORT_OPTIONS = [
  { value: "order_date.desc", label: "Order Date (Newest First)" },
  { value: "order_date.asc", label: "Order Date (Oldest First)" },
  { value: "order_total.desc", label: "Order Total (High to Low)" },
  { value: "order_total.asc", label: "Order Total (Low to High)" },
  { value: "total_paid.desc", label: "Total Paid (High to Low)" },
  { value: "total_paid.asc", label: "Total Paid (Low to High)" },
  { value: "outstanding_amount.desc", label: "Outstanding (High to Low)" },
  { value: "outstanding_amount.asc", label: "Outstanding (Low to High)" },
];

export const PaymentsTableCustom = () => {
  const { searchParams, raw } = usePaymentsTableQuery({
    pageSize: PAGE_SIZE,
  });

  const [searchTerm, setSearchTerm] = useState(searchParams.q || "");
  const [sortBy, setSortBy] = useState(searchParams.order || "order_date.desc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const sendReminderMutation = useSendReminder();

  const { data, isPending } = usePayments({
    limit: searchParams.limit,
    offset: searchParams.offset,
    q: searchParams.q,
    order: searchParams.order
  });

  const customerGroups = data?.orders || [];
  const count = data?.count || 0;

  const toggleRow = (customerId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(customerId)) {
      newExpandedRows.delete(customerId);
    } else {
      newExpandedRows.add(customerId);
    }
    setExpandedRows(newExpandedRows);
  };

  const columns = usePaymentsTableColumns(expandedRows, toggleRow);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalCustomers = customerGroups.length;
    const totalOrderTotal = customerGroups.reduce((sum: number, customer: any) => sum + customer.total_order_total, 0);
    const totalPaid = customerGroups.reduce((sum: number, customer: any) => sum + customer.total_paid, 0);
    const totalOutstanding = customerGroups.reduce((sum: number, customer: any) => sum + customer.total_outstanding, 0);
    
    return {
      totalCustomers,
      totalOrderTotal,
      totalPaid,
      totalOutstanding
    };
  }, [customerGroups]);

  // Flatten data for the table - include customer groups and their expanded orders
  const flattenedData = useMemo(() => {
    const result: any[] = [];
    
    customerGroups.forEach((customer: any) => {
      // Add the customer group row
      result.push(customer);
      
      // Add individual order rows if this customer is expanded
      if (expandedRows.has(customer.customer_id) && customer.orders) {
        customer.orders.forEach((order: any) => {
          result.push({
            ...order,
            is_expanded_order: true,
            parent_customer_id: customer.customer_id
          });
        });
      }
    });
    
    return result;
  }, [customerGroups, expandedRows]);

  const handleSearch = () => {
    // Update the URL with the search term
    const url = new URL(window.location.href);
    if (searchTerm.trim()) {
      url.searchParams.set('q', searchTerm.trim());
    } else {
      url.searchParams.delete('q');
    }
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    // Update the URL to remove search parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    // Update the URL with the sort value
    const url = new URL(window.location.href);
    url.searchParams.set('order', value);
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex size-full flex-col overflow-hidden">
      {/* Custom Search and Sort Controls */}
      <div className="flex items-center gap-4 p-4 border-b border-ui-border-base bg-ui-bg-subtle">
        <div className="flex items-center gap-2 flex-1">
          <Text className="text-ui-fg-muted font-medium">Search:</Text>
          <Input
            placeholder="Search by customer name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="max-w-md"
          />
          <Button onClick={handleSearch} variant="secondary" size="small">
            Search
          </Button>
          <Button 
            onClick={handleClearSearch} 
            variant="transparent" 
            size="small"
            disabled={!searchTerm.trim()}
          >
            Clear
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Text className="text-ui-fg-muted font-medium">Sort by:</Text>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <Select.Trigger className="w-[250px]">
              <Select.Value placeholder="Select sort option" />
            </Select.Trigger>
            <Select.Content>
              {SORT_OPTIONS.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      </div>

      {/* Summary Statistics */}
      {!isPending && customerGroups.length > 0 && (
        <div className="p-4 bg-ui-bg-subtle border-b border-ui-border-base">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <Text className="text-2xl font-bold text-ui-fg-base">{summaryStats.totalCustomers}</Text>
              <Text className="text-sm text-ui-fg-muted">Total Customers</Text>
            </div>
            <div className="text-center">
              <Text className="text-2xl font-bold text-ui-fg-base">
                <AmountCell amount={summaryStats.totalOrderTotal} currencyCode="CAD" />
              </Text>
              <Text className="text-sm text-ui-fg-muted">Total Order Value</Text>
            </div>
            <div className="text-center">
              <Text className="text-2xl font-bold text-green-600">
                <AmountCell amount={summaryStats.totalPaid} currencyCode="CAD" />
              </Text>
              <Text className="text-sm text-ui-fg-muted">Total Paid</Text>
            </div>
            <div className="text-center">
              <Text className="text-2xl font-bold text-red-600">
                <AmountCell amount={summaryStats.totalOutstanding} currencyCode="CAD" />
              </Text>
              <Text className="text-sm text-ui-fg-muted">Total Outstanding</Text>
            </div>
          </div>
        </div>
      )}

      {/* Custom Table */}
      <div className="flex-1 overflow-auto">
        {isPending ? (
          <div className="flex items-center justify-center p-8">
            <Text>Loading...</Text>
          </div>
        ) : flattenedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8">
            <Text className="text-lg font-medium mb-2">No customers found</Text>
            <Text className="text-ui-fg-muted">There are currently no customers with payment data.</Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Customer</Table.HeaderCell>
                <Table.HeaderCell>Company</Table.HeaderCell>
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Order Total</Table.HeaderCell>
                <Table.HeaderCell>Total Paid</Table.HeaderCell>
                <Table.HeaderCell>Outstanding Amount</Table.HeaderCell>
                <Table.HeaderCell>Reminder Last Sent At</Table.HeaderCell>
                <Table.HeaderCell>Reminder?</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {flattenedData.map((row: any, index: number) => (
                <Table.Row 
                  key={row.is_expanded_order ? `order-${row.order_id}` : `customer-${row.customer_id}`}
                  className={`
                    ${row.is_expanded_order ? "bg-ui-bg-subtle border-l-4 border-l-ui-border-interactive" : ""}
                    ${!row.is_expanded_order ? "font-medium" : ""}
                    hover:bg-ui-bg-hover
                  `}
                >
                  <Table.Cell>
                    {row.is_expanded_order ? (
                      <div className="pl-4">
                        <div className="flex flex-col">
                          <TextCell text={`Order #${row.order_number}`} />
                          <span className="text-xs text-ui-fg-muted">
                            {new Date(row.order_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {row.orders && row.orders.length > 0 && (
                          <Button
                            variant="transparent"
                            size="small"
                            onClick={() => toggleRow(row.customer_id)}
                            className="p-1 h-6 w-6 flex items-center justify-center"
                          >
                            <span className="text-sm">
                              {expandedRows.has(row.customer_id) ? "▼" : "▶"}
                            </span>
                          </Button>
                        )}
                        <div className="flex flex-col">
                          <TextCell text={row.customer_name} />
                          {row.orders && row.orders.length > 0 && (
                            <span className="text-xs text-ui-fg-muted">
                              {row.orders.length} order{row.orders.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <TextCell text={row.company_name} />
                  </Table.Cell>
                  <Table.Cell>
                    <TextCell text={row.email} />
                  </Table.Cell>
                  <Table.Cell>
                    <AmountCell amount={row.order_total} currencyCode="CAD" />
                  </Table.Cell>
                  <Table.Cell>
                    <AmountCell amount={row.total_paid} currencyCode="CAD" />
                  </Table.Cell>
                  <Table.Cell>
                    <AmountCell 
                      amount={row.outstanding_amount} 
                      currencyCode="CAD" 
                      className={row.outstanding_amount > 0 ? "text-red-600 font-semibold" : "text-green-600"}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    {row.reminder_last_sent_at ? (
                      <TextCell text={new Date(row.reminder_last_sent_at).toLocaleString()} />
                    ) : (
                      <TextCell text="Never" />
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {row.outstanding_amount > 0 && (
                      <Button
                        variant="secondary"
                        size="small"
                        isLoading={sendReminderMutation.isPending}
                        onClick={() => {
                          // Send reminder for this specific order or all customer orders
                          if (row.is_expanded_order) {
                            // Send reminder for specific order
                            sendReminderMutation.mutate(row.order_id);
                          } else {
                            // Send reminder for all outstanding orders of this customer
                            row.orders
                              ?.filter((order: any) => order.outstanding_amount > 0)
                              .forEach((order: any) => {
                                sendReminderMutation.mutate(order.order_id);
                              });
                          }
                        }}
                        >
                          {row.is_expanded_order ? "Send" : "Send All"}
                        </Button>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </div>
  );
};
