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
exports.Hint = void 0;
var icons_1 = require("@medusajs/icons");
var cva_1 = require("cva");
var React = require("react");
var clx_1 = require("@/utils/clx");
var hintVariants = (0, cva_1.cva)({
    base: "txt-small",
    variants: {
        variant: {
            info: "text-ui-fg-subtle",
            error: "text-ui-fg-error grid grid-cols-[20px_1fr] gap-1 items-start",
        },
    },
    defaultVariants: {
        variant: "info",
    },
});
var Hint = React.forwardRef(function (_a, ref) {
    var className = _a.className, 
    /**
     * The hint's style.
     */
    _b = _a.variant, 
    /**
     * The hint's style.
     */
    variant = _b === void 0 ? "info" : _b, children = _a.children, props = __rest(_a, ["className", "variant", "children"]);
    return (<span ref={ref} className={(0, clx_1.clx)(hintVariants({ variant: variant }), className)} {...props}>
        {variant === "error" && <div className="size-5 flex items-center justify-center"><icons_1.ExclamationCircleSolid /></div>}
        {children}
      </span>);
});
exports.Hint = Hint;
Hint.displayName = "Hint";
