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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalCalendar = void 0;
var date_1 = require("@internationalized/date");
var icons_1 = require("@medusajs/icons");
var React = require("react");
var react_aria_1 = require("react-aria");
var react_stately_1 = require("react-stately");
var calendar_button_1 = require("./calendar-button");
var calendar_grid_1 = require("./calendar-grid");
/**
 * InternalCalendar is the internal implementation of the Calendar component.
 * It's not for public use, but only used for other components like DatePicker.
 */
var InternalCalendar = function (props) {
    var locale = (0, react_aria_1.useLocale)().locale;
    var state = (0, react_stately_1.useCalendarState)(__assign(__assign({}, props), { locale: locale, createCalendar: date_1.createCalendar }));
    var _a = (0, react_aria_1.useCalendar)(props, state), calendarProps = _a.calendarProps, prevButtonProps = _a.prevButtonProps, nextButtonProps = _a.nextButtonProps, title = _a.title;
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
exports.InternalCalendar = InternalCalendar;
