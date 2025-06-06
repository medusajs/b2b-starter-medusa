import { DataTable } from "../../../../admin/components";
import { useDataTable } from "../../../../admin/hooks";
import { useFulfillmentsTableQuery } from "./table/query";
import { useOrders } from '../../../hooks/api/order';
import { useFulfillmentTableColumns } from "./table/columns";
import { useFulfillmentTableFilters } from "./table/filters";

const PAGE_SIZE = 50;

export const FulfillmentsTable = () => {
  const { searchParams, raw } = useFulfillmentsTableQuery({
    pageSize: PAGE_SIZE,
  });

  const { orders, isPending, count } = useOrders({q: searchParams.created_at, order: "-created_at"});

  const columns = useFulfillmentTableColumns();
  const filters = useFulfillmentTableFilters();

  const { table } = useDataTable({
    data: orders,
    columns,
    enablePagination: true,
    count: count,
    pageSize: PAGE_SIZE,
  });

  // Define a function that returns the navigation path as a string
  const getRowLink = (row) => {
    return `/fulfillment/${row.original.id}`;
  };

  return (
    <div className="flex size-full flex-col overflow-hidden">
      <DataTable
        columns={columns}
        table={table}
        pagination
        filters={filters}
        count={count}
        search
        isLoading={isPending}
        pageSize={PAGE_SIZE}
        orderBy={["id", "created_at"]}
        queryObject={raw}
        noRecords={{
          title: "No fulfillments found",
          message: "There are currently no fulfillments.",
        }}
        navigateTo={getRowLink}
      />
    </div>
  );
};
