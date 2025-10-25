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
exports.IconBadge = void 0;
var cva_1 = require("cva");
var radix_ui_1 = require("radix-ui");
var React = require("react");
var badge_1 = require("@/components/badge");
var clx_1 = require("@/utils/clx");
var iconBadgeVariants = (0, cva_1.cva)({
    base: "flex items-center justify-center overflow-hidden rounded-md border",
    variants: {
        size: {
            base: "h-6 w-6",
            large: "h-7 w-7",
        },
    },
});
/**
 * This component is based on the `span` element and supports all of its props
 */
var IconBadge = React.forwardRef(function (_a, ref) {
    var children = _a.children, className = _a.className, 
    /**
     * The badge's color.
     */
    _b = _a.color, 
    /**
     * The badge's color.
     */
    color = _b === void 0 ? "grey" : _b, 
    /**
     * The badge's size.
     */
    _c = _a.size, 
    /**
     * The badge's size.
     */
    size = _c === void 0 ? "base" : _c, 
    /**
     * Whether to remove the wrapper `span` element and use the
     * passed child element instead.
     */
    _d = _a.asChild, 
    /**
     * Whether to remove the wrapper `span` element and use the
     * passed child element instead.
     */
    asChild = _d === void 0 ? false : _d, props = __rest(_a, ["children", "className", "color", "size", "asChild"]);
    var Component = asChild ? radix_ui_1.Slot.Root : "span";
    return (<Component ref={ref} className={(0, clx_1.clx)((0, badge_1.badgeColorVariants)({ color: color }), iconBadgeVariants({ size: size }), className)} {...props}>
        {children}
      </Component>);
});
exports.IconBadge = IconBadge;
IconBadge.displayName = "IconBadge";
