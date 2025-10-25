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
exports.inputBaseStyles = exports.Input = void 0;
var icons_1 = require("@medusajs/icons");
var cva_1 = require("cva");
var React = require("react");
var clx_1 = require("@/utils/clx");
var inputBaseStyles = (0, clx_1.clx)("caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none", "focus-visible:shadow-borders-interactive-with-active", "disabled:text-ui-fg-disabled disabled:!bg-ui-bg-disabled disabled:placeholder-ui-fg-disabled disabled:cursor-not-allowed", "aria-[invalid=true]:!shadow-borders-error  invalid:!shadow-borders-error");
exports.inputBaseStyles = inputBaseStyles;
var inputVariants = (0, cva_1.cva)({
    base: (0, clx_1.clx)(inputBaseStyles, "[&::--webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"),
    variants: {
        size: {
            base: "txt-compact-small h-8 px-2 py-1.5",
            small: "txt-compact-small h-7 px-2 py-1",
        },
    },
    defaultVariants: {
        size: "base",
    },
});
/**
 * This component is based on the `input` element and supports all of its props
 */
var Input = React.forwardRef(function (_a, ref) {
    var className = _a.className, type = _a.type, 
    /**
     * The input's size.
     */
    _b = _a.size, 
    /**
     * The input's size.
     */
    size = _b === void 0 ? "base" : _b, props = __rest(_a, ["className", "type", "size"]);
    var _c = React.useState(type), typeState = _c[0], setTypeState = _c[1];
    var isPassword = type === "password";
    var isSearch = type === "search";
    return (<div className="relative">
        <input ref={ref} type={isPassword ? typeState : type} className={(0, clx_1.clx)(inputVariants({ size: size }), {
            "pl-8": isSearch && size === "base",
            "pr-8": isPassword && size === "base",
            "pl-7": isSearch && size === "small",
            "pr-7": isPassword && size === "small",
        }, className)} {...props}/>
        {isSearch && (<div className={(0, clx_1.clx)("text-ui-fg-muted pointer-events-none absolute bottom-0 left-0 flex items-center justify-center", {
                "h-8 w-8": size === "base",
                "h-7 w-7": size === "small",
            })} role="img">
            <icons_1.MagnifyingGlassMini />
          </div>)}
        {isPassword && (<div className={(0, clx_1.clx)("absolute bottom-0 right-0 flex items-center justify-center border-l", {
                "h-8 w-8": size === "base",
                "h-7 w-7": size === "small",
            })}>
            <button className="text-ui-fg-muted hover:text-ui-fg-base focus-visible:text-ui-fg-base focus-visible:shadow-borders-interactive-w-focus active:text-ui-fg-base h-fit w-fit rounded-sm outline-none transition-all" type="button" onClick={function () {
                setTypeState(typeState === "password" ? "text" : "password");
            }}>
              <span className="sr-only">
                {typeState === "password" ? "Show password" : "Hide password"}
              </span>
              {typeState === "password" ? <icons_1.Eye /> : <icons_1.EyeSlash />}
            </button>
          </div>)}
      </div>);
});
exports.Input = Input;
Input.displayName = "Input";
