"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableToolbar = void 0;
var data_table_filter_bar_1 = require("@/blocks/data-table/components/data-table-filter-bar");
var use_data_table_context_1 = require("@/blocks/data-table/context/use-data-table-context");
var clx_1 = require("@/utils/clx");
var React = require("react");
/**
 * Toolbar shown for the data table.
 */
var DataTableToolbar = function (props) {
    var _a, _b, _c;
    var instance = (0, use_data_table_context_1.useDataTableContext)().instance;
    var hasFilters = instance.getFilters().length > 0;
    return (<div className="flex flex-col divide-y">
      <div className={(0, clx_1.clx)("flex items-center px-6 py-4", props.className)}>
        {props.children}
      </div>
      <data_table_filter_bar_1.DataTableFilterBar clearAllFiltersLabel={(_a = props.translations) === null || _a === void 0 ? void 0 : _a.clearAll} alwaysShow={hasFilters} sortingTooltip={(_b = props.translations) === null || _b === void 0 ? void 0 : _b.sort} columnsTooltip={(_c = props.translations) === null || _c === void 0 ? void 0 : _c.columns}>
        {props.filterBarContent}
      </data_table_filter_bar_1.DataTableFilterBar>
    </div>);
};
exports.DataTableToolbar = DataTableToolbar;
