"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTable = void 0;
var React = require("react");
var clx_1 = require("@/utils/clx");
var data_table_command_bar_1 = require("./components/data-table-command-bar");
var data_table_column_visibility_menu_1 = require("./components/data-table-column-visibility-menu");
var data_table_filter_bar_1 = require("./components/data-table-filter-bar");
var data_table_filter_menu_1 = require("./components/data-table-filter-menu");
var data_table_pagination_1 = require("./components/data-table-pagination");
var data_table_search_1 = require("./components/data-table-search");
var data_table_sorting_menu_1 = require("./components/data-table-sorting-menu");
var data_table_table_1 = require("./components/data-table-table");
var data_table_toolbar_1 = require("./components/data-table-toolbar");
var data_table_context_provider_1 = require("./context/data-table-context-provider");
/**
 * This component creates a data table with filters, pagination, sorting, and more.
 * It's built on top of the `Table` component while expanding its functionality.
 * The `DataTable` is useful to create tables similar to those in the Medusa Admin dashboard.
 */
var Root = function (_a) {
    var instance = _a.instance, children = _a.children, className = _a.className;
    return (<data_table_context_provider_1.DataTableContextProvider instance={instance}>
      <div className={(0, clx_1.clx)("relative flex min-h-0 flex-1 flex-col", className)}>
        {children}
      </div>
    </data_table_context_provider_1.DataTableContextProvider>);
};
Root.displayName = "DataTable";
var DataTable = Object.assign(Root, {
    Table: data_table_table_1.DataTableTable,
    Toolbar: data_table_toolbar_1.DataTableToolbar,
    Search: data_table_search_1.DataTableSearch,
    SortingMenu: data_table_sorting_menu_1.DataTableSortingMenu,
    FilterMenu: data_table_filter_menu_1.DataTableFilterMenu,
    FilterBar: data_table_filter_bar_1.DataTableFilterBar,
    ColumnVisibilityMenu: data_table_column_visibility_menu_1.DataTableColumnVisibilityMenu,
    Pagination: data_table_pagination_1.DataTablePagination,
    CommandBar: data_table_command_bar_1.DataTableCommandBar,
});
exports.DataTable = DataTable;
