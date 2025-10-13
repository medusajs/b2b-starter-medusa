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
exports.DatePickerClearButton = void 0;
var clx_1 = require("@/utils/clx");
var React = require("react");
var ALLOWED_KEYS = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
exports.DatePickerClearButton = React.forwardRef(function (_a, ref) {
    var _b = _a.type, type = _b === void 0 ? "button" : _b, className = _a.className, children = _a.children, props = __rest(_a, ["type", "className", "children"]);
    /**
     * Allows the button to be used with only the keyboard.
     * Otherwise the wrapping component will hijack the event.
     */
    var stopPropagation = function (e) {
        if (!ALLOWED_KEYS.includes(e.key)) {
            e.stopPropagation();
        }
    };
    return (<button ref={ref} type={type} className={(0, clx_1.clx)("text-ui-fg-muted transition-fg flex size-full items-center justify-center outline-none", "hover:bg-ui-button-transparent-hover", "focus-visible:bg-ui-bg-interactive focus-visible:text-ui-fg-on-color", className)} aria-label="Clear date" onKeyDown={stopPropagation} {...props}>
      {children}
    </button>);
});
exports.DatePickerClearButton.displayName = "DatePickerClearButton";
