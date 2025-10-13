"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableSortingMenu = void 0;
var use_data_table_context_1 = require("@/blocks/data-table/context/use-data-table-context");
var dropdown_menu_1 = require("@/components/dropdown-menu");
var icon_button_1 = require("@/components/icon-button");
var skeleton_1 = require("@/components/skeleton");
var tooltip_1 = require("@/components/tooltip");
var icons_1 = require("@medusajs/icons");
var React = require("react");
/**
 * This component adds a sorting menu to the data table, allowing users
 * to sort the table's data.
 */
var DataTableSortingMenu = function (props) {
    var instance = (0, use_data_table_context_1.useDataTableContext)().instance;
    var sortableColumns = instance
        .getAllColumns()
        .filter(function (column) { return column.getCanSort(); });
    var sorting = instance.getSorting();
    var selectedColumn = React.useMemo(function () {
        return sortableColumns.find(function (column) { return column.id === (sorting === null || sorting === void 0 ? void 0 : sorting.id); });
    }, [sortableColumns, sorting]);
    var setKey = React.useCallback(function (key) {
        instance.setSorting(function (prev) { var _a; return ({ id: key, desc: (_a = prev === null || prev === void 0 ? void 0 : prev.desc) !== null && _a !== void 0 ? _a : false }); });
    }, [instance]);
    var setDesc = React.useCallback(function (desc) {
        instance.setSorting(function (prev) {
            var _a;
            return ({
                id: (_a = prev === null || prev === void 0 ? void 0 : prev.id) !== null && _a !== void 0 ? _a : "",
                desc: desc === "true",
            });
        });
    }, [instance]);
    if (!instance.enableSorting) {
        throw new Error("DataTable.SortingMenu was rendered but sorting is not enabled. Make sure to pass sorting to 'useDataTable'");
    }
    if (!sortableColumns.length) {
        throw new Error("DataTable.SortingMenu was rendered but there are no sortable columns. Make sure to set `enableSorting` to true on at least one column.");
    }
    if (instance.showSkeleton) {
        return <DataTableSortingMenuSkeleton />;
    }
    var Wrapper = props.tooltip ? tooltip_1.Tooltip : React.Fragment;
    var wrapperProps = props.tooltip ? { content: props.tooltip } : {};
    return (<dropdown_menu_1.DropdownMenu>
      <Wrapper {...wrapperProps}>
        <dropdown_menu_1.DropdownMenu.Trigger asChild>
          <icon_button_1.IconButton size="small">
            <icons_1.DescendingSorting />
          </icon_button_1.IconButton>
        </dropdown_menu_1.DropdownMenu.Trigger>
      </Wrapper>
      <dropdown_menu_1.DropdownMenu.Content side="bottom">
        <dropdown_menu_1.DropdownMenu.RadioGroup value={sorting === null || sorting === void 0 ? void 0 : sorting.id} onValueChange={setKey}>
          {sortableColumns.map(function (column) {
            return (<dropdown_menu_1.DropdownMenu.RadioItem onSelect={function (e) { return e.preventDefault(); }} value={column.id} key={column.id}>
                {getSortLabel(column)}
              </dropdown_menu_1.DropdownMenu.RadioItem>);
        })}
        </dropdown_menu_1.DropdownMenu.RadioGroup>
        {sorting && (<React.Fragment>
            <dropdown_menu_1.DropdownMenu.Separator />
            <dropdown_menu_1.DropdownMenu.RadioGroup value={(sorting === null || sorting === void 0 ? void 0 : sorting.desc) ? "true" : "false"} onValueChange={setDesc}>
              <dropdown_menu_1.DropdownMenu.RadioItem onSelect={function (e) { return e.preventDefault(); }} value="false" className="flex items-center gap-2">
                <icons_1.ArrowUpMini className="text-ui-fg-subtle"/>
                {getSortDescriptor("asc", selectedColumn)}
              </dropdown_menu_1.DropdownMenu.RadioItem>
              <dropdown_menu_1.DropdownMenu.RadioItem onSelect={function (e) { return e.preventDefault(); }} value="true" className="flex items-center gap-2">
                <icons_1.ArrowDownMini className="text-ui-fg-subtle"/>
                {getSortDescriptor("desc", selectedColumn)}
              </dropdown_menu_1.DropdownMenu.RadioItem>
            </dropdown_menu_1.DropdownMenu.RadioGroup>
          </React.Fragment>)}
      </dropdown_menu_1.DropdownMenu.Content>
    </dropdown_menu_1.DropdownMenu>);
};
exports.DataTableSortingMenu = DataTableSortingMenu;
DataTableSortingMenu.displayName = "DataTable.SortingMenu";
function getSortLabel(column) {
    var _a, _b, _c;
    var meta = column.columnDef.meta;
    var headerValue = undefined;
    if (typeof column.columnDef.header === "string") {
        headerValue = column.columnDef.header;
    }
    return (_c = (_b = (_a = meta === null || meta === void 0 ? void 0 : meta.___sortMetaData) === null || _a === void 0 ? void 0 : _a.sortLabel) !== null && _b !== void 0 ? _b : headerValue) !== null && _c !== void 0 ? _c : column.id;
}
function getSortDescriptor(direction, column) {
    var _a, _b, _c, _d;
    if (!column) {
        return null;
    }
    var meta = column.columnDef.meta;
    switch (direction) {
        case "asc":
            return (_b = (_a = meta === null || meta === void 0 ? void 0 : meta.___sortMetaData) === null || _a === void 0 ? void 0 : _a.sortAscLabel) !== null && _b !== void 0 ? _b : "A-Z";
        case "desc":
            return (_d = (_c = meta === null || meta === void 0 ? void 0 : meta.___sortMetaData) === null || _c === void 0 ? void 0 : _c.sortDescLabel) !== null && _d !== void 0 ? _d : "Z-A";
    }
}
var DataTableSortingMenuSkeleton = function () {
    return <skeleton_1.Skeleton className="size-7"/>;
};
