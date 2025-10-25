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
exports.iconButtonVariants = exports.IconButton = void 0;
var icons_1 = require("@medusajs/icons");
var cva_1 = require("cva");
var radix_ui_1 = require("radix-ui");
var React = require("react");
var clx_1 = require("@/utils/clx");
var iconButtonVariants = (0, cva_1.cva)({
    base: (0, clx_1.clx)("transition-fg inline-flex w-fit items-center justify-center overflow-hidden rounded-md outline-none", "disabled:bg-ui-bg-disabled disabled:shadow-buttons-neutral disabled:text-ui-fg-disabled "),
    variants: {
        variant: {
            primary: (0, clx_1.clx)("shadow-buttons-neutral text-ui-fg-subtle bg-ui-button-neutral", "hover:bg-ui-button-neutral-hover", "active:bg-ui-button-neutral-pressed", "focus-visible:shadow-buttons-neutral-focus"),
            transparent: (0, clx_1.clx)("text-ui-fg-subtle bg-ui-button-transparent", "hover:bg-ui-button-transparent-hover", "active:bg-ui-button-transparent-pressed", "focus-visible:shadow-buttons-neutral-focus focus-visible:bg-ui-bg-base", "disabled:!bg-transparent disabled:!shadow-none"),
        },
        size: {
            "2xsmall": "h-5 w-5",
            xsmall: "h-6 w-6 p-1",
            small: "h-7 w-7 p-1",
            base: "h-8 w-8 p-1.5",
            large: "h-10 w-10 p-2.5",
            xlarge: "h-12 w-12 p-3.5",
        },
    },
    defaultVariants: {
        variant: "primary",
        size: "base",
    },
});
exports.iconButtonVariants = iconButtonVariants;
/**
 * This component is based on the `button` element and supports all of its props
 */
var IconButton = React.forwardRef(function (_a, ref) {
    var 
    /**
     * The button's style.
     */
    _b = _a.variant, 
    /**
     * The button's style.
     */
    variant = _b === void 0 ? "primary" : _b, 
    /**
     * The button's size.
     */
    _c = _a.size, 
    /**
     * The button's size.
     */
    size = _c === void 0 ? "base" : _c, 
    /**
     * Whether to remove the wrapper `button` element and use the
     * passed child element instead.
     */
    _d = _a.asChild, 
    /**
     * Whether to remove the wrapper `button` element and use the
     * passed child element instead.
     */
    asChild = _d === void 0 ? false : _d, className = _a.className, children = _a.children, 
    /**
     * Whether to show a loading spinner.
     */
    _e = _a.isLoading, 
    /**
     * Whether to show a loading spinner.
     */
    isLoading = _e === void 0 ? false : _e, disabled = _a.disabled, props = __rest(_a, ["variant", "size", "asChild", "className", "children", "isLoading", "disabled"]);
    var Component = asChild ? radix_ui_1.Slot.Root : "button";
    /**
     * In the case of a button where asChild is true, and isLoading is true, we ensure that
     * only on element is passed as a child to the Slot component. This is because the Slot
     * component only accepts a single child.
     */
    var renderInner = function () {
        if (isLoading) {
            return (<span className="pointer-events-none">
            <div className={(0, clx_1.clx)("bg-ui-bg-disabled absolute inset-0 flex items-center justify-center rounded-md")}>
              <icons_1.Spinner className="animate-spin"/>
            </div>
            {children}
          </span>);
        }
        return children;
    };
    return (<Component ref={ref} {...props} className={(0, clx_1.clx)(iconButtonVariants({ variant: variant, size: size }), className)} disabled={disabled || isLoading}>
        {renderInner()}
      </Component>);
});
exports.IconButton = IconButton;
IconButton.displayName = "IconButton";
