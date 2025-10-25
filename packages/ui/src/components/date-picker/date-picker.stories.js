"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InDrawer = exports.Small = exports.WithTime = exports.DisabledDates = exports.MaxValue = exports.MinValue = exports.Controlled = exports.Default = void 0;
var button_1 = require("@/components/button");
var drawer_1 = require("@/components/drawer");
var label_1 = require("@/components/label");
var React = require("react");
var date_picker_1 = require("./date-picker");
var meta = {
    title: "Components/DatePickerNew",
    component: date_picker_1.DatePicker,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.Default = {
    args: {
        "aria-label": "Select a date",
    },
};
var today = new Date(); // Today
var oneWeekFromToday = new Date(new Date(today).setDate(today.getDate() + 7)); // Today + 7 days
var ControlledDemo = function (args) {
    var _a = React.useState(today), startDate = _a[0], setStartDate = _a[1];
    var _b = React.useState(oneWeekFromToday), endDate = _b[0], setEndDate = _b[1];
    return (<div className="text-ui-fg-subtle grid max-w-[576px] gap-4 md:grid-cols-2">
      <fieldset className="flex flex-col gap-y-0.5">
        <label_1.Label id="starts_at:r1:label" htmlFor="starts_at:r1">Starts at</label_1.Label>
        <date_picker_1.DatePicker id="starts_at:r1" aria-labelledby="starts_at:r1:label" {...args} maxValue={endDate || undefined} value={startDate} onChange={setStartDate}/>
      </fieldset>
      <fieldset className="flex flex-col gap-y-0.5">
        <label_1.Label id="ends_at:r1:label" htmlFor="ends_at:r1">Ends at</label_1.Label>
        <date_picker_1.DatePicker id="ends_at:r1" name="ends_at" aria-labelledby="ends_at:r1:label" minValue={startDate || undefined} {...args} value={endDate} onChange={setEndDate}/>
      </fieldset>
    </div>);
};
exports.Controlled = {
    render: ControlledDemo,
    args: {
        className: "w-[230px]",
    },
};
exports.MinValue = {
    args: {
        "aria-label": "Select a date",
        className: "w-[230px]",
        minValue: new Date(),
    },
};
exports.MaxValue = {
    args: {
        "aria-label": "Select a date",
        className: "w-[230px]",
        maxValue: new Date(),
    },
};
exports.DisabledDates = {
    args: {
        isDateUnavailable: function (date) {
            var unavailable = date.getDay() === 0;
            return unavailable;
        },
        "aria-label": "Select a date",
        className: "w-[230px]",
    },
};
exports.WithTime = {
    args: {
        granularity: "minute",
        "aria-label": "Select a date",
        className: "w-[230px]",
        value: new Date(),
    },
};
exports.Small = {
    args: {
        size: "small",
        "aria-label": "Select a date",
        className: "w-[230px]",
    },
};
var InDrawerDemo = function (args) {
    return (<drawer_1.Drawer>
      <drawer_1.Drawer.Trigger asChild>
        <button_1.Button size="small">Open Drawer</button_1.Button>
      </drawer_1.Drawer.Trigger>
      <drawer_1.Drawer.Content>
        <drawer_1.Drawer.Header>
          <drawer_1.Drawer.Title>Select a date</drawer_1.Drawer.Title>
        </drawer_1.Drawer.Header>
        <drawer_1.Drawer.Body>
          <div className="p-4">
            <date_picker_1.DatePicker {...args}/>
          </div>
        </drawer_1.Drawer.Body>
      </drawer_1.Drawer.Content>
    </drawer_1.Drawer>);
};
exports.InDrawer = {
    render: InDrawerDemo,
};
