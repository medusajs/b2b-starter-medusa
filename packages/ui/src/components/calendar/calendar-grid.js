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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarGrid = void 0;
var date_1 = require("@internationalized/date");
var React = require("react");
var react_aria_1 = require("react-aria");
var calendar_cell_1 = require("./calendar-cell");
var CalendarGrid = function (_a) {
    var state = _a.state, props = __rest(_a, ["state"]);
    var locale = (0, react_aria_1.useLocale)().locale;
    var _b = (0, react_aria_1.useCalendarGrid)(props, state), gridProps = _b.gridProps, headerProps = _b.headerProps, weekDays = _b.weekDays;
    var weeksInMonth = (0, date_1.getWeeksInMonth)(state.visibleRange.start, locale);
    return (<table {...gridProps}>
      <thead {...headerProps}>
        <tr>
          {weekDays.map(function (day, index) { return (<th key={index} className="txt-compact-small-plus text-ui-fg-muted size-8 p-1 rounded-md">{day}</th>); })}
        </tr>
      </thead>
      <tbody>
        {__spreadArray([], new Array(weeksInMonth).keys(), true).map(function (weekIndex) { return (<tr key={weekIndex}>
            {state
                .getDatesInWeek(weekIndex)
                .map(function (date, i) {
                return date ? (<calendar_cell_1.CalendarCell key={i} state={state} date={date}/>) : (<td key={i}/>);
            })}
          </tr>); })}
      </tbody>
    </table>);
};
exports.CalendarGrid = CalendarGrid;
