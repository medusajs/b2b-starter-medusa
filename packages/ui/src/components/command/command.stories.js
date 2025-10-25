"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
var react_1 = require("react");
var badge_1 = require("../badge");
var tooltip_1 = require("../tooltip");
var command_1 = require("./command");
var meta = {
    title: "Components/Command",
    component: command_1.Command,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.Default = {
    render: function () {
        return (<tooltip_1.TooltipProvider>
        <div className="w-[500px]">
          <command_1.Command>
            <badge_1.Badge className="dark" size="small" color="green">
              GET
            </badge_1.Badge>
            <code>localhost:9000/store/products</code>
            <command_1.Command.Copy content="localhost:9000/store/products"/>
          </command_1.Command>
        </div>
      </tooltip_1.TooltipProvider>);
    },
};
