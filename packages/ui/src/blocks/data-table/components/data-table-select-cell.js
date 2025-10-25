"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableSelectHeader = exports.DataTableSelectCell = void 0;
var checkbox_1 = require("@/components/checkbox");
var React = require("react");
var DataTableSelectCell = function (props) {
    var checked = props.ctx.row.getIsSelected();
    var onChange = props.ctx.row.getToggleSelectedHandler();
    var disabled = !props.ctx.row.getCanSelect();
    return (<checkbox_1.Checkbox onClick={function (e) { return e.stopPropagation(); }} checked={checked} onCheckedChange={onChange} disabled={disabled}/>);
};
exports.DataTableSelectCell = DataTableSelectCell;
DataTableSelectCell.displayName = "DataTable.SelectCell";
var DataTableSelectHeader = function (props) {
    var checked = props.ctx.table.getIsSomePageRowsSelected()
        ? "indeterminate"
        : props.ctx.table.getIsAllPageRowsSelected();
    var onChange = function (checked) {
        props.ctx.table.toggleAllPageRowsSelected(!!checked);
    };
    var disabled = !props.ctx.table
        .getRowModel()
        .rows.some(function (row) { return row.getCanSelect(); });
    return (<checkbox_1.Checkbox onClick={function (e) { return e.stopPropagation(); }} checked={checked} onCheckedChange={onChange} disabled={disabled}/>);
};
exports.DataTableSelectHeader = DataTableSelectHeader;
