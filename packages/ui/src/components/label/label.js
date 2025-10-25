"use client";
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
exports.Label = void 0;
var cva_1 = require("cva");
var radix_ui_1 = require("radix-ui");
var React = require("react");
var clx_1 = require("@/utils/clx");
var labelVariants = (0, cva_1.cva)({
    base: "font-sans",
    variants: {
        size: {
            xsmall: "txt-compact-xsmall",
            small: "txt-compact-small",
            base: "txt-compact-medium",
            large: "txt-compact-large",
        },
        weight: {
            regular: "font-normal",
            plus: "font-medium",
        },
    },
    defaultVariants: {
        size: "base",
        weight: "regular",
    },
});
/**
 * This component is based on the [Radix UI Label](https://www.radix-ui.com/primitives/docs/components/label) primitive.
 */
var Label = React.forwardRef(function (_a, ref) {
    var className = _a.className, 
    /**
     * The label's size.
     */
    _b = _a.size, 
    /**
     * The label's size.
     */
    size = _b === void 0 ? "base" : _b, 
    /**
     * The label's font weight.
     */
    _c = _a.weight, 
    /**
     * The label's font weight.
     */
    weight = _c === void 0 ? "regular" : _c, props = __rest(_a, ["className", "size", "weight"]);
    return (<radix_ui_1.Label.Root ref={ref} className={(0, clx_1.clx)(labelVariants({ size: size, weight: weight }), className)} {...props}/>);
});
exports.Label = Label;
Label.displayName = "Label";
