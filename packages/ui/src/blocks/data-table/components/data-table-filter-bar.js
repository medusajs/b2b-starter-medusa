"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableFilterBar = void 0;
var React = require("react");
var data_table_filter_1 = require("@/blocks/data-table/components/data-table-filter");
var data_table_filter_menu_1 = require("@/blocks/data-table/components/data-table-filter-menu");
var data_table_sorting_menu_1 = require("@/blocks/data-table/components/data-table-sorting-menu");
var data_table_column_visibility_menu_1 = require("@/blocks/data-table/components/data-table-column-visibility-menu");
var use_data_table_context_1 = require("@/blocks/data-table/context/use-data-table-context");
var skeleton_1 = require("@/components/skeleton");
var DataTableFilterBar = function (_a) {
    var _b = _a.clearAllFiltersLabel, clearAllFiltersLabel = _b === void 0 ? "Clear all" : _b, _c = _a.alwaysShow, alwaysShow = _c === void 0 ? false : _c, sortingTooltip = _a.sortingTooltip, columnsTooltip = _a.columnsTooltip, children = _a.children;
    var _d = (0, use_data_table_context_1.useDataTableContext)(), instance = _d.instance, enableColumnVisibility = _d.enableColumnVisibility;
    // Local state for managing intermediate filters
    var _e = React.useState([]), localFilters = _e[0], setLocalFilters = _e[1];
    var parentFilterState = instance.getFiltering();
    var availableFilters = instance.getFilters();
    // Sync parent filters with local state
    React.useEffect(function () {
        setLocalFilters(function (prevLocalFilters) {
            var parentIds = Object.keys(parentFilterState);
            var localIds = prevLocalFilters.map(function (f) { return f.id; });
            // Remove local filters that have been removed from parent
            var updatedLocalFilters = prevLocalFilters.filter(function (f) {
                return parentIds.includes(f.id) || f.isNew;
            });
            // Add parent filters that don't exist locally
            parentIds.forEach(function (id) {
                if (!localIds.includes(id)) {
                    updatedLocalFilters.push({
                        id: id,
                        value: parentFilterState[id],
                        isNew: false
                    });
                }
            });
            // Only update if there's an actual change
            if (updatedLocalFilters.length !== prevLocalFilters.length ||
                updatedLocalFilters.some(function (f, i) { var _a; return f.id !== ((_a = prevLocalFilters[i]) === null || _a === void 0 ? void 0 : _a.id); })) {
                return updatedLocalFilters;
            }
            return prevLocalFilters;
        });
    }, [parentFilterState]);
    // Add a new filter locally
    var addLocalFilter = React.useCallback(function (id, value) {
        setLocalFilters(function (prev) { return __spreadArray(__spreadArray([], prev, true), [{ id: id, value: value, isNew: true }], false); });
    }, []);
    // Update a local filter's value
    var updateLocalFilter = React.useCallback(function (id, value) {
        setLocalFilters(function (prev) { return prev.map(function (f) {
            return f.id === id ? __assign(__assign({}, f), { value: value, isNew: false }) : f;
        }); });
        // If the filter has a meaningful value, propagate to parent
        if (value !== undefined && value !== null && value !== '' &&
            !(Array.isArray(value) && value.length === 0)) {
            instance.updateFilter({ id: id, value: value });
        }
    }, [instance]);
    // Remove a local filter
    var removeLocalFilter = React.useCallback(function (id) {
        setLocalFilters(function (prev) { return prev.filter(function (f) { return f.id !== id; }); });
        // Also remove from parent if it exists there
        if (parentFilterState[id] !== undefined) {
            instance.removeFilter(id);
        }
    }, [instance, parentFilterState]);
    var clearFilters = React.useCallback(function () {
        setLocalFilters([]);
        instance.clearFilters();
    }, [instance]);
    var filterCount = localFilters.length;
    var hasAvailableFilters = availableFilters.length > 0;
    // Check if sorting is enabled
    var sortableColumns = instance.getAllColumns().filter(function (column) { return column.getCanSort(); });
    var hasSorting = instance.enableSorting && sortableColumns.length > 0;
    // Always show the filter bar when there are available filters, sorting, column visibility, or when forced
    if (filterCount === 0 && !hasAvailableFilters && !hasSorting && !enableColumnVisibility && !alwaysShow && !children) {
        return null;
    }
    if (instance.showSkeleton) {
        return <DataTableFilterBarSkeleton filterCount={filterCount}/>;
    }
    return (<div className="bg-ui-bg-subtle flex w-full flex-nowrap items-center justify-between gap-2 overflow-x-auto border-t px-6 py-2">
      <div className="flex flex-nowrap items-center gap-2 md:flex-wrap">
        {localFilters.map(function (localFilter) { return (<data_table_filter_1.DataTableFilter key={localFilter.id} id={localFilter.id} filter={localFilter.value} isNew={localFilter.isNew} onUpdate={function (value) { return updateLocalFilter(localFilter.id, value); }} onRemove={function () { return removeLocalFilter(localFilter.id); }}/>); })}
        {hasAvailableFilters && (<data_table_filter_menu_1.DataTableFilterMenu onAddFilter={addLocalFilter}/>)}
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        {hasSorting && <data_table_sorting_menu_1.DataTableSortingMenu tooltip={sortingTooltip}/>}
        {enableColumnVisibility && <data_table_column_visibility_menu_1.DataTableColumnVisibilityMenu tooltip={columnsTooltip}/>}
        {children}
      </div>
    </div>);
};
exports.DataTableFilterBar = DataTableFilterBar;
DataTableFilterBar.displayName = "DataTable.FilterBar";
var DataTableFilterBarSkeleton = function (_a) {
    var filterCount = _a.filterCount;
    return (<div className="bg-ui-bg-subtle flex w-full flex-nowrap items-center gap-2 overflow-x-auto border-t px-6 py-2 md:flex-wrap">
      {Array.from({ length: filterCount }).map(function (_, index) { return (<skeleton_1.Skeleton key={index} className="h-7 w-[180px]"/>); })}
      {filterCount > 0 ? <skeleton_1.Skeleton className="h-7 w-[66px]"/> : null}
    </div>);
};
