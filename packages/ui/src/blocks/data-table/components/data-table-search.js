"use client";
"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableSearch = void 0;
var input_1 = require("@/components/input");
var skeleton_1 = require("@/components/skeleton");
var clx_1 = require("@/utils/clx");
var React = require("react");
var use_data_table_context_1 = require("@/blocks/data-table/context/use-data-table-context");
/**
 * This component adds a search input to the data table, allowing users
 * to search through the table's data.
 */
var DataTableSearch = function (props) {
    var className = props.className, rest = __rest(props, ["className"]);
    var instance = (0, use_data_table_context_1.useDataTableContext)().instance;
    if (!instance.enableSearch) {
        throw new Error("DataTable.Search was rendered but search is not enabled. Make sure to pass search to 'useDataTable'");
    }
    if (instance.showSkeleton) {
        return <DataTableSearchSkeleton />;
    }
    return (<input_1.Input size="small" type="search" value={instance.getSearch()} onChange={function (e) { return instance.onSearchChange(e.target.value); }} className={(0, clx_1.clx)({
            "pr-[calc(15px+2px+8px)]": instance.isLoading,
        }, className)} {...rest}/>);
};
exports.DataTableSearch = DataTableSearch;
DataTableSearch.displayName = "DataTable.Search";
var DataTableSearchSkeleton = function () {
    return <skeleton_1.Skeleton className="h-7 w-[128px]"/>;
};
