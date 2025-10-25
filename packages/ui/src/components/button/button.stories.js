"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XLarge = exports.Large = exports.Loading = exports.WithIcon = exports.Disabled = exports.Danger = exports.Transparent = exports.Secondary = exports.Primary = void 0;
var React = require("react");
var icons_1 = require("@medusajs/icons");
var button_1 = require("./button");
var meta = {
    title: "Components/Button",
    component: button_1.Button,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.Primary = {
    args: {
        children: "Action",
    },
};
exports.Secondary = {
    args: {
        children: "Action",
        variant: "secondary",
    },
};
exports.Transparent = {
    args: {
        children: "Action",
        variant: "transparent",
    },
};
exports.Danger = {
    args: {
        children: "Action",
        variant: "danger",
    },
};
exports.Disabled = {
    args: {
        children: "Action",
        disabled: true,
    },
};
exports.WithIcon = {
    args: {
        children: ["Action", <icons_1.PlusMini key={1}/>],
    },
};
exports.Loading = {
    args: {
        children: "Action",
        isLoading: true,
    },
};
exports.Large = {
    args: {
        children: "Action",
        size: "large",
    },
};
exports.XLarge = {
    args: {
        children: "Action",
        size: "xlarge",
    },
};
