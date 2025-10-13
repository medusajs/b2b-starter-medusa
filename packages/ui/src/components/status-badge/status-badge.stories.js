"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orange = exports.Blue = exports.Red = exports.Green = exports.Grey = void 0;
var status_badge_1 = require("./status-badge");
var meta = {
    title: "Components/StatusBadge",
    component: status_badge_1.StatusBadge,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.Grey = {
    args: {
        children: "Draft",
        color: "grey",
    },
};
exports.Green = {
    args: {
        children: "Published",
        color: "green",
    },
};
exports.Red = {
    args: {
        children: "Expired",
        color: "red",
    },
};
exports.Blue = {
    args: {
        children: "Pending",
        color: "blue",
    },
};
exports.Orange = {
    args: {
        children: "Requires Attention",
        color: "orange",
    },
};
