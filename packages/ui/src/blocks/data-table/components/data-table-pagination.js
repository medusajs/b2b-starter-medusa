"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTablePagination = void 0;
var React = require("react");
var use_data_table_context_1 = require("@/blocks/data-table/context/use-data-table-context");
var skeleton_1 = require("@/components/skeleton");
var table_1 = require("@/components/table");
/**
 * This component adds a pagination component and functionality to the data table.
 */
var DataTablePagination = function (props) {
    var instance = (0, use_data_table_context_1.useDataTableContext)().instance;
    if (!instance.enablePagination) {
        throw new Error("DataTable.Pagination was rendered but pagination is not enabled. Make sure to pass pagination to 'useDataTable'");
    }
    if (instance.showSkeleton) {
        return <DataTablePaginationSkeleton />;
    }
    return (<table_1.Table.Pagination translations={props.translations} className="flex-shrink-0" canNextPage={instance.getCanNextPage()} canPreviousPage={instance.getCanPreviousPage()} pageCount={instance.getPageCount()} count={instance.rowCount} nextPage={instance.nextPage} previousPage={instance.previousPage} pageIndex={instance.pageIndex} pageSize={instance.pageSize}/>);
};
exports.DataTablePagination = DataTablePagination;
DataTablePagination.displayName = "DataTable.Pagination";
var DataTablePaginationSkeleton = function () {
    return (<div>
      <div className="flex items-center justify-between p-4">
        <skeleton_1.Skeleton className="h-7 w-[138px]"/>
        <div className="flex items-center gap-x-2">
          <skeleton_1.Skeleton className="h-7 w-24"/>
          <skeleton_1.Skeleton className="h-7 w-11"/>
          <skeleton_1.Skeleton className="h-7 w-11"/>
        </div>
      </div>
    </div>);
};
