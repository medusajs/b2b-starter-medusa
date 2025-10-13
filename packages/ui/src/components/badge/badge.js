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
exports.badgeColorVariants = exports.Badge = void 0;
var cva_1 = require("cva");
var radix_ui_1 = require("radix-ui");
var React = require("react");
var clx_1 = require("@/utils/clx");
var badgeColorVariants = (0, cva_1.cva)({
    variants: {
        color: {
            green: "bg-ui-tag-green-bg text-ui-tag-green-text [&_svg]:text-ui-tag-green-icon border-ui-tag-green-border",
            red: "bg-ui-tag-red-bg text-ui-tag-red-text [&_svg]:text-ui-tag-red-icon border-ui-tag-red-border",
            blue: "bg-ui-tag-blue-bg text-ui-tag-blue-text [&_svg]:text-ui-tag-blue-icon border-ui-tag-blue-border",
            orange: "bg-ui-tag-orange-bg text-ui-tag-orange-text [&_svg]:text-ui-tag-orange-icon border-ui-tag-orange-border",
            grey: "bg-ui-tag-neutral-bg text-ui-tag-neutral-text [&_svg]:text-ui-tag-neutral-icon border-ui-tag-neutral-border",
            purple: "bg-ui-tag-purple-bg text-ui-tag-purple-text [&_svg]:text-ui-tag-purple-icon border-ui-tag-purple-border",
        },
    },
    defaultVariants: {
        color: "grey",
    },
});
exports.badgeColorVariants = badgeColorVariants;
var badgeSizeVariants = (0, cva_1.cva)({
    base: "inline-flex items-center gap-x-0.5 border box-border",
    variants: {
        size: {
            "2xsmall": "txt-compact-xsmall-plus h-5",
            xsmall: "txt-compact-xsmall-plus py-px h-6",
            small: "txt-compact-xsmall-plus py-[3px] h-7",
            base: "txt-compact-small-plus py-[5px] h-8",
            large: "txt-compact-medium-plus py-[7px] h-10",
        },
        rounded: {
            base: "rounded-md",
            full: "rounded-full",
        },
    },
    compoundVariants: [
        {
            size: "2xsmall",
            rounded: "full",
            className: "px-1.5",
        },
        {
            size: "2xsmall",
            rounded: "base",
            className: "px-1",
        },
        {
            size: "xsmall",
            rounded: "full",
            className: "px-2",
        },
        {
            size: "xsmall",
            rounded: "base",
            className: "px-1.5",
        },
        {
            size: "small",
            rounded: "full",
            className: "px-2.5",
        },
        {
            size: "small",
            rounded: "base",
            className: "px-2",
        },
        {
            size: "base",
            rounded: "full",
            className: "px-3",
        },
        {
            size: "base",
            rounded: "base",
            className: "px-2.5",
        },
        {
            size: "large",
            rounded: "full",
            className: "px-3.5",
        },
        {
            size: "large",
            rounded: "base",
            className: "px-3",
        },
    ],
    defaultVariants: {
        size: "base",
        rounded: "base",
    },
});
/**
 * This component is based on the `div` element and supports all of its props
 */
var Badge = React.forwardRef(function (_a, ref) {
    var className = _a.className, 
    /**
     * The badge's size.
     */
    _b = _a.size, 
    /**
     * The badge's size.
     */
    size = _b === void 0 ? "base" : _b, 
    /**
     * The style of the badge's border radius.
     */
    _c = _a.rounded, 
    /**
     * The style of the badge's border radius.
     */
    rounded = _c === void 0 ? "base" : _c, 
    /**
     * The badge's color.
     */
    _d = _a.color, 
    /**
     * The badge's color.
     */
    color = _d === void 0 ? "grey" : _d, 
    /**
     * Whether to remove the wrapper `span` element and use the
     * passed child element instead.
     */
    _e = _a.asChild, 
    /**
     * Whether to remove the wrapper `span` element and use the
     * passed child element instead.
     */
    asChild = _e === void 0 ? false : _e, props = __rest(_a, ["className", "size", "rounded", "color", "asChild"]);
    var Component = asChild ? radix_ui_1.Slot.Root : "span";
    return (<Component ref={ref} className={(0, clx_1.clx)(badgeColorVariants({ color: color }), badgeSizeVariants({ size: size, rounded: rounded }), className)} {...props}/>);
});
exports.Badge = Badge;
Badge.displayName = "Badge";
