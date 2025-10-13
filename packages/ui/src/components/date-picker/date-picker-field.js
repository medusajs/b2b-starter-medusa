"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.DatePickerField = void 0;
var date_1 = require("@internationalized/date");
var React = require("react");
var react_aria_1 = require("react-aria");
var react_stately_1 = require("react-stately");
var date_segment_1 = require("@/components/date-segment");
var cva_1 = require("cva");
var datePickerFieldStyles = (0, cva_1.cva)({
    base: "flex items-center tabular-nums",
    variants: {
        size: {
            small: "py-1",
            base: "py-1.5",
        },
    },
    defaultVariants: {
        size: "base",
    },
});
var DatePickerField = function (_a) {
    var _b = _a.size, size = _b === void 0 ? "base" : _b, props = __rest(_a, ["size"]);
    var locale = (0, react_aria_1.useLocale)().locale;
    var state = (0, react_stately_1.useDateFieldState)(__assign(__assign({}, props), { locale: locale, createCalendar: date_1.createCalendar }));
    var ref = React.useRef(null);
    var fieldProps = (0, react_aria_1.useDateField)(props, state, ref).fieldProps;
    return (<div ref={ref} aria-label="Date input" className={datePickerFieldStyles({ size: size })} {...fieldProps}>
      {state.segments.map(function (segment, index) {
            return <date_segment_1.DateSegment key={index} segment={segment} state={state}/>;
        })}
    </div>);
};
exports.DatePickerField = DatePickerField;
