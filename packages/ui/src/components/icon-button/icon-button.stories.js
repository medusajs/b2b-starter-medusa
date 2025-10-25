"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsLoading = exports.Disabled = exports.XLargeTransparent = exports.XLargePrimary = exports.LargeTransparent = exports.LargePrimary = exports.BaseTransparent = exports.BasePrimary = void 0;
var React = require("react");
var icons_1 = require("@medusajs/icons");
var icon_button_1 = require("./icon-button");
var meta = {
    title: "Components/IconButton",
    component: icon_button_1.IconButton,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.BasePrimary = {
    args: {
        variant: "primary",
        size: "base",
        children: <icons_1.Plus />,
    },
};
exports.BaseTransparent = {
    args: {
        variant: "transparent",
        size: "base",
        children: <icons_1.Plus />,
    },
};
exports.LargePrimary = {
    args: {
        variant: "primary",
        size: "large",
        children: <icons_1.Plus />,
    },
};
exports.LargeTransparent = {
    args: {
        variant: "transparent",
        size: "large",
        children: <icons_1.Plus />,
    },
};
exports.XLargePrimary = {
    args: {
        variant: "primary",
        size: "xlarge",
        children: <icons_1.Plus />,
    },
};
exports.XLargeTransparent = {
    args: {
        variant: "transparent",
        size: "xlarge",
        children: <icons_1.Plus />,
    },
};
exports.Disabled = {
    args: {
        variant: "primary",
        size: "base",
        children: <icons_1.Plus />,
        disabled: true,
    },
};
exports.IsLoading = {
    args: {
        variant: "primary",
        size: "base",
        children: <icons_1.Plus />,
        isLoading: true,
    },
};
