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
exports.Calendar = void 0;
var date_1 = require("@internationalized/date");
var icons_1 = require("@medusajs/icons");
var React = require("react");
var react_aria_1 = require("react-aria");
var react_stately_1 = require("react-stately");
var calendar_1 = require("@/utils/calendar");
var calendar_button_1 = require("./calendar-button");
var calendar_grid_1 = require("./calendar-grid");
/**
 * Calendar component used to select a date.
 * Its props are based on [React Aria Calendar](https://react-spectrum.adobe.com/react-aria/Calendar.html#calendar-1).
 *
 * @excludeExternal
 */
var Calendar = function (props) {
    var _a = React.useState(function () { return (0, calendar_1.getDefaultCalendarDate)(props.value, props.defaultValue); }), value = _a[0], setValue = _a[1];
    var locale = (0, react_aria_1.useLocale)().locale;
    var _props = React.useMemo(function () { return convertProps(props, setValue); }, [props]);
    var state = (0, react_stately_1.useCalendarState)(__assign(__assign({}, _props), { value: value, locale: locale, createCalendar: date_1.createCalendar }));
    React.useEffect(function () {
        setValue(props.value ? (0, calendar_1.updateCalendarDate)(value, props.value) : null);
    }, [props.value]);
    var _b = (0, react_aria_1.useCalendar)(__assign({ value: value }, _props), state), calendarProps = _b.calendarProps, prevButtonProps = _b.prevButtonProps, nextButtonProps = _b.nextButtonProps, title = _b.title;
    return (<div {...calendarProps} className="flex flex-col gap-y-2">
      <div className="bg-ui-bg-field border-base grid grid-cols-[28px_1fr_28px] items-center gap-1 rounded-md border p-0.5">
        <calendar_button_1.CalendarButton {...prevButtonProps}>
          <icons_1.TriangleLeftMini />
        </calendar_button_1.CalendarButton>
        <div className="flex items-center justify-center">
          <h2 className="txt-compact-small-plus">{title}</h2>
        </div>
        <calendar_button_1.CalendarButton {...nextButtonProps}>
          <icons_1.TriangleRightMini />
        </calendar_button_1.CalendarButton>
      </div>
      <calendar_grid_1.CalendarGrid state={state}/>
    </div>);
};
exports.Calendar = Calendar;
function convertProps(props, setValue) {
    var minValue = props.minValue, maxValue = props.maxValue, _isDateUnavailable = props.isDateUnavailable, _onChange = props.onChange, __value__ = props.value, __defaultValue__ = props.defaultValue, rest = __rest(props, ["minValue", "maxValue", "isDateUnavailable", "onChange", "value", "defaultValue"]);
    var onChange = function (value) {
        setValue(value);
        _onChange === null || _onChange === void 0 ? void 0 : _onChange(value ? value.toDate((0, date_1.getLocalTimeZone)()) : null);
    };
    var isDateUnavailable = function (date) {
        var _date = date.toDate((0, date_1.getLocalTimeZone)());
        return _isDateUnavailable ? _isDateUnavailable(_date) : false;
    };
    return __assign(__assign({}, rest), { onChange: onChange, isDateUnavailable: isDateUnavailable, minValue: minValue ? (0, calendar_1.createCalendarDate)(minValue) : minValue, maxValue: maxValue ? (0, calendar_1.createCalendarDate)(maxValue) : maxValue });
}
