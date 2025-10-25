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
exports.useDataTable = void 0;
var react_table_1 = require("@tanstack/react-table");
var React = require("react");
var types_1 = require("./types");
var useDataTable = function (_a) {
    var _b, _c, _d, _e, _f, _g;
    var _h = _a.rowCount, rowCount = _h === void 0 ? 0 : _h, filters = _a.filters, commands = _a.commands, rowSelection = _a.rowSelection, sorting = _a.sorting, filtering = _a.filtering, pagination = _a.pagination, search = _a.search, onRowClick = _a.onRowClick, _j = _a.autoResetPageIndex, autoResetPageIndex = _j === void 0 ? true : _j, _k = _a.isLoading, isLoading = _k === void 0 ? false : _k, columnVisibility = _a.columnVisibility, columnOrder = _a.columnOrder, options = __rest(_a, ["rowCount", "filters", "commands", "rowSelection", "sorting", "filtering", "pagination", "search", "onRowClick", "autoResetPageIndex", "isLoading", "columnVisibility", "columnOrder"]);
    var _l = sorting !== null && sorting !== void 0 ? sorting : {}, sortingState = _l.state, onSortingChange = _l.onSortingChange;
    var _m = filtering !== null && filtering !== void 0 ? filtering : {}, filteringState = _m.state, onFilteringChange = _m.onFilteringChange;
    var _o = pagination !== null && pagination !== void 0 ? pagination : {}, paginationState = _o.state, onPaginationChange = _o.onPaginationChange;
    var _p = rowSelection !== null && rowSelection !== void 0 ? rowSelection : {}, rowSelectionState = _p.state, onRowSelectionChange = _p.onRowSelectionChange, enableRowSelection = _p.enableRowSelection;
    var _q = columnVisibility !== null && columnVisibility !== void 0 ? columnVisibility : {}, columnVisibilityState = _q.state, onColumnVisibilityChange = _q.onColumnVisibilityChange;
    var _r = columnOrder !== null && columnOrder !== void 0 ? columnOrder : {}, columnOrderState = _r.state, onColumnOrderChange = _r.onColumnOrderChange;
    // Store filter metadata like openOnMount
    var autoResetPageIndexHandler = React.useCallback(function () {
        return autoResetPageIndex
            ? function () {
                return paginationState &&
                    (onPaginationChange === null || onPaginationChange === void 0 ? void 0 : onPaginationChange(__assign(__assign({}, paginationState), { pageIndex: 0 })));
            }
            : undefined;
    }, [autoResetPageIndex, paginationState, onPaginationChange]);
    var sortingStateHandler = React.useCallback(function () {
        return onSortingChange
            ? function (updaterOrValue) {
                var _a;
                (_a = autoResetPageIndexHandler()) === null || _a === void 0 ? void 0 : _a();
                onSortingChangeTransformer(onSortingChange, sortingState)(updaterOrValue);
            }
            : undefined;
    }, [onSortingChange, sortingState, autoResetPageIndexHandler]);
    var rowSelectionStateHandler = React.useCallback(function () {
        return onRowSelectionChange
            ? function (updaterOrValue) {
                onRowSelectionChangeTransformer(onRowSelectionChange, rowSelectionState)(updaterOrValue);
            }
            : undefined;
    }, [onRowSelectionChange, rowSelectionState, autoResetPageIndexHandler]);
    var filteringStateHandler = React.useCallback(function () {
        return onFilteringChange
            ? function (updaterOrValue) {
                var _a;
                (_a = autoResetPageIndexHandler()) === null || _a === void 0 ? void 0 : _a();
                onFilteringChangeTransformer(onFilteringChange, filteringState)(updaterOrValue);
            }
            : undefined;
    }, [onFilteringChange, filteringState, autoResetPageIndexHandler]);
    var paginationStateHandler = React.useCallback(function () {
        return onPaginationChange
            ? onPaginationChangeTransformer(onPaginationChange, paginationState)
            : undefined;
    }, [onPaginationChange, paginationState]);
    var columnVisibilityStateHandler = React.useCallback(function () {
        return onColumnVisibilityChange
            ? function (updaterOrValue) {
                var value = typeof updaterOrValue === "function"
                    ? updaterOrValue(columnVisibilityState !== null && columnVisibilityState !== void 0 ? columnVisibilityState : {})
                    : updaterOrValue;
                onColumnVisibilityChange(value);
            }
            : undefined;
    }, [onColumnVisibilityChange, columnVisibilityState]);
    var columnOrderStateHandler = React.useCallback(function () {
        return onColumnOrderChange
            ? function (updaterOrValue) {
                var value = typeof updaterOrValue === "function"
                    ? updaterOrValue(columnOrderState !== null && columnOrderState !== void 0 ? columnOrderState : [])
                    : updaterOrValue;
                onColumnOrderChange(value);
            }
            : undefined;
    }, [onColumnOrderChange, columnOrderState]);
    var instance = (0, react_table_1.useReactTable)(__assign(__assign({}, options), { getCoreRowModel: (0, react_table_1.getCoreRowModel)(), state: {
            rowSelection: rowSelectionState !== null && rowSelectionState !== void 0 ? rowSelectionState : {},
            sorting: sortingState ? [sortingState] : undefined,
            columnFilters: Object.entries(filteringState !== null && filteringState !== void 0 ? filteringState : {}).map(function (_a) {
                var id = _a[0], filter = _a[1];
                return ({
                    id: id,
                    value: filter,
                });
            }),
            pagination: paginationState,
            columnVisibility: columnVisibilityState !== null && columnVisibilityState !== void 0 ? columnVisibilityState : {},
            columnOrder: columnOrderState !== null && columnOrderState !== void 0 ? columnOrderState : [],
        }, enableRowSelection: enableRowSelection, rowCount: rowCount, onColumnFiltersChange: filteringStateHandler(), onRowSelectionChange: rowSelectionStateHandler(), onSortingChange: sortingStateHandler(), onPaginationChange: paginationStateHandler(), onColumnVisibilityChange: columnVisibilityStateHandler(), onColumnOrderChange: columnOrderStateHandler(), manualSorting: true, manualPagination: true, manualFiltering: true }));
    var getSorting = React.useCallback(function () {
        var _a, _b;
        return (_b = (_a = instance.getState().sorting) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : null;
    }, [instance]);
    var setSorting = React.useCallback(function (sortingOrUpdater) {
        var _a, _b, _c;
        var currentSort = (_b = (_a = instance.getState().sorting) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : null;
        var newSorting = typeof sortingOrUpdater === "function"
            ? sortingOrUpdater(currentSort)
            : sortingOrUpdater;
        (_c = autoResetPageIndexHandler()) === null || _c === void 0 ? void 0 : _c();
        instance.setSorting([newSorting]);
    }, [instance, autoResetPageIndexHandler]);
    var getFilters = React.useCallback(function () {
        return filters !== null && filters !== void 0 ? filters : [];
    }, [filters]);
    var getFilterOptions = React.useCallback(function (id) {
        var filter = getFilters().find(function (filter) { return filter.id === id; });
        if (!filter) {
            return null;
        }
        return filter.options || null;
    }, [getFilters]);
    var getFilterMeta = React.useCallback(function (id) {
        return getFilters().find(function (filter) { return filter.id === id; }) || null;
    }, [getFilters]);
    var getFiltering = React.useCallback(function () {
        var _a;
        var state = (_a = instance.getState().columnFilters) !== null && _a !== void 0 ? _a : [];
        return Object.fromEntries(state.map(function (filter) { return [filter.id, filter.value]; }));
    }, [instance]);
    var addFilter = React.useCallback(function (filter) {
        var _a;
        var _b;
        var currentFilters = getFiltering();
        var newFilters = __assign(__assign({}, currentFilters), (_a = {}, _a[filter.id] = filter.value, _a));
        (_b = autoResetPageIndexHandler()) === null || _b === void 0 ? void 0 : _b();
        onFilteringChange === null || onFilteringChange === void 0 ? void 0 : onFilteringChange(newFilters);
    }, [onFilteringChange, getFiltering, autoResetPageIndexHandler]);
    var removeFilter = React.useCallback(function (id) {
        var _a;
        var currentFilters = getFiltering();
        delete currentFilters[id];
        (_a = autoResetPageIndexHandler()) === null || _a === void 0 ? void 0 : _a();
        onFilteringChange === null || onFilteringChange === void 0 ? void 0 : onFilteringChange(currentFilters);
    }, [onFilteringChange, getFiltering, autoResetPageIndexHandler]);
    var clearFilters = React.useCallback(function () {
        var _a;
        (_a = autoResetPageIndexHandler()) === null || _a === void 0 ? void 0 : _a();
        onFilteringChange === null || onFilteringChange === void 0 ? void 0 : onFilteringChange({});
    }, [onFilteringChange, autoResetPageIndexHandler]);
    var updateFilter = React.useCallback(function (filter) {
        addFilter(filter);
    }, [addFilter]);
    var _s = search !== null && search !== void 0 ? search : {}, searchState = _s.state, onSearchChange = _s.onSearchChange, _t = _s.debounce, debounce = _t === void 0 ? 300 : _t;
    var _u = React.useState(searchState !== null && searchState !== void 0 ? searchState : ""), localSearch = _u[0], setLocalSearch = _u[1];
    var timeoutRef = React.useRef();
    React.useEffect(function () {
        setLocalSearch(searchState !== null && searchState !== void 0 ? searchState : "");
    }, [searchState]);
    var getSearch = React.useCallback(function () {
        return localSearch;
    }, [localSearch]);
    var debouncedSearchChange = React.useMemo(function () {
        if (!onSearchChange) {
            return undefined;
        }
        return function (value) {
            var _a;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (debounce <= 0) {
                (_a = autoResetPageIndexHandler()) === null || _a === void 0 ? void 0 : _a();
                onSearchChange(value);
                return;
            }
            timeoutRef.current = setTimeout(function () {
                var _a;
                (_a = autoResetPageIndexHandler()) === null || _a === void 0 ? void 0 : _a();
                onSearchChange(value);
            }, debounce);
        };
    }, [onSearchChange, debounce, autoResetPageIndexHandler]);
    React.useEffect(function () {
        return function () {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    var onSearchChangeHandler = React.useCallback(function (search) {
        setLocalSearch(search);
        debouncedSearchChange === null || debouncedSearchChange === void 0 ? void 0 : debouncedSearchChange(search);
    }, [debouncedSearchChange]);
    var getCommands = React.useCallback(function () {
        return commands !== null && commands !== void 0 ? commands : [];
    }, [commands]);
    var getRowSelection = React.useCallback(function () {
        return instance.getState().rowSelection;
    }, [instance]);
    var rows = instance.getRowModel().rows;
    var emptyState = React.useMemo(function () {
        var hasRows = rows.length > 0;
        var hasSearch = Boolean(searchState);
        var hasFilters = Object.keys(filteringState !== null && filteringState !== void 0 ? filteringState : {}).length > 0;
        if (hasRows) {
            return types_1.DataTableEmptyState.POPULATED;
        }
        if (hasSearch || hasFilters) {
            return types_1.DataTableEmptyState.FILTERED_EMPTY;
        }
        return types_1.DataTableEmptyState.EMPTY;
    }, [rows, searchState, filteringState]);
    var showSkeleton = React.useMemo(function () {
        return isLoading === true && rows.length === 0;
    }, [isLoading, rows]);
    var enablePagination = !!pagination;
    var enableFiltering = !!filtering;
    var enableSorting = !!sorting;
    var enableSearch = !!search;
    var enableColumnVisibility = !!columnVisibility;
    var enableColumnOrder = !!columnOrder;
    var setColumnOrderFromArray = React.useCallback(function (order) {
        instance.setColumnOrder(order);
    }, [instance]);
    return {
        // Table
        getHeaderGroups: instance.getHeaderGroups,
        getRowModel: instance.getRowModel,
        getAllColumns: instance.getAllColumns,
        setColumnVisibility: instance.setColumnVisibility,
        setColumnOrder: instance.setColumnOrder,
        // Pagination
        enablePagination: enablePagination,
        getCanNextPage: instance.getCanNextPage,
        getCanPreviousPage: instance.getCanPreviousPage,
        nextPage: instance.nextPage,
        previousPage: instance.previousPage,
        getPageCount: instance.getPageCount,
        pageIndex: (_d = (_c = (_b = instance.getState()) === null || _b === void 0 ? void 0 : _b.pagination) === null || _c === void 0 ? void 0 : _c.pageIndex) !== null && _d !== void 0 ? _d : 0,
        pageSize: (_g = (_f = (_e = instance.getState()) === null || _e === void 0 ? void 0 : _e.pagination) === null || _f === void 0 ? void 0 : _f.pageSize) !== null && _g !== void 0 ? _g : 10,
        rowCount: rowCount,
        // Search
        enableSearch: enableSearch,
        getSearch: getSearch,
        onSearchChange: onSearchChangeHandler,
        // Sorting
        enableSorting: enableSorting,
        getSorting: getSorting,
        setSorting: setSorting,
        // Filtering
        enableFiltering: enableFiltering,
        getFilters: getFilters,
        getFilterOptions: getFilterOptions,
        getFilterMeta: getFilterMeta,
        getFiltering: getFiltering,
        addFilter: addFilter,
        removeFilter: removeFilter,
        clearFilters: clearFilters,
        updateFilter: updateFilter,
        // Commands
        getCommands: getCommands,
        getRowSelection: getRowSelection,
        // Handlers
        onRowClick: onRowClick,
        // Empty State
        emptyState: emptyState,
        // Loading
        isLoading: isLoading,
        showSkeleton: showSkeleton,
        // Column Visibility
        enableColumnVisibility: enableColumnVisibility,
        // Column Order
        enableColumnOrder: enableColumnOrder,
        columnOrder: instance.getState().columnOrder,
        setColumnOrderFromArray: setColumnOrderFromArray,
    };
};
exports.useDataTable = useDataTable;
function onSortingChangeTransformer(onSortingChange, state) {
    return function (updaterOrValue) {
        var value = typeof updaterOrValue === "function"
            ? updaterOrValue(state ? [state] : [])
            : updaterOrValue;
        var columnSort = value[0];
        onSortingChange(columnSort);
    };
}
function onRowSelectionChangeTransformer(onRowSelectionChange, state) {
    return function (updaterOrValue) {
        var value = typeof updaterOrValue === "function"
            ? updaterOrValue(state !== null && state !== void 0 ? state : {})
            : updaterOrValue;
        onRowSelectionChange(value);
    };
}
function onFilteringChangeTransformer(onFilteringChange, state) {
    return function (updaterOrValue) {
        var value = typeof updaterOrValue === "function"
            ? updaterOrValue(Object.entries(state !== null && state !== void 0 ? state : {}).map(function (_a) {
                var id = _a[0], filter = _a[1];
                return ({
                    id: id,
                    value: filter,
                });
            }))
            : updaterOrValue;
        var transformedValue = Object.fromEntries(value.map(function (filter) { return [filter.id, filter.value]; }));
        onFilteringChange(transformedValue);
    };
}
function onPaginationChangeTransformer(onPaginationChange, state) {
    return function (updaterOrValue) {
        var value = typeof updaterOrValue === "function"
            ? updaterOrValue(state !== null && state !== void 0 ? state : { pageIndex: 0, pageSize: 10 })
            : updaterOrValue;
        onPaginationChange(value);
    };
}
