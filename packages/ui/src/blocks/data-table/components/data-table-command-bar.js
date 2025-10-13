"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableCommandBar = void 0;
var React = require("react");
var use_data_table_context_1 = require("@/blocks/data-table/context/use-data-table-context");
var command_bar_1 = require("@/components/command-bar");
/**
 * This component adds a command bar to the data table, which is used
 * to show commands that can be executed on the selected rows.
 */
var DataTableCommandBar = function (props) {
    var instance = (0, use_data_table_context_1.useDataTableContext)().instance;
    var commands = instance.getCommands();
    var rowSelection = instance.getRowSelection();
    var count = Object.keys(rowSelection || []).length;
    var open = commands && commands.length > 0 && count > 0;
    function getSelectedLabel(count) {
        if (typeof props.selectedLabel === "function") {
            return props.selectedLabel(count);
        }
        return props.selectedLabel;
    }
    if (!commands || commands.length === 0) {
        return null;
    }
    return (<command_bar_1.CommandBar open={open}>
      <command_bar_1.CommandBar.Bar>
        {props.selectedLabel && (<React.Fragment>
            <command_bar_1.CommandBar.Value>{getSelectedLabel(count)}</command_bar_1.CommandBar.Value>
            <command_bar_1.CommandBar.Seperator />
          </React.Fragment>)}
        {commands.map(function (command, idx) { return (<React.Fragment key={idx}>
            <command_bar_1.CommandBar.Command key={command.label} action={function () { return command.action(rowSelection); }} label={command.label} shortcut={command.shortcut}/>
            {idx < commands.length - 1 && <command_bar_1.CommandBar.Seperator />}
          </React.Fragment>); })}
      </command_bar_1.CommandBar.Bar>
    </command_bar_1.CommandBar>);
};
exports.DataTableCommandBar = DataTableCommandBar;
DataTableCommandBar.displayName = "DataTable.CommandBar";
