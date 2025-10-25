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
exports.DatePickerButton = void 0;
var clx_1 = require("@/utils/clx");
var React = require("react");
var react_aria_1 = require("react-aria");
var DatePickerButton = React.forwardRef(function (_a, ref) {
    var children = _a.children, _b = _a.size, size = _b === void 0 ? "base" : _b, props = __rest(_a, ["children", "size"]);
    var innerRef = React.useRef(null);
    React.useImperativeHandle(ref, function () { return innerRef.current; });
    var buttonProps = (0, react_aria_1.useButton)(props, innerRef).buttonProps;
    return (<button type="button" className={(0, clx_1.clx)("text-ui-fg-muted transition-fg flex items-center justify-center border-r outline-none", "disabled:text-ui-fg-disabled", "hover:bg-ui-button-transparent-hover", "focus-visible:bg-ui-bg-interactive focus-visible:text-ui-fg-on-color", {
            "size-7": size === "small",
            "size-8": size === "base",
        })} aria-label="Open calendar" {...buttonProps}>
      {children}
    </button>);
});
exports.DatePickerButton = DatePickerButton;
DatePickerButton.displayName = "DatePickerButton";
