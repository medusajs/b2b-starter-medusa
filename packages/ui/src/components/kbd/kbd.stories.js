"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
var kbd_1 = require("./kbd");
var meta = {
    title: "Components/Kbd",
    component: kbd_1.Kbd,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.Default = {
    args: {
        children: "⌘",
    },
};
