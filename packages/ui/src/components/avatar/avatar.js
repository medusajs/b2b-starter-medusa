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
exports.Avatar = void 0;
var cva_1 = require("cva");
var radix_ui_1 = require("radix-ui");
var React = require("react");
var clx_1 = require("@/utils/clx");
var avatarVariants = (0, cva_1.cva)({
    base: "flex shrink-0 items-center justify-center overflow-hidden shadow-borders-base bg-ui-bg-base",
    variants: {
        variant: {
            squared: "",
            rounded: "rounded-full",
        },
        size: {
            "2xsmall": "h-5 w-5",
            xsmall: "h-6 w-6",
            small: "h-7 w-7",
            base: "h-8 w-8",
            large: "h-10 w-10",
            xlarge: "h-12 w-12",
        },
    },
    compoundVariants: [
        {
            variant: "squared",
            size: "2xsmall",
            className: "rounded",
        },
        {
            variant: "squared",
            size: "xsmall",
            className: "rounded-md",
        },
        {
            variant: "squared",
            size: "small",
            className: "rounded-md",
        },
        {
            variant: "squared",
            size: "base",
            className: "rounded-md",
        },
        {
            variant: "squared",
            size: "large",
            className: "rounded-lg",
        },
        {
            variant: "squared",
            size: "xlarge",
            className: "rounded-xl",
        },
    ],
    defaultVariants: {
        variant: "rounded",
        size: "base",
    },
});
var innerVariants = (0, cva_1.cva)({
    base: "aspect-square object-cover object-center",
    variants: {
        variant: {
            squared: "",
            rounded: "rounded-full",
        },
        size: {
            "2xsmall": "txt-compact-xsmall-plus size-4",
            xsmall: "txt-compact-xsmall-plus size-5",
            small: "txt-compact-small-plus size-6",
            base: "txt-compact-small-plus size-7",
            large: "txt-compact-medium-plus size-9",
            xlarge: "txt-compact-large-plus size-11",
        },
    },
    compoundVariants: [
        {
            variant: "squared",
            size: "2xsmall",
            className: "rounded-sm",
        },
        {
            variant: "squared",
            size: "xsmall",
            className: "rounded",
        },
        {
            variant: "squared",
            size: "small",
            className: "rounded",
        },
        {
            variant: "squared",
            size: "base",
            className: "rounded",
        },
        {
            variant: "squared",
            size: "large",
            className: "rounded-md",
        },
        {
            variant: "squared",
            size: "xlarge",
            className: "rounded-[10px]",
        },
    ],
    defaultVariants: {
        variant: "rounded",
        size: "base",
    },
});
/**
 * This component is based on the [Radix UI Avatar](https://www.radix-ui.com/primitives/docs/components/avatar) primitive.
 */
var Avatar = React.forwardRef(function (_a, ref) {
    var 
    /**
     * The URL of the image used in the Avatar.
     */
    src = _a.src, 
    /**
     * Text to show in the avatar if the URL provided in `src` can't be opened.
     */
    fallback = _a.fallback, 
    /**
     * The style of the avatar.
     */
    _b = _a.variant, 
    /**
     * The style of the avatar.
     */
    variant = _b === void 0 ? "rounded" : _b, 
    /**
     * The size of the avatar's border radius.
     */
    _c = _a.size, 
    /**
     * The size of the avatar's border radius.
     */
    size = _c === void 0 ? "base" : _c, className = _a.className, props = __rest(_a, ["src", "fallback", "variant", "size", "className"]);
    return (<radix_ui_1.Avatar.Root ref={ref} {...props} className={(0, clx_1.clx)(avatarVariants({ variant: variant, size: size }), className)}>
        {src && (<radix_ui_1.Avatar.Image src={src} className={innerVariants({ variant: variant, size: size })}/>)}
        <radix_ui_1.Avatar.Fallback className={(0, clx_1.clx)(innerVariants({ variant: variant, size: size }), "bg-ui-bg-component-hover text-ui-fg-subtle pointer-events-none flex select-none items-center justify-center")}>
          {fallback}
        </radix_ui_1.Avatar.Fallback>
      </radix_ui_1.Avatar.Root>);
});
exports.Avatar = Avatar;
Avatar.displayName = "Avatar";
