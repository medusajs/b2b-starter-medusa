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
exports.createDataTableColumnHelper = void 0;
var react_table_1 = require("@tanstack/react-table");
var React = require("react");
var data_table_action_cell_1 = require("../components/data-table-action-cell");
var data_table_select_cell_1 = require("../components/data-table-select-cell");
var createDataTableColumnHelper = function () {
    var _a = (0, react_table_1.createColumnHelper)(), accessorTanstack = _a.accessor, display = _a.display;
    return {
        accessor: function (accessor, column) {
            var _a = column, sortLabel = _a.sortLabel, sortAscLabel = _a.sortAscLabel, sortDescLabel = _a.sortDescLabel, headerAlign = _a.headerAlign, meta = _a.meta, enableSorting = _a.enableSorting, rest = __rest(_a, ["sortLabel", "sortAscLabel", "sortDescLabel", "headerAlign", "meta", "enableSorting"]);
            var extendedMeta = __assign({ ___sortMetaData: { sortLabel: sortLabel, sortAscLabel: sortAscLabel, sortDescLabel: sortDescLabel }, ___alignMetaData: { headerAlign: headerAlign } }, (meta || {}));
            return accessorTanstack(accessor, __assign(__assign({}, rest), { enableSorting: enableSorting !== null && enableSorting !== void 0 ? enableSorting : false, meta: extendedMeta }));
        },
        display: display,
        action: function (_a) {
            var actions = _a.actions, props = __rest(_a, ["actions"]);
            return display(__assign({ id: "action", cell: function (ctx) { return <data_table_action_cell_1.DataTableActionCell ctx={ctx}/>; }, meta: __assign({ ___actions: actions }, (props.meta || {})) }, props));
        },
        select: function (props) {
            return display({
                id: "select",
                header: (props === null || props === void 0 ? void 0 : props.header)
                    ? props.header
                    : function (ctx) { return <data_table_select_cell_1.DataTableSelectHeader ctx={ctx}/>; },
                cell: (props === null || props === void 0 ? void 0 : props.cell)
                    ? props.cell
                    : function (ctx) { return <data_table_select_cell_1.DataTableSelectCell ctx={ctx}/>; },
            });
        },
    };
};
exports.createDataTableColumnHelper = createDataTableColumnHelper;
var helper = (0, react_table_1.createColumnHelper)();
helper.accessor("name", {
    meta: {},
});
