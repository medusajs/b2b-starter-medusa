"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Error = exports.Info = void 0;
var hint_1 = require("./hint");
var meta = {
    title: "Components/Hint",
    component: hint_1.Hint,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.Info = {
    args: {
        children: "This is a hint text to help user.",
    },
};
exports.Error = {
    args: {
        variant: "error",
        children: "This is a hint text to help user.",
    },
};
