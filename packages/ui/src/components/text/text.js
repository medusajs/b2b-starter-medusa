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
exports.Text = void 0;
var cva_1 = require("cva");
var radix_ui_1 = require("radix-ui");
var React = require("react");
var clx_1 = require("@/utils/clx");
var textVariants = (0, cva_1.cva)({
    variants: {
        size: {
            xsmall: "",
            small: "",
            base: "",
            large: "",
            xlarge: "",
        },
        weight: {
            regular: "font-normal",
            plus: "font-medium",
        },
        family: {
            sans: "font-sans",
            mono: "font-mono",
        },
        leading: {
            normal: "",
            compact: "",
        },
    },
    defaultVariants: {
        family: "sans",
        size: "base",
        weight: "regular",
        leading: "normal",
    },
    compoundVariants: [
        {
            size: "xsmall",
            leading: "normal",
            className: "txt-xsmall",
        },
        {
            size: "xsmall",
            leading: "compact",
            className: "txt-compact-xsmall",
        },
        {
            size: "small",
            leading: "normal",
            className: "txt-small",
        },
        {
            size: "small",
            leading: "compact",
            className: "txt-compact-small",
        },
        {
            size: "base",
            leading: "normal",
            className: "txt-medium",
        },
        {
            size: "base",
            leading: "compact",
            className: "txt-compact-medium",
        },
        {
            size: "large",
            leading: "normal",
            className: "txt-large",
        },
        {
            size: "large",
            leading: "compact",
            className: "txt-compact-large",
        },
        {
            size: "xlarge",
            leading: "normal",
            className: "txt-xlarge",
        },
        {
            size: "xlarge",
            leading: "compact",
            className: "txt-compact-xlarge",
        },
    ],
});
/**
 * This component is based on the `p` element and supports all of its props
 */
var Text = React.forwardRef(function (_a, ref) {
    var className = _a.className, 
    /**
     * Whether to remove the wrapper `button` element and use the
     * passed child element instead.
     */
    _b = _a.asChild, 
    /**
     * Whether to remove the wrapper `button` element and use the
     * passed child element instead.
     */
    asChild = _b === void 0 ? false : _b, 
    /**
     * The wrapper element to use when `asChild` is disabled.
     */
    _c = _a.as, 
    /**
     * The wrapper element to use when `asChild` is disabled.
     */
    as = _c === void 0 ? "p" : _c, 
    /**
     * The text's size.
     */
    _d = _a.size, 
    /**
     * The text's size.
     */
    size = _d === void 0 ? "base" : _d, 
    /**
     * The text's font weight.
     */
    _e = _a.weight, 
    /**
     * The text's font weight.
     */
    weight = _e === void 0 ? "regular" : _e, 
    /**
     * The text's font family.
     */
    _f = _a.family, 
    /**
     * The text's font family.
     */
    family = _f === void 0 ? "sans" : _f, 
    /**
     * The text's line height.
     */
    _g = _a.leading, 
    /**
     * The text's line height.
     */
    leading = _g === void 0 ? "normal" : _g, children = _a.children, props = __rest(_a, ["className", "asChild", "as", "size", "weight", "family", "leading", "children"]);
    var Component = asChild ? radix_ui_1.Slot.Root : as;
    return (<Component ref={ref} className={(0, clx_1.clx)(textVariants({ size: size, weight: weight, family: family, leading: leading }), className)} {...props}>
        {children}
      </Component>);
});
exports.Text = Text;
Text.displayName = "Text";
