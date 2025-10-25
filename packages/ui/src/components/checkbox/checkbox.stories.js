"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisabledIndeterminate = exports.DisabledChecked = exports.Disabled = exports.Indeterminate = exports.Checked = exports.Default = void 0;
var checkbox_1 = require("./checkbox");
var meta = {
    title: "Components/Checkbox",
    component: checkbox_1.Checkbox,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.Default = {
    args: {},
};
exports.Checked = {
    args: {
        checked: true,
    },
};
exports.Indeterminate = {
    args: {
        checked: "indeterminate",
    },
};
exports.Disabled = {
    args: {
        disabled: true,
    },
};
exports.DisabledChecked = {
    args: {
        disabled: true,
        checked: true,
    },
};
exports.DisabledIndeterminate = {
    args: {
        disabled: true,
        checked: "indeterminate",
    },
};
