import { DataTableFilter, Filter } from "./data-table-filter";

export interface DataTableQueryProps {
  search?: boolean | "autofocus";
  orderBy?: (string | number)[];
  filters?: Filter[];
  prefix?: string;
}

export const DataTableQuery = ({
  search,
  orderBy,
  filters,
  prefix,
}: DataTableQueryProps) => {
  return (
    (search || orderBy || filters || prefix) && (
      <div className="flex items-start justify-between gap-x-4 px-6 py-4">
        <div className="w-full max-w-[60%]">
          {filters && filters.length > 0 && (
            <DataTableFilter filters={filters} prefix={prefix} />
          )}
        </div>
        <div className="flex shrink-0 items-center gap-x-2"></div>
      </div>
    )
  );
};
