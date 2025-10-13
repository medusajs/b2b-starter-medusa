"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableFilterMenu = void 0;
var React = require("react");
var use_data_table_context_1 = require("@/blocks/data-table/context/use-data-table-context");
var dropdown_menu_1 = require("@/components/dropdown-menu");
var icon_button_1 = require("@/components/icon-button");
var skeleton_1 = require("@/components/skeleton");
var tooltip_1 = require("@/components/tooltip");
var icons_1 = require("@medusajs/icons");
/**
 * This component adds a filter menu to the data table, allowing users
 * to filter the table's data.
 */
var DataTableFilterMenu = function (_a) {
    var tooltip = _a.tooltip, onAddFilter = _a.onAddFilter;
    var instance = (0, use_data_table_context_1.useDataTableContext)().instance;
    var enabledFilters = Object.keys(instance.getFiltering());
    var filterOptions = instance
        .getFilters()
        .filter(function (filter) { return !enabledFilters.includes(filter.id); });
    if (!enabledFilters.length && !filterOptions.length) {
        throw new Error("DataTable.FilterMenu was rendered but there are no filters to apply. Make sure to pass filters to 'useDataTable'");
    }
    var Wrapper = tooltip ? tooltip_1.Tooltip : React.Fragment;
    var wrapperProps = tooltip
        ? { content: tooltip, hidden: filterOptions.length === 0 }
        : {};
    if (instance.showSkeleton) {
        return <DataTableFilterMenuSkeleton />;
    }
    return (<dropdown_menu_1.DropdownMenu>
      <Wrapper {...wrapperProps}>
        <dropdown_menu_1.DropdownMenu.Trigger asChild disabled={filterOptions.length === 0}>
          <icon_button_1.IconButton size="small">
            <icons_1.Funnel />
          </icon_button_1.IconButton>
        </dropdown_menu_1.DropdownMenu.Trigger>
      </Wrapper>
      <dropdown_menu_1.DropdownMenu.Content side="bottom" align="start">
        {filterOptions.map(function (filter) {
            var getDefaultValue = function () {
                switch (filter.type) {
                    case "select":
                    case "multiselect":
                        return [];
                    case "string":
                        return "";
                    case "number":
                        return null;
                    case "date":
                        return null;
                    case "radio":
                        return null;
                    case "custom":
                        return null;
                    default:
                        return null;
                }
            };
            return (<dropdown_menu_1.DropdownMenu.Item key={filter.id} onClick={function (e) {
                    // Prevent any bubbling that might interfere
                    e.stopPropagation();
                    if (onAddFilter) {
                        onAddFilter(filter.id, getDefaultValue());
                    }
                    else {
                        instance.addFilter({ id: filter.id, value: getDefaultValue() });
                    }
                }}>
              {filter.label}
            </dropdown_menu_1.DropdownMenu.Item>);
        })}
      </dropdown_menu_1.DropdownMenu.Content>
    </dropdown_menu_1.DropdownMenu>);
};
exports.DataTableFilterMenu = DataTableFilterMenu;
DataTableFilterMenu.displayName = "DataTable.FilterMenu";
var DataTableFilterMenuSkeleton = function () {
    return <skeleton_1.Skeleton className="size-7"/>;
};
