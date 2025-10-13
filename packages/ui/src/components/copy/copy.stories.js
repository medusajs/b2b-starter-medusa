"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsChild = exports.Default = void 0;
var React = require("react");
var button_1 = require("@/components/button");
var tooltip_1 = require("@/components/tooltip");
var copy_1 = require("./copy");
var meta = {
    title: "Components/Copy",
    component: copy_1.Copy,
    parameters: {
        layout: "centered",
    },
    render: function (args) { return <tooltip_1.TooltipProvider><copy_1.Copy {...args}/></tooltip_1.TooltipProvider>; },
};
exports.default = meta;
exports.Default = {
    args: {
        content: "Hello world",
    },
};
exports.AsChild = {
    args: {
        content: "Hello world",
        asChild: true,
        children: <button_1.Button className="text-ui-fg-on-color">Copy</button_1.Button>,
    },
};
