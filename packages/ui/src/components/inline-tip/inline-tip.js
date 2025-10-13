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
exports.InlineTip = void 0;
var clx_1 = require("@/utils/clx");
var React = require("react");
/**
 * This component is based on the `div` element and supports all of its props.
 */
exports.InlineTip = React.forwardRef(function (_a, ref) {
    var 
    /**
     * The variant of the tip.
     */
    _b = _a.variant, 
    /**
     * The variant of the tip.
     */
    variant = _b === void 0 ? "info" : _b, 
    /**
     * The label to display in the tip.
     */
    label = _a.label, className = _a.className, children = _a.children, props = __rest(_a, ["variant", "label", "className", "children"]);
    return (<div ref={ref} className={(0, clx_1.clx)("bg-ui-bg-component txt-small text-ui-fg-subtle grid grid-cols-[4px_1fr] items-start gap-3 rounded-lg border p-3", className)} {...props}>
        <div role="presentation" className={(0, clx_1.clx)("bg-ui-tag-neutral-icon h-full w-1 rounded-full", {
            "bg-ui-tag-orange-icon": variant === "warning",
            "bg-ui-tag-red-icon": variant === "error",
            "bg-ui-tag-green-icon": variant === "success",
        })}/>
        <div className="text-pretty">
          <strong className="txt-small-plus text-ui-fg-base">{label}:</strong>{" "}
          {children}
        </div>
      </div>);
});
exports.InlineTip.displayName = "InlineTip";
