"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarCell = void 0;
var React = require("react");
var react_aria_1 = require("react-aria");
var clx_1 = require("@/utils/clx");
var CalendarCell = function (_a) {
    var state = _a.state, date = _a.date;
    var ref = React.useRef(null);
    var _b = (0, react_aria_1.useCalendarCell)({ date: date }, state, ref), cellProps = _b.cellProps, buttonProps = _b.buttonProps, isSelected = _b.isSelected, isOutsideVisibleRange = _b.isOutsideVisibleRange, isDisabled = _b.isDisabled, isUnavailable = _b.isUnavailable, formattedDate = _b.formattedDate;
    var isToday = getIsToday(date);
    return (<td {...cellProps} className="p-1">
      <div {...buttonProps} ref={ref} hidden={isOutsideVisibleRange} className={(0, clx_1.clx)("bg-ui-bg-base txt-compact-small relative flex size-8 items-center justify-center rounded-md outline-none transition-fg border border-transparent", "hover:bg-ui-bg-base-hover", "focus-visible:shadow-borders-focus focus-visible:border-ui-border-interactive", {
            "!bg-ui-bg-interactive !text-ui-fg-on-color": isSelected,
            "hidden": isOutsideVisibleRange,
            "text-ui-fg-muted hover:!bg-ui-bg-base cursor-default": isDisabled || isUnavailable,
        })}>
        {formattedDate}
        {isToday && (<div role="none" className={(0, clx_1.clx)("bg-ui-bg-interactive absolute bottom-[3px] left-1/2 size-[3px] -translate-x-1/2 rounded-full transition-fg", {
                "bg-ui-fg-on-color": isSelected,
            })}/>)}
      </div>
    </td>);
};
exports.CalendarCell = CalendarCell;
/**
 * Check if the date is today. The CalendarDate is using a 1-based index for the month.
 * @returns Whether the CalendarDate is today.
 */
function getIsToday(date) {
    var today = new Date();
    return ([date.year, date.month, date.day].join("-") ===
        [today.getFullYear(), today.getMonth() + 1, today.getDate()].join("-"));
}
