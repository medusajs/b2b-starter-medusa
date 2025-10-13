"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableActionCell = void 0;
var React = require("react");
var dropdown_menu_1 = require("@/components/dropdown-menu");
var icon_button_1 = require("@/components/icon-button");
var icons_1 = require("@medusajs/icons");
var DataTableActionCell = function (_a) {
    var ctx = _a.ctx;
    var meta = ctx.column.columnDef.meta;
    var actions = meta === null || meta === void 0 ? void 0 : meta.___actions;
    if (!actions) {
        return null;
    }
    var resolvedActions = typeof actions === "function" ? actions(ctx) : actions;
    if (!Array.isArray(resolvedActions)) {
        return null;
    }
    return (<dropdown_menu_1.DropdownMenu>
      <dropdown_menu_1.DropdownMenu.Trigger asChild className="ml-1">
        <icon_button_1.IconButton size="small" variant="transparent">
          <icons_1.EllipsisHorizontal />
        </icon_button_1.IconButton>
      </dropdown_menu_1.DropdownMenu.Trigger>
      <dropdown_menu_1.DropdownMenu.Content side="bottom">
        {resolvedActions.map(function (actionOrGroup, idx) {
            var isArray = Array.isArray(actionOrGroup);
            var isLast = idx === resolvedActions.length - 1;
            return isArray ? (<React.Fragment key={idx}>
              {actionOrGroup.map(function (action) { return (<dropdown_menu_1.DropdownMenu.Item key={action.label} onClick={function (e) {
                        e.stopPropagation();
                        action.onClick(ctx);
                    }} className="[&>svg]:text-ui-fg-subtle flex items-center gap-2">
                  {action.icon}
                  {action.label}
                </dropdown_menu_1.DropdownMenu.Item>); })}
              {!isLast && <dropdown_menu_1.DropdownMenu.Separator />}
            </React.Fragment>) : (<dropdown_menu_1.DropdownMenu.Item key={actionOrGroup.label} onClick={function (e) {
                    e.stopPropagation();
                    actionOrGroup.onClick(ctx);
                }} className="[&>svg]:text-ui-fg-subtle flex items-center gap-2">
              {actionOrGroup.icon}
              {actionOrGroup.label}
            </dropdown_menu_1.DropdownMenu.Item>);
        })}
      </dropdown_menu_1.DropdownMenu.Content>
    </dropdown_menu_1.DropdownMenu>);
};
exports.DataTableActionCell = DataTableActionCell;
DataTableActionCell.displayName = "DataTable.ActionCell";
