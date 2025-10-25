"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Large = exports.Base = exports.Small = exports.XSmall = exports.XXSmall = exports.Rounded = exports.Default = exports.Purple = exports.Orange = exports.Blue = exports.Red = exports.Green = exports.Grey = void 0;
var React = require("react");
var badge_1 = require("./badge");
var meta = {
    title: "Components/Badge",
    component: badge_1.Badge,
    parameters: {
        layout: "centered",
    },
    render: function (_a) {
        var children = _a.children, args = __rest(_a, ["children"]);
        return (<badge_1.Badge {...args}>{children || "Badge"}</badge_1.Badge>);
    },
};
exports.default = meta;
exports.Grey = {
    args: {
        color: "grey",
    },
};
exports.Green = {
    args: {
        color: "green",
    },
};
exports.Red = {
    args: {
        color: "red",
    },
};
exports.Blue = {
    args: {
        color: "blue",
    },
};
exports.Orange = {
    args: {
        color: "orange",
    },
};
exports.Purple = {
    args: {
        color: "purple",
    },
};
exports.Default = {
    args: {
        rounded: "base",
    },
};
exports.Rounded = {
    args: {
        rounded: "full",
    },
};
exports.XXSmall = {
    args: {
        size: "2xsmall",
    },
};
exports.XSmall = {
    args: {
        size: "xsmall",
    },
};
exports.Small = {
    args: {
        size: "small",
    },
};
exports.Base = {
    args: {
        size: "base",
    },
};
exports.Large = {
    args: {
        size: "large",
    },
};
