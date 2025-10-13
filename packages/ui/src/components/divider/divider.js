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
exports.Divider = void 0;
var clx_1 = require("@/utils/clx");
var React = require("react");
var Divider = function (_a) {
    var _b = _a.orientation, orientation = _b === void 0 ? "horizontal" : _b, _c = _a.variant, variant = _c === void 0 ? "solid" : _c, className = _a.className, props = __rest(_a, ["orientation", "variant", "className"]);
    return (<div aria-orientation={orientation} role="separator" className={(0, clx_1.clx)("border-ui-border-base", {
            "w-full border-t": orientation === "horizontal" && variant === "solid",
            "h-full border-l": orientation === "vertical" && variant === "solid",
            "bg-transparent": variant === "dashed",
            "h-px w-full bg-[linear-gradient(90deg,var(--border-strong)_1px,transparent_1px)] bg-[length:4px_1px]": variant === "dashed" && orientation === "horizontal",
            "h-full w-px bg-[linear-gradient(0deg,var(--border-strong)_1px,transparent_1px)] bg-[length:1px_4px]": variant === "dashed" && orientation === "vertical",
        }, className)} {...props}/>);
};
exports.Divider = Divider;
