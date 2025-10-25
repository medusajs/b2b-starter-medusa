"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
var React = require("react");
var button_1 = require("../button");
var command_bar_1 = require("./command-bar");
var meta = {
    title: "Components/CommandBar",
    component: command_bar_1.CommandBar,
    parameters: {
        layout: "fullscreen",
    },
};
exports.default = meta;
var CommandBarDemo = function () {
    var _a = React.useState(false), active = _a[0], setActive = _a[1];
    return (<div className="flex h-screen w-screen items-center justify-center">
      <button_1.Button onClick={function () { return setActive(!active); }}>
        {active ? "Hide" : "Show"}
      </button_1.Button>
      <command_bar_1.CommandBar open={active}>
        <command_bar_1.CommandBar.Bar>
          <command_bar_1.CommandBar.Value>1 selected</command_bar_1.CommandBar.Value>
          <command_bar_1.CommandBar.Seperator />
          <command_bar_1.CommandBar.Command label="Edit" action={function () {
            console.log("Edit");
        }} shortcut="e"/>
          <command_bar_1.CommandBar.Seperator />
          <command_bar_1.CommandBar.Command label="Delete" action={function () {
            console.log("Delete");
        }} shortcut="d"/>
        </command_bar_1.CommandBar.Bar>
      </command_bar_1.CommandBar>
    </div>);
};
exports.Default = {
    render: function () { return <CommandBarDemo />; },
};
