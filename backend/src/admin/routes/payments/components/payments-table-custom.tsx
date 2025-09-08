import { useState } from "react";
import { Button, Input, Select, Text } from "@medusajs/ui";
import { usePaymentsTableQuery } from "./table/query";
import { usePaymentsTableColumns } from "./table/columns";
import { usePayments } from "../../../hooks/api/payments";
import { DataTable } from "../../../../admin/components";
import { useDataTable } from "../../../../admin/hooks";

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

  const { data, isPending } = usePayments({
    limit: searchParams.limit,
    offset: searchParams.offset,
    q: searchParams.q,
    order: searchParams.order
  });

  const orders = data?.orders || [];
  const count = data?.count || 0;


  const columns = usePaymentsTableColumns();

  const { table } = useDataTable({
    data: orders,
    columns,
    enablePagination: true,
    count: count,
    pageSize: PAGE_SIZE,
  });

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

      {/* Data Table */}
      <div className="flex-1 overflow-hidden">
        <DataTable
          columns={columns}
          table={table}
          pagination
          count={count}
          isLoading={isPending}
          pageSize={PAGE_SIZE}
          queryObject={raw}
          noRecords={{
            title: "No orders found",
            message: "There are currently no orders with payment data.",
          }}
        />
      </div>
    </div>
  );
};
