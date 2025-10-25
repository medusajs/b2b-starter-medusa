"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XSmallRegular = exports.SmallPlus = exports.SmallRegular = exports.LargePlus = exports.LargeRegular = exports.BasePlus = exports.BaseRegular = void 0;
var label_1 = require("./label");
var meta = {
    title: "Components/Label",
    component: label_1.Label,
    argTypes: {
        size: {
            control: {
                type: "select",
            },
            options: ["small", "xsmall", "base", "large"],
        },
        weight: {
            control: {
                type: "select",
            },
            options: ["regular", "plus"],
        },
    },
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.BaseRegular = {
    args: {
        size: "base",
        weight: "regular",
        children: "I am a label",
    },
};
exports.BasePlus = {
    args: {
        size: "base",
        weight: "plus",
        children: "I am a label",
    },
};
exports.LargeRegular = {
    args: {
        size: "large",
        weight: "regular",
        children: "I am a label",
    },
};
exports.LargePlus = {
    args: {
        size: "large",
        weight: "plus",
        children: "I am a label",
    },
};
exports.SmallRegular = {
    args: {
        size: "small",
        weight: "regular",
        children: "I am a label",
    },
};
exports.SmallPlus = {
    args: {
        size: "small",
        weight: "plus",
        children: "I am a label",
    },
};
exports.XSmallRegular = {
    args: {
        size: "xsmall",
        weight: "regular",
        children: "I am a label",
    },
};
