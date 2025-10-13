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
exports.TimeInput = void 0;
var React = require("react");
var react_aria_1 = require("react-aria");
var react_stately_1 = require("react-stately");
var date_segment_1 = require("@/components/date-segment");
var clx_1 = require("@/utils/clx");
var TimeInput = function (props) {
    var ref = React.useRef(null);
    var locale = (0, react_aria_1.useLocale)().locale;
    var state = (0, react_stately_1.useTimeFieldState)(__assign(__assign({}, props), { locale: locale }));
    var fieldProps = (0, react_aria_1.useTimeField)(props, state, ref).fieldProps;
    return (<div ref={ref} {...fieldProps} aria-label="Time input" className={(0, clx_1.clx)("bg-ui-bg-field shadow-borders-base txt-compact-small flex items-center rounded-md px-2 py-1", {
            "": props.isDisabled,
        })}>
      {state.segments.map(function (segment, index) {
            return <date_segment_1.DateSegment key={index} segment={segment} state={state}/>;
        })}
    </div>);
};
exports.TimeInput = TimeInput;
