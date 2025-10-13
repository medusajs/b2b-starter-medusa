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
exports.StatusBadge = void 0;
var React = require("react");
var clx_1 = require("@/utils/clx");
var cva_1 = require("cva");
var statusBadgeVariants = (0, cva_1.cva)({
    base: "flex items-center justify-center w-5 h-[18px] [&_div]:w-2 [&_div]:h-2 [&_div]:rounded-sm",
    variants: {
        color: {
            green: "[&_div]:bg-ui-tag-green-icon",
            red: "[&_div]:bg-ui-tag-red-icon",
            orange: "[&_div]:bg-ui-tag-orange-icon",
            blue: "[&_div]:bg-ui-tag-blue-icon",
            purple: "[&_div]:bg-ui-tag-purple-icon",
            grey: "[&_div]:bg-ui-tag-neutral-icon",
        },
    },
    defaultVariants: {
        color: "grey",
    },
});
/**
 * This component is based on the span element and supports all of its props
 */
var StatusBadge = React.forwardRef(function (_a, ref) {
    var children = _a.children, className = _a.className, 
    /**
     * The status's color.
     */
    _b = _a.color, 
    /**
     * The status's color.
     */
    color = _b === void 0 ? "grey" : _b, props = __rest(_a, ["children", "className", "color"]);
    return (<span ref={ref} className={(0, clx_1.clx)("txt-compact-xsmall-plus bg-ui-bg-subtle text-ui-fg-subtle border-ui-border-base box-border flex w-fit select-none items-center overflow-hidden rounded-md border pl-0 pr-1 leading-none", className)} {...props}>
        <div role="presentation" className={statusBadgeVariants({ color: color })}>
          <div />
        </div>
        {children}
      </span>);
});
exports.StatusBadge = StatusBadge;
StatusBadge.displayName = "StatusBadge";
