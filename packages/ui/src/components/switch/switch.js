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
exports.Switch = void 0;
var cva_1 = require("cva");
var radix_ui_1 = require("radix-ui");
var React = require("react");
var clx_1 = require("@/utils/clx");
var switchVariants = (0, cva_1.cva)({
    base: "bg-ui-bg-switch-off hover:bg-ui-bg-switch-off-hover data-[state=unchecked]:hover:after:bg-switch-off-hover-gradient before:shadow-details-switch-background focus-visible:shadow-details-switch-background-focus data-[state=checked]:bg-ui-bg-interactive disabled:opacity-50 group relative inline-flex items-center rounded-full outline-none transition-all before:absolute before:inset-0 before:rounded-full before:content-[''] after:absolute after:inset-0 after:rounded-full after:content-[''] disabled:cursor-not-allowed",
    variants: {
        size: {
            small: "h-[16px] w-[28px]",
            base: "h-[18px] w-[32px]",
        },
    },
    defaultVariants: {
        size: "base",
    },
});
var thumbVariants = (0, cva_1.cva)({
    base: "bg-ui-fg-on-color shadow-details-switch-handle pointer-events-none h-[14px] w-[14px] rounded-full transition-all",
    variants: {
        size: {
            small: "h-[12px] w-[12px] data-[state=checked]:translate-x-3.5 data-[state=unchecked]:translate-x-0.5",
            base: "h-[14px] w-[14px] transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5",
        },
    },
    defaultVariants: {
        size: "base",
    },
});
/**
 * This component is based on the [Radix UI Switch](https://www.radix-ui.com/primitives/docs/components/switch) primitive.
 */
var Switch = React.forwardRef(function (_a, ref) {
    var className = _a.className, 
    /**
     * The switch's size.
     */
    _b = _a.size, 
    /**
     * The switch's size.
     */
    size = _b === void 0 ? "base" : _b, props = __rest(_a, ["className", "size"]);
    return (<radix_ui_1.Switch.Root className={(0, clx_1.clx)(switchVariants({ size: size }), className)} {...props} ref={ref}>
      <radix_ui_1.Switch.Thumb className={(0, clx_1.clx)(thumbVariants({ size: size }))}/>
    </radix_ui_1.Switch.Root>);
});
exports.Switch = Switch;
Switch.displayName = "Switch";
