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
exports.CalendarButton = void 0;
var React = require("react");
var react_aria_1 = require("react-aria");
var icon_button_1 = require("@/components/icon-button");
var CalendarButton = React.forwardRef(function (_a, ref) {
    var children = _a.children, props = __rest(_a, ["children"]);
    var innerRef = React.useRef(null);
    React.useImperativeHandle(ref, function () { return innerRef.current; });
    var buttonProps = (0, react_aria_1.useButton)(props, innerRef).buttonProps;
    return (<icon_button_1.IconButton size="small" variant="transparent" className="rounded-[4px]" {...buttonProps}>
        {children}
      </icon_button_1.IconButton>);
});
exports.CalendarButton = CalendarButton;
CalendarButton.displayName = "CalendarButton";
