"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisabledDates = exports.MaxValue = exports.MinValue = exports.Controlled = exports.Default = void 0;
var button_1 = require("@/components/button");
var calendar_1 = require("@/components/calendar/calendar");
var React = require("react");
var meta = {
    title: "Components/CalendarNew",
    component: calendar_1.Calendar,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.Default = {
    args: {},
};
var ControlledDemo = function (args) {
    var _a = React.useState(new Date()), date = _a[0], setDate = _a[1];
    return (<div>
      <calendar_1.Calendar {...args} value={date} onChange={setDate}/>
      <div className="flex items-center justify-between">
        <pre className="font-mono txt-compact-small">{date ? date.toDateString() : "null"}</pre>
        <button_1.Button variant="secondary" size="small" onClick={function () { return setDate(null); }}>Reset</button_1.Button>
      </div>
    </div>);
};
exports.Controlled = {
    render: ControlledDemo,
};
exports.MinValue = {
    args: {
        minValue: new Date(),
    },
};
exports.MaxValue = {
    args: {
        maxValue: new Date(),
    },
};
exports.DisabledDates = {
    args: {
        isDateUnavailable: function (date) {
            var unavailable = date.getDay() === 0;
            return unavailable;
        },
    },
};
