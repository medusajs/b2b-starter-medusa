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
exports.buttonVariants = exports.Button = void 0;
var cva_1 = require("cva");
var radix_ui_1 = require("radix-ui");
var React = require("react");
var clx_1 = require("@/utils/clx");
var icons_1 = require("@medusajs/icons");
var buttonVariants = (0, cva_1.cva)({
    base: (0, clx_1.clx)("transition-fg relative inline-flex w-fit items-center justify-center overflow-hidden rounded-md outline-none", "disabled:bg-ui-bg-disabled disabled:border-ui-border-base disabled:text-ui-fg-disabled disabled:shadow-buttons-neutral disabled:after:hidden", "after:transition-fg after:absolute after:inset-0 after:content-['']"),
    variants: {
        variant: {
            primary: (0, clx_1.clx)("shadow-buttons-inverted text-ui-contrast-fg-primary bg-ui-button-inverted after:button-inverted-gradient", "hover:bg-ui-button-inverted-hover hover:after:button-inverted-hover-gradient", "active:bg-ui-button-inverted-pressed active:after:button-inverted-pressed-gradient", "focus-visible:!shadow-buttons-inverted-focus"),
            secondary: (0, clx_1.clx)("shadow-buttons-neutral text-ui-fg-base bg-ui-button-neutral after:button-neutral-gradient", "hover:bg-ui-button-neutral-hover hover:after:button-neutral-hover-gradient", "active:bg-ui-button-neutral-pressed active:after:button-neutral-pressed-gradient", "focus-visible:shadow-buttons-neutral-focus"),
            transparent: (0, clx_1.clx)("after:hidden", "text-ui-fg-base bg-ui-button-transparent", "hover:bg-ui-button-transparent-hover", "active:bg-ui-button-transparent-pressed", "focus-visible:shadow-buttons-neutral-focus focus-visible:bg-ui-bg-base", "disabled:!bg-transparent disabled:!shadow-none"),
            danger: (0, clx_1.clx)("shadow-buttons-colored shadow-buttons-danger text-ui-fg-on-color bg-ui-button-danger after:button-danger-gradient", "hover:bg-ui-button-danger-hover hover:after:button-danger-hover-gradient", "active:bg-ui-button-danger-pressed active:after:button-danger-pressed-gradient", "focus-visible:shadow-buttons-danger-focus"),
        },
        size: {
            small: "txt-compact-small-plus gap-x-1.5 px-2 py-1",
            base: "txt-compact-small-plus gap-x-1.5 px-3 py-1.5",
            large: "txt-compact-medium-plus gap-x-1.5 px-4 py-2.5",
            xlarge: "txt-compact-large-plus gap-x-1.5 px-5 py-3.5",
        },
    },
    defaultVariants: {
        size: "base",
        variant: "primary",
    },
});
exports.buttonVariants = buttonVariants;
/**
 * This component is based on the `button` element and supports all of its props
 */
var Button = React.forwardRef(function (_a, ref) {
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
    size = _c === void 0 ? "base" : _c, className = _a.className, 
    /**
     * Whether to remove the wrapper `button` element and use the
     * passed child element instead.
     */
    _d = _a.asChild, 
    /**
     * Whether to remove the wrapper `button` element and use the
     * passed child element instead.
     */
    asChild = _d === void 0 ? false : _d, children = _a.children, 
    /**
     * Whether to show a loading spinner.
     */
    _e = _a.isLoading, 
    /**
     * Whether to show a loading spinner.
     */
    isLoading = _e === void 0 ? false : _e, disabled = _a.disabled, props = __rest(_a, ["variant", "size", "className", "asChild", "children", "isLoading", "disabled"]);
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
    return (<Component ref={ref} {...props} className={(0, clx_1.clx)(buttonVariants({ variant: variant, size: size }), className)} disabled={disabled || isLoading}>
        {renderInner()}
      </Component>);
});
exports.Button = Button;
Button.displayName = "Button";
