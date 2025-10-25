"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
var React = require("react");
var icons_1 = require("@medusajs/icons");
var tooltip_1 = require("./tooltip");
var meta = {
    title: "Components/Tooltip",
    component: tooltip_1.Tooltip,
    parameters: {
        layout: "centered",
    },
    argTypes: {
        side: {
            options: ["top", "bottom", "left", "right"],
            control: { type: "radio" },
        },
        children: {
            table: {
                disable: true,
            },
        },
    },
    render: function (args) { return <tooltip_1.TooltipProvider><tooltip_1.Tooltip {...args}/></tooltip_1.TooltipProvider>; },
};
exports.default = meta;
exports.Default = {
    args: {
        content: "The quick brown fox jumps over the lazy dog.",
        side: "top",
        children: <icons_1.InformationCircleSolid />,
    },
};
