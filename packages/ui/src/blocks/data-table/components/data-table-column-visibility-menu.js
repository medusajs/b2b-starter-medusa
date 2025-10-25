"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableColumnVisibilityMenu = void 0;
var react_1 = require("react");
var checkbox_1 = require("@/components/checkbox");
var dropdown_menu_1 = require("@/components/dropdown-menu");
var icon_button_1 = require("@/components/icon-button");
var tooltip_1 = require("@/components/tooltip");
var icons_1 = require("@medusajs/icons");
var use_data_table_context_1 = require("../context/use-data-table-context");
var DataTableColumnVisibilityMenu = function (_a) {
    var className = _a.className, tooltip = _a.tooltip;
    var _b = (0, use_data_table_context_1.useDataTableContext)(), instance = _b.instance, enableColumnVisibility = _b.enableColumnVisibility;
    if (!enableColumnVisibility) {
        return null;
    }
    var columns = instance
        .getAllColumns()
        .filter(function (column) { return column.getCanHide(); });
    var handleToggleColumn = function (column) {
        column.toggleVisibility();
    };
    var handleToggleAll = function (value) {
        instance.setColumnVisibility(Object.fromEntries(columns.map(function (column) { return [column.id, value]; })));
    };
    var allColumnsVisible = columns.every(function (column) { return column.getIsVisible(); });
    var someColumnsVisible = columns.some(function (column) { return column.getIsVisible(); });
    var Wrapper = tooltip ? tooltip_1.Tooltip : react_1.default.Fragment;
    var wrapperProps = tooltip ? { content: tooltip } : {};
    return (<dropdown_menu_1.DropdownMenu>
      <Wrapper {...wrapperProps}>
        <dropdown_menu_1.DropdownMenu.Trigger asChild>
          <icon_button_1.IconButton size="small" className={className}>
            <icons_1.Adjustments />
          </icon_button_1.IconButton>
        </dropdown_menu_1.DropdownMenu.Trigger>
      </Wrapper>
      <dropdown_menu_1.DropdownMenu.Content align="end" className="min-w-[200px] max-h-[400px] overflow-hidden">
        <dropdown_menu_1.DropdownMenu.Label>Toggle columns</dropdown_menu_1.DropdownMenu.Label>
        <dropdown_menu_1.DropdownMenu.Separator />
        <dropdown_menu_1.DropdownMenu.Item onSelect={function (e) {
            e.preventDefault();
            handleToggleAll(!allColumnsVisible);
        }}>
          <div className="flex items-center gap-x-2">
            <checkbox_1.Checkbox checked={allColumnsVisible ? true : (someColumnsVisible && !allColumnsVisible) ? "indeterminate" : false}/>
            <span>Toggle all</span>
          </div>
        </dropdown_menu_1.DropdownMenu.Item>
        <dropdown_menu_1.DropdownMenu.Separator />
        <div className="max-h-[250px] overflow-y-auto">
          {columns.map(function (column) {
            var _a;
            return (<dropdown_menu_1.DropdownMenu.Item key={column.id} onSelect={function (e) {
                    e.preventDefault();
                    handleToggleColumn(column);
                }}>
                <div className="flex items-center gap-x-2">
                  <checkbox_1.Checkbox checked={column.getIsVisible()}/>
                  <span className="truncate">
                    {((_a = column.columnDef.meta) === null || _a === void 0 ? void 0 : _a.name) || column.id}
                  </span>
                </div>
              </dropdown_menu_1.DropdownMenu.Item>);
        })}
        </div>
      </dropdown_menu_1.DropdownMenu.Content>
    </dropdown_menu_1.DropdownMenu>);
};
exports.DataTableColumnVisibilityMenu = DataTableColumnVisibilityMenu;
