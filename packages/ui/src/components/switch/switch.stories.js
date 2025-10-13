"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckedDisabled = exports.Disabled = exports.Checked = exports.Small = exports.Default = void 0;
var switch_1 = require("./switch");
var meta = {
    title: "Components/Switch",
    component: switch_1.Switch,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.Default = {
    args: {},
};
exports.Small = {
    args: {
        size: "small",
    },
};
exports.Checked = {
    args: {
        checked: true,
    },
};
exports.Disabled = {
    args: {
        disabled: true,
    },
};
exports.CheckedDisabled = {
    args: {
        checked: true,
        disabled: true,
    },
};
