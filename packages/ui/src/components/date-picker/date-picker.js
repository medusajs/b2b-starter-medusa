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
exports.DatePicker = void 0;
var date_1 = require("@internationalized/date");
var icons_1 = require("@medusajs/icons");
var cva_1 = require("cva");
var React = require("react");
var react_aria_1 = require("react-aria");
var react_stately_1 = require("react-stately");
var calendar_1 = require("@/components/calendar");
var popover_1 = require("@/components/popover");
var time_input_1 = require("@/components/time-input");
var calendar_2 = require("@/utils/calendar");
var clx_1 = require("@/utils/clx");
var date_picker_button_1 = require("./date-picker-button");
var date_picker_clear_button_1 = require("./date-picker-clear-button");
var date_picker_field_1 = require("./date-picker-field");
var datePickerStyles = function (isOpen, isInvalid, value) {
    return (0, cva_1.cva)({
        base: (0, clx_1.clx)("bg-ui-bg-field shadow-borders-base txt-compact-small text-ui-fg-base transition-fg grid items-center gap-2 overflow-hidden rounded-md h-fit", "focus-within:shadow-borders-interactive-with-active focus-visible:shadow-borders-interactive-with-active", "aria-[invalid=true]:shadow-borders-error invalid:shadow-borders-error", {
            "shadow-borders-interactive-with-active": isOpen,
            "shadow-borders-error": isInvalid,
            "pr-2": !value,
        }),
        variants: {
            size: {
                small: (0, clx_1.clx)("grid-cols-[28px_1fr]", {
                    "grid-cols-[28px_1fr_28px]": !!value,
                }),
                base: (0, clx_1.clx)("grid-cols-[32px_1fr]", {
                    "grid-cols-[32px_1fr_32px]": !!value,
                }),
            },
        },
    });
};
var HAS_TIME = new Set(["hour", "minute", "second"]);
var DatePicker = React.forwardRef(function (_a, ref) {
    var _b = _a.size, size = _b === void 0 ? "base" : _b, _c = _a.shouldCloseOnSelect, shouldCloseOnSelect = _c === void 0 ? true : _c, className = _a.className, _d = _a.modal, modal = _d === void 0 ? false : _d, props = __rest(_a, ["size", "shouldCloseOnSelect", "className", "modal"]);
    var _e = React.useState((0, calendar_2.getDefaultCalendarDateFromDate)(props.value, props.defaultValue, props.granularity)), value = _e[0], setValue = _e[1];
    var innerRef = React.useRef(null);
    React.useImperativeHandle(ref, function () { return innerRef.current; });
    var contentRef = React.useRef(null);
    var _props = convertProps(props, setValue);
    var state = (0, react_stately_1.useDatePickerState)(__assign(__assign({}, _props), { shouldCloseOnSelect: shouldCloseOnSelect }));
    var _f = (0, react_aria_1.useDatePicker)(_props, state, innerRef), groupProps = _f.groupProps, fieldProps = _f.fieldProps, buttonProps = _f.buttonProps, dialogProps = _f.dialogProps, calendarProps = _f.calendarProps;
    React.useEffect(function () {
        setValue(props.value
            ? (0, calendar_2.updateCalendarDateFromDate)(value, props.value, props.granularity)
            : null);
        state.setValue(props.value
            ? (0, calendar_2.updateCalendarDateFromDate)(value, props.value, props.granularity)
            : null);
    }, [props.value]);
    function clear(e) {
        var _a;
        e.preventDefault();
        e.stopPropagation();
        (_a = props.onChange) === null || _a === void 0 ? void 0 : _a.call(props, null);
        state.setValue(null);
    }
    (0, react_aria_1.useInteractOutside)({
        ref: contentRef,
        onInteractOutside: function () {
            state.setOpen(false);
        },
    });
    var hasTime = props.granularity && HAS_TIME.has(props.granularity);
    var Icon = hasTime ? icons_1.Clock : icons_1.CalendarMini;
    return (<popover_1.Popover modal={modal} open={state.isOpen} onOpenChange={state.setOpen}>
        <popover_1.Popover.Anchor asChild>
          <div ref={ref} className={(0, clx_1.clx)(datePickerStyles(state.isOpen, state.isInvalid, state.value)({ size: size }), className)} {...groupProps}>
            <date_picker_button_1.DatePickerButton {...buttonProps} size={size}>
              <Icon />
            </date_picker_button_1.DatePickerButton>
            <date_picker_field_1.DatePickerField {...fieldProps} size={size}/>
            {!!state.value && (<date_picker_clear_button_1.DatePickerClearButton onClick={clear}>
                <icons_1.XMarkMini />
              </date_picker_clear_button_1.DatePickerClearButton>)}
          </div>
        </popover_1.Popover.Anchor>
        <popover_1.Popover.Content ref={contentRef} {...dialogProps} className="flex flex-col divide-y p-0">
          <div className="p-3">
            <calendar_1.InternalCalendar autoFocus {...calendarProps}/>
          </div>
          {state.hasTime && (<div className="p-3">
              <time_input_1.TimeInput value={state.timeValue} onChange={state.setTimeValue} hourCycle={props.hourCycle}/>
            </div>)}
        </popover_1.Popover.Content>
      </popover_1.Popover>);
});
exports.DatePicker = DatePicker;
DatePicker.displayName = "DatePicker";
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
    return __assign(__assign({}, rest), { onChange: onChange, isDateUnavailable: isDateUnavailable, minValue: minValue
            ? (0, calendar_2.createCalendarDateFromDate)(minValue, props.granularity)
            : minValue, maxValue: maxValue
            ? (0, calendar_2.createCalendarDateFromDate)(maxValue, props.granularity)
            : maxValue });
}
