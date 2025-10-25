import { OnChangeFn, RowSelectionState } from "@tanstack/react-table";
import { useState } from "react";
import { DataTable } from "../../../../components";
import { useVariants } from "../../../../hooks/api";
import { useDataTable } from "../../../../hooks/use-data-table";
import { useManageItemsTableColumns } from "./table/columns";
import { useManageItemsTableFilters } from "./table/filters";
import { useManageItemsTableQuery } from "./table/query";

const PAGE_SIZE = 50;
const PREFIX = "rit";

type ManageItemsTableProps = {
  onSelectionChange: (ids: string[]) => void;
  currencyCode: string;
};

export const ManageItemsTable = ({
  onSelectionChange,
  currencyCode,
}: ManageItemsTableProps) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const updater: OnChangeFn<RowSelectionState> = (fn) => {
    const newState: RowSelectionState =
      typeof fn === "function" ? fn(rowSelection) : fn;

    setRowSelection(newState);
    onSelectionChange(Object.keys(newState));
  };

  const { searchParams, raw } = useManageItemsTableQuery({
    pageSize: PAGE_SIZE,
    prefix: PREFIX,
  });

  const { variants = [], count } = useVariants({
    ...searchParams,
    fields: "*inventory_items.inventory.location_levels,+inventory_quantity",
  });

  const columns = useManageItemsTableColumns(currencyCode);
  const filters = useManageItemsTableFilters();

  const { table } = useDataTable({
    data: variants,
    columns: columns,
    count,
    enablePagination: true,
    getRowId: (row) => row.id,
    pageSize: PAGE_SIZE,
    enableRowSelection: (row) => true,
    rowSelection: {
      state: rowSelection,
      updater,
    },
  });

  return (
    <div className="flex size-full flex-col overflow-hidden">
      <DataTable
        table={table}
        columns={columns}
        pageSize={PAGE_SIZE}
        count={count}
        filters={filters}
        pagination
        layout="fill"
        search
        orderBy={["product_id", "title", "sku"]}
        prefix={PREFIX}
        queryObject={raw}
      />
    </div>
  );
};
