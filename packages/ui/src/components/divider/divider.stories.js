"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dashed = exports.Vertical = exports.Horizontal = void 0;
var React = require("react");
var divider_1 = require("./divider");
var meta = {
    title: "Components/Divider",
    component: divider_1.Divider,
    parameters: {
        layout: "centered",
    },
    render: function (args) { return (<div className="flex h-[200px] w-[200px] items-center justify-center">
      <divider_1.Divider {...args}/>
    </div>); },
};
exports.default = meta;
exports.Horizontal = {
    args: {
        orientation: "horizontal",
    },
};
exports.Vertical = {
    args: {
        orientation: "vertical",
    },
};
exports.Dashed = {
    args: {
        variant: "dashed",
    },
};
